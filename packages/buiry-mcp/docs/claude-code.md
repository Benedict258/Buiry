# Buiry MCP — Claude Code Setup

## Quick Setup

Add this to your `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "buiry": {
      "command": "npx",
      "args": ["buiry-mcp"],
      "env": {
        "BUIRY_PROJECT_ROOT": "/path/to/your/project"
      }
    }
  }
}
```

## What happens

When you start a Claude Code session:
1. Claude calls `buiry_start_session` to get project context
2. You work normally — Claude logs decisions and issues
3. When done, Claude calls `buiry_end_session` to persist memory

## Tools available

- `buiry_start_session` — Get context from last session
- `buiry_end_session` — Save session to memory
- `buiry_log_decision` — Log a decision mid-session
- `buiry_flag_issue` — Flag an issue mid-session
- `buiry_get_context` — Search past sessions
- `buiry_init` — Initialize a new Buiry project
- `buiry_generate_docs` — Generate documents from session history
