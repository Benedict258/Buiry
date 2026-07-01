# Buiry — YouTube Video Script

**Hackathon:** Kaggle AI Agents Hackathon — Freestyle Track
**Project:** Buiry — BUild context memoRY
**Duration:** 5:00 max
**Speaking Rate:** ~150 words/min

---

## [0:00 – 0:10] Title Card

**Screen:** Animated logo reveal. Buiry wordmark fades in on dark background. Subtitle types out beneath.

```
Buiry — Your Agents Never Forget Again
Persistent Memory for AI Coding Agents
```

**Voiceover:** None. Title card holds for 5 seconds. Ambient synth swell fades in.

**Transition:** Hard cut to split-screen terminal view.

---

## [0:10 – 0:50] The Problem

**Screen:** Two terminal windows side by side. Left terminal shows an AI coding agent. Right terminal shows the developer's chat.

```
LEFT TERMINAL (Agent):
> What are we building?
> I don't have any context. Can you fill me in?

RIGHT TERMINAL (Developer):
> We're building an auth module.
> Use JWT, store tokens in httpOnly cookies.

LEFT TERMINAL (Agent):
> Great, I'll implement the auth module.
> I'll use session-based tokens.

RIGHT TERMINAL (Developer):
> No — we already decided JWT in the last session.
```

**Voiceover:**
> Every time you start a new AI coding session, your agent forgets everything. What was built. What decisions were made. What errors were hit. What comes next. You waste time re-discovering, and sometimes make contradicting decisions.

**Word count:** ~45 words | **Time:** ~18 sec

**Transition:** Zoom into the left terminal, then morph into the Buiry dashboard.

---

## [0:50 – 1:30] The Solution

**Screen:** Buiry dashboard loads. Hero card animates in at the top.

```
Hero Card:
  Session #47 — Claude Code
  "Resuming work on MCP Server integration"

Stats Row:
  Phase: MCP Server | Progress: 65% | Open Issues: 3 | Active Agents: 2
```

Below, a project timeline shows connected session dots. One pulses green — "active."

**Voiceover:**
> Buiry gives your agents persistent memory. One command at session start, and your agent knows everything — every decision, every error, every next step.

**Word count:** ~30 words | **Time:** ~12 sec

**Transition:** Cursor clicks "Session Explorer" in the sidebar.

---

## [1:30 – 2:30] Session Explorer

**Screen:** Session Explorer panel slides in. Left side shows a vertical timeline with 6 session cards grouped under "Today" and "Yesterday."

```
Today
  Session #47  ● Active  — MCP Server integration
  Session #46  ✓ Done    — Auth module refactor
  Session #45  ✓ Done    — Fix rate limiter bug

Yesterday
  Session #44  ✓ Done    — Set up project structure
  Session #43  ✓ Done    — Initial research & planning
  Session #42  ✗ Failed  — Database migration attempt
```

Cursor clicks Session #47. Right panel expands to show:

```
Decisions Made:
  - Use Zod for MCP tool input validation
  - Store context memos in SQLite, not Postgres

Errors Encountered:
  - MCP handshake timeout at 5s — fixed by adding retry logic

Next Steps:
  - Implement search endpoint
  - Add session expiry (30 min TTL)

Code Changes:
  - src/mcp/server.ts — added tool registration
  - src/db/schema.ts — added ContextMemo table
```

**Voiceover:**
> Every session is logged. Every decision recorded. Every error tracked. You can see exactly what happened, when, and why.

**Word count:** ~28 words | **Time:** ~11 sec

**Transition:** Cursor moves to the top search bar. Cmd+K opens.

---

## [2:30 – 3:15] Context Search

**Screen:** Command palette opens center-screen. User types: `what approach did we take for auth?`

Results appear instantly:

```
1. Session #32 — 92% match
   "Decided on JWT with httpOnly cookies. Refresh tokens
    stored in memory, not localStorage. Chose jose library
    over jsonwebtoken for ESM compatibility."
   — 4 decisions, 12 code changes

2. Session #28 — 74% match
   "Evaluated auth0 vs custom. Going custom for
    full control over token lifecycle."
   — 2 decisions, 3 code changes

3. Session #19 — 61% match
   "Initial auth research. Compared OAuth2 flows."
   — 1 decision, 0 code changes
```

