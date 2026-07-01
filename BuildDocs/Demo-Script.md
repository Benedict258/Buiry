# Buiry — Hackathon Demo Script
**5-minute video walkthrough for Kaggle submission**

---

## Video Structure (5:00 total)

### Scene 1: The Problem (0:00 - 0:45)

**Screen:** Split view — two terminal windows side by side

**Narration:**
"Every time you start a new AI coding session, your agent forgets everything. What was built. What decisions were made. What errors were hit. What comes next. You paste context manually, waste time re-discovering, and sometimes make contradicting decisions."

**Visual:**
- Left terminal: Agent says "I don't know anything about this project. What are we building?"
- Right terminal: Developer pasting project info manually
- Agent: "I'll start implementing the auth module."
- Developer: "We already decided to use JWT in the last session."

**Key moment:** The pain is visible. Developer frustrated.

---

### Scene 2: The Solution (0:45 - 1:30)

**Screen:** Buiry Dashboard (dark theme)

**Narration:**
"Buiry gives your AI agents persistent memory. One command at session start, and your agent knows everything — every decision, every error, every next step."

**Visual:**
- Dashboard loads with "Continue Where You Left Off" hero card
- Shows Session #47, Phase 2: MCP Server, 65% progress
- Stat cards: 3 open issues, 2 active agents
- Recent decisions list visible

---

### Scene 3: The Demo (1:30 - 3:30)

**Screen:** Session Explorer → Context Search → Session Detail

**Narration:**
"Let me show you how it works."

**Step 1 (1:30-2:00):** Open Session Explorer
- Show timeline of 12 sessions
- Expand Session #47 — show decisions, changes, next steps
- "Every session is logged. Every decision recorded."

**Step 2 (2:00-2:30):** Context Search (Cmd+K)
- Open Cmd+K search
- Type "what approach did we take for auth?"
- Show results with 92% match from Session #32
- "Semantic search across all memory. Find any decision, any time."

**Step 3 (2:30-3:00):** Session Detail Modal
- Open Session #47 detail
- Show: metadata, changes made, decisions log, dataset signals, next steps
- "Full audit trail. Every change tracked. Every decision justified."

**Step 4 (3:00-3:30):** ADK Agents Demo
- Show ADK agents running in terminal
- CoordinatorAgent calls buiry_start_session → gets context
- DevAgent implements code changes
- ReviewAgent cross-checks against past decisions
- CoordinatorAgent calls buiry_end_session → memory updated
- "Multi-agent system with shared memory. Agents collaborate, not just execute."

---

### Scene 4: The Architecture (3:30 - 4:15)

**Screen:** Architecture diagram (ASCII or simple graphic)

**Narration:**
"Buiry has three layers."

**Visual:**
- Layer 1: "MCP Server — npx buiry-mcp — 7 tools for session memory"
- Layer 2: "ADK Agents — Google ADK — Multi-agent orchestration"
- Layer 3: "React Dashboard — Visualize sessions, search memory, manage datasets"

**Key points:**
- "MCP server works with Claude Code, Cursor, Copilot — any tool"
- "ADK agents demonstrate multi-agent collaboration with shared memory"
- "Dashboard shows everything in one place"

---

### Scene 5: The Impact (4:15 - 5:00)

**Screen:** Dashboard with stats, then Dataset Browser

**Narration:**
"Buiry doesn't just remember — it learns. Every interaction becomes training data. Privacy-safe. Verifiable. Owned by you."

**Visual:**
- Show Dataset Browser with 3 datasets
- Privacy scores visible (98%, 94%, 76%)
- "No raw user data stored. PII stripped before storage."

**Closing:**
- "Buiry — Your agents never forget again."
- GitHub URL: github.com/Benedict258/Buiry
- "Hackathon submission for Kaggle AI Agents course"

---

## Recording Checklist

| Item | Status |
|---|---|
| Screen recording software | Need OBS or similar |
| Microphone | Need clean audio |
| Demo data ready | Build-Context-Memory.json with 12 sessions |
| React app running | npm run dev in apps/web |
| MCP server running | node packages/buiry-mcp/dist/index.js |
| ADK agents ready | packages/adk-agents/ |
| Architecture diagram | ASCII or simple graphic |
| YouTube upload | Need channel |
| Thumbnail | Need cover image |

---

## Key Demo Moments (for video editing)

1. **0:45** — Dashboard appears (visual impact)
2. **2:00** — Cmd+K search returns results (wow moment)
3. **3:00** — ADK agents collaborating (technical depth)
4. **4:00** — Architecture diagram (clarity)
5. **5:00** — Closing with URL (call to action)

---

*Demo Script — Buiry Hackathon Submission*
