# Buiry — Alignment Document
**Complete gap analysis + phased execution plan**

> Source documents: `Buiry_DevPlan_Architecture.md` + `Buiry_Standalone_Plan.md` + `Hackathon Overview.md`
> Update this file as work progresses. Move completed items to the "Completed" section at the bottom.

---

## 1. Complete Gap Inventory

### 1.1 Architecture Gaps (DevPlan + Standalone Plan combined)

| Category | Gap | Severity |
|---|---|---|
| **MCP Server** | 4 tools missing: buiry_init, buiry_log_decision, buiry_flag_issue, buiry_generate_docs | High |
| **MCP Server** | No separate tool files (all inline in index.ts) | High |
| **MCP Server** | No cloud mode (local-only, no BuiryCloudClient) | High |
| **MCP Server** | Not published to npm | Medium |
| **MCP Server** | No .buiry/config.json reader | Low |
| **MCP Server** | No integration guides (Claude Code, Cursor, Copilot) | Low |
| **Cloud Backend** | apps/api doesn't exist — no Express server | High |
| **Cloud Backend** | No session CRUD routes | High |
| **Cloud Backend** | No auth middleware (API key validation) | High |
| **Cloud Backend** | No rate limiting | Medium |
| **Cloud Backend** | No MemWal client | High |
| **Cloud Backend** | No Walrus client | Medium |
| **Cloud Backend** | No Sui client | Medium |
| **Data Agent** | packages/data-agent doesn't exist | High |
| **Data Agent** | No Privacy Pass (PII stripping) | High |
| **Data Agent** | No Threshold Check | Medium |
| **Data Agent** | No Aggregator | Medium |
| **Data Agent** | No Categorizer | Medium |
| **Data Agent** | No Walrus Writer | Medium |
| **Data Agent** | No Sui Registrar | Medium |
| **SDK TypeScript** | packages/sdk-ts doesn't exist | High |
| **SDK TypeScript** | No buiry.wrap() for Anthropic/OpenAI | High |
| **SDK TypeScript** | No LLM interception wrapper | High |
| **SDK Python** | packages/sdk-py doesn't exist | Medium |
| **SDK Python** | No buiry.wrap() for Python | Medium |
| **Sui Contracts** | contracts/buiry/sources/ empty — 0/4 contracts | Medium |
| **Infrastructure** | PostgreSQL + pgvector not installed | High |
| **Infrastructure** | Redis not installed | Medium |
| **Infrastructure** | MemWal SDK not installed | High |
| **Infrastructure** | Walrus SDK not installed | Medium |
| **Infrastructure** | Sui SDK not installed | Medium |
| **Infrastructure** | SEAL not installed | Medium |
| **Infrastructure** | Apalis not installed | Medium |
| **Schema** | $schema field missing from Build-Context-Memory.json | High |
| **Schema** | JSON Schema file not created | Medium |
| **Schema** | Not hosted at buiry.dev | Low |
| **Templates** | PRD.md template not created | High |
| **Templates** | ARCHITECTURE.md template not created | High |
| **Templates** | DEV_PLAN.md template not created | High |
| **AI_Starter** | Rule 2 (validate before writing) missing | Medium |
| **AI_Starter** | Rule 3 (clarify scope) not explicit | Medium |
| **AI_Starter** | Rule 8 (log dataset signals) missing | Medium |
| **Documentation** | DevPlan milestones/sprint/backlog/completed sections empty | Medium |
| **Documentation** | Standalone Plan phases not updated | Medium |

### 1.2 Hackathon Submission Gaps

| Gap | Severity |
|---|---|
| YouTube video not recorded | Critical |
| Cover image not created | Critical |
| Antigravity not demonstrated | High |
| Agent skills (google-agent-cli) not used | High |
| Security not demonstrated in demo/code | High |
| Deployability not proven (no live npx demo) | Medium |
| "Why agents" argument weak in writeup | Medium |
| Code comments sparse | Medium |
| No visual architecture diagrams in README | Medium |
| ADK agents not tested with real Gemini API | Medium |

---

## 2. Phased Execution Plan