Cursor clicks the first result. Session #32 detail view opens, highlighting the auth decision block.

**Voiceover:**
> Semantic search across all memory. Find any decision, any time. No more "what did we do last week?"

**Word count:** ~25 words | **Time:** ~10 sec

**Transition:** Hard cut to a terminal window.

---

## [3:15 – 4:00] ADK Agents

**Screen:** Terminal showing ADK agent orchestration logs. Four agents run in parallel with colored output.

```
[CoordinatorAgent] buiry_start_session --context "MCP Server integration"
  → Retrieved: 3 past sessions, 7 decisions, 2 open issues
  → Context memo loaded (4.2KB)

[CoordinatorAgent] → DevAgent: "Implement search endpoint for context memos"
  [DevAgent] Writing src/mcp/tools/search.ts
  [DevAgent] Added Zod schema for query input
  [DevAgent] Implemented SQLite FTS5 full-text search

[CoordinatorAgent] → ReviewAgent: "Review search implementation"
  [ReviewAgent] Cross-checking against past decisions...
  [ReviewAgent] ✅ Consistent with Session #45 (use FTS5, not LIKE)
  [ReviewAgent] ⚠️ Missing: rate limiting — Session #38 decided on 100 req/min

[CoordinatorAgent] → DevAgent: "Add rate limiting per Session #38 decision"
  [DevAgent] Added rate limiter middleware (100 req/min)

[CoordinatorAgent] buiry_end_session --summary "Search endpoint implemented with FTS5 + rate limiting"
  → Memory updated: 1 new decision, 3 code changes logged
```

**Voiceover:**
> Multi-agent system with shared memory. The Coordinator orchestrates. The DevAgent implements. The ReviewAgent cross-checks. They collaborate, disagree, and resolve conflicts — all using Buiry memory.

**Word count:** ~38 words | **Time:** ~15 sec

**Transition:** Terminal shrinks into the center of a clean diagram.

---

## [4:00 – 4:30] Architecture

**Screen:** Minimal architecture diagram builds in three layers, each animating in with a subtle scale-up.

```
┌─────────────────────────────────────────────┐
│            React Dashboard (11 screens)      │
│   Session Explorer · Context Search · Stats  │
├─────────────────────────────────────────────┤
│            ADK Agents (Google ADK)           │
│  CoordinatorAgent · DevAgent · ReviewAgent   │
├─────────────────────────────────────────────┤
│          MCP Server (npx buiry-mcp)          │
│     start_session · end_session · search     │
│          SQLite + FTS5 + Vector Search       │
└─────────────────────────────────────────────┘
```

Each layer highlights as the voiceover mentions it.

**Voiceover:**
> Three layers. MCP server for persistent memory. ADK agents for multi-agent orchestration. React dashboard for visualization.

**Word count:** ~24 words | **Time:** ~10 sec

**Transition:** Diagram fades into the dashboard hero view.

---

## [4:30 – 5:00] Closing

**Screen:** Dashboard fills the screen. Stats animate up: "47 sessions · 312 decisions · 1,847 code changes." Logo fades in over the dashboard.

```
Buiry — Your Agents Never Forget Again

github.com/Benedict258/Buiry
Kaggle AI Agents Hackathon — Freestyle Track
```

**Voiceover:**
> Buiry. Persistent memory for AI coding agents. Open source. Built for the Kaggle AI Agents hackathon.

**Word count:** ~22 words | **Time:** ~9 sec

**Transition:** Fade to black. Hold on GitHub URL for 3 seconds.

---

## Summary

| Section | Start | End | Duration | Word Count |
|---|---|---|---|---|
| Title Card | 0:00 | 0:10 | 10s | — |
| The Problem | 0:10 | 0:50 | 40s | 45 |
| The Solution | 0:50 | 1:30 | 40s | 30 |
| Session Explorer | 1:30 | 2:30 | 60s | 28 |
| Context Search | 2:30 | 3:15 | 45s | 25 |
| ADK Agents | 3:15 | 4:00 | 45s | 38 |
| Architecture | 4:00 | 4:30 | 30s | 24 |
| Closing | 4:30 | 5:00 | 30s | 22 |
| **Total** | | | **5:00** | **212** |

**Total voiceover words:** 212
**Estimated speaking time:** ~85 seconds of narration across 5 minutes (ample room for pauses and transitions)
