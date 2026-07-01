# Security Features

Buiry's security model is built into the architecture, not bolted on after the fact. Every design decision was made in the first 5 sessions.

## Append-Only Memory Model

Sessions are **immutable once written**. The `buiry_end_session` tool appends a validated session object to `Build-Context-Memory.json` and never modifies existing entries.

- No session can be updated or deleted after writing
- `max_sessions` config trims old sessions when the file exceeds a limit, but individual sessions are never altered
- Creates a complete audit trail of every session across the project's history
- Prevents the most common failure mode: accidentally overwriting good context with bad

## Schema Validation (Zod)

Every session object passes through Zod validation before touching the file system:

| Field | Rule | Enforcement |
|---|---|---|
| `next_steps` | **Required**, min 1 entry | Ensures every session leaves a breadcrumb for the next |
| `session_id` | Unique within file | Prevents duplicate sessions |
| `timestamp` | ISO 8601 format | Enforces temporal ordering |
| `progress.completed` | Required array | No session closes without reporting progress |
| `progress.in_progress` | Required array | Active work is always documented |
| `progress.blocked` | Required array | Blockers are surfaced, not hidden |

Malformed data is **rejected at write time**, not discovered at read time. This means downstream consumers (agents, dashboard, search) always receive valid data.

## PII Stripping Pipeline

The Dataset Browser includes privacy scores on every dataset card. The architecture supports a PII stripping pipeline (designed in Phase 2, implementation pending):

- **Detection** — Identify PII patterns (emails, API keys, personal names, file paths with usernames) in session data
- **Stripping** — Replace detected PII with anonymized placeholders before dataset export
- **Scoring** — Assign privacy scores based on PII density and sensitivity
- **Export** — Output clean datasets suitable for sharing or marketplace listing

The pipeline is designed to run locally. No PII detection data leaves the machine.

## Local-Only Mode

For the hackathon, Buiry operates entirely on the local filesystem:

- **No cloud API** — The MCP server reads and writes `Build-Context-Memory.json` in the project root
- **No telemetry** — No usage data is collected or transmitted
- **No external dependencies** — Only npm packages for the MCP server; no cloud services required
- **No network calls** — The MCP server communicates via stdio, not HTTP

This makes Buiry deployable anywhere Node.js runs. No API keys, no accounts, no cloud setup required.

## Design Principles

1. **Reject bad data early** — Zod validation at write time, not read time
2. **Immutable by default** — Append-only prevents accidental corruption
3. **Local-first** — No data leaves the machine unless explicitly configured
4. **Privacy by design** — PII stripping is a first-class feature, not an afterthought
5. **Audit trail** — Every session is a timestamped, immutable record