### Phase 0: Hackathon Submission (P0 — before July 6 deadline)

**Goal:** Submit a complete, competitive hackathon entry.

| Task | What | Deliverable | Effort |
|---|---|---|---|
| 0.1 | Record YouTube video | 5-min video following Video-Script.md, uploaded to YouTube | 2-3 hrs |
| 0.2 | Create cover image | Visual for Kaggle submission media gallery | 30 min |
| 0.3 | Strengthen Security concept | Add PII stripping visualization to demo (Data Agent pipeline in video) | 1 hr |
| 0.4 | Strengthen Deployability | Show `npx buiry-mcp` actually starting in video | 30 min |
| 0.5 | Add code comments | Descriptive comments in MCP server, ADK agents, React components | 1 hr |
| 0.6 | Add visual diagrams to README | Replace ASCII diagrams with images or add screenshots | 30 min |
| 0.7 | Test ADK agents with Gemini | Verify agents work with real Gemini API key | 1 hr |
| 0.8 | Polish writeup | Strengthen "why agents" section, add quantifiable metrics | 30 min |

**Total: ~7 hours**
**Unblocks:** Kaggle submission

---

### Phase 1: Foundation Alignment (P0 — align with architecture)

**Goal:** Fix all foundation-level gaps so the build matches both architecture documents.

| Task | What | Files | Effort |
|---|---|---|---|
| 1.1 | Add $schema to Build-Context-Memory.json | `BuildDocs/Build-Context-Memory.json` | 10 min |
| 1.2 | Create JSON Schema file | `schemas/build-context-memory.schema.json` | 2 hrs |
| 1.3 | Create PRD.md template | `templates/PRD.md` | 1 hr |
| 1.4 | Create ARCHITECTURE.md template | `templates/ARCHITECTURE.md` | 1 hr |
| 1.5 | Create DEV_PLAN.md template | `templates/DEV_PLAN.md` | 1 hr |
| 1.6 | Fix AI_Starter Rule 2 | `BuildDocs/AI_Starter.md` — add "Validate before writing" | 30 min |
| 1.7 | Fix AI_Starter Rule 3 | `BuildDocs/AI_Starter.md` — add "Clarify scope" | 30 min |
| 1.8 | Fix AI_Starter Rule 8 | `BuildDocs/AI_Starter.md` — add "Log dataset signals" | 30 min |
| 1.9 | Refactor MCP server to separate tool files | `packages/buiry-mcp/src/tools/*.ts`, `src/validator.ts`, `src/cloud.ts`, `src/local.ts`, `src/config.ts` | 4 hrs |
| 1.10 | Implement buiry_init | `packages/buiry-mcp/src/tools/init.ts` | 2 hrs |
| 1.11 | Implement buiry_log_decision | `packages/buiry-mcp/src/tools/session.ts` | 1 hr |
| 1.12 | Implement buiry_flag_issue | `packages/buiry-mcp/src/tools/session.ts` | 1 hr |
| 1.13 | Implement buiry_generate_docs | `packages/buiry-mcp/src/tools/docs.ts` | 2 hrs |
| 1.14 | Add cloud mode to MCP server | `packages/buiry-mcp/src/index.ts`, `src/cloud.ts` | 2 hrs |
| 1.15 | Publish to npm | `package.json` — set name: buiry-mcp, add bin | 30 min |

**Total: ~17 hours (2-3 days)**
**Unblocks:** M1 (Foundation), M3 (MCP server local)

---

### Phase 2: Cloud Backend (P1)

**Goal:** Build the Express API server that the MCP cloud mode and SDKs connect to.

