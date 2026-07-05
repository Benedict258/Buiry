# Buiry — YouTube Video Script

**Hackathon:** AI Agents: Intensive Vibe Coding Capstone Project
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

**Screen:** Buiry dashboard loads. Hero card animates in at the top. Stats row shows live data.

```
Hero Card:
  Session #47 — Claude Code
  "Resuming work on MCP Server integration"

Stats Row:
  Phase: MCP Server | Progress: 65% | Open Issues: 3
```

Below, a project timeline shows connected session dots. One pulses green — "active." 14 LLM adapter icons appear around the edges — Anthropic, OpenAI, Gemini, Groq, and more.

**Voiceover:**
> Buiry gives your agents persistent memory. One command at session start, and your agent knows everything — every decision, every error, every next step. It works across 14 LLM providers through our SDK, and 9 tools through our MCP server. Your agents never lose context again.

**Word count:** ~42 words | **Time:** ~17 sec

**Transition:** Cursor clicks "Session Explorer" in the sidebar.

---

## [1:30 – 2:15] Session Explorer & Export

**Screen:** Session Explorer panel slides in. Left side shows a vertical timeline with session cards. Right panel expands to show decisions, errors, and next steps.

```
Today
  Session #47  ● Active  — MCP Server integration
  Session #46  ✓ Done    — Auth module refactor
  Session #45  ✓ Done    — Fix rate limiter bug

Decisions Made:
  - Use Zod for MCP tool input validation
  - Store context memos in PostgreSQL, fallback to file

Errors Encountered:
  - MCP handshake timeout at 5s — fixed by adding retry logic

Next Steps:
  - Implement search endpoint
```

Cursor clicks "Export Logs" button. A dropdown appears: JSON, CSV, TXT. User selects JSON — download begins. Sonner notification appears: "Session log exported as JSON."

**Voiceover:**
> Every session is logged. Every decision recorded. Every error tracked. Export logs as JSON, CSV, or TXT for your records. The sidebar toggles on any screen size, so you can work anywhere.

**Word count:** ~35 words | **Time:** ~14 sec

**Transition:** Cursor moves to the top search bar. Cmd+K opens the command palette.

---

## [2:15 – 2:55] Context Search

**Screen:** Command palette opens center-screen. User types: `what approach did we take for auth?`

Results appear instantly with relevance scores:

```
1. Session #32 — 92% match
   "Decided on JWT with httpOnly cookies. Refresh tokens
    stored in memory, not localStorage."

2. Session #28 — 74% match
   "Evaluated auth0 vs custom. Going custom for
    full control over token lifecycle."

3. Session #19 — 61% match
   "Initial auth research. Compared OAuth2 flows."
```

**Voiceover:**
> Search across all sessions instantly. Find any decision, any error, any next step. No more "what did we do last week?"

**Word count:** ~22 words | **Time:** ~9 sec

**Transition:** Hard cut to a terminal showing ADK agent orchestration.

---

## [2:55 – 3:40] ADK Agents & Bridge

**Screen:** Terminal showing ADK agent orchestration with the Bridge server. Seven agents run in sequence.

```
[IntentRouter] → "log_decision"
  Analyzing: "We decided to use TypeScript for the SDK"

[ContextGuardian] Scanning for PII...
  ✅ No sensitive data detected

[DatasetGenerator] Classifying interactions...
  → behavioral_patterns (12), decision_sequences (8)

[QualityAuditor] Auditing dataset...
  Score: 87/100 → APPROVE

[SessionAnalyst] Analyzing session...
  → 3 patterns identified, 0 blockers

[ContractGuardian] Validating Sui transaction...
  ✅ revenue_vault distribution valid

ADK Bridge server (port 8765) — 7 agents running
```

**Voiceover:**
> Ten agents, seven active — all powered by Gemini. The ADK Bridge server connects our TypeScript pipeline to Python agents. PII scanning, dataset classification, quality auditing — agents collaborate through shared memory and produce results no single agent could achieve alone.

**Word count:** ~38 words | **Time:** ~15 sec

**Transition:** Terminal shrinks into an architecture diagram.

---

## [3:40 – 4:20] Architecture & Security

**Screen:** Architecture diagram builds layer by layer:

```
┌─────────────────────────────────────────────────┐
│         React Frontend (10 pages)                │
│   Dashboard · Sessions · Datasets · Settings      │
│   Sonner notifications · Export logs · Sidebar    │
│            Deployed on Vercel                     │
├─────────────────────────────────────────────────┤
│         Express API (29 routes, 10 groups)        │
│   Auth (SHA-256) · Rate limiting · PostgreSQL     │
│            Deployed on Railway                    │
├─────────────────────────────────────────────────┤
│         ADK Agents (7 working, Gemini)            │
│   Bridge server · BuirySkill · ContractGuardian   │
├─────────────────────────────────────────────────┤
│         MCP Server (9 tools)                      │
│   @buiry/mcp@0.1.3 · Cloud-first architecture     │
├─────────────────────────────────────────────────┤
│         Blockchain Layer                          │
│   Sui Move contracts · Walrus SEAL encryption     │
│   4 contracts on testnet · Real transactions      │
└─────────────────────────────────────────────────┘
```

**Voiceover:**
> Four layers. React frontend on Vercel. Express API on Railway with SHA-256 auth and rate limiting. ADK agents powered by Gemini. MCP server with nine tools. And blockchain contracts on Sui testnet with SEAL-encrypted storage.

**Word count:** ~32 words | **Time:** ~13 sec

**Transition:** Diagram fades into the live dashboard.

---

## [4:20 – 5:00] Closing

**Screen:** Dashboard fills the screen. Stats animate up. Activity graph shows sinusoidal pattern of session activity. Live URLs appear.

```
Buiry — Your Agents Never Forget Again

Live: https://buiry.vercel.app
API:  https://buiry.up.railway.app

14 LLM adapters · 9 MCP tools · 10 ADK agents
29 API routes · 4 Sui contracts · 10 frontend pages
244+ source files across 6 packages
```

**Voiceover:**
> Buiry. Persistent memory for AI coding agents. Open source. Built for the Kaggle AI Agents capstone.

**Word count:** ~20 words | **Time:** ~8 sec

**Transition:** Fade to black.

---

## Summary

| Section | Start | End | Duration | Word Count |
|---|---|---|---|---|
| Title Card | 0:00 | 0:10 | 10s | — |
| The Problem | 0:10 | 0:50 | 40s | 45 |
| The Solution | 0:50 | 1:30 | 40s | 42 |
| Session Explorer | 1:30 | 2:15 | 45s | 35 |
| Context Search | 2:15 | 2:55 | 40s | 22 |
| ADK Agents & Bridge | 2:55 | 3:40 | 45s | 38 |
| Architecture & Security | 3:40 | 4:20 | 40s | 32 |
| Closing | 4:20 | 5:00 | 40s | 20 |
| **Total** | | | **5:00** | **234** |

**Total voiceover words:** 234
**Estimated speaking time:** ~94 seconds of narration across 5 minutes (ample room for pauses and transitions)
