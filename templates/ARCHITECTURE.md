# Architecture

> Version: 1.0.0 | Status: Current | Last Updated: 2026-07-01

---

## 1. System Overview

Buiry is a local-first developer infrastructure for persistent AI agent memory. It consists of four major components that communicate via MCP protocol and share a single JSON-based memory file.

```
┌─────────────────────────────────────────────────────────┐
│                    Developer Machine                     │
│                                                          │
│  ┌──────────────┐    stdio    ┌──────────────────────┐  │
│  │  AI Agent    │◄───────────►│  buiry-mcp           │  │
│  │  (Claude,    │   MCP       │  (Node.js / TS)      │  │
│  │   Cursor,    │   Protocol  │                      │  │
│  │   Copilot)   │             │  Tools:              │  │
│  └──────────────┘             │  - start_session     │  │
│                               │  - end_session       │  │
│                               │  - get_context       │  │
│                               │  - search_memory     │  │
│                               │  - log_decision      │  │
│                               │  - log_error         │  │
│                               │  - checkpoint        │  │
│                               └──────────┬───────────┘  │
│                                          │ read/write   │
│                               ┌──────────▼───────────┐  │
│                               │ Build-Context-       │  │
│                               │ Memory.json          │  │
│                               │ (Append-only JSON)   │  │
│                               └──────────┬───────────┘  │
│                                          │              │
│              ┌───────────────────────────┼──────┐       │
│              │                           │      │       │
│  ┌───────────▼──────────┐  ┌────────────▼────┐ │       │
│  │  React Dashboard     │  │  ADK Agents     │ │       │
│  │  (Vite + Tailwind)   │  │  (Python)       │ │       │
│  │                      │  │                 │ │       │
│  │  - Session Explorer  │  │  - Coordinator  │ │       │
│  │  - Context Search    │  │  - DevAgent     │ │       │
│  │  - Dataset Browser   │  │  - ReviewAgent  │ │       │
│  │  - Settings          │  │                 │ │       │
│  └──────────────────────┘  └─────────────────┘ │       │
│                                                  │       │
│  ┌──────────────────────────────────────────────┘       │
│  │                                                       │
│  │  ┌──────────────────────┐                            │
│  │  │  Dataset SDK         │                            │
│  │  │  (TypeScript)        │                            │
│  │  │  - signal capture    │                            │
│  │  │  - privacy filter    │                            │
│  │  │  - export            │                            │
│  │  └──────────────────────┘                            │
│  └──────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| MCP Server | TypeScript / Node.js | 22+ | Core memory server |
| MCP Protocol | @modelcontextprotocol/sdk | ^1.12 | Tool registration, stdio transport |
| Validation | Zod | 3.x | Input schema validation |
| Frontend | React | 19 | Dashboard UI |
| Build | Vite | 6.x | Dev server, bundling |
| Styling | Tailwind CSS | 4.x | Stitch dark theme tokens |
| Routing | React Router | 7.x | Client-side routing |
| Agents | Python / Google ADK | 3.11+ | Multi-agent orchestration |
| Data | Dataset SDK | custom | Interaction pattern capture |
| Memory | JSON file | draft-07 | Append-only session storage |

---

## 3. Component Map

### 3.1 MCP Server (`packages/buiry-mcp/`)

The core of Buiry. A local MCP server exposing 7 tools over stdio transport.

```
packages/buiry-mcp/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts          # Entry point, StdioServerTransport
    ├── schemas.ts        # Zod validation schemas
    ├── memory.ts         # File I/O: readMemory, writeMemory
    └── tools/
        ├── start-session.ts
        ├── end-session.ts
        ├── get-context.ts
        ├── search-memory.ts
        ├── log-decision.ts
        ├── log-error.ts
        └── checkpoint.ts
```

**Key design decisions:**
- Each tool in its own file under `src/tools/`
- ESM modules (type: module)
- Zod validates all inputs at tool boundary
- `next_steps` required in `end_session` (min 1 item)

### 3.2 React Dashboard (`apps/web/`)

Web UI for visualizing session history and exploring context.

```
apps/web/
├── package.json
├── vite.config.ts
├── tailwind.config.js    # Stitch dark theme tokens
├── index.html            # Google Fonts (Inter, JetBrains Mono)
└── src/
    ├── App.tsx            # Router with 6 routes
    ├── lib/
    │   ├── types.ts       # TypeScript interfaces
    │   ├── mock-data.ts   # Demo data
    │   └── api.ts         # Data layer
    ├── components/
    │   ├── layout/
    │   │   ├── Layout.tsx
    │   │   ├── Sidebar.tsx
    │   │   └── TopBar.tsx
    │   ├── sessions/
    │   │   └── SessionDetailModal.tsx
    │   └── search/
    │       └── ContextSearchModal.tsx
    └── pages/
        ├── Dashboard.tsx
        ├── SessionExplorer.tsx
        ├── DatasetBrowser.tsx
        ├── Settings.tsx
        └── Onboarding.tsx
```

### 3.3 ADK Agents (`packages/adk-agents/`)

Python-based multi-agent system using Google ADK.

```
packages/adk-agents/
├── requirements.txt
└── agents/
    ├── coordinator.py    # Orchestrates session lifecycle
    ├── dev_agent.py      # Implements code changes
    └── review_agent.py   # Cross-checks decisions
```

### 3.4 Dataset SDK (`packages/dataset-sdk/`)

Captures structural interaction patterns. Privacy-first design.

```
packages/dataset-sdk/
├── package.json
└── src/
    ├── index.ts
    ├── capture.ts        # Signal capture
    ├── filter.ts         # Privacy filter (no raw user data)
    └── export.ts         # Export to various formats
```

---

## 4. Data Flows

### 4.1 Session Lifecycle

```
AI Agent ──start_session──► buiry-mcp ──write──► Memory.json
                                                      │
AI Agent ◄──get_context─── buiry-mcp ◄──read──── Memory.json
                                                      │
AI Agent ──log_decision───► buiry-mcp ──append──► Memory.json
                                                      │
AI Agent ──end_session────► buiry-mcp ──write──► Memory.json
```

### 4.2 Dashboard Data Flow

```
React App ──read──► Memory.json ──parse──► Session Data
                                              │
Dashboard ◄──render── Session Explorer ────────┤
Session Detail ◄───────────────────────────────┤
Context Search ◄───────────────────────────────┘
```

### 4.3 Dataset Capture Flow

```
AI Agent ──interaction──► Dataset SDK ──filter──► Privacy Check
                                                      │
Dataset Store ◄──export──── Dataset SDK ◄──signal────┘
```

---

## 5. External Dependencies

| Dependency | Purpose | Risk Level |
|------------|---------|------------|
| @modelcontextprotocol/sdk | MCP protocol implementation | Low — actively maintained |
| Zod | Schema validation | Low — stable, well-tested |
| Google ADK | Multi-agent orchestration | Medium — newer framework |
| Sui blockchain | Dataset anchoring (Phase 4) | High — early integration |
| Walrus storage | Decentralized storage (Phase 4) | High — early integration |

---

## 6. Known Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| MCP SDK breaking changes | Tools stop working | Pin SDK version, test on updates |
| JSON file corruption | Session data loss | Append-only design, try-catch recovery |
| Google ADK API changes | Agent code breaks | Abstract behind interface, test suite |
| Sui/Walrus mainnet instability | Blockchain features unreliable | Defer to Phase 4, local fallback |
| Context size exceeding limits | get_context returns too much data | max_sessions_in_context config, auto-summarize |
| Concurrent file writes | Race condition on Memory.json | File locking or single-writer pattern |
