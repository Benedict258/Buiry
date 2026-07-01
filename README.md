# Buiry — BUild context memoRY

> Your agents never forget again.

Buiry is a persistent memory infrastructure for AI coding agents and a dataset harvesting platform. It solves two problems at once: (1) AI agents lose all context when sessions end or tools change — Buiry gives them append-only, cross-tool memory that survives across every session and every editor; and (2) developers building AI products generate valuable interaction data but have no clean way to capture, privacy-strip, and own it — Buiry harvests this data into verifiable datasets on-chain. Built as a hackathon submission for the [Kaggle/Google AI Agents: Intensive Vibe Coding Capstone Project](https://www.kaggle.com/competitions/ai-agents-intensive-vibe-coding-capstone-project).

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        MCP Server                                │
│                   npx buiry-mcp                                  │
│                                                                  │
│   buiry_init │ buiry_start_session │ buiry_end_session           │
│   buiry_log_decision │ buiry_get_context │ buiry_flag_issue      │
│   buiry_generate_docs                                           │
│                                                                  │
│   Local JSON read/write (Build-Context-Memory.json)              │
└──────────────────────────┬───────────────────────────────────────┘
                           │ MCP protocol (stdio)
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                      ADK Agents (Python)                         │
│                                                                  │
│   Session Manager  │  Decision Logger  │  Context Retriever      │
│   Issue Tracker    │  Doc Generator    │  Dataset Harvester      │
│                                                                  │
│   Calls MCP tools via stdio transport                            │
│   Manages session lifecycle and memory updates                   │
└──────────────────────────┬───────────────────────────────────────┘
                           │ REST API
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                   React Dashboard (Vite)                         │
│                                                                  │
│   Session Browser  │  Memory Search  │  Dataset Explorer         │
│   Issue Tracker    │  Doc Viewer     │  Blockchain Status        │
│                                                                  │
│   Displays sessions, search, datasets, and on-chain metadata     │
└──────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/Benedict258/Buiry.git
cd Buiry

# 2. Install the MCP server
cd packages/buiry-mcp
npm install
npm run build

# 3. Install the web dashboard
cd ../../apps/web
npm install

# 4. Start the dashboard
npm run dev

# 5. Configure Claude Code — add to .claude/settings.json
```

```json
{
  "mcpServers": {
    "buiry": {
      "command": "npx",
      "args": ["buiry-mcp"],
      "env": {}
    }
  }
}
```

Open the dashboard at `http://localhost:5173` and start your first Buiry session.

---

## MCP Tools

Buiry exposes 7 tools via the Model Context Protocol:

| Tool | Description |
|---|---|
| `buiry_init` | Initialize a new Buiry project with full file structure (AI_Starter.md, Build-Context-Memory.json, PRD, ARCHITECTURE, DEV_PLAN) |
| `buiry_start_session` | Begin a new session — returns project identity, last N sessions, next steps, and open issues |
| `buiry_end_session` | End the current session — validates the session object, enforces append-only rules, writes to memory |
| `buiry_log_decision` | Append a decision to the active session without ending it |
| `buiry_get_context` | Semantic search across all past sessions for relevant context |
| `buiry_flag_issue` | Log a known issue and increment the open issues counter |
| `buiry_generate_docs` | LLM-synthesize PRD, ARCHITECTURE, and DEV_PLAN from accumulated session history |

---

## Project Structure

```
Buiry/
├── apps/
│   ├── api/                    # Cloud backend (Express + TypeScript)
│   └── web/                    # React + Vite + Tailwind dashboard
│       ├── src/
│       ├── package.json
│       ├── vite.config.ts
│       └── tailwind.config.js
├── packages/
│   ├── buiry-mcp/              # MCP server (Node.js + TypeScript)
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── adk-agents/             # Google ADK agent definitions (Python)
│       ├── agents/
│       └── tools/
├── contracts/
│   └── buiry/                  # Sui smart contracts (Move)
├── ProjectDocs/                # Product specs and planning docs
├── BuildDocs/                  # Architecture and knowledge base
├── stitch/                     # UI prototyping artifacts
└── README.md
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| MCP Server | Node.js + TypeScript | Local JSON read/write, tool definitions via `npx buiry-mcp` |
| Frontend | React + Vite + Tailwind CSS | Dashboard for sessions, search, datasets |
| Agents | Python + Google ADK | Multi-agent orchestration, session management |
| Backend API | Node.js + Express + TypeScript | Cloud backend, REST endpoints |
| Database | PostgreSQL + pgvector | Metadata, vector search, job queue |
| Cache | Redis | Rate limiting, session caching |
| Blockchain | Sui | Ownership objects, dataset registration, marketplace |
| Blob Storage | Walrus | SEAL-encrypted session archives and dataset blobs |
| Encryption | SEAL | Threshold encryption before Walrus upload |
| Job Queue | Apalis | Async Data Agent pipeline |
| Schema | JSON Schema | Session object validation |

---

## How It Works

1. **Agent starts a session** — The AI agent calls `buiry_start_session` and receives the project identity, last 5 sessions, open next steps, and unresolved issues. No manual prompt-pasting required.

2. **Agent works** — The agent reads and writes code, makes decisions, encounters errors. Mid-session, it calls `buiry_log_decision` or `buiry_flag_issue` as needed.

3. **Agent ends the session** — The agent calls `buiry_end_session` with a structured session object containing progress, changes made, decisions taken, errors encountered, and next steps.

4. **Memory is updated** — The session is validated against the JSON schema, appended to `Build-Context-Memory.json` (or synced to cloud), and made searchable for future sessions.

5. **Next session picks up where it left off** — Any tool (Claude Code, Cursor, Copilot) calls `buiry_start_session` and gets the full context. Tool switches become invisible.

6. **Datasets accumulate** — Over time, the interaction data builds a rich, privacy-stripped dataset that can be registered on-chain via Sui and made available through the marketplace.

---

## Hackathon Track

**Freestyle**

### Course Concepts Demonstrated

| Concept | Implementation |
|---|---|
| ADK Multi-Agent System | Python-based agents orchestrate session lifecycle, context retrieval, and document generation via Google ADK |
| MCP Server | Full MCP server (`buiry-mcp`) exposing 7 tools over stdio transport, integrating with Claude Code and other MCP-compatible tools |
| Security Features | JSON schema validation on every write, append-only memory enforcement, SEAL threshold encryption for cloud storage, PII stripping in dataset pipeline |

---

## License

MIT
