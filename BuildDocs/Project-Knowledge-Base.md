# Buiry — Project Knowledge Base
**Complete project understanding as of 2026-07-01**

> This document is the single source of truth for everything known about Buiry. Read this to understand the full scope without needing to parse all the docs.

---

## 0. Repository Facts

| Fact | Value |
|---|---|
| Repo name | `Buiry` |
| Remote | `https://github.com/Benedict258/Buiry.git` |
| Branch | `main` |
| Commits | 8679ce1+ (active development) |
| Code written | 244 files across 6 packages |
| OpenCode tracking | `.git/opencode` → `f4df43964c2b74983b0293a8d6eb74d69f09122b` |

---

## 1. What Buiry Is

Buiry = **BUild context memoRY**. A developer infrastructure platform that solves two problems:

1. **AI agent memory loss**: Every time a developer opens a new AI session (Cursor, Claude Code, Copilot), the agent forgets everything from the last session. Buiry gives agents persistent, append-only, cross-tool memory.

2. **Training data scarcity**: Developers building AI products (chatbots, agents, assistants) generate valuable real-world interaction data but have no clean way to capture, privacy-strip, and own it. Buiry harvests this data and produces verifiable datasets.

**The pitch**: "What ChatGPT/Claude does for themselves — generating training data from user interactions — Buiry makes available to any developer."

---

## 2. The Three Layers

### Layer 1: Core (Open Source)
Two files that work standalone, no install required:

- **`AI_Starter.md`**: Behavior contract for AI agents. Tells them what to read first, how to work, when to update memory, what they must never do. 7 sections, 9 mandatory rules.
- **`Build-Context-Memory.json`**: Append-only session log. Stores `project_identity` (immutable once set), `config`, `summary`, and a `sessions[]` array. Each session object has: progress, changes, decisions, errors, known issues, file/module map, next steps, dataset signals.

### Layer 2: MCP Server (`buiry-mcp`)
Node.js + TypeScript process. Distributed via `npx buiry-mcp`. Replaces manual prompt-pasting:

| Tool | Trigger | What it does |
|---|---|---|
| `buiry_init` | New project | Generates full file structure: AI_Starter.md, Build-Context-Memory.json, PRD.md, ARCHITECTURE.md, DEV_PLAN.md |
| `buiry_start_session` | Every AI session start | Returns project identity + last N sessions + next_steps + open issues. Replaces manual paste entirely. |
| `buiry_end_session` | Every AI session end | Validates session object against JSON schema, enforces append-only + required fields, writes to cloud or local file |
| `buiry_log_decision` | Mid-session | Appends a decision to active session without ending it |
| `buiry_get_context` | On demand | Semantic search across all past sessions (MemWal vector recall for cloud, keyword search for free) |
| `buiry_flag_issue` | Mid-session | Logs a known issue, increments open_issues counter |
| `buiry_generate_docs` | On demand | LLM synthesis of PRD/ARCH/DEV_PLAN from accumulated session history |

Architecture: `mcp-server (local) → REST API → Cloud Backend (Express) → MemWal → Walrus → Sui`

### Layer 3: Dataset SDK (`buiry` on npm/PyPI)
One line wraps any LLM client and silently captures interaction data:

```typescript
const buiry = new Buiry({ apiKey, projectId, domain: "customer-support", capture: true })
const llm = buiry.wrap(anthropicClient)
// All calls now captured, privacy-processed, routed to Data Agent
```

Data Agent pipeline (8 steps, async via Apalis job queue):

| Step | Action | Output |
|---|---|---|
| 1. Receive | Raw interaction captured by SDK wrapper | DatasetJob queued |
| 2. Privacy Pass | Strip PII: regex + NER, hash IDs, relativize timestamps | SanitizedInteraction or REJECTED |
| 3. Threshold Check | Buffer until 10+ interactions (configurable) | Proceed or buffer |
| 4. Aggregate | Merge into statistical claims | AggregateClaim[] |
| 5. Categorize | LLM classification into 5 categories | DatasetCategory + confidence |
| 6. Walrus Store | Serialize JSON+CSV, SEAL encrypt, upload to Walrus | blobId + blobUrl |
| 7. Sui Register | Create DatasetListing Sui object on-chain | suiObjectId |
| 8. Notify | Update dashboard, emit event | Developer sees dataset |

