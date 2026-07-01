# Development Plan

> Version: 1.0.0 | Status: Active | Last Updated: 2026-07-01

---

## Milestones

### M1: Foundation (Week 1) — COMPLETE
- [x] Initialize monorepo structure (`packages/`, `apps/`, `contracts/`)
- [x] Create `Build-Context-Memory.json` with schema v1
- [x] Write `AI_Starter.md` with mandatory agent rules
- [x] Define PRD, ARCHITECTURE, DEV_PLAN templates
- [x] Set up JSON Schema validation

### M2: MCP Server Core (Week 1-2) — COMPLETE
- [x] Scaffold `buiry-mcp` TypeScript project
- [x] Implement `buiry_start_session` tool
- [x] Implement `buiry_end_session` tool
- [x] Implement `buiry_get_context` tool
- [x] Add Zod validation for all tool inputs
- [x] Add `next_steps` enforcement (min 1 item)

### M3: React Dashboard (Week 2) — COMPLETE
- [x] Scaffold React + Vite + Tailwind app
- [x] Import Stitch dark theme tokens
- [x] Build Layout shell (Sidebar + TopBar + content area)
- [x] Build Dashboard page (hero card, stats, activity chart, decisions)
- [x] Set up React Router with 6 routes

### M4: Full MCP Tools (Week 2-3) — COMPLETE
- [x] Implement `buiry_search_memory` tool
- [x] Implement `buiry_log_decision` tool
- [x] Implement `buiry_log_error` tool
- [x] Implement `buiry_checkpoint` tool
- [x] JSON corruption recovery in `readMemory`

### M5: Core Screens (Week 3) — COMPLETE
- [x] Build Session Explorer (timeline, expandable cards, filters)
- [x] Build Session Detail modal (metadata, changes, decisions, next steps)
- [x] Build Context Search modal (Cmd+K overlay, semantic results)
- [x] Build frontend data layer (types, mock-data, api)

### M6: ADK Agents (Week 3-4) — COMPLETE
- [x] Implement CoordinatorAgent (orchestrates session lifecycle)
- [x] Implement DevAgent (implements code changes)
- [x] Implement ReviewAgent (cross-checks decisions)
- [x] Connect agents to MCP tools via stdio

### M7: Additional Screens (Week 4) — COMPLETE
- [x] Build Onboarding wizard (3-step flow with success overlay)
- [x] Build Settings page (API keys, workspace config, billing)
- [x] Build Dataset Browser (dataset cards with privacy scores)

### M8: Dataset SDK (Week 5) — PENDING
- [ ] Implement signal capture module
- [ ] Build privacy filter (no raw user data)
- [ ] Add export to JSON/CSV formats
- [ ] Integrate with MCP server

### M9: Testing & QA (Week 5-6) — PENDING
- [ ] Unit tests for MCP server tools
- [ ] Integration tests for session lifecycle
- [ ] React component tests
- [ ] ADK agent tests
- [ ] End-to-end flow test

### M10: Polish & Documentation (Week 6) — PENDING
- [ ] Hover states, transitions, responsive tweaks
- [ ] Complete README with setup instructions
- [ ] Write API documentation for MCP tools
- [ ] Record demo video (<5 min)

### M11: Sui Blockchain Integration (Week 7-8) — PENDING
- [ ] Deploy onchain session registry contract
- [ ] Anchor session hashes to Sui
- [ ] Implement Walrus storage for session snapshots
- [ ] Dashboard: onchain verification badge

### M12: Launch (Week 8) — PENDING
- [ ] Kaggle writeup (<2500 words)
- [ ] YouTube video (<5 min)
- [ ] GitHub repo public release
- [ ] npm publish `buiry-mcp`

---

## Current Sprint

**Sprint: Phase 0-1 — Foundation & Core Build**
**Status:** Complete
**Duration:** 2026-05-08 to 2026-05-14

| Task | Owner | Status |
|------|-------|--------|
| Initialize monorepo | Claude Code | Done |
| Create memory schema v1 | GitHub Copilot | Done |
| Write AI_Starter.md rules | Claude Code | Done |
| Define 5-phase build plan | Cursor | Done |
| Scaffold buiry-mcp | Claude Code | Done |
| Implement 3 core MCP tools | GitHub Copilot | Done |
| Scaffold React app | Cursor | Done |
| Build Layout + Dashboard | GitHub Copilot | Done |
| Generate Stitch UI designs | Claude Code | Done |
| Gap analysis (10 gaps) | Claude Code | Done |

---

## Backlog

| Priority | Item | Phase | Notes |
|----------|------|-------|-------|
| High | Frontend-MCP data bridge | P2 | Replace mock data with live MCP reads |
| High | Session file locking | P2 | Prevent concurrent write corruption |
| Medium | Responsive breakpoints | P3 | Mobile sidebar, stacked layout |
| Medium | Collaborative sessions | P4 | Multiple agents writing simultaneously |
| Low | Custom dashboard themes | P5 | User-selectable color schemes |
| Low | Export to PDF/Markdown | P5 | Shareable session reports |

---

## Completed

| Date | Item | Session |
|------|------|---------|
| 2026-05-08 | Project initialized with AI starter and memory files | session_001 |
| 2026-05-09 | MCP server architecture locked (7 tools) | session_003 |
| 2026-05-09 | JSON Schema v1 created | session_004 |
| 2026-05-10 | AI_Starter.md written with 9 rules | session_005 |
| 2026-05-10 | 5-phase build plan defined | session_006 |
| 2026-05-11 | buiry-mcp scaffolded | session_007 |
| 2026-05-12 | 3 core MCP tools implemented | session_008 |
| 2026-05-12 | Zod validation + next_steps enforcement | session_009 |
| 2026-05-13 | React + Vite + Tailwind scaffolded | session_010 |
| 2026-05-13 | Layout shell + Dashboard built | session_011 |
| 2026-05-14 | Stitch designs + gap analysis complete | session_012 |
| 2026-07-01 | Phase 2+3 complete: 11 screens, 3 agents, data layer | session_013 |
