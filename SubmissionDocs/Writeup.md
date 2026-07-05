# Buiry — Persistent Memory for AI Coding Agents

**Hackathon:** AI Agents: Intensive Vibe Coding Capstone Project
**Track:** Freestyle
**GitHub:** [Benedict258/Buiry](https://github.com/Benedict258/Buiry)

---

## Problem Statement

Every time a developer starts a new AI coding session, the agent forgets everything. What was built, which decisions were made, what errors were hit, and what comes next — all gone. The developer wastes minutes re-explaining project context, re-discovering prior decisions, and sometimes making contradicting choices the agent made two sessions ago.

This is the **context amnesia problem**. AI coding agents are stateless by design. Each session starts from zero. For small scripts, this is tolerable. For real projects spanning days or weeks, it's devastating. Developers become the memory — manually copying summaries between sessions, maintaining ad-hoc notes, and acting as the continuity layer that should be automated.

The result: duplicated work, lost decisions, inconsistent architecture, and frustrated developers who spend more time on context reconstruction than actual coding.

Buiry solves this with a simple insight: **if agents can't remember, give them a memory they can read and write.** Not a database. Not a vector store. A structured, append-only memory system that every agent session can load at start and persist to at end — creating a continuous thread of project memory across sessions, agents, and tools.

---

## Why Agents

Buiry uses a multi-agent architecture because memory recall isn't a simple database lookup — it's **semantic reasoning across sessions**. When a developer asks "what did we decide about authentication?", the answer isn't a single record. It's a chain: session 3 chose JWT, session 7 discovered a token expiry bug, session 9 added refresh tokens. Reconstructing this requires an agent that reads, interprets, and connects disjointed facts.

A database returns rows. An agent returns understanding.

### Multi-Agent Architecture (10 agents, 7 working)

The system uses 10 specialized agents built with Google ADK and powered by Gemini, connected to the TypeScript pipeline via the **ADK Bridge server** (`server.py`, port 8765):

**Working agents (7 — Gemini-powered):**

- **ContextGuardianAgent** — 4-layer PII scanner. Detects emails, phones, names, addresses, SSNs, credit cards, and network identifiers. Uses Gemini for semantic detection beyond regex capabilities. Exposed via `/pii-check` endpoint.

- **DatasetGeneratorAgent** — Classifies raw interactions into 5 dataset categories (behavioral patterns, decision sequences, error recovery, domain knowledge, workflow execution). Exposed via `/classify` endpoint.

- **SessionAnalystAgent** — Analyzes completed sessions to extract patterns, identify blockers, and suggest next steps. Feeds intelligence into subsequent sessions.

- **IntentRouterAgent** — Classifies raw user messages into MCP tool intents (`start_session`, `end_session`, `log_decision`, `flag_issue`, `get_context`, `generate_docs`, `none`) with structured JSON output.

- **QualityAuditorAgent** — Audits dataset quality before publication. Returns a score (0–100) and verdict (`APPROVE`/`REJECT`). Datasets below 60/100 are rejected. Exposed via `/quality-audit` endpoint.

- **ContractGuardianAgent** — Validates Sui Move smart contract interactions against expected schemas. Ensures on-chain transactions follow correct patterns.

- **BuiryCLIAgent** — Wraps all 9 Buiry MCP tools as native ADK `FunctionTool` wrappers for use with `google-agent-cli`. Supports `agents chat --agent buiry`.

**Legacy agents (3):** CoordinatorAgent, DevAgent, ReviewAgent from the original ADK prototype. These are syntactically valid but not in the active pipeline.

### The Collaboration Effect

Agent-to-agent collaboration means memory is **actively used, not passively stored**. Without agents, session logs sit in a file. With agents, they become decision fuel:

- **Zero redundant queries.** Agents load context once at session start via `buiry_start_session` and work from structured data. No repeated "what are we building?" prompts.

- **100% decision traceability.** Every architectural decision is logged with timestamp, rationale, and alternatives considered. The QualityAuditor cross-references new datasets against quality thresholds, catching low-quality data before publication.

- **4-layer PII protection.** PrivacyPass pipeline strips PII before storage. ContextGuardian adds Gemini-powered semantic scanning for names, addresses, and organizational references that regex alone cannot detect.

The `BuirySkill` class (`buiry/skill.py`) wraps Buiry memory operations for use inside any ADK agent — providing `buiry_start_session`, `buiry_remember`, `buiry_recall`, and `buiry_end_session` as Python methods connecting to the Railway API.

---

## Architecture

Buiry is a monorepo with 6 packages and 244+ source files, deployed across Vercel (frontend) and Railway (backend).

### MCP Server (`packages/buiry-mcp`)

The core infrastructure. A TypeScript MCP server exposing **9 tools** over stdio transport, published as `@buiry/mcp@0.1.3`:

| # | Tool | Description |
|---|------|-------------|
| 1 | `buiry_start_session` | Read memory, return last 5 sessions + project context |
| 2 | `buiry_end_session` | Validate and append a session to memory |
| 3 | `buiry_log_decision` | Log a decision mid-session |
| 4 | `buiry_flag_issue` | Flag an issue to the active session |
| 5 | `buiry_get_context` | Keyword search across all sessions |
| 6 | `buiry_init` | Initialize Buiry file structure for a new project |
| 7 | `buiry_generate_docs` | Generate PRD, Architecture, or Dev Plan |
| 8 | `buiry_execute` | Universal intent router — classify and route messages |
| 9 | `buiry_sync` | Push local session memory to Buiry Cloud |

**Cloud-first architecture:** When `BUIRY_API_KEY` is set, tools proxy through the Railway API. Sessions are stored in PostgreSQL with file-based fallback. Zod validation enforces that every session has `next_steps`, `decisions_log`, and `known_issues` — enforced documentation, not optional.

### Express API (`apps/api`)

A production API server with **29 routes across 10 route groups**, deployed on Railway with PostgreSQL + Redis:

| Route Group | Routes | Key Endpoints |
|-------------|--------|---------------|
| Session | 4 | `/start`, `/end`, `/:id`, `/search` |
| Cloud Session | 4 | `/cloud/start`, `/cloud/end`, `/cloud/:id`, `/cloud/search` |
| Dataset | 5 | List, create, upload, publish |
| Workspace | 4 | CRUD operations |
| Context | 3 | Search, recent, export |
| Docs | 3 | Generate PRD/Architecture/DevPlan |
| Keys | 3 | List, create, delete API keys |
| Projects | 3 | List, create, get |
| Auth | 2 | Signup, login (JWT) |
| Settings | 1 | Profile |

**Security layers:** SHA-256 API key hashing, session isolation via `api_key_id` FK, `express-rate-limit` on all routes, Helmet security headers, CORS with restricted origins, Sentry error monitoring.

### React Dashboard (`apps/web`)

A Vite + React 19 + Tailwind CSS application with **10 pages**, deployed on Vercel:

| Page | Features |
|------|----------|
| Landing | Hero, project identity, live stats |
| Dashboard | Hero card, activity graph (sinusoidal), stats row, decisions list |
| Sessions | Timeline view, expandable cards, session details |
| Datasets | Dataset cards with privacy scores, ADK quality gates |
| Projects | Project listing and management |
| ProjectDetail | Single project view with sessions and datasets |
| Settings | Configuration, API key management, integrations |
| Market | Dataset marketplace (Sui-powered) |
| Documentation | Generated PRDs, architectures, dev plans |
| Onboarding | First-run guide with step indicators |

**UX features:** Sonner toast notifications, export logs (JSON/CSV/TXT), sinusoidal activity graph, sidebar toggle on all screen sizes, user authentication with signup/login.

### SDK (`packages/sdk-ts`, `packages/sdk-python`)

**14 LLM adapters** in both TypeScript (`@buiry/buiry@0.1.1`) and Python (`buiry 0.1.0`):

Anthropic, OpenAI, Gemini, Groq, Mistral, Cohere, xAI, DeepSeek, Together, Fireworks, Perplexity, Replicate, Ollama, Generic (OpenAI-compatible)

Both SDKs auto-detect the LLM provider from installed clients and environment variables. Each adapter wraps the provider's client with a `Proxy` that captures decision types, strips PII, and persists context to Buiry memory on every LLM call.

### ADK Agents (`packages/adk-agents`)

10 agents (7 working, Gemini-powered) connected to the TypeScript pipeline via the ADK Bridge server. The `BuirySkill` class enables any agent to read/write Buiry memory.

### Data Agent (`packages/data-agent`)

A privacy-first data pipeline with 4 stages:
1. **PrivacyPass** — 4-layer PII detection (contact, identity, financial, network) with ADK Bridge semantic scanning
2. **ThresholdCheck** — Enforces minimum 10 interactions before aggregation
3. **Aggregator** — Combines sanitized claims into dataset-ready format
4. **Categorizer** — Classifies into 5 categories (keyword mode + ADK Bridge)
5. **QualityAuditor** — Score ≥ 60/100 required for publication

### Blockchain Layer

**4 Move contracts** deployed on Sui testnet:
- `revenue_vault` — Revenue distribution
- `marketplace_purchase` — Dataset marketplace transactions
- `dataset_listing` — Dataset publication on-chain
- `workspace_ownership` — Workspace identity and access control

**Package ID:** `0x411d197869a261a42911ac454e063231301c18d0c0f9289f3a4c414db016e60e`

Real Sui transaction submission with `signAndExecuteTransaction`. Walrus SDK integration for decentralized blob storage with SEAL encryption (`writeBlob`/`readBlob`).

---

## Six Course Concepts Demonstrated

### 1. Agent Memory and State
Buiry's entire purpose is persistent agent memory. The `Build-Context-Memory.json` stores sessions with decisions, errors, and next steps. Agents read context at start and write it at end — creating state across stateless LLM calls.

### 2. Multi-Agent Collaboration
Seven Gemini-powered agents collaborate through shared memory. The ContextGuardian scans for PII, the DatasetGenerator classifies interactions, the QualityAuditor validates outputs. Agent disagreement is resolved by referencing session history.

### 3. Tool Composition (MCP)
Nine MCP tools compose into workflows. `buiry_start_session` loads context, `buiry_log_decision` records mid-session choices, `buiry_end_session` persists everything. Tools are independently testable and composable — agents chain them without custom orchestration.

### 4. Privacy by Design
Four-layer PII detection pipeline strips sensitive data before storage. ADK-powered semantic scanning catches names and addresses that regex misses. Session isolation via `api_key_id` FK prevents cross-tenant data leakage.

### 5. Cloud-First Architecture
MCP server operates locally by default but seamlessly proxies through Railway when `BUIRY_API_KEY` is set. PostgreSQL for primary storage, file-based fallback when offline. `buiry_sync` pushes local sessions to the cloud.

### 6. Blockchain for Trust
Sui Move contracts handle revenue distribution, marketplace purchases, and workspace ownership. Walrus SEAL encryption protects data at rest on decentralized storage. Real transaction submission — not simulated.

---

## The Build

Buiry was built using subagents for parallel execution across independent components:

1. MCP server scaffolded with 9 tools, compiled clean — `packages/buiry-mcp/src/index.ts` connects to `StdioServerTransport`, published as `@buiry/mcp@0.1.3`.

2. Express API with 29 routes across 10 groups — PostgreSQL + Redis on Railway, SHA-256 auth, rate limiting, Sentry monitoring.

3. React frontend with 10 pages — Vite + Tailwind, Stitch dark theme, Sonner notifications, export logs, sinusoidal activity graph, sidebar toggle.

4. TypeScript SDK with 14 adapters — published as `@buiry/buiry@0.1.1`. Python SDK with 14 adapters — built for PyPI as `buiry 0.1.0`.

5. ADK agents with Gemini — 7 working agents, Bridge server connecting TS pipeline, BuirySkill class for in-agent memory operations.

6. Data Agent pipeline — 4-layer PII, ThresholdCheck, Categorizer with ADK Bridge, QualityAuditor gate (≥60/100).

7. Blockchain layer — 4 Move contracts on Sui testnet, Walrus SEAL encryption, real signAndExecuteTransaction.

All 6 packages compile clean. No type errors. 244+ source files.

---

## Test Results

| Suite | Result |
|-------|--------|
| Python SDK (pytest) | 20/20 pass |
| TypeScript SDK (Vitest) | 19 pass, 4 skipped, 0 failed |
| 6 packages compile | All clean |
| E2E verification (9 endpoints) | All pass against Railway |
| ADK agents (10 total) | 7 working, 10 syntax valid |
| ADK Gemini tests | 6/6 pass |

---

## Live Deployment

| Service | URL |
|---------|-----|
| Frontend | https://buiry.vercel.app |
| Backend API | https://buiry.up.railway.app |
| npm SDK | `@buiry/buiry@0.1.1` |
| npm MCP | `@buiry/mcp@0.1.3` |
| Python SDK | `buiry 0.1.0` |

---

## Security Features

- **SHA-256 API key hashing** — Keys hashed before storage, compared on each request
- **Session isolation** — `api_key_id` FK prevents cross-tenant data access
- **SEAL encryption** — Walrus blob storage encrypted at rest
- **Silent failures eliminated** — All write operations validate success
- **4-layer PII detection** — Names, addresses, phones, emails, SSNs, credit cards, network IDs
- **Rate limiting** — `express-rate-limit` on all API routes
- **Security headers** — Helmet, restricted CORS
- **Error monitoring** — Sentry integration
- **Append-only sessions** — Sessions are never modified after writing

---

## What We Learned

**Multi-agent collaboration requires shared memory, not just shared prompts.** Agents that can read and write to the same context make better decisions than agents operating in isolation. The ADK Bridge connects Python agents to the TypeScript pipeline, enabling cross-language intelligence.

**Cloud-first with local fallback is the right pattern for developer tools.** Developers shouldn't need to configure a database to get started. The MCP server works out of the box with local JSON, but seamlessly upgrades to PostgreSQL when `BUIRY_API_KEY` is set.

**Zod validation is enforced documentation.** Requiring `next_steps` on every session forces agents to leave breadcrumbs. Schema validation catches malformed data at write time, not read time.

**Blockchain adds trust but is optional.** SEAL encryption and Sui contracts provide verifiable storage and transactions. But if you don't need them, Buiry works fine without them — the blockchain layer is an opt-in upgrade.

---

## Challenges

- **ADK Python-TS integration** — Connecting Python-based Google ADK agents to the TypeScript pipeline required building a dedicated HTTP bridge server. This added complexity but enabled Gemini-powered intelligence in an otherwise TypeScript-native stack.

- **PII detection without a full ML pipeline** — Regex-based PII detection catches structured patterns (emails, phones) but misses semantic PII (names, addresses). The ADK Bridge with Gemini fills this gap, but requires an API key — creating a dependency.

- **Concurrent session writes** — The read-modify-write pattern for session files has no locking, which could cause data loss under concurrent access. PostgreSQL solves this for cloud mode, but the local file path remains vulnerable.

---

## Future Work

- **Vector search** — Upgrade keyword search to semantic embeddings for context retrieval. "What did we do about auth?" should find sessions about JWT, OAuth, and token management regardless of exact words.

- **Dataset marketplace** — Trade curated datasets and memory bundles on the Sui marketplace. Agents share learned patterns across projects. Developers sell curated session histories as onboarding material.

- **Cross-project memory** — Agents that have worked on one project bring relevant patterns to new projects. "You've solved this before in project X" becomes a system-level memory.

- **Real-time collaboration** — Multiple agents working simultaneously with shared memory, resolving conflicts through the append-only log.
