# Buiry — Persistent Memory for AI Coding Agents

**Hackathon:** AI Agents: Intensive Vibe Coding Capstone Project
**Track:** Freestyle
**GitHub:** [Benedict258/Buiry](https://github.com/Benedict258/Buiry)

---

## Problem Statement

Every time a developer starts a new AI coding session, the agent forgets everything. What was built, which decisions were made, what errors were hit, and what comes next — all gone. The developer wastes minutes re-explaining project context, re-discovering prior decisions, and sometimes making contradicting choices the agent made two sessions ago.

This is the **context amnesia problem**. AI coding agents are stateless by design. Each session starts from zero. For small scripts, this is tolerable. For real projects spanning days or weeks, it's devastating. Developers become the memory — manually copying summaries between sessions, maintaining ad-hoc notes, and acting as the continuity layer that should be automated.

The result: duplicated work, lost decisions, inconsistent architecture, and frustrated developers who spend more time on context reconstruction than actual coding.

Buiry solves this with a simple insight: **if agents can't remember, give them a memory they can read and write.** Not a database. Not a vector store. A structured, append-only JSON file that every agent session can load at start and persist to at end — creating a continuous thread of project memory across sessions, agents, and tools.

---

## Why Agents

Buiry uses a multi-agent architecture because memory recall isn't a simple database lookup — it's **semantic reasoning across sessions**. When a developer asks "what did we decide about authentication?", the answer isn't a single record. It's a chain: session 3 chose JWT, session 7 discovered a token expiry bug, session 9 added refresh tokens. Reconstructing this requires an agent that reads, interprets, and connects disjointed facts.

The system uses three specialized agents built with Google ADK:

- **CoordinatorAgent** — Orchestrates the session. Reads context from Buiry memory, identifies next steps and open issues, delegates tasks to the other agents. When agents disagree, it resolves conflicts using session history.

- **DevAgent** — Implements code changes. Receives context from the Coordinator, writes code, and reports back with decisions made and files modified.

- **ReviewAgent** — Cross-checks work. Validates that implementations match prior decisions, flags regressions, and surfaces issues from past sessions that are relevant to current work.

Each agent interprets the same memory differently. The Coordinator sees the big picture. The DevAgent focuses on implementation details. The ReviewAgent hunts for inconsistencies. They collaborate, disagree, and resolve conflicts — all using shared session memory as the source of truth.

This isn't just a workflow. It's a demonstration that **memory makes agents smarter together**, not just individually.

---

## Architecture

Buiry is a monorepo with three packages, each serving a distinct role:

### MCP Server (`packages/buiry-mcp`)

The core infrastructure. A TypeScript MCP server exposing 3 tools over stdio transport:

- **`buiry_start_session`** — Reads `Build-Context-Memory.json` and returns the last 5 sessions with project identity, summary, next steps, and open issues. This is what every agent calls first.

- **`buiry_end_session`** — Validates a session object against Zod schemas and appends it to the memory file. Enforces immutability: once a session is written, it cannot be modified.

- **`buiry_get_context`** — Keyword search across all sessions. Returns matching sessions with relevance ranking.

The server reads/writes a single local file: `Build-Context-Memory.json`. No cloud API, no database, no Redis. This makes it deployable anywhere with `npx buiry-mcp`.

Zod validation is critical. The `next_steps` field is required — every session must leave a breadcrumb for the next one. Session immutability is enforced by schema validation. `max_sessions` config trims old sessions when the file grows too large.

### ADK Agents (`packages/adk-agents`)

Three Python agents using Google ADK's `SequentialAgent` pattern:

```python
root_agent = SequentialAgent(
    name="buiry_agent_team",
    sub_agents=[coordinator, dev_agent, review_agent],
)
```

The flow is linear: Coordinator loads context → DevAgent implements → ReviewAgent validates. Each agent calls Buiry MCP tools via stdio to read and write session memory. The agents are thin wrappers — the intelligence comes from the MCP tools providing structured context.

### React Dashboard (`apps/web`)

A Vite + React 19 + Tailwind CSS application with a Stitch dark theme. The dashboard visualizes session history, enables search, and provides a developer-facing interface for the memory system.

Key screens:
- **Dashboard** — Hero card, session stats, activity timeline, recent decisions
- **Session Explorer** — Timeline view of all sessions with expandable cards and filters
- **Session Detail Modal** — Full session metadata, decisions log, dataset signals, next steps
- **Context Search** — Cmd+K overlay for semantic search across sessions
- **Dataset Browser** — Browse harvested interaction data with privacy scores
- **Settings** — Configuration for memory limits, themes, integrations
- **Onboarding** — First-run guide for new users

Layout: 240px fixed sidebar + 48px top bar + scrollable content area. Dark theme with MD3 design tokens, Inter for body text, JetBrains Mono for code.

---

## Technical Implementation

### MCP Over REST

Tools compose better than endpoints. An AI agent calling `buiry_start_session` gets exactly the context it needs — not a monolithic API response. Each tool is self-contained, independently testable, and composable into workflows. The MCP protocol handles transport, serialization, and error handling. We didn't need to build any of that.

### Zod Validation as Guard Rails

Every session object passes through Zod before touching the file system:

- `next_steps` is **required** — no session can close without telling the next session what comes next
- `session_id` must be unique within the file
- `timestamp` must be ISO 8601
- `progress.completed`, `progress.in_progress`, and `progress.blocked` are all required arrays

This isn't just validation — it's **enforced documentation**. The schema guarantees that every session contributes useful context.

### ADK SequentialAgent Pattern

We chose `SequentialAgent` over parallel execution because coding work has dependencies. The Coordinator must load context before the DevAgent can implement. The ReviewAgent must see the implementation before it can validate. Sequential execution is correct, simple, and sufficient for the demo.

Each agent is defined as a thin `Agent()` with a detailed instruction prompt. The prompt encodes Buiry-specific rules: always load context first, log every decision with reasons, never leave `next_steps` empty. This keeps the agents focused and the code minimal.

### Stitch Design System

The dashboard uses Material Design 3 tokens from Stitch's dark theme specification:

- **Colors:** Dark surface (#0f0f12), primary (#6750a4), error (#f2b8b5)
- **Typography:** Inter (body), JetBrains Mono (code), with MD3 type scale
- **Shape:** 8px corner radius for cards, 12px for modals
- **Spacing:** 4px base unit, consistent across all components

Tailwind config maps these tokens to utility classes. Every component uses the design system, not arbitrary values.

---

## The Build

Buiry was built using subagents for parallel execution. The Phase 1 build plan had 7 independent tasks that could run concurrently:

1. MCP server scaffolded and compiled clean in one pass — `packages/buiry-mcp/src/index.ts` connects to `StdioServerTransport`, registers 3 tools, and compiles to `dist/index.js`.

2. React app scaffolded with Vite + Tailwind — `apps/web` with Stitch dark theme tokens in `tailwind.config.js`, Layout component combining Sidebar + TopBar, and Dashboard page with hero card and stats.

3. Documentation written in parallel — README with architecture diagram, Project Knowledge Base (26KB), Stitch UI Study (49KB), Gap Analysis (13KB), UI/UX Reference (82KB).

4. ADK agents built as thin wrappers — Three Python files defining the Coordinator, Dev, and Review agents with detailed instruction prompts.

5. Build-Context-Memory.json populated with 13 realistic sessions telling the full story of building the platform — from initial scaffolding through schema design, MCP implementation, React dashboard, ADK agents, and Stitch theme integration.

All components compile clean. No type errors. No lint warnings. The MCP server starts and responds to tool calls. The React app renders all screens. The ADK orchestrator instantiates the agent team.

---

## Security Features

Buiry's architecture includes several security-conscious design decisions:

- **Append-only session model** — Sessions are never modified after writing. This prevents accidental data loss and creates an audit trail. The `max_sessions` config trims old sessions, but individual sessions are immutable.

- **Schema-enforced structure** — Zod validation ensures every session has required fields. Malformed data is rejected at write time, not discovered at read time.

- **Local-only for hackathon** — The MCP server reads/writes to the local filesystem. No data leaves the machine. No cloud API, no telemetry, no external dependencies beyond npm packages.

- **Privacy-aware dataset design** — The Dataset Browser shows privacy scores on dataset cards. The architecture supports PII stripping pipelines (planned for Phase 2) that will strip sensitive data before dataset export.

These are foundational choices, not afterthoughts. The append-only model was decided in session 1. Schema validation was designed in session 4. Security was part of the architecture from the start.

---

## Demo

The 5-minute video demonstrates:

1. **The Problem** — Start a new AI coding session with no context. The agent asks "what are we building?" The developer re-explains everything from scratch.

2. **The Solution** — Open the Buiry dashboard. The same session now starts with full context: 13 prior sessions, every decision logged, every error tracked, next steps clearly defined.

3. **Session Explorer** — Timeline view showing the progression from project initialization through schema design, MCP server build, React dashboard, ADK agents, and theme integration. Each session card expands to show decisions, progress, and next steps.

4. **Context Search** — Cmd+K overlay searching across all 13 sessions. Type "MCP" and see every session that touched the MCP server. Type "decision" and see every logged decision with its rationale.

5. **ADK Agents Collaborating** — The CoordinatorAgent loads context, the DevAgent implements a feature, the ReviewAgent validates the work. Each agent calls Buiry MCP tools to read and write memory, creating a continuous thread of context.

---

## What We Learned

**Multi-agent collaboration requires shared memory, not just shared prompts.** Agents that can read and write to the same context make better decisions than agents operating in isolation. The CoordinatorAgent's ability to resolve conflicts between DevAgent and ReviewAgent depended entirely on having session history to reference.

**MCP tools compose better than monolithic APIs.** Each tool does one thing well. `buiry_start_session` returns context. `buiry_end_session` persists work. `buiry_get_context` searches history. Agents chain these tools into workflows without needing custom orchestration logic.

**Append-only is the right default for session memory.** Immutability prevents the most common failure mode: accidentally overwriting good context with bad. The `next_steps` requirement ensures continuity. The schema enforces documentation without requiring developer discipline.

---

## Future Work

- **Cloud backend with MemWal** — Move from local JSON to cloud-hosted memory with Walrus for decentralized storage and Sui smart contracts for marketplace transactions.
- **Dataset SDK** — Harvest interaction data from session logs into structured datasets. Support PII stripping, privacy scoring, and export in standard formats.
- **Marketplace** — Trade datasets and memory bundles. Agents share learned patterns across projects. Developers sell curated session histories as onboarding material.
