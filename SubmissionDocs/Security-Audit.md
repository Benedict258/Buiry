# Buiry Project — Security Audit Report

**Date:** 2026-07-02
**Scope:** PII pipeline, API server, secrets management, configuration
**Files Audited:** `packages/data-agent/src/pipeline/PrivacyPass.ts`, `apps/api/src/**`, `.gitignore`, `.env.example`

---

## 1. PII Detection Coverage

**Detected types (7):**
| Type | Regex | Notes |
|---|---|---|
| Email | `[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z\|a-z]{2,}` | Standard email |
| Phone | `(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}` | US-only |
| SSN | `\d{3}[-.\s]?\d{2}[-.\s]?\d{4}` | US SSN format |
| Credit Card | `(\d{4}[-\s]?){3}\d{4}` | 16-digit cards only |
| IPv4 | Validated range 0–255 | Good |
| IPv6 | Full 8-group only | Partial |
| UUID | Standard v4 format | Low risk, but detected |

**Missing PII types:**
- **International phone numbers** (EU, APAC, etc.)
- **Non-US SSN equivalents** (UK NHS, SIN, etc.)
- **Names / person references** (not detectable via regex alone, but notable)
- **Physical addresses / street patterns**
- **Date of birth** (YYYY-MM-DD in context)
- **Bank account / routing numbers** (IBAN, ACH)
- **Passport / driver's license numbers**
- **MAC addresses** (could leak device info)

---

## 2. Regex Pattern Analysis

**Strengths:**
- IPv4 regex validates octet ranges (0–255) — prevents false positives
- SSN regex is restrictive enough

**Weaknesses & bypasses:**

| Pattern | Issue |
|---|---|
| Email | Does not handle international domains (IDN), quoted local parts (`"user name"@example.com`), or IP-literal addresses (`user@[192.168.1.1]`) |
| Phone | US-only; zero coverage for international formats. Easily bypassed with non-US numbers |
| SSN | No lookahead for context — matches any 9-digit sequence (e.g., timestamps like `202607021234`) |
| Credit Card | No Luhn check; matches any 16-digit number including non-card sequences. Misses Amex (15-digit) and shorter formats |
| IPv6 | Only matches full 8-group compressed forms; misses `::` shorthand notation (`::1`, `fe80::1%lo`) |
| UUID | Overly broad — any hyphenated hex string of correct length |

**Critical bypass:** All patterns use word boundaries (`\b`). PII embedded in base64, hex-encoded, or URL-encoded form will evade detection entirely.

---

## 3. Threshold Logic (5% Rejection)

**Implementation (`PrivacyPass.ts:57-63`):**
```typescript
const piiCharEstimate = totalPII * 20
const piiRatio = totalLength > 0 ? piiCharEstimate / totalLength : 0
if (piiRatio > 0.05) { ... }
```

**Issues:**

1. **Constant estimate of 20 chars per PII token is unreliable.** A 4-digit credit card match is ~4 chars; an email can be 30+. The estimate inflates or deflates the ratio unpredictably.
2. **5% threshold may be too permissive.** A document with 100 PII instances (e.g., leaked database row) could pass if the surrounding text is long enough. Conversely, a short legitimate request with 2 PII tokens could be rejected.
3. **Ratio is computed on total content length, not character count of PII hits.** The `match()` count is number of *tokens*, not characters — the heuristic misrepresents actual PII character volume.
4. **Threshold applies globally.** A single SSN in a short prompt (~50 chars) = 20/50 = 40% — rejected. But a 2000-char prompt with 4 SSNs = 80/2000 = 4% — passes. This creates inconsistent behavior.

**Recommendation:** Use actual character length of matched PII strings rather than a constant multiplier. Consider per-field limits (e.g., reject any input containing >3 SSNs regardless of length).

---

## 4. Edge Cases

### Unicode & Encoding
- All regex patterns are ASCII-only. PII in Cyrillic, CJK, Arabic scripts, or accented characters will bypass detection entirely.
- URL-encoded data (`%40` for `@`) evades email regex.
- Base64-encoded PII is completely invisible to the pipeline.
- HTML entities (`&#64;` for `@`) bypass detection.

