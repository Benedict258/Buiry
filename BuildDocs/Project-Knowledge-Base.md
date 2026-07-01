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
| Commits | 2 (`9867167 Initialize Buiry`, `70255ec DOCS INITIALIZE`) |
| Code written | None — documentation only |
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
| MemWal | Walrus | Encrypted session memory backend. Semantic search via vector recall. Portable across tools/teams/machines. | Not built |
| Walrus | Walrus | Blob storage for session archives + dataset blobs. SEAL encrypted before upload. | Not built |
| SEAL | N/A | Threshold encryption layer. Encrypts everything before Walrus. Buiry infrastructure cannot read workspace content. | Not built |
| `WorkspaceOwnership` | Sui | One object per workspace. Proves ownership on-chain. Controls membership/delegates. | Not written |
| `DatasetListing` | Sui | One object per generated dataset. Stores walrus_blob_id, category, domain, owner, sample_size, price. | Not written |
| `MarketplacePurchase` | Sui | Trustless 90/10 revenue split — 90% to dataset owner, 10% to RevenueVault. Emits purchase event with blob ID. | Not written |
| `RevenueVault` | Sui | Shared object holding platform fees. Only admin can withdraw. | Not written |

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
| **1: Foundation** | Open source core on GitHub | AI_Starter.md, Build-Context-Memory.json, PRD/ARCH/DEV_PLAN templates, JSON schema at buiry.dev/schema/v1/ | Not started |
| **2: MCP Server** | `npm install -g buiry-mcp` | 7 MCP tools, local file mode, Claude Code/Cursor integration guides | Not started |
| **3: Co-pilot Skill** | One-command project init | buiry_init auto-generates files, buiry_start_session auto-detects on project open, semantic search via MemWal | Not started |
| **4: Dataset SDK** | `npm install buiry` | TypeScript + Python SDKs, Data Agent pipeline, developer dashboard, DatasetListing on Sui testnet | Not started |
| **5: Cloud + Marketplace** | buiry.dev web platform | MemWal-backed sessions, full dashboard, marketplace UI, all 4 Sui contracts, monetization tiers | Not started |

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
buiry-core/
├── packages/
│   ├── buiry-mcp/          # MCP server (npm: buiry-mcp)
│   │   ├── src/
│   │   │   ├── index.ts          # MCP server entry, registers all tools
│   │   │   ├── tools/
│   │   │   │   ├── session.ts    # buiry_start_session, buiry_end_session, buiry_log_decision
│   │   │   │   ├── context.ts    # buiry_get_context, buiry_flag_issue
│   │   │   │   ├── init.ts       # buiry_init
│   │   │   │   └── docs.ts       # buiry_generate_docs
│   │   │   ├── validator.ts      # JSON schema validation
│   │   │   ├── cloud.ts          # REST client to Buiry cloud backend
│   │   │   ├── local.ts          # Local file read/write for free tier
│   │   │   └── config.ts         # Reads .buiry/config.json
│   │   └── package.json
│   ├── sdk-ts/             # TypeScript SDK (npm: buiry)
│   │   ├── src/
│   │   │   ├── index.ts          # Exports Buiry class
│   │   │   ├── Buiry.ts          # Constructor, wrap(), remember(), recall(), datasets
│   │   │   ├── wrapper/
│   │   │   │   └── LLMWrapper.ts # Intercepts LLM calls, captures interactions
│   │   │   ├── adapters/
│   │   │   │   ├── anthropic.ts  # Wraps Anthropic client
│   │   │   │   ├── openai.ts     # Wraps OpenAI client
│   │   │   │   └── generic.ts    # Wraps any OpenAI-compatible API
│   │   │   └── api/
│   │   │       └── client.ts     # REST calls to Buiry cloud backend
│   │   └── package.json
│   ├── sdk-py/             # Python SDK (PyPI: buiry)
│   │   ├── buiry/
│   │   │   ├── __init__.py       # Exports Buiry class
│   │   │   ├── client.py         # Constructor, wrap(), remember(), recall()
│   │   │   ├── wrapper.py        # Intercepts LLM calls
│   │   │   └── adapters/
│   │   │       ├── anthropic.py  # Wraps Anthropic client
│   │   │       └── openai.py     # Wraps OpenAI client
│   │   └── setup.py
│   ├── data-agent/         # Background job processor
│   │   ├── src/
│   │   │   ├── jobs/
│   │   │   │   └── DatasetJob.ts       # Apalis job entry point
│   │   │   ├── pipeline/
│   │   │   │   ├── PrivacyPass.ts      # PII detection and stripping
│   │   │   │   ├── ThresholdCheck.ts   # Buffer until minimum sample size
│   │   │   │   ├── Aggregator.ts       # Merge into statistical claims
│   │   │   │   └── Categorizer.ts      # LLM-based category classification
│   │   │   ├── storage/
│   │   │   │   ├── WalrusWriter.ts     # Dataset blob upload to Walrus
│   │   │   │   └── SuiRegistrar.ts     # DatasetListing contract call
│   │   │   └── types.ts                # RawInteraction, SanitizedInteraction, AggregateClaim, DatasetCategory
│   │   └── package.json
│   └── adk-agents/          # Google ADK multi-agent system (hackathon layer)
│       ├── agents/
│       │   ├── coordinator.py   # CoordinatorAgent — orchestrates sub-agents
│       │   ├── session.py       # SessionAgent — calls buiry_start_session, buiry_end_session
│       │   ├── context.py       # ContextAgent — calls buiry_get_context, buiry_flag_issue
│       │   └── docs.py          # DocAgent — calls buiry_generate_docs
│       ├── tools/
│       │   └── buiry_mcp.py     # MCP client connecting to buiry-mcp (stdio)
│       └── pyproject.toml
├── apps/
│   ├── api/                # Buiry Cloud Backend
│   │   ├── src/
│   │   │   ├── index.ts          # Express server, middleware, route registration
│   │   │   ├── routes/
│   │   │   │   ├── session.ts    # CRUD for sessions, schema validation, MemWal writes
│   │   │   │   ├── dataset.ts    # Dataset listing, download, marketplace listing
│   │   │   │   └── workspace.ts  # Workspace creation, member management, Sui registration
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts       # API key validation, zkLogin session verification
│   │   │   │   └── ratelimit.ts  # Per-workspace burst + sustained limits via Redis
│   │   │   ├── memwal/
│   │   │   │   └── client.ts     # Only file that calls MemWal SDK directly
│   │   │   ├── walrus/
│   │   │   │   └── client.ts     # Only file that calls Walrus directly
│   │   │   └── sui/
│   │   │       └── client.ts     # Contract interactions
│   │   └── package.json
│   └── web/                # Buiry Dashboard (React)
│       ├── src/
│       │   ├── routes/
│       │   │   ├── Dashboard.tsx         # /dashboard
│       │   │   ├── SessionExplorer.tsx   # /dashboard/sessions
│       │   │   ├── DatasetBrowser.tsx    # /datasets
│       │   │   ├── Marketplace.tsx       # /marketplace
│       │   │   ├── Settings.tsx          # /settings
│       │   │   └── Docs.tsx              # /docs
│       │   └── ...
│       └── package.json
├── contracts/
│   └── buiry/
│       └── sources/
│           ├── workspace_ownership.move
│           ├── dataset_listing.move
│           ├── marketplace_purchase.move
│           └── revenue_vault.move
├── BuildDocs/
│   ├── AI_Starter.md
│   ├── Build-Context-Memory.json
│   └── Project-Knowledge-Base.md         # ← this file
├── ProjectDocs/
│   ├── Buiry_Standalone_Plan.md
│   ├── Buiry_DevPlan_Architecture.md
│   └── Hackathon Overview.md
└── README.md
```

---

## 12. Hackathon Context

| Detail | Value |
|---|---|
| Event | Kaggle & Google AI Agents: Intensive Vibe Coding Capstone Project |
| Deadline | July 6, 2026 @ 11:59 PM PT (~5 days remaining) |
| Strategy | Option B (Hybrid) — Google ADK orchestration layer on top of Buiry |
| Track | Freestyle (most likely fit) |
| Required | 3 of 6 course concepts demonstrated |

### Hackathon Criteria Coverage

| # | Concept | Demonstrated via |
|---|---|---|
| 1 | Agent / Multi-agent (ADK) | CoordinatorAgent → SessionAgent, ContextAgent, DocAgent in `packages/adk-agents/` |
| 2 | MCP Server | `buiry-mcp` with 7 tools, connected via stdio to ADK agents |
| 3 | Antigravity | Video demo showing rapid UI prototyping of Buiry dashboard |
| 4 | Security features | PII-stripping pipeline, SEAL encryption, append-only immutability |
| 5 | Deployability | `npx buiry-mcp` zero-install, documented Claude Code/Cursor setup |
| 6 | Agent skills (Agents CLI) | `google-agent-cli` used to scaffold and test ADK agents |

### Submission Requirements

| Requirement | Status |
|---|---|
| Writeup (<2500 words) | Not started |
| Cover image | Not started |
| YouTube video (<5 min) | Not started |
| Public repo or live demo | Repo exists, needs code |
| README with setup instructions | Needs writing |

### Scoring (100 points)

| Category | Points | Weight |
|---|---|---|
| The Pitch — Problem, Solution, Value | 30 | Concept relevance (10), Video quality (10), Writeup clarity (10) |
| The Implementation — Architecture, Code | 70 | Technical quality + agent tech integration (50), Documentation + README (20) |

---

## 13. Key Deliverables (Priority Order)

1. **Skill**: Declarative instruction file teaching any AI agent the Buiry protocol (`.opencode/skills/buiry/SKILL.md` or similar)
2. **MCP Server**: `packages/buiry-mcp` — Node.js/TypeScript, 7 tools, local file mode first
3. **ADK Agents**: `packages/adk-agents` — Python ADK layer calling Buiry MCP tools (for hackathon criteria)
4. **Cloud Backend**: `apps/api` — Express, session CRUD, auth
5. **Documents**: PRD.md, ARCHITECTURE.md, DEV_PLAN.md — filled with real Buiry content
6. **JSON Schema**: Hosted at buiry.dev/schema/v1/
7. **README**: Full setup instructions, exact starter prompt
8. **SDKs**: TypeScript + Python (post-hackathon)
9. **Frontend**: Dashboard + marketplace (post-hackathon)
10. **Sui Contracts**: 4 Move modules (post-hackathon)

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
| Code written | 0 lines |
| Documentation written | 4 files (3 in ProjectDocs, 2 in BuildDocs) |
| Backlog | 50+ items, fully prioritized |
| Sprint | Empty — no active work |
| Blocked items | None |
| Completed items | None |
| Next action | Begin Phase 1 — scaffold `packages/buiry-mcp` TypeScript project |

---

*Buiry Project Knowledge Base — generated 2026-07-01*
*Comprehensive reference. Read this before any other file.*
