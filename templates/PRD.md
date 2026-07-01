# Product Requirements Document (PRD)

> Version: 1.0.0 | Status: Draft | Owner: Buiry Team

---

## 1. Problem Statement

AI agents lose context between sessions. Every new conversation starts from scratch — no memory of past decisions, no awareness of prior file changes, no continuity across multi-day tasks. Developers waste hours re-explaining project context, re-deciding already-settled architecture choices, and re-discovering previously resolved issues. This context collapse is the single biggest bottleneck in AI-assisted development workflows.

---

## 2. Target Users

**Primary:** Developers building AI-powered products who use AI coding agents (Claude Code, Cursor, GitHub Copilot, Windsurf) as part of their daily workflow.

**Secondary:** Teams running multi-agent systems (Google ADK, CrewAI, AutoGen) that need shared context across agent runs.

**Tertiary:** Data engineers building training datasets from AI coding interactions.

---

## 3. Core Features

| Feature | Description | Phase |
|---------|-------------|-------|
| **MCP Server** | Local session memory server via `npx buiry-mcp`. Exposes 7 tools: start_session, end_session, get_context, search_memory, log_decision, log_error, checkpoint. | P1 |
| **ADK Agents** | Multi-agent system (CoordinatorAgent, DevAgent, ReviewAgent) calling MCP tools via stdio. Orchestrates full session lifecycle. | P2 |
| **React Dashboard** | Web UI for visualizing session history, exploring context, searching decisions. Dark theme with Stitch design tokens. | P1 |
| **Dataset SDK** | Captures structural interaction patterns for training data. Privacy-first: no raw user content, only behavioral signals. | P3 |

---

## 4. Non-Goals

- **Not a general-purpose database.** Buiry is a specialized context layer, not a replacement for Postgres, Redis, or any existing storage system.
- **Not a replacement for existing AI tools.** Buiry augments Claude, Copilot, Cursor — it does not compete with or wrap them.
- **Not a cloud service (hackathon scope).** The initial build is local-only, reading and writing `Build-Context-Memory.json` on disk. Cloud sync is a future consideration.
- **Not an IDE plugin.** Buiry operates at the MCP protocol level, not as a VS Code or JetBrains extension.
- **Not a prompt management system.** We store session context and decisions, not prompt templates or chains.

---

## 5. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Context restoration speed | < 100ms from `get_context` call to usable context | MCP tool response time |
| Decision preservation | 100% of technical decisions captured in `decisions_log` | Audit against session logs |
| Session continuity | Any AI agent can pick up where the last one left off | Pass/fail: new agent reads next_steps and proceeds correctly |
| Zero data loss | No session object is ever overwritten or deleted | Schema validation on every write |
| Developer time saved | > 30 minutes per day in context re-establishment | Self-reported survey |

---

## 6. User Stories

**US-1:** As a developer, when I start a new AI coding session, the agent automatically reads my last session and knows exactly where I left off.

**US-2:** As a developer, I can search across all past sessions to find when and why a specific decision was made.

**US-3:** As a team lead, I can view a dashboard showing all active sessions, open issues, and blocked tasks across my team's AI agents.

**US-4:** As a data engineer, I can export anonymized interaction patterns from Buiry sessions to train a domain-specific model.

**US-5:** As a developer, when my AI agent encounters an error that was solved before, it finds the resolution in past sessions instead of re-debugging from scratch.

---

## 7. Constraints

- **Local-first:** All data stored in `Build-Context-Memory.json` on the user's machine.
- **Append-only:** Sessions are never modified or deleted after creation.
- **Protocol-based:** MCP server communicates via stdio transport (no network).
- **Schema-validated:** Every write validated against JSON Schema draft-07.
- **Hackathon scope:** Phase 1 deliverable (MCP server + React dashboard) must be demo-ready.

---

## 8. Out of Scope (Future Phases)

- Cloud sync and multi-device context sharing
- Real-time collaboration between multiple AI agents
- Custom dashboard themes and plugin system
- Integration with non-MCP AI tools
- Dataset marketplace and sharing