### Nested Structures
- `RawInteraction.output.metadata` is typed as `Record<string, unknown>` but `detectPII` only scans `output.response`. PII in metadata fields is never checked.
- `context` field is concatenated to `input` but not separately validated — multi-line injection in `context` could contain PII that merges with prompt boundaries.

### Null / Empty
- `piiRatio` is correctly guarded against division by zero (`totalLength > 0`).
- However, `input.context` is optional — if `undefined`, the ternary correctly falls back to just `prompt`.

---

## 5. Data Flow Security

### Where data goes:
```
User → Express API → MemWal (cloud) + Walrus (decentralized storage) + local JSON file
```

**Encryption at rest:**
- **Local JSON file** (`data/Build-Context-Memory.json`): Written via `writeFile` with no encryption. Session data (including summaries, decisions) stored in plaintext.
- **MemWal cloud**: Write path in `memwal/client.ts` — unknown if encrypted at rest; no TLS pinning observed.
- **Walrus blobs**: Decentralized storage; encryption depends on Walrus network configuration.

**Encryption in transit:**
- Express app uses plain HTTP (`app.listen(PORT)`). No TLS termination at application layer — relies on reverse proxy (Railway) for HTTPS.
- `MEMWAL_URL` defaults to `http://localhost:8000` — plaintext in dev.

**Recommendations:**
- Encrypt session files at rest (AES-256-GCM).
- Validate TLS for MemWal and Walrus connections in production.
- Add `Strict-Transport-Security` header (present via `helmet()` but should be explicitly configured).

---

## 6. Append-Only Enforcement

**Claim:** The session system appears append-only — `context.sessions.push(session)` in `sessionRoutes.post('/end')`.

**Bypass vectors:**
1. **No append-only enforcement at application level.** The `readContext` → `writeContext` pattern is read-modify-write with no locking. Concurrent requests can cause data loss (last-write-wins race condition).
2. **No `POST /session/delete` or `PUT` endpoint exists**, which is good — but there's nothing preventing a direct file write if filesystem access is compromised.
3. **`sessionRoutes.get('/:id')` only reads** — no update/delete routes, which is the correct append-only pattern.
4. **MemWal cloud write** has no confirmation that the cloud backend enforces append-only.

**Recommendation:** Add file-level locking (`proper-lockfile` or similar) to the read-modify-write cycle. Consider WORM (Write Once Read Many) storage for compliance-sensitive data.

---

## 7. API Key Security

**Auth middleware (`apps/api/src/middleware/auth.ts`):**
```typescript
const apiKey = req.headers['x-api-key'] as string
if (!apiKey || !apiKey.startsWith('buiry_')) {
  return res.status(401).json({ error: 'Invalid or missing API key' })
}
```

**Issues:**

1. **Prefix-only validation.** Any string starting with `buiry_` passes. The actual key value is never checked against a stored hash or database. An attacker sending `buiry_anything` gains full access.
2. **No rate limiting on auth failures.** Unlimited brute-force attempts possible.
3. **No key rotation mechanism** visible in codebase.
4. **Client-side key exposure:** `apps/web/src/lib/api.ts` sends the API key in every request header. If the frontend is bundled, the key is visible in browser DevTools/network tab.
5. **`.env.example` contains a dev key** (`buiry_sk_live_dev_12345`) that could be mistaken for a real key if accidentally deployed.

**Recommendation:**
- Store API key hashes (SHA-256) in the database; compare hash on each request.
- Add rate limiting (e.g., `express-rate-limit`).
- Use short-lived tokens or HMAC-based request signing instead of static keys.

---

## 8. CORS Configuration

**Current (`apps/api/src/index.ts:16`):**
```typescript
app.use(cors())
```

**Issue:** `cors()` with no options defaults to `Access-Control-Allow-Origin: *` — any origin can make requests to the API. This is a critical misconfiguration for a production API.