| Task | What | Files | Effort |
|---|---|---|---|
| 2.1 | Scaffold Express backend | `apps/api/package.json`, `tsconfig.json`, `src/index.ts` | 2 hrs |
| 2.2 | Auth middleware | `apps/api/src/middleware/auth.ts` | 1 hr |
| 2.3 | Rate limiting | `apps/api/src/middleware/ratelimit.ts` | 1 hr |
| 2.4 | Error handler | `apps/api/src/middleware/errorHandler.ts` | 30 min |
| 2.5 | Session routes | `apps/api/src/routes/session.ts` | 3 hrs |
| 2.6 | Dataset routes | `apps/api/src/routes/dataset.ts` | 2 hrs |
| 2.7 | Workspace routes | `apps/api/src/routes/workspace.ts` | 2 hrs |
| 2.8 | Context routes | `apps/api/src/routes/context.ts` | 1 hr |
| 2.9 | Docs routes | `apps/api/src/routes/docs.ts` | 1 hr |
| 2.10 | MemWal client | `apps/api/src/memwal/client.ts` | 3 hrs |
| 2.11 | Walrus client | `apps/api/src/walrus/client.ts` | 2 hrs |
| 2.12 | Sui client | `apps/api/src/sui/client.ts` | 2 hrs |

**Total: ~21 hours (3-4 days)**
**Unblocks:** M4 (Cloud backend), M5 (MCP cloud mode), M10 (Dashboard with real data)

---

### Phase 3: Data Agent + SDKs (P2)

**Goal:** Build the dataset harvesting pipeline and developer SDKs.

| Task | What | Files | Effort |
|---|---|---|---|
| 3.1 | Scaffold Data Agent | `packages/data-agent/package.json`, `tsconfig.json`, `src/index.ts`, `src/types.ts` | 2 hrs |
| 3.2 | Implement Privacy Pass | `packages/data-agent/src/pipeline/PrivacyPass.ts` | 4 hrs |
| 3.3 | Implement Threshold Check | `packages/data-agent/src/pipeline/ThresholdCheck.ts` | 2 hrs |
| 3.4 | Implement Aggregator | `packages/data-agent/src/pipeline/Aggregator.ts` | 3 hrs |
| 3.5 | Implement Categorizer | `packages/data-agent/src/pipeline/Categorizer.ts` | 2 hrs |
| 3.6 | Implement Walrus Writer | `packages/data-agent/src/storage/WalrusWriter.ts` | 2 hrs |
| 3.7 | Implement Sui Registrar | `packages/data-agent/src/storage/SuiRegistrar.ts` | 1 hr |
| 3.8 | Scaffold TypeScript SDK | `packages/sdk-ts/package.json`, `tsconfig.json`, `src/index.ts`, `src/Buiry.ts` | 2 hrs |
| 3.9 | Implement LLM Wrapper | `packages/sdk-ts/src/wrapper/LLMWrapper.ts` | 4 hrs |
| 3.10 | Implement adapters | `packages/sdk-ts/src/adapters/anthropic.ts`, `openai.ts`, `generic.ts` | 2 hrs |
| 3.11 | Implement API client | `packages/sdk-ts/src/api/client.ts` | 1 hr |
| 3.12 | Scaffold Python SDK | `packages/sdk-py/setup.py`, `buiry/__init__.py`, `buiry/client.py` | 2 hrs |
| 3.13 | Implement Python wrapper | `packages/sdk-py/buiry/wrapper.py` | 2 hrs |
| 3.14 | Implement Python adapters | `packages/sdk-py/buiry/adapters/anthropic.py`, `openai.py` | 1 hr |

**Total: ~27 hours (4-5 days)**
**Unblocks:** M6 (TS SDK), M7 (Data Agent privacy), M8 (Data Agent full), M9 (Python SDK)

---

### Phase 4: Infrastructure + Contracts (P2-P3)

**Goal:** Install all external dependencies and write Sui smart contracts.

| Task | What | Files | Effort |
|---|---|---|---|
| 4.1 | Install PostgreSQL + pgvector | Docker compose or managed | 2 hrs |
| 4.2 | Install Redis | Docker or managed | 1 hr |
| 4.3 | Install MemWal SDK | npm install, configure | 1 hr |
| 4.4 | Install Walrus SDK | npm install, configure | 1 hr |
| 4.5 | Install Sui SDK | npm install @mysten/sui.js, configure | 1 hr |
| 4.6 | Write WorkspaceOwnership contract | `contracts/buiry/sources/workspace_ownership.move` | 2 hrs |
| 4.7 | Write DatasetListing contract | `contracts/buiry/sources/dataset_listing.move` | 2 hrs |
| 4.8 | Write MarketplacePurchase contract | `contracts/buiry/sources/marketplace_purchase.move` | 2 hrs |
| 4.9 | Write RevenueVault contract | `contracts/buiry/sources/revenue_vault.move` | 1 hr |
| 4.10 | Host schema at buiry.dev | Register domain, deploy JSON schema | 2 hrs |