---

## 3. Blockchain Components (Phases 4-5)

| Component | Chain | Purpose | Status |
|---|---|---|---|
| MemWal | Walrus | Encrypted session memory backend. Semantic search via vector recall. Portable across tools/teams/machines. | Partial (client wrapper in apps/api) |
| Walrus | Walrus | Blob storage for session archives + dataset blobs. SEAL encrypted before upload. | Partial (client wrapper in apps/api) |
| SEAL | N/A | Threshold encryption layer. Encrypts everything before Walrus. Buiry infrastructure cannot read workspace content. | Not built |
| `WorkspaceOwnership` | Sui | One object per workspace. Proves ownership on-chain. Controls membership/delegates. | Deployed to testnet (0x411d197869a261a42911ac454e063231301c18d0c0f9289f3a4c414db016e60e) |
| `DatasetListing` | Sui | One object per generated dataset. Stores walrus_blob_id, category, domain, owner, sample_size, price. | Deployed to testnet |
| `MarketplacePurchase` | Sui | Trustless 90/10 revenue split — 90% to dataset owner, 10% to RevenueVault. Emits purchase event with blob ID. | Deployed to testnet |
| `RevenueVault` | Sui | Shared object holding platform fees. Only admin can withdraw. | Deployed to testnet |

---

## 4. Full Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BUIRY PLATFORM                               │
│                                                                       │
│  DEVELOPER TOOLS                  END-USER PRODUCTS                  │
│  ┌────────────────────┐           ┌──────────────────────────────┐   │
│  │ buiry-mcp          │           │ Developer's AI product        │   │
│  │ npx buiry-mcp      │           │ (chatbot / agent / assistant) │   │
│  └──────────┬─────────┘           └──────────────┬───────────────┘   │
│             │ MCP protocol                       │ buiry SDK          │
│  ┌──────────▼─────────────────────────────────────▼─────────────────┐│
│  │              BUIRY CLOUD BACKEND                                  ││
│  │              Node.js + Express + TypeScript                       ││
│  │                                                                   ││
│  │  /api/session    /api/dataset    /api/workspace    /api/market    ││
│  └──────────┬─────────────┬──────────────┬──────────────────────────┘│
│             │             │              │                             │
│  ┌──────────▼──────┐  ┌───▼────────┐  ┌─▼──────────────────────┐    │
│  │ MemWal           │  │ Data Agent  │  │ Marketplace             │    │
│  │ session memory   │  │ (Apalis     │  │ Sui smart contracts     │    │
│  │ + recall         │  │  job queue) │  │ + revenue distribution  │    │
│  └──────────┬───────┘  └───┬────────┘  └─┬──────────────────────┘    │
│             │              │              │                             │
│  ┌──────────▼──────────────▼──────────────▼──────────────────────┐   │
│  │              WALRUS (blob storage — SEAL encrypted)             │   │
│  │   Session archives │ Dataset blobs │ Workspace definitions      │   │
│  └───────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │              SUI BLOCKCHAIN                                      │  │
│  │   WorkspaceOwnership │ DatasetListing │ MarketplacePurchase      │  │
│  │   RevenueVault       │ AgentDelegate  │                          │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| API server | Node.js + Express + TypeScript | Primary backend runtime |
| Database | PostgreSQL + pgvector | Metadata, vector search, job queue backend |
| Cache | Redis | Rate limiting, session caching, embedding cache |
| Session memory (cloud) | MemWal | Encrypted, portable, MemWal-backed session state |
| Session memory (free) | Local JSON file | Build-Context-Memory.json |
| Dataset storage | Walrus | Blob storage, SEAL encrypted, on-chain metadata |
| Encryption | SEAL | Threshold encryption before any data reaches Walrus |
| Blockchain | Sui | Ownership objects, dataset registration, marketplace |
| Job queue | Apalis (PostgreSQL backend) | Data Agent runs as async background jobs |
| SDK: TypeScript | npm — `buiry` | TypeScript/JavaScript first |
| SDK: Python | PyPI — `buiry` | Python second |
| MCP server | Node.js + TypeScript — `buiry-mcp` | Published to npm |
| Frontend | React + Vite + Tailwind CSS | Dashboard, dataset browser, marketplace |
| Schema validation | JSON Schema (buiry.dev/schema/v1/) | Co-pilot validates session objects before writing |
| Hosting (backend) | Railway | PostgreSQL + Redis managed hosting for Express API at buiry.up.railway.app |
| Hosting (frontend) | Vercel | React dashboard deployment |
| CI/CD | GitHub Actions | Automated testing and deployment |

