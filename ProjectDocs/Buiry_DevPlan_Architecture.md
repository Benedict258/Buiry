# Buiry — Development Plan & Architecture
**Living document — append only, never delete completed work**

---

## Table of Contents
1. [Architecture](#1-architecture)
2. [Tech Stack](#2-tech-stack)
3. [Component Map](#3-component-map)
4. [Data Flow](#4-data-flow)
5. [Sui Smart Contracts](#5-sui-smart-contracts)
6. [External Dependencies](#6-external-dependencies)
7. [Known Technical Risks](#7-known-technical-risks)
8. [Development Milestones](#8-development-milestones)
9. [Current Sprint](#9-current-sprint)
10. [Backlog](#10-backlog)
11. [Completed](#11-completed)
12. [Blocked](#12-blocked)

---

## 1. Architecture

### System Overview

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

### Architectural Principles

| Principle | Rule |
|---|---|
| Single source of truth | MemWal is the session memory backend for cloud users. Local JSON file is a cache, not the source of truth. |
| Privacy by design | PII is stripped at the entry point by the Data Agent — before any storage occurs. It is never in the system at any layer. |
| Chokepoint discipline | The SDK wrapper is the only path to data capture. Nothing bypasses it. The Data Agent is the only writer to `buiry::datasets` namespaces. |
| Append-only memory | Session objects are immutable once written. `project_identity` is immutable once initialized. No exceptions. |
| Blockchain where it solves a real problem | Walrus + Sui for dataset ownership and provenance. MemWal for portable encrypted session memory. Not blockchain for its own sake. |
| Open source core, paid cloud | SDK and MCP server are open source. The cloud platform and marketplace are the monetization layer. |

---

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| API server | Node.js + Express + TypeScript | Primary backend runtime |
| Database | PostgreSQL + pgvector | Fast metadata queries, vector search fallback, job queue backend |
| Cache | Redis | Rate limiting, session caching, embedding cache |
| Session memory (cloud) | MemWal | Encrypted, portable, MemWal-backed session state |
| Session memory (free) | Local JSON file | `Build-Context-Memory.json` — manual or MCP-managed |
| Dataset storage | Walrus | Blob storage, SEAL encrypted, on-chain metadata |
| Encryption | SEAL | Threshold encryption before any data reaches Walrus |
| Blockchain | Sui | Ownership objects, dataset registration, marketplace |
| Job queue | Apalis (PostgreSQL backend) | Data Agent runs as async background jobs |
| SDK: TypeScript | npm package — `buiry` | TypeScript/JavaScript first |
| SDK: Python | PyPI package — `buiry` | Python second |
| MCP server | Node.js + TypeScript — `buiry-mcp` | Published to npm |
| Frontend | React + Vite + Tailwind CSS | Dashboard, dataset browser, marketplace |
| Schema validation | JSON Schema (hosted at buiry.dev/schema/v1/) | Co-pilot validates session objects before writing |

---

## 3. Component Map

### MCP Server (`packages/buiry-mcp`)

| Component | File | Responsibility |
|---|---|---|
| MCP server entry | `src/index.ts` | Registers all tools, starts MCP server process |
| Session tools | `src/tools/session.ts` | `buiry_start_session`, `buiry_end_session`, `buiry_log_decision`, `buiry_flag_issue` |
| Context tools | `src/tools/context.ts` | `buiry_get_context` — semantic search via MemWal recall |
| Init tools | `src/tools/init.ts` | `buiry_init` — project file structure generation |
| Doc tools | `src/tools/docs.ts` | `buiry_generate_docs` — LLM synthesis of PRD/ARCH/DEV_PLAN |
| Schema validator | `src/validator.ts` | JSON schema validation before any session write |
| Cloud client | `src/cloud.ts` | REST client to Buiry cloud backend |
| Local client | `src/local.ts` | Local file read/write for free tier |
| Config | `src/config.ts` | Reads `.buiry/config.json` from project root |

### Cloud Backend (`apps/api`)

| Component | File | Responsibility |
|---|---|---|
| API entry | `src/index.ts` | Express server, middleware, route registration |
| Session routes | `src/routes/session.ts` | CRUD for sessions, schema validation, MemWal writes |
| Dataset routes | `src/routes/dataset.ts` | Dataset listing, download, marketplace listing |
| Workspace routes | `src/routes/workspace.ts` | Workspace creation, member management, Sui object registration |
| Auth middleware | `src/middleware/auth.ts` | API key validation, zkLogin session verification |
| Rate limiting | `src/middleware/ratelimit.ts` | Per-workspace burst + sustained limits via Redis |
| MemWal client | `src/memwal/client.ts` | Wrapper around MemWal SDK — the only file that calls MemWal directly |
| Walrus client | `src/walrus/client.ts` | Wrapper around Walrus upload/download — the only file that calls Walrus directly |
| Sui client | `src/sui/client.ts` | Contract interactions — workspace registration, dataset listing |

### Data Agent (`packages/data-agent`)

| Component | File | Responsibility |
|---|---|---|
| Job definition | `src/jobs/DatasetJob.ts` | Apalis job — entry point for all captured interactions |
| Privacy pass | `src/pipeline/PrivacyPass.ts` | PII detection and stripping — regex + NER |
| Threshold check | `src/pipeline/ThresholdCheck.ts` | Buffer interactions until minimum sample size |
| Aggregator | `src/pipeline/Aggregator.ts` | Merge raw interactions into statistical claims |
| Categorizer | `src/pipeline/Categorizer.ts` | LLM-based category classification |
| Walrus writer | `src/storage/WalrusWriter.ts` | Dataset blob upload via Walrus client |
| Sui registrar | `src/storage/SuiRegistrar.ts` | DatasetListing contract call |
| Types | `src/types.ts` | `RawInteraction`, `SanitizedInteraction`, `AggregateClaim`, `DatasetCategory` |

### SDK — TypeScript (`packages/sdk-ts`)

| Component | File | Responsibility |
|---|---|---|
| SDK entry | `src/index.ts` | Exports `Buiry` class |
| Buiry class | `src/Buiry.ts` | Constructor, `wrap()`, `remember()`, `recall()`, `datasets` |
| Wrapper | `src/wrapper/LLMWrapper.ts` | Intercepts LLM calls, captures interactions, enqueues DatasetJob |
| Anthropic adapter | `src/adapters/anthropic.ts` | Wraps Anthropic client |
| OpenAI adapter | `src/adapters/openai.ts` | Wraps OpenAI client |
| Generic adapter | `src/adapters/generic.ts` | Wraps any OpenAI-compatible API |
| API client | `src/api/client.ts` | REST calls to Buiry cloud backend |

### SDK — Python (`packages/sdk-py`)

| Component | File | Responsibility |
|---|---|---|
| SDK entry | `buiry/__init__.py` | Exports `Buiry` class |
| Buiry class | `buiry/client.py` | Constructor, `wrap()`, `remember()`, `recall()` |
| Wrapper | `buiry/wrapper.py` | Intercepts LLM calls |
| Anthropic adapter | `buiry/adapters/anthropic.py` | Wraps Anthropic client |
| OpenAI adapter | `buiry/adapters/openai.py` | Wraps OpenAI client |

### Frontend (`apps/web`)

| Surface | Route | Responsibility |
|---|---|---|
| Dashboard | `/dashboard` | Project overview, session health, recent activity |
| Session explorer | `/dashboard/sessions` | Browse and search session history |
| Dataset browser | `/datasets` | View generated datasets, privacy scores, blob IDs |
| Marketplace | `/marketplace` | Browse and purchase datasets |
| Settings | `/settings` | API keys, team members, billing |
| Docs | `/docs` | SDK docs, MCP setup, integration guides |

---

## 4. Data Flow

### Session Write Flow (MCP Server)

```
Co-pilot agent completes work
        ↓
Calls buiry_end_session({ projectId, sessionObject })
        ↓
MCP server validates sessionObject against JSON schema
  → next_steps non-empty?
  → required fields present?
  → severity enum valid?
  → old sessions unmodified?
  If FAIL → reject, return error with field-level detail
        ↓
If PASS → write to cloud backend POST /api/session
        ↓
Cloud backend writes to MemWal (cloud users)
  OR updates local Build-Context-Memory.json (free users)
        ↓
Walrus blob created for session archive
        ↓
Return: { sessionId, walrusBlobId, timestamp }
```

### Session Read Flow (MCP Server)

```
Co-pilot agent starts new session
        ↓
Calls buiry_start_session({ projectId, agentId })
        ↓
Cloud backend queries MemWal for last N sessions
  (N = config.max_sessions_in_context, default 5)
        ↓
Returns: {
  project_identity,
  summary,
  recent_sessions[N],
  next_steps (from latest session),
  open_issues
}
        ↓
Co-pilot agent has full context — no manual prompt paste required
```

### Semantic Context Search Flow

```
Developer or co-pilot calls buiry_get_context({ projectId, query })
        ↓
Cloud backend calls MemWal recall with query
        ↓
MemWal generates query embedding (OpenAI text-embedding-3-small)
        ↓
pgvector cosine similarity search across all session content
        ↓
Returns: top N semantically relevant memory entries
  with: content, session_id, timestamp, relevance_score
```

### Dataset Capture Flow (SDK)

```
Developer's end user interacts with their AI product
        ↓
buiry.wrap(llmClient) intercepts the LLM call
        ↓
RawInteraction recorded: input structure, output structure,
  decision type, domain signals, error patterns
        ↓
DatasetJob enqueued in Apalis (async — does not block LLM response)
        ↓
Data Agent processes job:
  Step 1: Privacy Pass — strip PII, hash IDs, relativize timestamps
  Step 2: Threshold Check — buffer until 10+ interactions
  Step 3: Aggregate — merge into statistical claims
  Step 4: Categorize — LLM classification
  Step 5: Store on Walrus (JSON + CSV, SEAL encrypted)
  Step 6: Register on Sui (DatasetListing object)
  Step 7: Notify developer dashboard
        ↓
Developer sees dataset in Buiry dashboard
  with: category, domain, sample size, privacy score,
        Walrus blob CID, Sui object ID
```

---

## 5. Sui Smart Contracts

All contracts live in `contracts/buiry/sources/`. Target: Sui Testnet during development, Mainnet after platform is stable.

### Contract 1 — WorkspaceOwnership

```move
module buiry::workspace_ownership {
  // One object per Buiry workspace
  // owner = Sui address controlling this workspace
  // memwal_account_id = MemWal Account object this workspace maps to
  public struct WorkspaceOwnership has key, store {
    id: UID,
    owner: address,
    memwal_account_id: ID,
    workspace_name: vector<u8>,
    created_at: u64,
    is_active: bool,
  }

  public fun create(memwal_account_id: ID, name: vector<u8>, ctx: &mut TxContext): WorkspaceOwnership
  public fun transfer_ownership(workspace: &mut WorkspaceOwnership, new_owner: address, ctx: &TxContext)
  public fun revoke(workspace: &mut WorkspaceOwnership, ctx: &TxContext)
}
```

### Contract 2 — DatasetListing

```move
module buiry::dataset_listing {
  // One object per generated dataset
  // walrus_blob_id = Walrus CID of the dataset blob
  public struct DatasetListing has key, store {
    id: UID,
    walrus_blob_id: vector<u8>,
    category: vector<u8>,
    domain: vector<u8>,
    owner: address,
    workspace_id: ID,
    sample_size: u64,
    price_mist: u64,       // 0 = free, set by owner to list
    is_public: bool,
    generated_at: u64,
  }

  public fun create(...): DatasetListing
  public fun list_on_marketplace(listing: &mut DatasetListing, price_mist: u64, ctx: &TxContext)
}
```

### Contract 3 — MarketplacePurchase

```move
module buiry::marketplace_purchase {
  const PLATFORM_FEE_BPS: u64 = 1000; // 10% platform fee

  // Splits payment: developer share → listing.owner
  //                 platform share → RevenueVault
  // Emits DatasetPurchased event with walrus_blob_id for buyer
  public fun purchase(
    listing: &DatasetListing,
    payment: Coin<SUI>,
    vault: &mut RevenueVault,
    ctx: &mut TxContext,
  )
}
```

### Contract 4 — RevenueVault

```move
module buiry::revenue_vault {
  // Shared object — holds platform fees
  // Only platform admin can withdraw
  public struct RevenueVault has key {
    id: UID,
    admin: address,
    balance: Balance<SUI>,
    total_collected: u64,
  }

  public fun deposit(vault: &mut RevenueVault, coin: Coin<SUI>)
  public fun withdraw(vault: &mut RevenueVault, amount: u64, ctx: &mut TxContext): Coin<SUI>
}
```

---

## 6. External Dependencies

| Dependency | Purpose | Required? | Risk if unavailable |
|---|---|---|---|
| MemWal | Session memory backend (cloud), semantic recall | Yes (cloud tier) | Fall back to local JSON file for free tier |
| Walrus | Dataset blob storage, session archives | Yes | No verifiable dataset storage — critical |
| Sui | Workspace ownership, dataset registration, marketplace | Yes (blockchain features) | Platform still works without contracts — disable marketplace |
| SEAL | End-to-end encryption before Walrus | Yes | Do not store without it — block writes |
| Apalis | Background job queue for Data Agent | Yes | Dataset generation blocked — queue to local buffer |
| OpenAI (embeddings) | `text-embedding-3-small` for semantic search | Yes | Degrade to keyword search in fallback |
| Anthropic / OpenAI (categorization) | LLM for dataset category classification | Yes | Use rule-based classifier as fallback |
| Redis | Rate limiting, caching | Yes | In-memory fallback, reduced performance |
| PostgreSQL | Metadata store, job queue | Yes | No fallback — critical dependency |

---

## 7. Known Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Privacy pass misses a PII pattern | Medium | High — could store sensitive data | Layered approach: regex + NER model + threshold minimum. Err on discard rather than store. Audit PII patterns regularly. |
| MemWal API changes break session layer | Low | High — all cloud sessions affected | Pin MemWal SDK version. Wrap all MemWal calls through a single client file. |
| Walrus storage costs exceed expectations | Medium | Medium — pricing model broken | Monitor per-workspace storage usage. Enforce storage quotas per tier. |
| LLM categorization produces wrong category | Medium | Low — dataset in wrong folder | Low impact since data is still captured and stored. Re-categorization job can run retroactively. |
| Minimum threshold (10 interactions) is too high for low-traffic products | High | Medium — no datasets generated | Make threshold configurable per workspace. Default 10, minimum 1 for dev/testing mode. |
| JSON schema validation too strict causes adoption friction | Medium | Medium — developers avoid Buiry | Schema should warn not reject on non-critical fields. Only hard-reject on immutability violations and missing next_steps. |
| Sui contract bugs post-deployment | Low | High — marketplace broken | Testnet-first, audit before mainnet. Marketplace is Phase 5 — plenty of time to harden contracts. |

---

## 8. Development Milestones

| # | Milestone | Key Deliverable | Status |
|---|---|---|---|
| M1 | Foundation | `buiry-core` repo live on GitHub with refined schema, AI_Starter.md, all three templates | Not started |
| M2 | Schema hosting | JSON schema live at `buiry.dev/schema/v1/` | Not started |
| M3 | MCP server — local mode | `buiry-mcp` published to npm, local file read/write working, 7 tools functional | Not started |
| M4 | Cloud backend skeleton | Express API live, basic auth, session CRUD, MCP server wired to cloud | Not started |
| M5 | MCP server — cloud mode | Sessions write to MemWal instead of local file, semantic search working | Not started |
| M6 | TypeScript SDK | `buiry.wrap()` working for Anthropic + OpenAI, interactions captured and logged | Not started |
| M7 | Data Agent — privacy pass | PII stripping functional, threshold check working, interactions buffered correctly | Not started |
| M8 | Data Agent — full pipeline | Aggregation, categorization, Walrus storage, Sui registration all working end-to-end | Not started |
| M9 | Python SDK | Same wrapping pattern as TypeScript SDK | Not started |
| M10 | Developer dashboard | Session explorer, dataset browser live and wired to real data | Not started |
| M11 | Sui contracts — testnet | WorkspaceOwnership + DatasetListing deployed and callable | Not started |
| M12 | Marketplace | Dataset listing, purchase, revenue split working via Sui contracts | Not started |

---

## 9. Current Sprint

| Task | Owner | Status | Blocker |
|---|---|---|---|
| — | — | — | — |

> Update this section at the start of every sprint. Never leave it blank during active development.

---

## 10. Backlog

> Prioritized list of work not yet started. Items at the top are highest priority.

- [ ] Create GitHub org and `buiry-core` repo
- [ ] Write refined `Build-Context-Memory.json` schema file
- [ ] Write tightened `AI_Starter.md`
- [ ] Write `PRD.md`, `ARCHITECTURE.md`, `DEV_PLAN.md` templates with real filled examples
- [ ] Write README with step-by-step setup + exact starter prompt
- [ ] Register `buiry.dev` domain
- [ ] Host JSON schema at `buiry.dev/schema/v1/build-context-memory.json`
- [ ] Scaffold `packages/buiry-mcp` TypeScript project
- [ ] Implement `buiry_init` tool
- [ ] Implement `buiry_start_session` tool
- [ ] Implement `buiry_end_session` tool with schema validation
- [ ] Implement `buiry_log_decision` tool
- [ ] Implement `buiry_flag_issue` tool
- [ ] Implement `buiry_get_context` tool (keyword search first, MemWal semantic later)
- [ ] Implement `buiry_generate_docs` tool
- [ ] Write Claude Code `.claude/settings.json` integration guide
- [ ] Write Cursor integration guide
- [ ] Publish `buiry-mcp` to npm
- [ ] Scaffold `apps/api` Express backend
- [ ] Implement session CRUD routes
- [ ] Implement basic API key auth
- [ ] Wire MCP server to cloud backend
- [ ] Integrate MemWal as session memory backend
- [ ] Scaffold `packages/sdk-ts`
- [ ] Implement `buiry.wrap()` for Anthropic
- [ ] Implement `buiry.wrap()` for OpenAI
- [ ] Implement Data Agent `PrivacyPass`
- [ ] Implement Data Agent `ThresholdCheck`
- [ ] Implement Data Agent `Aggregator`
- [ ] Implement Data Agent `Categorizer`
- [ ] Implement Walrus dataset storage
- [ ] Deploy `DatasetListing` contract to Sui testnet
- [ ] Deploy `WorkspaceOwnership` contract to Sui testnet
- [ ] Scaffold `packages/sdk-py`
- [ ] Build developer dashboard (session explorer + dataset browser)
- [ ] Deploy `MarketplacePurchase` + `RevenueVault` contracts
- [ ] Build marketplace UI

---

## 11. Completed

> Append completed milestones here. Never delete entries. Each entry should include what was done and any decisions made.

*(Nothing completed yet — this section will grow.)*

---

## 12. Blocked

| Blocker | Impact | Owner | ETA |
|---|---|---|---|
| — | — | — | — |

> Update this section whenever work is blocked. Remove entries when unblocked and move the completed work to Section 11.

---

*Buiry DevPlan & Architecture — Living Document*
*Append only. Never delete completed work. Never modify historical entries.*
