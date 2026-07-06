# Buiry — Persistent Memory for AI Coding Agents

**Hackathon:** AI Agents: Intensive Vibe Coding Capstone Project
**Track:** Freestyle
**GitHub:** [Benedict258/Buiry](https://github.com/Benedict258/Buiry)
**MCP:** `@buiry/mcp@0.1.7` | **SDK:** `@buiry/buiry@0.1.1` | **Python:** `buiry 0.1.0`

---

## What Buiry Does

Buiry gives AI coding agents persistent memory across sessions. Every time a developer starts a new session, the agent loads the last 5 sessions — what was built, which decisions were made, what errors remain open, and what comes next. Mid-session, the agent logs decisions and flags issues. At session end, the agent saves everything to memory. The next agent picks up where the last one left off. No more context amnesia.

But Buiry goes further. A TypeScript data pipeline captures raw LLM interactions, strips PII with 4-layer pattern detection + Gemini-powered semantic scanning, classifies interactions into training datasets, and enforces a quality gate (score ≥ 60/100). The pipeline connects to a Python ADK bridge server where Gemini agents provide AI-powered PII detection, LLM-based classification, and automated quality auditing.

The output: every LLM-powered application becomes a training data source. Chatbots, coding agents, API endpoints — wrap with one line of code, and every interaction is captured, privacy-scrubbed, classified, and turned into labeled datasets the developer owns. Those datasets can be registered on Sui blockchain for provenance, stored on Walrus with SEAL encryption, and browsed from a live dashboard.

---

## Architecture (6 packages, 244+ files)

### 1. MCP Server (`@buiry/mcp@0.1.7`, npm published)
9 tools over stdio transport. Cloud-first: proxies through Railway API when `BUIRY_API_KEY` is set, falls back to local JSON file. Zod schema validation enforces that every session has `next_steps`, `decisions_log`, and `known_issues`.
| # | Tool | Description |
|---|------|-------------|
| 1 | `buiry_start_session` | Load last 5 sessions + project context |
| 2 | `buiry_end_session` | Validate and persist a completed session |
| 3 | `buiry_log_decision` | Record an architectural decision mid-session |
| 4 | `buiry_flag_issue` | Flag a known issue for future sessions |
| 5 | `buiry_get_context` | Search across all session history |
| 6 | `buiry_init` | Initialize a new Buiry project |
| 7 | `buiry_generate_docs` | Generate PRD, Architecture, or Dev Plan docs |
| 8 | `buiry_execute` | Universal intent router — natural language → tool |
| 9 | `buiry_sync` | Push local sessions to Buiry Cloud |

### 2. Express API (`apps/api`, Railway + PostgreSQL + Redis)
29 routes across 10 route groups. SHA-256 API key hashing, `express-rate-limit`, Helmet, CORS, Sentry. Session isolation via `api_key_id` FK. Real PostgreSQL health checks.

### 3. React Dashboard (`apps/web`, Vercel)
10 pages: Landing, Dashboard, Sessions, Datasets, Projects, ProjectDetail, Settings, Market, Documentation, Onboarding. Sonner notifications, export logs (JSON/CSV/TXT), sinusoidal activity graph, sidebar toggle, user authentication with signup/login. Auto-published API key at signup.

### 4. SDK (`@buiry/buiry@0.1.1` npm, `buiry 0.1.0` PyPI)
14 adapters with auto-detection: Anthropic, OpenAI, Gemini, Groq, Mistral, Cohere, xAI, DeepSeek, Together, Fireworks, Perplexity, Replicate, Ollama, Generic. Proxy-based silent wrapping. One line: `buiry.wrap(client)`.

### 5. ADK Agents (`packages/adk-agents`, 10 agents)
7 working agents powered by Gemini 2.5 Flash: ContextGuardian (PII), DatasetGenerator (classification), SessionAnalyst (patterns), IntentRouter (tool dispatch), QualityAuditor (≥60/100 gate), ContractGuardian (Sui verification), BuiryCLIAgent (CLI wrapper). ADK Bridge server (`server.py`) connects Python agents to TypeScript pipeline. `BuirySkill` class for in-agent memory operations.

### 6. Data Agent Pipeline (`packages/data-agent`, TypeScript)
4-layer PII (emails, phones, SSNs, credit cards, IPs, names, addresses, international phones) → ThresholdCheck (min 10 samples) → Aggregator → Categorizer (keyword + ADK Gemini as primary). Quality gate: datasets < 60/100 rejected.

### 7. Blockchain (`contracts/buiry`, Sui testnet)
4 Move contracts: `revenue_vault`, `marketplace_purchase`, `dataset_listing`, `workspace_ownership`. Package ID: `0x411d197869a261a42911ac454e063231301c18d0c0f9289f3a4c414db016e60e`. Real `signAndExecuteTransaction`. Walrus SEAL encryption.

---

## Course Concepts Demonstrated (6/6)

| Concept | Implementation |
|---------|---------------|
| **Google ADK** | 10 agents (7 working), ADK Bridge server, BuirySkill class |
| **MCP Server** | 9 tools, npm published, cloud-first architecture, Zod validation |
| **Security** | SHA-256 key hashing, 4-layer PII, SEAL encryption, session isolation FK |
| **Deployability** | Railway + Vercel + npm + PyPI, all 6 packages compile clean |
| **Antigravity** | MCP tested in Antigravity CLI, OpenCode MCP verified |
| **Agents CLI** | `BuiryCLIAgent` wraps 9 tools as FunctionTool, `agents chat --agent buiry` |

---

## Test Results

| Suite | Result |
|-------|--------|
| Python SDK | 20/20 pass |
| TypeScript SDK (Vitest) | 19 pass, 4 skipped, 0 failed |
| 6 packages compile | All clean (tsc no errors) |
| E2E verification (9 endpoints) | All pass against Railway |
| ADK Gemini tests | 6/6 pass |
| Jest→Vitest migration | Complete (Vitest v4.1.9) |

---

## Live Deployment

| Service | URL |
|---------|-----|
| Frontend | https://buiry.vercel.app |
| Backend API | https://buiry.up.railway.app |
| Build Report | https://raw.githubusercontent.com/Benedict258/Buiry/main/BuildReport.md |
| npm SDK | `@buiry/buiry@0.1.1` |
| npm MCP | `@buiry/mcp@0.1.7` |

---

## What We Learned

**Agents need shared memory, not shared prompts.** Agents reading and writing the same context make better decisions than isolated agents. The ADK Bridge shows Python agents can collaborate with TypeScript pipelines through HTTP.

**Cloud-first with local fallback works.** Developers start with local JSON. Setting an API key upgrades to PostgreSQL without code changes. `buiry_sync` bridges offline work to the cloud.

**Zod validation enforces documentation.** Every session must include `next_steps`, `decisions_log`, and `known_issues`. Schema catches malformed data at write time — no silent corruption.

**Blockchain adds trust but is optional.** SEAL encryption and Sui contracts provide verifiable storage. Without them, Buiry still works — the blockchain is an opt-in upgrade.

---

## Challenges

- **Python-TS integration** required building a dedicated HTTP bridge (`server.py`). Added complexity but enabled Gemini intelligence in a TypeScript-native stack.
- **PII without ML** — Regex catches structured patterns. ADK Bridge with Gemini fills the semantic gap but adds an API key dependency.
- **Concurrent writes** — Local file mode has no locking. PostgreSQL solves this but requires a database.

---

## Future Work

- Vector search for semantic context retrieval
- Dataset marketplace on Sui
- Cross-project agent memory
- Real-time collaboration with shared memory