---

## 6. Architectural Principles

| Principle | Rule |
|---|---|
| Single source of truth | MemWal is cloud session backend. Local JSON is cache, not source of truth. |
| Privacy by design | PII stripped at entry point by Data Agent — before any storage. Never in system at any layer. |
| Chokepoint discipline | SDK wrapper is the only path to data capture. Data Agent is the only writer to `buiry::datasets` namespaces. |
| Append-only memory | Session objects immutable once written. `project_identity` immutable once initialized. No exceptions. |
| Blockchain where it matters | Walrus + Sui for dataset ownership and provenance. MemWal for portable encrypted memory. Not blockchain for its own sake. |
| Open source core, paid cloud | SDK and MCP server are open source. Cloud platform and marketplace are the monetization layer. |

---

## 7. Build-Context-Memory.json Schema (v1)

```json
{
  "$schema": "https://buiry.dev/schema/v1/build-context-memory.json",
  "project_identity": {
    "name": "",
    "description": "",
    "version": "0.1.0",
    "stack": [],
    "architecture_summary": "",
    "repo_url": "",
    "created_at": "",
    "owner": "",
    "buiry_version": "1.0.0"
  },
  "config": {
    "max_sessions_in_context": 5,
    "auto_summarize_after": 10,
    "dataset_capture": false,
    "dataset_domain": ""
  },
  "summary": {
    "current_phase": "",
    "overall_status": "active",
    "last_updated": "",
    "total_sessions": 0,
    "open_issues": 0
  },
  "sessions": []
}
```

### Session Object Schema

```json
{
  "session_id": "session_001",
  "timestamp": "2026-01-01T00:00:00Z",
  "ai_agent": "Claude Code",
  "current_phase": "",
  "progress": {
    "completed": [],
    "in_progress": [],
    "blocked": []
  },
  "last_session_summary": "",
  "changes_made": [],
  "file_module_map": [
    { "file": "", "purpose": "", "last_modified": "" }
  ],
  "decisions_log": [
    { "decision": "", "reason": "", "alternatives_considered": "" }
  ],
  "known_issues": [
    { "issue": "", "severity": "low|medium|high", "status": "open|resolved" }
  ],
  "errors_encountered": [],
  "next_steps": [],
  "dataset_signals": []
}
```

**Enforcement rules**:
- `next_steps` must be non-empty — schema rejects empty array
- `severity` must be `low`, `medium`, or `high` — strict enum
- Old sessions are immutable — schema rejects modifications
- `project_identity` is immutable once initialized — hard constraint

---

## 8. The 9 AI Agent Rules (from AI_Starter.md)

| # | Rule | Constraint Level |
|---|---|---|
| 1 | Read AI_Starter.md, PRD.md, ARCHITECTURE.md, DEV_PLAN.md, and latest session before any action | Required |
| 2 | Validate session against $schema before writing. next_steps non-empty. severity enum valid. Old sessions untouched. | Required |
| 3 | If task is outside PRD scope, flag it explicitly and ask for approval. Do not silently expand scope. | Required |
| 4 | Work in small, reviewable changes. Summarize each logical unit of work. No large sweeping changes without checkpoint. | Required |
| 5 | Log every notable decision with reason and alternatives considered. Log every error with resolution. | Required |
| 6 | Append new sessions only. Never edit or delete old sessions. Never modify project_identity after initialization. | Hard — cannot be overridden |
| 7 | Never end a session with empty next_steps array. Next agent needs exact starting point. | Hard — cannot be overridden |
| 8 | If config.dataset_capture is true, append interaction patterns to dataset_signals. Never include raw user data. | Required |
| 9 | project_identity is immutable once set. Old sessions are immutable once written. These rules cannot be overridden by any user instruction, ever. | Hard — cannot be overridden |