**Total: ~15 hours (2-3 days)**
**Unblocks:** M2 (Schema hosting), M11 (Sui contracts), M12 (Marketplace)

---

### Phase 5: Documentation + Integration Guides (P1)

**Goal:** Update all documentation to reflect current build state.

| Task | What | Files | Effort |
|---|---|---|---|
| 5.1 | Update DevPlan Section 8 (milestones) | `ProjectDocs/Buiry_DevPlan_Architecture.md` | 1 hr |
| 5.2 | Update DevPlan Section 9 (sprint) | Same file | 30 min |
| 5.3 | Update DevPlan Section 10 (backlog) | Same file | 1 hr |
| 5.4 | Update DevPlan Section 11 (completed) | Same file | 30 min |
| 5.5 | Update Standalone Plan phases | `ProjectDocs/Buiry_Standalone_Plan.md` | 1 hr |
| 5.6 | Write Claude Code integration guide | `packages/buiry-mcp/docs/claude-code.md` | 1 hr |
| 5.7 | Write Cursor integration guide | `packages/buiry-mcp/docs/cursor.md` | 1 hr |
| 5.8 | Write Copilot integration guide | `packages/buiry-mcp/docs/copilot.md` | 1 hr |
| 5.9 | Append session to Build-Context-Memory.json | `BuildDocs/Build-Context-Memory.json` | 10 min |

**Total: ~7 hours (1 day)**
**Unblocks:** M1 (Foundation complete), developer adoption

---

### Phase 6: Polish + Testing (P1)

**Goal:** Ensure everything works, is tested, and is ready for production.

| Task | What | Effort |
|---|---|---|
| 6.1 | E2E test all MCP tools (7 tools) | 2 hrs |
| 6.2 | E2E test cloud backend routes | 2 hrs |
| 6.3 | E2E test Data Agent pipeline | 2 hrs |
| 6.4 | E2E test TypeScript SDK | 1 hr |
| 6.5 | E2E test Python SDK | 1 hr |
| 6.6 | E2E test ADK agents with Gemini | 1 hr |
| 6.7 | Fix all test failures | 4 hrs |
| 6.8 | Update AlignDoc.md with completed items | 30 min |

**Total: ~13 hours (2 days)**

---

## 3. Execution Order

```
Phase 0 (Hackathon Submission) ──────── IMMEDIATE — before July 6
         │
Phase 1 (Foundation Alignment) ──────── P0 — fixes all base gaps
         │
    ┌────┴────┐
    │         │
Phase 2      Phase 5
(Cloud API)  (Docs + Guides)
    │
    ├──→ Phase 3 (Data Agent + SDKs)
    │
    └──→ Phase 4 (Infrastructure + Contracts)
              │
         Phase 6 (Polish + Testing)
```

**Phase 0 is independent** — can be done in parallel with anything.
**Phase 1 must come first** — everything else builds on the foundation.
**Phases 2 and 5 can run in parallel** — no dependencies on each other.
**Phase 3 depends on Phase 2** — Data Agent needs cloud backend.
**Phase 4 can run after Phase 2** — infrastructure needed for contracts.
**Phase 6 comes last** — tests everything.

---

## 4. Priority Matrix

| Phase | Priority | Why | Effort |
|---|---|---|---|
| Phase 0 | P0 — CRITICAL | Hackathon deadline July 6 | ~7 hrs |
| Phase 1 | P0 — CRITICAL | Foundation for everything else | ~17 hrs |
| Phase 5 | P1 | Documentation enables developer adoption | ~7 hrs |
| Phase 2 | P1 | Cloud backend enables MCP cloud mode + SDKs | ~21 hrs |
| Phase 3 | P2 | Data Agent + SDKs are core value prop | ~27 hrs |
| Phase 4 | P2-P3 | Infrastructure + contracts for full platform | ~15 hrs |
| Phase 6 | P1 | Testing ensures quality | ~13 hrs |

