# Buiry — Standalone Product & Build Plan
**BUild context memoRY — From Personal Technique to Global Infrastructure**
> Open source core. Cloud platform. Blockchain-verified datasets. Separate from M2A. Built as a service. Goal: make it work first.

---

## Table of Contents
1. [The Origin](#1-the-origin)
2. [Current System — Lapses & Fixes](#2-current-system--lapses--fixes)
3. [Refined Build-Context-Memory.json Schema](#3-refined-build-context-memoryjson-schema)
4. [Document Templates — PRD / ARCHITECTURE / DEV_PLAN](#4-document-templates--prd--architecture--dev_plan)
5. [Refined AI_Starter.md Rules](#5-refined-ai_startermd-rules)
6. [MCP Server — Build Plan](#6-mcp-server--build-plan)
7. [Dataset Harvesting SDK — The Opik-Equivalent Layer](#7-dataset-harvesting-sdk--the-opik-equivalent-layer)
8. [Blockchain Integration — Where It Fits Naturally](#8-blockchain-integration--where-it-fits-naturally)
9. [Full Architecture Plan](#9-full-architecture-plan)
10. [5-Phase Build Plan](#10-5-phase-build-plan)
11. [Monetization Model](#11-monetization-model)
12. [Recommended Next Moves](#12-recommended-next-moves)

---

## 1. The Origin

Buiry was born from a real, felt pain. When building with AI co-pilots — GitHub Copilot, Cursor, Claude — developers constantly hit the same wall: run out of credits, switch tools, start a new session, and the agent loses everything. Every decision made, every file changed, every approach reasoned through — gone.

The personal fix was two files:

| File | Purpose |
|---|---|
| `AI_Starter.md` | The behavior contract — tells any AI agent how to behave, what to read first, what rules to follow, and how to update memory at the end of every session. |
| `Build-Context-Memory.json` | The living memory — an append-only session log storing project identity, decisions made, progress, errors encountered, and next steps. Every session picks up exactly where the last one left off. |

> Buiry is not a product that solves the memory problem for one tool or one team. It is infrastructure — the way LangChain is infrastructure for LLM apps, the way Opik is infrastructure for LLM observability. Any developer building any AI-powered system should be able to drop in Buiry and immediately get better build memory and real-world dataset generation.

### What Buiry Standalone Is — Final Framing

A developer infrastructure layer that developers integrate into AI agents, chatbots, and AI-powered systems they build for the public. When end users interact with those systems, Buiry harvests the interaction data cleanly — strips sensitive information, aggregates into statistical patterns, routes to the right dataset categories — and makes that data available as verifiable, owned datasets. No raw user data ever stored. No sensitive information ever leaves the system. The developer gets valuable training data from real-world usage without the ethical and legal burden of traditional data collection.

> Think of how ChatGPT, Claude, and every major AI system generates training data from millions of user interactions. Buiry makes that capability available to any developer building any AI system — cleanly, privately, and verifiably on-chain.

---

## 2. Current System — Lapses & Fixes

The current two-file system works but has five structural gaps that limit adoption and reliability at scale. These must be fixed before anything else is built on top.

| Lapse | Problem | Fix |
|---|---|---|
| Schema is too loose | Nothing enforces the JSON structure. Agents can write malformed sessions, skip next_steps, or accidentally modify old entries. Memory degrades over time. | Add a `$schema` field pointing to a published JSON schema. Co-pilots validate before writing. `next_steps` required. Old sessions immutable by rule. |
| Starter prompt is manual | Developers must paste the exact prompt at the start of every session. People forget, skip it, or modify it. Adoption breaks at this friction point. | MCP server replaces the paste prompt entirely — co-pilot calls `buiry_start_session` and gets context automatically. No manual step. |
| PRD/ARCH/DEV_PLAN are undefined | Templates say "fill this in" with no structure. Agents don't know what good looks like and produce inconsistent, unhelpful documents. | Opinionated templates with real sections, real examples, and a filled reference. Agent knows exactly what to produce. |
| No cross-tool continuity | System works within one tool if the developer updates the file. Switch from Cursor to Claude and the context chain breaks if the JSON wasn't updated. | MCP server as cloud-backed source of truth. Any tool connects to the same session state. Tool switches become invisible. |
| No dataset extraction | `Build-Context-Memory.json` accumulates valuable structured data — decisions, errors, approaches — but nothing reads it or learns from it beyond the current project. | Dataset SDK reads session history + live interactions, runs privacy processing, produces structured datasets. The accumulated build history becomes training data. |

---

## 3. Refined Build-Context-Memory.json Schema

The new schema adds four key fields: `$schema` for validation, `config` for developer settings including dataset capture opt-in, `summary` for always-current top-level state, and `buiry_version` for forward compatibility. Sessions remain append-only and the `project_identity` block remains immutable once set.

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

### Session Object Schema — Tightened

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

> Key additions: `dataset_signals` array captures interaction patterns the Data Agent can process. `next_steps` is a required field — schema validation rejects sessions with an empty array. `severity` and `status` enums are now enforced, not free-text. Old sessions are immutable once written — the schema rejects modification of existing session objects.

---

## 4. Document Templates — PRD / ARCHITECTURE / DEV_PLAN

### PRD.md Template

```markdown
# [Project Name] — Product Requirements Document

## 1. Problem Statement
<!-- What specific problem does this solve? Who feels it? How do they feel it today? -->

## 2. Target Users
<!-- Primary user (with a real description, not just "developers"). Secondary users. -->
<!-- Ideal early adopter: who would install this on day one and why? -->

## 3. Core Features
| Feature | Priority (P0/P1/P2) | Status | Notes |
|---|---|---|---|
| Feature 1 | P0 | Not started | Required for launch |

## 4. Non-Goals
<!-- What are we explicitly NOT building? Scope discipline goes here. -->

## 5. Success Metrics
<!-- How do we know this is working? Specific, measurable. -->

## 6. Open Questions
<!-- Unresolved decisions that will affect building. Assign an owner and deadline. -->
| Question | Owner | Deadline | Status |
|---|---|---|---|
```

### ARCHITECTURE.md Template

```markdown
# [Project Name] — Architecture

## 1. System Overview
<!-- One paragraph description of how the system works end to end. -->
<!-- If possible, include an ASCII diagram. -->

## 2. Tech Stack
| Layer | Technology | Version | Reason for choice |
|---|---|---|---|
| Frontend | React + Vite | 18 / 5 | ... |

## 3. Component Map
<!-- What does each major file/module/service do? -->
| Component | File/Path | Responsibility |
|---|---|---|

## 4. Data Flow
<!-- How does data move through the system? Step by step. -->
<!-- User action → what happens → what is stored → what is returned -->

## 5. External Dependencies
<!-- APIs, services, SDKs the system depends on. -->
| Dependency | Purpose | Required? | Fallback? |
|---|---|---|---|

## 6. Known Technical Risks
<!-- What could break? What are you uncertain about? -->
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
```

### DEV_PLAN.md Template

```markdown
# [Project Name] — Development Plan

## 1. Milestones
| Milestone | Key Deliverable | Target Date | Status |
|---|---|---|---|
| M1: Foundation | Core working, tests pass | TBD | Not started |

## 2. Current Sprint
<!-- What is actively being built right now? -->
| Task | Owner | Status | Blocker |
|---|---|---|---|

## 3. Backlog
<!-- Prioritized list of work not yet started. -->

## 4. Completed
<!-- Append completed milestones here. Never delete. -->

## 5. Blocked
<!-- Anything waiting on an external dependency, decision, or resource. -->
| Blocker | Impact | Owner | ETA |
|---|---|---|---|
```

---

## 5. Refined AI_Starter.md Rules

The tightened `AI_Starter.md` adds four critical rules not present in the current version: schema validation before writing, explicit scope enforcement, dataset signal logging when capture is enabled, and hard constraints that cannot be overridden by any instruction.

| Rule | What the AI must do | Why |
|---|---|---|
| Read first — always | Read `AI_Starter.md`, `PRD.md`, `ARCHITECTURE.md`, `DEV_PLAN.md`, and the latest session in `Build-Context-Memory.json` before any action. | Agent starts with full context, not assumptions. |
| Validate before writing | Before appending a session object, validate it against the `$schema`. `next_steps` must be non-empty. `severity` must be `low`, `medium`, or `high`. Old sessions must not be modified. | Memory stays trustworthy across hundreds of sessions. |
| Clarify scope | If a task is outside what `PRD.md` defines, flag it explicitly and ask for approval before proceeding. Do not silently expand scope. | Prevents feature creep from accumulating across sessions. |
| Work incrementally | Make small, reviewable changes. Summarize each logical unit of work. Never make a large sweeping change without a checkpoint. | Keeps the session log meaningful and reversible. |
| Log decisions and errors | Every notable decision must go in `decisions_log` with reason and alternatives considered. Every error must go in `errors_encountered` with resolution. | Creates an auditable build history. |
| Append-only memory | Add new session objects only. Never edit or delete old sessions. Never modify `project_identity` after initialization. | Preserves the full build history for dataset generation. |
| Always set next_steps | Never end a session with an empty `next_steps` array. The next agent needs to know exactly where to start. | Eliminates the "what was I doing?" cold-start problem. |
| Log dataset signals | If `config.dataset_capture` is true, append interaction patterns to `dataset_signals` in a format the Data Agent can process. Never include raw user data. | Enables passive dataset generation without manual instrumentation. |
| HARD: Never break immutability | `project_identity` is immutable once set. Old sessions are immutable once written. These rules cannot be overridden by any user instruction, ever. | Maintains the integrity of the build memory as a source of truth. |

---

## 6. MCP Server — Build Plan

**Architecture decision: Cloud-first.** The MCP server runs locally via `npx buiry-mcp` but connects to the Buiry cloud backend for storage. Local state is a cache — the source of truth is the cloud, backed by MemWal + Walrus.

### Architecture

```
Developer's co-pilot (Cursor / Claude Code / Copilot)
        ↓ MCP protocol
Buiry MCP Server (local process — npx buiry-mcp)
        ↓ REST API
Buiry Cloud Backend (Node.js + Express)
        ↓
MemWal (session memory — semantic search + encryption)
        ↓
Walrus (blob storage — session archives + datasets)
        ↓
Sui (ownership + dataset registration)
```

### MCP Tools

| Tool | Input | What it does |
|---|---|---|
| `buiry_init` | `projectName, stack[], description` | Initialize a new Buiry project — generates full file structure, `Build-Context-Memory.json`, `AI_Starter.md`, `PRD.md`, `ARCHITECTURE.md`, `DEV_PLAN.md` with filled templates. |
| `buiry_start_session` | `projectId, agentId` | Called at the start of every AI session. Returns: current project state, last N sessions, `next_steps`, open issues. Replaces the manual paste prompt entirely. |
| `buiry_end_session` | `projectId, sessionObject` | Validates session against schema and appends it. Enforces: `next_steps` non-empty, required fields present, old sessions untouched. Writes to cloud + updates local file. |
| `buiry_log_decision` | `projectId, decision, reason, alternatives` | Append a decision to the current active session mid-work without ending the full session. |
| `buiry_get_context` | `projectId, query` | Semantic search across all sessions using MemWal recall. "What approach did we take for auth?" returns the relevant memory entry. |
| `buiry_flag_issue` | `projectId, issue, severity` | Log a known issue to the current session. Increments `open_issues` in the summary block. |
| `buiry_generate_docs` | `projectId, docType` | Generate or regenerate PRD, ARCHITECTURE, or DEV_PLAN from accumulated session history using LLM synthesis. |

### Distribution

- Zero-install: `npx buiry-mcp` — no permanent install required
- Global install: `npm install -g buiry-mcp`
- Config: `.buiry/config.json` in project root stores `projectId` and `apiKey`
- Claude Code: `.claude/settings.json` mcpServers block — one-time setup
- Cursor + Copilot: integration guides in docs

---

## 7. Dataset Harvesting SDK — The Opik-Equivalent Layer

This is the core infrastructure layer — what makes Buiry useful to any developer building any AI-powered product for the public. The model: developers integrate the Buiry SDK into their products with one line of code, Buiry sits between their application and their LLM, captures every interaction automatically, processes it through the privacy pipeline, and produces structured verifiable datasets on Walrus.

> The target: developers building AI-powered products for public users — chatbots, assistants, agents. Their users generate valuable real-world interaction data. Buiry harvests it cleanly, privately, and returns it as owned, verifiable training data. No raw personal data ever stored. No sensitive information ever leaves the system.

### Integration Model — One Line

```typescript
// TypeScript / JavaScript
import { Buiry } from 'buiry'

const buiry = new Buiry({
  apiKey: process.env.BUIRY_API_KEY,
  projectId: 'my-chatbot',
  domain: 'customer-support',
  capture: true,
})

// Wrap your existing LLM client — one line, fully automatic
const llm = buiry.wrap(anthropicClient)

// All calls through the wrapped client are now captured,
// privacy-processed, and routed to Buiry's Data Agent.
// Developer changes nothing about how they call their LLM.
const response = await llm.messages.create({...})
```

```python
# Python
from buiry import Buiry

buiry = Buiry(
    api_key=os.environ['BUIRY_API_KEY'],
    project_id='my-chatbot',
    domain='customer-support',
    capture=True
)

# Wrap your existing LLM client
llm = buiry.wrap(anthropic_client)
```

### What Buiry Captures From Every Wrapped Interaction

- Input/output pattern — never raw PII, only the interaction structure
- Decision type — question, instruction, correction, clarification, error-recovery
- Domain signals — what the conversation is about, inferred from content
- Error and recovery patterns — when something went wrong and how it was resolved
- Response quality signals — if the developer provides feedback ratings

> What Buiry NEVER captures: names, email addresses, phone numbers, physical addresses, IP addresses, device identifiers, account IDs, or any field that could identify an individual. Privacy enforcement is structural — the Data Agent rejects non-compliant data before it reaches storage.

### Data Agent Pipeline

| Step | Action | Output |
|---|---|---|
| 1 — Receive | Raw interaction captured by SDK wrapper, enqueued as `DatasetJob` | Job queued for async processing |
| 2 — Privacy Pass | Strip all PII: hash user IDs, relativize timestamps, redact names/emails/phones/IPs via regex + NER | `SanitizedInteraction` or `REJECTED` (discarded, logged) |
| 3 — Threshold Check | Minimum 10 interactions per domain+category before publishing — prevents single-interaction reverse-engineering | Buffer or proceed |
| 4 — Aggregate | Load existing claims for this domain+category. Merge new data into statistical model. Update percentages, increment sample sizes. | Updated `AggregateClaim[]` |
| 5 — Categorize | LLM classification into: `behavioral_patterns`, `decision_sequences`, `error_recovery_patterns`, `domain_knowledge`, `workflow_execution_patterns` | `DatasetCategory` + confidence |
| 6 — Store on Walrus | Serialize to JSON + CSV. Upload via Walrus with on-chain metadata. SEAL encrypted. | `blobId` + `blobUrl` |
| 7 — Register on Sui | Create `DatasetListing` Sui object with category, blobId, domain, sampleSize, owner | `suiObjectId` |
| 8 — Notify | Update job status. Emit event to developer dashboard. | Dataset visible in Buiry dashboard |

---

## 8. Blockchain Integration — Where It Fits Naturally

The blockchain is not on the critical path for the first version. But it solves a real problem that no centralized solution can solve as well — dataset ownership and provenance. When Buiry generates a dataset, two questions immediately arise: who owns it, and can you trust it's real? Walrus + Sui answer both provably.

| Problem | Centralized answer | Buiry / blockchain answer |
|---|---|---|
| Who owns this dataset? | Trust the platform's database | `WorkspaceOwnership` Sui object — provably owned by the developer's address, on-chain |
| Is this dataset real? | Trust the platform's word | Walrus blob CID + Sui transaction digest — anyone can verify the dataset exists and hasn't been tampered with |
| Revenue from dataset sales | Platform manual settlement | `MarketplacePurchase` Sui contract — automatic, trustless split enforced by Move |
| Session memory portability | Locked to one platform | MemWal — encrypted session memory on Walrus, portable across any tool that connects to the same workspace |

### MemWal as the Session Memory Backend

For developers using the cloud plan, the `Build-Context-Memory.json` stops being a local file and becomes a MemWal-backed memory space. The MCP server writes session objects to MemWal instead of to disk. Any tool, any machine, any team member — same session memory. SEAL encrypted so Buiry's infrastructure cannot read workspace content. The workspace owner holds the keys.

- `buiry_get_context` semantic search — powered by MemWal vector recall, not a text search across JSON
- Cross-machine continuity — developer switches machine, connects to same workspace, same memory
- Team access — multiple developers on same project share session memory via MemWal delegate keys
- Full session history always restorable from Walrus even if local files are lost

---

## 9. Full Architecture Plan

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BUIRY PLATFORM                               │
│                                                                       │
│  Developer Tools                  End-User Products                  │
│  ┌────────────────────┐           ┌──────────────────────────────┐   │
│  │ buiry-mcp          │           │ Developer's AI product        │   │
│  │ (local process)    │           │ (chatbot, agent, assistant)   │   │
│  └──────────┬─────────┘           └──────────────┬───────────────┘   │
│             │ MCP protocol                       │ Buiry SDK         │
│  ┌──────────▼─────────────────────────────────────▼─────────────────┐│
│  │              BUIRY CLOUD BACKEND (Node.js + Express)              ││
│  │   Session API      │    Dataset API    │    Marketplace API        ││
│  └──────────┬─────────┴──────────┬────────┴──────────┬──────────────┘│
│             │                    │                    │               │
│  ┌──────────▼───────┐  ┌─────────▼──────┐  ┌────────▼─────────────┐ │
│  │ MemWal            │  │ Data Agent      │  │ Marketplace           │ │
│  │ (session memory   │  │ (privacy pass + │  │ (dataset listing +    │ │
│  │  + recall)        │  │  aggregation +  │  │  purchase + revenue   │ │
│  │                   │  │  categorization)│  │  split via Sui)       │ │
│  └──────────┬────────┘  └─────────┬──────┘  └────────┬─────────────┘ │
│             │                     │                    │               │
│  ┌──────────▼─────────────────────▼────────────────────▼────────────┐│
│  │              WALRUS (blob storage — SEAL encrypted)                ││
│  │  Session archives  │  Dataset blobs  │  Workflow definitions       ││
│  └───────────────────────────────────────────────────────────────────┘│
│  ┌────────────────────────────────────────────────────────────────────┐│
│  │              SUI BLOCKCHAIN (ownership + marketplace)               ││
│  │  WorkspaceOwnership  │  DatasetListing  │  MarketplacePurchase      ││
│  └────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────┘
```

### Backend Tech Stack

| Layer | Technology |
|---|---|
| API server | Node.js + Express + TypeScript |
| Database | PostgreSQL + pgvector |
| Cache | Redis |
| Session memory | MemWal (cloud) / local JSON file (free/manual) |
| Dataset storage | Walrus (blob storage, SEAL encrypted) |
| Blockchain | Sui |
| Job queue | Apalis (PostgreSQL backend) |
| SDK: TypeScript | npm — `buiry` |
| SDK: Python | PyPI — `buiry` |
| Frontend | React + Vite + Tailwind CSS |

---

## 10. 5-Phase Build Plan

> Phase 1 is the foundation everything else builds on. If the technique is flawed, the MCP and SDK on top will be flawed. Ship Phase 1 as open source immediately — it establishes the Buiry brand independently and generates real community feedback before building the platform.

### Phase 1 — Refine the Foundation
**Ship as open source — buiry-core on GitHub**

- Publish refined `Build-Context-Memory.json` schema with `$schema` validation endpoint
- Publish tightened `AI_Starter.md` with all 9 rules from Section 5
- Publish filled `PRD.md`, `ARCHITECTURE.md`, `DEV_PLAN.md` templates with real examples
- README with step-by-step setup, the exact starter prompt, and a real filled example
- JSON schema hosted at `buiry.dev/schema/v1/` for co-pilot validation
- **Milestone:** Any developer can clone the repo and have a working Buiry setup in 10 minutes

### Phase 2 — The MCP Server
**`npm install -g buiry-mcp`**

- Node.js + TypeScript MCP server implementing all 7 tools from Section 6
- Local file read/write for free tier (no cloud account required)
- Cloud backend skeleton — Express API with basic auth and session storage
- Claude Code integration: `.claude/settings.json` config documented and tested
- Cursor and Copilot integration guides
- **Milestone:** Developer runs `npx buiry-mcp`, connects their co-pilot, and session context restores automatically at the start of every session — no manual prompt paste

### Phase 3 — The Co-pilot Skill
**One-command project initialization**

- `buiry_init` tool generates full project file structure from a single MCP call
- Auto-detection: if `Build-Context-Memory.json` exists on project open, automatically call `buiry_start_session`
- `buiry_generate_docs`: synthesize PRD/ARCHITECTURE/DEV_PLAN from accumulated session history
- Semantic memory search: `buiry_get_context` powered by MemWal recall for cloud users
- **Milestone:** Developer opens a project, co-pilot automatically restores full context and announces the next steps — zero manual setup

### Phase 4 — The Dataset SDK
**`npm install buiry` — one line integration**

- TypeScript SDK: `buiry.wrap()` middleware for OpenAI, Anthropic, and generic LLM clients
- Python SDK: same wrapping pattern for the Python AI developer ecosystem
- Data Agent pipeline: privacy pass → threshold check → aggregate → categorize → Walrus
- Developer dashboard: view generated datasets, privacy scores, Walrus blob IDs
- `DatasetListing` Sui contract: on-chain registration of every generated dataset
- **Milestone:** Developer integrates one line of SDK code, their AI product runs in production, and Buiry has produced at least one verified dataset visible on the dashboard

### Phase 5 — The Cloud Platform + Marketplace
**buiry.dev — the web application**

- Full web application: dashboard, dataset browser, marketplace, settings
- MemWal-backed session memory for cloud users (replaces local JSON file)
- Dataset marketplace: browse, purchase, and sell datasets via Sui smart contracts
- `WorkspaceOwnership` + `MarketplacePurchase` + `RevenueVault` Sui contracts
- Monetization layer: free tier, Pro subscription, marketplace commission
- **Milestone:** End-to-end flow working — developer integrates SDK, product goes live, users interact, datasets generate, developer earns from marketplace sales

---

## 11. Monetization Model

> The goal right now is to make it work. Monetization is a future layer. But the architecture is designed to support it without rebuilding — free tier now, paid tiers activate when the platform is ready.

| Tier | What you get | Mechanism |
|---|---|---|
| Free (open source) | `buiry-core` repo, manual JSON technique, basic MCP with local file storage, SDK with limited dataset generation | None — community layer, drives adoption |
| Pro (subscription) | Cloud-backed MCP, MemWal session memory, unlimited dataset generation, dashboard access, marketplace listing | Monthly subscription |
| Enterprise | Custom storage limits, SLA, dedicated Data Agent pipeline, team workspace sharing, full Sui contract integration, on-premise option | Annual contract |
| Marketplace commission | Platform takes a percentage of every dataset sale — enforced by Sui smart contract, automatic, trustless | Per-transaction, no manual settlement |

---

## 12. Recommended Next Moves

Everything below is sequenced so each phase validates and enables the next. Do not jump to Phase 5 before Phase 1 is working — the dataset quality and the platform's credibility depends entirely on the foundation.

1. Create the `buiry-core` GitHub repo. Publish the refined `Build-Context-Memory.json`, `AI_Starter.md`, and the three document templates from this document. This is the foundation — everything else builds on it.
2. Publish the JSON schema at `buiry.dev/schema/v1/` — this makes the `$schema` field in the JSON file actually validate. Needs a domain and a simple static hosting setup.
3. Build the MCP server — 7 tools, local file mode first (no cloud required). Publish to npm as `buiry-mcp`. Test with Claude Code, Cursor, and Copilot against real projects.
4. Build the cloud backend skeleton — Express API, basic auth, session storage. Wire the MCP server to it. This is the inflection point where Buiry becomes a service rather than a local tool.
5. Integrate MemWal as the session memory backend for cloud users. This is where the blockchain story becomes real — session memory is now verifiable, portable, and encrypted on Walrus.
6. Build the TypeScript SDK and Data Agent pipeline. Ship to npm as `buiry`. Test with a real AI product and verify the end-to-end flow: interaction captured → privacy pass → dataset on Walrus → Sui registration.
7. Build the web platform. Dashboard first, marketplace second.

---

*Buiry © 2026 — Internal Document*
*Separate from M2A. Built as a service. Goal: make it work.*