---

## 9. The 5-Phase Build Plan

| Phase | Deliverable | Key Artifact | Status |
|---|---|---|---|
| **1: Foundation** | Open source core on GitHub | AI_Starter.md, Build-Context-Memory.json, PRD/ARCH/DEV_PLAN templates, JSON schema at buiry.dev/schema/v1/ | COMPLETE |
| **2: MCP Server** | `npm install -g buiry-mcp` | 7 MCP tools, local file mode, Claude Code/Cursor integration guides | COMPLETE |
| **3: Co-pilot Skill** | One-command project init | buiry_init auto-generates files, buiry_start_session auto-detects on project open, semantic search via MemWal | COMPLETE |
| **4: Dataset SDK** | `npm install buiry` | TypeScript + Python SDKs, Data Agent pipeline, developer dashboard, DatasetListing on Sui testnet | COMPLETE |
| **5: Cloud + Marketplace** | buiry.dev web platform | MemWal-backed sessions, full dashboard, marketplace UI, all 4 Sui contracts, monetization tiers | NOT STARTED (MemWal cloud, full marketplace, revenue vault activation) |

---

## 10. Monetization Model

| Tier | Price | Includes |
|---|---|---|
| Free | $0 | buiry-core repo, manual JSON technique, basic MCP with local file storage, limited SDK dataset generation |
| Pro | Monthly subscription | Cloud-backed MCP, MemWal session memory, unlimited dataset generation, dashboard, marketplace listing |
| Enterprise | Annual contract | Custom storage, SLA, dedicated Data Agent pipeline, team workspace sharing, full Sui integration, on-premise option |
| Marketplace commission | Per-sale | 10% platform fee on every dataset sale — enforced by Sui MarketplacePurchase smart contract, automatic and trustless |

---

## 11. Package Structure (Component Map)

```
Buiry/
├── packages/
│   ├── buiry-mcp/          # MCP server (8 source files)
│   ├── sdk-ts/             # TypeScript SDK (7 source files)
│   ├── data-agent/         # Data Agent pipeline (6 source files)
│   └── adk-agents/         # Google ADK agents (5 source files)
├── apps/
│   ├── api/                # Express backend (12 source files)
│   └── web/                # React dashboard (15+ source files)
├── contracts/
│   └── buiry/sources/      # 4 Sui Move contracts (deployed to testnet)
├── BuildDocs/              # Project documentation
├── SubmissionDocs/         # Hackathon submission docs
└── schemas/                # JSON Schema files
```

---

## 12. Hackathon Context

| Detail | Value |
|---|---|
| Event | Kaggle & Google AI Agents: Intensive Vibe Coding Capstone Project |
| Deadline | July 6, 2026 @ 11:59 PM PT (submitted) |
| Strategy | Option B (Hybrid) — Google ADK orchestration layer on top of Buiry |
| Track | Freestyle |
| Required | 3 of 6 course concepts demonstrated |

### Hackathon Criteria Coverage

| # | Concept | Demonstrated via |
|---|---|---|
| 1 | Agent / Multi-agent (ADK) | CoordinatorAgent → SessionAgent, ContextAgent, DocAgent in `packages/adk-agents/` with SequentialAgent pattern |
| 2 | MCP Server | `buiry-mcp` with 7 tools, connected via stdio to ADK agents |
| 3 | Security features | PII-stripping pipeline in Data Agent, append-only immutability, security audit complete |
| 4 | Deployability | `npx buiry-mcp` zero-install, documented Claude Code/Cursor setup, Railway/Vercel deployment |