**Recommendation:**
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['https://your-domain.com'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'x-api-key'],
  credentials: true,
}))
```

---

## 9. Input Validation

| Endpoint | Validation | Status |
|---|---|---|
| `POST /session/end` | Zod schema (`SessionSchema`) | ✅ Good |
| `POST /session/search` | Manual `query` presence check | ⚠️ Minimal — no length/type validation |
| `POST /dataset/list` | Manual `datasetId` presence check | ⚠️ No validation on `price` (accepts any number) |
| `POST /dataset/upload` | Manual `data` presence check | ❌ No size validation beyond Express `10mb` limit; base64 decode without sanitization |
| `GET /dataset/:id` | Array check on param | ✅ Acceptable |
| `GET /session/:id` | Array check on param | ✅ Acceptable |
| `POST /session/start` | No body expected | ⚠️ No body validation (accepts arbitrary payload) |

**Specific risks:**
- `dataset/upload` accepts arbitrary base64 data and stores it — potential for storage abuse or injection into Walrus blob metadata.
- `session/search` passes user input directly to `memwal.recall()` — potential injection if MemWal uses the query in a non-parameterized way.
- Error handler returns `err.message` verbatim — can leak stack traces or internal paths to attackers.

---

## 10. Environment Variables & Secrets

**.gitignore coverage:**
| Pattern | Status |
|---|---|
| `.env` | ✅ Covered |
| `.env.local` | ✅ Covered |
| `.env.*.local` | ❌ **Missing** |
| `*.pem` | ❌ **Missing** |
| `*.key` | ❌ **Missing** |

**Secrets found in grep scan:**
- `.env.example` files contain placeholder API keys (`buiry_sk_live_dev_12345`) — low risk as they're examples, but should not contain realistic-looking keys.
- No `sk_live`, `sk_test`, or real secrets found in source code — ✅ clean.
- `apps/api/src/config.ts` reads secrets from env vars — ✅ correct pattern.

**Missing `.env.*` variants:**
```gitignore
.env
.env.local
.env.*.local    # ← add this
```

**Missing binary/key patterns:**
```gitignore
*.pem
*.key
*.cert
*.p12
*.pfx
```

---

## Summary of Critical Findings

| # | Severity | Finding | Location |
|---|---|---|---|
| 1 | **CRITICAL** | API key validation is prefix-only (`buiry_*`), not checking actual key value | `apps/api/src/middleware/auth.ts:5` |
| 2 | **CRITICAL** | CORS allows all origins (`cors()` with no config) | `apps/api/src/index.ts:16` |
| 3 | **HIGH** | PII regex only covers US-specific formats; international PII evades detection | `packages/data-agent/src/pipeline/PrivacyPass.ts:4-12` |
| 4 | **HIGH** | 5% PII threshold uses constant 20-char estimate — inaccurate and exploitable | `packages/data-agent/src/pipeline/PrivacyPass.ts:59` |
| 5 | **HIGH** | Error handler exposes `err.message` verbatim — information disclosure | `apps/api/src/middleware/errorHandler.ts:5` |
| 6 | **MEDIUM** | `.gitignore` missing `.env.*.local`, `*.pem`, `*.key` patterns | `.gitignore` |
| 7 | **MEDIUM** | No rate limiting on any endpoint — DoS and brute-force risk | `apps/api/src/index.ts` |
| 8 | **MEDIUM** | Session read-modify-write has no file locking — race condition under concurrency | `apps/api/src/routes/session.ts:37-60` |
| 9 | **MEDIUM** | PII not detected in `metadata` field or base64/URL-encoded content | `packages/data-agent/src/pipeline/PrivacyPass.ts:46-49` |
| 10 | **LOW** | `dataset/upload` accepts arbitrary base64 without size/type validation | `apps/api/src/routes/dataset.ts:56-73` |

---

## Recommended Remediations (Priority Order)

1. **Implement real API key validation** — hash keys on ingestion, compare hashes on auth.
2. **Restrict CORS** to specific allowed origins.
3. **Add rate limiting** (`express-rate-limit`) to all API routes.
4. **Sanitize error responses** — return generic errors in production, log details server-side.
5. **Extend PII detection** to cover international formats, base64 content, and metadata fields.
6. **Improve threshold logic** — use actual matched character length instead of constant estimate.
7. **Add `.env.*.local`, `*.pem`, `*.key` to `.gitignore`.**
8. **Add file locking** to session read-modify-write cycle.
9. **Validate and limit** dataset upload size and type.
10. **Add request ID tracking** and audit logging for security event correlation.
