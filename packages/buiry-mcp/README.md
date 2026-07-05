# @buiry/mcp

MCP server for Buiry — persistent build memory across AI coding sessions.

## Install

npm install -g @buiry/mcp
# or
npx @buiry/mcp

## Tools (9)

| Tool | Description |
|------|-------------|
| buiry_start_session | Load project context and last 5 sessions |
| buiry_end_session | Save completed session to memory |
| buiry_log_decision | Record an architectural decision mid-session |
| buiry_flag_issue | Flag a known issue for future sessions |
| buiry_get_context | Search across all session history |
| buiry_init | Initialize a new Buiry project |
| buiry_generate_docs | Generate PRD/Architecture/DevPlan docs |
| buiry_execute | Universal intent router — natural language → tool |
| buiry_sync | Push local sessions to Buiry cloud dashboard |

## Connect to Claude Code

Add to your `.mcp.json`:
```json
{
  "mcpServers": {
    "buiry": {
      "command": "npx",
      "args": ["-y", "@buiry/mcp"],
      "env": {
        "BUIRY_API_KEY": "<your-api-key>"
      }
    }
  }
}
```

## Connect to Cursor

Same JSON block in Cursor's MCP settings.

## License

MIT