### Submission Requirements

| Requirement | Status |
|---|---|
| Writeup (<2500 words) | Complete |
| Cover image | Complete |
| YouTube video (<5 min) | Complete |
| Public repo or live demo | Repo exists with 244 files, deployed |
| README with setup instructions | Complete |

### Scoring (100 points)

| Category | Points | Weight |
|---|---|---|
| The Pitch — Problem, Solution, Value | 30 | Concept relevance (10), Video quality (10), Writeup clarity (10) |
| The Implementation — Architecture, Code | 70 | Technical quality + agent tech integration (50), Documentation + README (20) |

---

## 13. Key Deliverables (Priority Order)

1. **Skill**: Declarative instruction file teaching any AI agent the Buiry protocol (`.opencode/skills/buiry/SKILL.md`) — COMPLETE
2. **MCP Server**: `packages/buiry-mcp` — Node.js/TypeScript, 7 tools, local file mode — COMPLETE
3. **ADK Agents**: `packages/adk-agents` — Python ADK layer calling Buiry MCP tools — COMPLETE
4. **Cloud Backend**: `apps/api` — Express, session CRUD, auth, deployed to Railway — COMPLETE
5. **Documents**: PRD.md, ARCHITECTURE.md, DEV_PLAN.md — filled with real Buiry content — COMPLETE
6. **JSON Schema**: Hosted at buiry.dev/schema/v1/ — COMPLETE
7. **README**: Full setup instructions, exact starter prompt — COMPLETE
8. **SDKs**: TypeScript SDK (`packages/sdk-ts`) — COMPLETE
9. **Data Agent**: Pipeline with PII stripping, aggregation, categorization (`packages/data-agent`) — COMPLETE
10. **Frontend**: React dashboard + dataset browser (`apps/web`) — COMPLETE
11. **Sui Contracts**: 4 Move modules deployed to testnet — COMPLETE
12. **CI/CD**: GitHub Actions active — COMPLETE
13. **Python SDK**: `packages/sdk-py` — POST-HACKATHON
14. **Full Marketplace**: MemWal cloud, revenue vault activation — POST-HACKATHON (Phase 5)

---

## 14. Technical Risks (Priority)

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | Privacy pass misses PII pattern | Medium | High | Layered: regex + NER + threshold minimum. Err on discard. Regular PII audits. |
| 2 | Minimum threshold (10 interactions) too high for low-traffic products | High | Medium | Make threshold configurable per workspace. Default 10, minimum 1 for dev mode. |
| 3 | JSON schema too strict causes adoption friction | Medium | Medium | Warn not reject on non-critical fields. Only hard-reject on immutability violations and missing next_steps. |
| 4 | LLM categorization produces wrong category | Medium | Low | Low impact — data still captured. Re-categorization job can run retroactively. |
| 5 | Walrus storage costs exceed expectations | Medium | Medium | Monitor per-workspace usage. Enforce storage quotas per tier. |
| 6 | MemWal API changes break session layer | Low | High | Pin MemWal SDK version. All MemWal calls through single client file. |
| 7 | Sui contract bugs post-deployment | Low | High | Testnet-first, audit before mainnet. Marketplace is Phase 5 — time to harden. |

---

## 15. Current Status

| Item | State |
|---|---|
| Code written | 244 files across 6 packages |
| Documentation written | 8+ docs files (BuildDocs, SubmissionDocs, ProjectDocs) |
| Tests | 37/37 passing |
| Backend | Deployed to Railway at buiry.up.railway.app |
| Frontend | Deployed to Vercel |
| Sui contracts | Deployed to testnet |
| CI/CD | GitHub Actions active |
| Backlog | Phase 5 (Cloud + Marketplace) — not started |
| Completed items | Phases 1-4 complete, hackathon submitted |
| Next action | Phase 5: MemWal cloud integration, full marketplace, revenue vault activation |

---

*Buiry Project Knowledge Base — generated 2026-07-01*
*Comprehensive reference. Read this before any other file.*
