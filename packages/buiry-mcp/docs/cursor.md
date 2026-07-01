# Buiry MCP — Cursor Setup

## Quick Setup

1. Open Cursor Settings → MCP Servers
2. Add new server:
   - Name: buiry
   - Command: npx buiry-mcp
   - Environment: BUIRY_PROJECT_ROOT=/path/to/your/project

## What happens

Cursor's AI agent automatically discovers Buiry tools. When you start a session, the agent calls `buiry_start_session` to get context. When you end, it calls `buiry_end_session`.