---

## 5. Milestone Mapping

| Milestone | Phase(s) | Status |
|---|---|---|
| M1: Foundation | Phase 1 | Partial |
| M2: Schema hosting | Phase 4.10 | Not started |
| M3: MCP server local | Phase 1 (tools 1.9-1.14) | Partial (3/7 tools) |
| M4: Cloud backend | Phase 2 | Not started |
| M5: MCP server cloud | Phase 1.14 + Phase 2 | Not started |
| M6: TypeScript SDK | Phase 3 (3.8-3.11) | Not started |
| M7: Data Agent privacy | Phase 3.2 | Not started |
| M8: Data Agent full | Phase 3 | Not started |
| M9: Python SDK | Phase 3 (3.12-3.14) | Not started |
| M10: Developer dashboard | Phase 2 (partial) | Partial (React built, no API) |
| M11: Sui contracts testnet | Phase 4 (4.6-4.9) | Not started |
| M12: Marketplace | Phase 4 + Phase 2 | Not started |

---

## 6. Total Effort

| Phase | Hours | Days |
|---|---|---|
| Phase 0: Hackathon Submission | 7 | <1 |
| Phase 1: Foundation Alignment | 17 | 2-3 |
| Phase 2: Cloud Backend | 21 | 3-4 |
| Phase 3: Data Agent + SDKs | 27 | 4-5 |
| Phase 4: Infrastructure + Contracts | 15 | 2-3 |
| Phase 5: Documentation + Guides | 7 | 1 |
| Phase 6: Polish + Testing | 13 | 2 |
| **Total** | **~107 hrs** | **~14-17 days** |

---

## 7. Subagent Execution Map

Each phase can be parallelized with subagents:

| Phase | Parallel Tasks | Subagent Count |
|---|---|---|
| Phase 0 | 0.1-0.8 all independent | 8 parallel |
| Phase 1 | 1.1-1.8 (foundation) parallel, then 1.9-1.15 (MCP) parallel | 2 batches |
| Phase 2 | 2.1-2.4 (scaffold) parallel, then 2.5-2.12 (routes + clients) parallel | 2 batches |
| Phase 3 | 3.1-3.7 (Data Agent) parallel, then 3.8-3.14 (SDKs) parallel | 2 batches |
| Phase 4 | 4.1-4.5 (infra) parallel, then 4.6-4.10 (contracts) parallel | 2 batches |
| Phase 5 | 5.1-5.9 all independent | 9 parallel |
| Phase 6 | 6.1-6.8 all independent | 8 parallel |

---

## 8. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Hackathon deadline missed | Low | Critical | Phase 0 is ~7 hours, well within deadline |
| ADK agents fail with real Gemini API | Medium | High | Test in Phase 0.7 before submission |
| Cloud backend takes longer than estimated | Medium | Medium | Phase 2 is post-hackathon, not critical for submission |
| Data Agent PII stripping misses patterns | Medium | High | Layered approach: regex + NER + threshold. Err on discard. |
| Sui contracts have bugs | Low | Medium | Testnet-first, audit before mainnet |
| PostgreSQL/Redis setup blocks Phase 2 | Low | High | Use Docker compose for quick setup |

---

## 9. Notes

- This document is append-only. Move completed items to the "Completed" section.
- Phase 0 is IMMEDIATE — must be done before July 6 hackathon deadline.
- Phase 1 is the foundation — nothing else works correctly without it.
- Phases 2-6 are post-hackathon platform work.
- The ADK agents (packages/adk-agents) are a hackathon addition — they stay as-is.
- The React frontend is ahead of schedule (11 screens vs 6 planned) — no action needed.
- Both architecture documents describe the same full platform vision.
- For hackathon scoring: strengthen Security and Deployability concepts to ensure ≥3 solid concepts.

---

## Completed

*(Append completed items here as work progresses)*

---

*AlignDoc.md — Living document. Updated with phased execution plan.*
*Last updated: 2026-07-01*
