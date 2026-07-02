# @buiry/mcp

MCP server for Buiry — persistent AI agent memory.

## What it does

Provides 7 MCP tools that give AI coding agents persistent memory across sessions:

| Tool | Description |
|------|-------------|
| `buiry_start_session` | Read session history (last 5 sessions) at session start |
| `buiry_end_session` | Save session context when ending a session |
| `buiry_log_decision` | Record architectural/design decisions mid-session |
| `buiry_flag_issue` | Flag known issues for future agents |
| `buiry_get_context` | Search across all sessions for relevant context |
| `buiry_init` | Initialize Buiry file structure for a new project |
| `buiry_generate_docs` | Auto-generate PRD, Architecture, or Dev Plan from history |

## Install

```bash
# Global install
npm install -g @buiry/mcp

# Or use directly with npx
npx @buiry/mcp
```

## Configuration

### Claude Code

Add to your MCP settings (`~/.claude/settings.json` or project `.claude/settings.json`):

```json
{
  "mcpServers": {
    "buiry": {
      "command": "npx",
      "args": ["-y", "@buiry/mcp"]
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "buiry": {
      "command": "npx",
      "args": ["-y", "@buiry/mcp"]
    }
  }
}
```

### GitHub Copilot

Add to `.github/copilot/mcp.json`:

```json
{
  "mcpServers": {
    "buiry": {
      "command": "npx",
      "args": ["-y", "@buiry/mcp"]
    }
  }
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BUIRY_PROJECT_ROOT` | Override project root directory | `process.cwd()` |

## License

MIT
