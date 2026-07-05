# Buiry E2E Test Plan

## Overview

The E2E verification is performed by `e2e-verify.sh`, a bash script that tests 9 endpoints end-to-end against the live Railway deployment at `https://buiry.up.railway.app`.

**Usage:**
```bash
BUIRY_API_KEY=buiry_sk_live_xxx bash e2e-verify.sh
```

---

## Step-by-Step Verification Flow

### Step 1: Health Check
- **Endpoint:** `GET /health`
- **Expected:** Backend responds with `{"postgres": "connected", "redis": "connected"}`
- **Pass criteria:** HTTP 200, PostgreSQL reports "connected"

### Step 2: API Key Bootstrap
- **Endpoint:** `POST /api/bootstrap-keys`
- **Expected:** Seeds initial API keys into the database
- **Pass criteria:** Response contains `"success": true` and `keys_count`

### Step 3: Auth — Signup
- **Endpoint:** `POST /api/auth/signup`
- **Body:** `{"email":"e2etest@buiry.dev","password":"test12345678","name":"E2E Test"}`
- **Expected:** JWT token returned
- **Pass criteria:** Response contains `"token"` field
- **Fallback:** If user exists, calls `POST /api/auth/login` instead

### Step 4: API Keys — List
- **Endpoint:** `GET /api/keys`
- **Headers:** `x-api-key: <API_KEY>`
- **Expected:** List of API keys (masked)
- **Pass criteria:** Response contains `"keys"` array with `"total"` count

### Step 5: API Keys — Create
- **Endpoint:** `POST /api/keys`
- **Headers:** `x-api-key: <API_KEY>`
- **Body:** `{"name":"e2e-test-key"}`
- **Expected:** New API key generated
- **Pass criteria:** Response contains `"api_key"` field starting with `buiry_`

### Step 6: Cloud Session — Start
- **Endpoint:** `POST /api/session/cloud/start`
- **Headers:** `x-api-key: <API_KEY>`
- **Expected:** Project context with session history
- **Pass criteria:** Response contains `"project_identity"` and `"total_sessions"`

### Step 7: Cloud Session — End
- **Endpoint:** `POST /api/session/cloud/end`
- **Body:** Full session object with `session_id`, `timestamp`, `ai_agent`, `progress`, `decisions_log`, `known_issues`, `next_steps`
- **Expected:** Session saved successfully
- **Pass criteria:** Response contains `"success": true` and `"stored_in"` (e.g., `"postgresql"`)

### Step 8: Context Search
- **Endpoint:** `POST /api/context/search`
- **Body:** `{"query":"e2e"}`
- **Expected:** Search results from session history
- **Pass criteria:** Response contains `"total"` with match count ≥ 0

### Step 9: Settings Profile
- **Endpoint:** `GET /api/settings/profile`
- **Headers:** `x-api-key: <API_KEY>`
- **Expected:** User/settings profile data
- **Pass criteria:** Response contains `"profile"` or `"settings"` field

---

## Expected Responses

### Health Check
```json
{
  "status": "ok",
  "postgres": "connected",
  "redis": "connected"
}
```

### Session Start
```json
{
  "project_identity": {
    "name": "Buiry",
    "description": "Persistent Memory for AI Coding Agents"
  },
  "last_5_sessions": [...],
  "open_issues": [...],
  "summary": "..."
}
```

### Session End
```json
{
  "success": true,
  "session_id": "sess_e2e_...",
  "stored_in": "postgresql",
  "total_sessions": 15
}
```

### Context Search
```json
{
  "query": "e2e",
  "total": 1,
  "sessions": [...]
}
```

---

## Test Summary

| Step | Endpoint | Critical? |
|------|----------|-----------|
| 1 | `GET /health` | Yes |
| 2 | `POST /api/bootstrap-keys` | No |
| 3 | `POST /api/auth/signup` | Yes |
| 4 | `GET /api/keys` | Yes |
| 5 | `POST /api/keys` | Yes |
| 6 | `POST /api/session/cloud/start` | Yes |
| 7 | `POST /api/session/cloud/end` | Yes |
| 8 | `POST /api/context/search` | Yes |
| 9 | `GET /api/settings/profile` | No |

**Total:** 9 steps, 7 critical, 2 non-critical

---

## Pass Criteria

- **All critical steps pass:** E2E is healthy, ready for demo
- **Critical step fails:** Fix before recording demo
- **Non-critical step fails:** Document and proceed — these are auxiliary endpoints
