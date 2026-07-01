# Buiry ADK Agents

Multi-agent coding team built with Google ADK, backed by Buiry MCP tools for persistent memory.

## Agents

| Agent | Role |
|---|---|
| **CoordinatorAgent** | Orchestrates session lifecycle, distributes tasks, resolves conflicts |
| **DevAgent** | Reads context, plans implementation, executes code changes |
| **ReviewAgent** | Reviews changes, cross-checks against known issues, flags risks |

## How It Works

```
User request
    │
    ▼
┌─────────────────┐
│ CoordinatorAgent │◄── buiry_start_session (load context)
└────────┬────────┘
         │ delegates
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│ DevAgent│ │ReviewAgent│
└───┬────┘ └───┬────┘
    │          │
    └────┬─────┘
         ▼
┌─────────────────┐
│ CoordinatorAgent │──► buiry_end_session (persist memory)
└─────────────────┘
```

## Buiry MCP Tools

The agents call these MCP tools via stdio:

- `buiry_start_session` — returns project context, last 5 sessions, next_steps, open_issues
- `buiry_end_session` — validates and appends a new session to Build-Context-Memory.json
- `buiry_get_context` — keyword search across all past sessions

## Prerequisites

- Python 3.10+
- Google ADK (`pip install google-adk>=0.3.0`)
- Gemini API key (`export GOOGLE_GENAI_API_KEY=your_key`)
- Buiry MCP server running (`packages/buiry-mcp`)

## Running

```bash
cd packages/adk-agents
pip install -r requirements.txt
adk run agents.orchestrator
```

## Architecture

SequentialAgent runs CoordinatorAgent → DevAgent → ReviewAgent in order. Each agent is a Gemini 2.0 Flash instance with role-specific instructions. MCP tools for Buiry memory are connected at runtime via stdio transport.
