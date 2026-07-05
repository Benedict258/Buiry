#!/usr/bin/env node
/**
 * MCP Server Entry Point
 *
 * This file bootstraps the Buiry MCP (Model Context Protocol) server, which
 * acts as the persistent memory layer for AI coding agents. The server exposes
 * 9 tools that agents use to read/write project context across sessions.
 *
 * Architecture decision: We use stdio transport rather than HTTP because
 * MCP servers are typically spawned as child processes by AI agent hosts
 * (e.g., Claude Code, Cursor). Stdio avoids port conflicts and firewall issues.
 *
 * Dashboard sync: When BUIRY_DASHBOARD_URL and BUIRY_API_KEY are set,
 * sessions are automatically pushed to the Buiry dashboard API, enabling
 * visual session browsing at https://buiry.vercel.app.
 *
 * Tool registration pattern: Each tool is defined with a Zod schema (for input
 * validation) and an async handler. The server validates inputs against the schema
 * before invoking the handler, ensuring type safety at the protocol boundary.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  startSessionArgs,
  handleStartSession,
  endSessionArgs,
  handleEndSession,
  logDecisionArgs,
  handleLogDecision,
  flagIssueArgs,
  handleFlagIssue,
} from "./tools/session.js";
import {
  getContextArgs,
  handleGetContext,
} from "./tools/context.js";
import { initArgs, handleInit } from "./tools/init.js";
import {
  generateDocsArgs,
  handleGenerateDocs,
} from "./tools/docs.js";
import { executeArgs, handleExecute } from "./tools/execute.js";
import { syncArgs, handleSync } from "./tools/sync.js";

/**
 * Detect the project root directory for memory file resolution.
 *
 * Priority: BUIRY_PROJECT_ROOT env var > process.cwd().
 * The env var allows agents to explicitly set the project root when spawning
 * the MCP server, which is critical in monorepo or nested directory scenarios.
 */
function detectProjectRoot(): string {
  const envRoot = process.env.BUIRY_PROJECT_ROOT;
  if (envRoot) return envRoot;
  return process.cwd();
}

// Instantiate the MCP server with a name and version for protocol handshake.
// The name appears in MCP client UIs and logs for debugging.
const server = new McpServer({
  name: "buiry-mcp",
  version: "0.1.0",
});

/**
 * Tool 1: buiry_start_session
 *
 * Called at the beginning of every coding session. Returns the last 5 sessions
 * from Build-Context-Memory.json so the agent can understand:
 *   - What was done previously (avoid repeating work)
 *   - What's next (next_steps from the most recent session)
 *   - What's broken (open issues that need attention)
 *
 * Design choice: Return only 5 sessions to balance context richness vs. token
 * budget. Agents have limited context windows, so we prioritize recency.
 */
server.tool(
  "buiry_start_session",
  "Read Build-Context-Memory.json and return the last 5 sessions with project identity, summary, next_steps, and open_issues.",
  startSessionArgs,
  async (args) => handleStartSession(args, detectProjectRoot)
);

/**
 * Tool 2: buiry_end_session
 *
 * Called at the end of every coding session. Validates the session object against
 * the Zod schema (ensuring required fields like next_steps are present) before
 * appending it to Build-Context-Memory.json.
 *
 * Design choice: Validation happens here (not in the agent) to guarantee memory
 * integrity even if an agent produces malformed data. The next_steps constraint
 * ensures agents always leave actionable breadcrumbs for the next session.
 */
server.tool(
  "buiry_end_session",
  "Validate and append a session object to Build-Context-Memory.json.",
  endSessionArgs,
  async (args) => handleEndSession(args, detectProjectRoot)
);

/**
 * Tool 3: buiry_log_decision
 *
 * Records architectural/design decisions mid-session without ending the session.
 * This is critical for capturing the "why" behind code changes — something that
 * git commits alone don't provide.
 *
 * Design choice: Separate from buiry_end_session because decisions happen
 * throughout a session, not just at the end. Each decision includes rationale
 * and alternatives considered, creating an audit trail for future agents.
 */
server.tool(
  "buiry_log_decision",
  "Log an architectural or design decision to the active session's decisions_log.",
  logDecisionArgs,
  async (args) => handleLogDecision(args, detectProjectRoot)
);

/**
 * Tool 4: buiry_flag_issue
 *
 * Appends a known issue to the active session's known_issues list. This allows
 * agents to flag problems they discover without halting their work.
 *
 * Design choice: Issues are separate from decisions because they represent
 * problems, not choices. They persist across sessions so future agents can
 * pick them up, creating a continuous issue-tracking loop within memory.
 */
server.tool(
  "buiry_flag_issue",
  "Flag an issue to the active session's known_issues list.",
  flagIssueArgs,
  async (args) => handleFlagIssue(args, detectProjectRoot)
);

/**
 * Tool 5: buiry_get_context
 *
 * Searches across all session memory for a query string. This is the agent's
 * primary tool for retrieving historical context — e.g., "What decisions were
 * made about authentication?" or "Have we seen this error before?"
 *
 * Design choice: Local mode uses substring search (simple, no dependencies).
 * Cloud mode could upgrade to semantic/vector search via MemWal for better
 * recall. The tool interface stays the same regardless of backend.
 */
server.tool(
  "buiry_get_context",
  "Search across all sessions for a query string and return matching sessions with context.",
  getContextArgs,
  async (args) => handleGetContext(args, detectProjectRoot)
);

/**
 * Tool 6: buiry_init
 *
 * Generates the complete Buiry file structure for a new project:
 *   - Build-Context-Memory.json (session memory)
 *   - AI_Starter.md (agent onboarding guide)
 *   - PRD.md, ARCHITECTURE.md, DEV_PLAN.md (project templates)
 *
 * Design choice: One tool call sets up everything, reducing friction for
 * first-time users. The templates are pre-populated with sensible defaults
 * that agents can refine over time.
 */
server.tool(
  "buiry_init",
  "Initialize the Buiry file structure for a new project.",
  initArgs,
  async (args) => handleInit(args, detectProjectRoot)
);

/**
 * Tool 7: buiry_generate_docs
 *
 * Synthesizes project documents (PRD, Architecture, Dev Plan) from accumulated
 * session history. Rather than requiring manual document authoring, this tool
 * extracts decisions, patterns, and progress from memory to auto-generate docs.
 *
 * Design choice: Documents are generated on-demand rather than auto-updated,
 * giving agents control over when documentation is refreshed. This prevents
 * unnecessary file churn during rapid development cycles.
 */
server.tool(
  "buiry_generate_docs",
  "Generate a PRD, Architecture, or Dev Plan document from session history.",
  generateDocsArgs,
  async (args) => handleGenerateDocs(args, detectProjectRoot)
);

/**
 * Tool 8: buiry_execute
 *
 * Single-entry intent router. Takes raw user text, classifies the intent
 * (start_session, log_decision, flag_issue, etc.), extracts parameters,
 * and routes to the appropriate handler automatically.
 *
 * This is the "universal interface" — any agent on any platform can send
 * raw user messages without needing to know which specific Buiry tool to call.
 * The intent engine handles classification and dispatching internally.
 *
 * Design choice: Intent classification uses keyword pattern matching for
 * speed and offline capability (no LLM dependency). The ADK-based intent
 * router (agents/intent_router.py) provides a more sophisticated LLM-powered
 * alternative for advanced deployments.
 */
server.tool(
  "buiry_execute",
  "Universal intent router — send raw user text and Buiry automatically classifies intent, extracts params, and calls the right tool (start_session, log_decision, flag_issue, get_context, generate_docs, or init).",
  executeArgs,
  async (args) => handleExecute(args, detectProjectRoot)
);

/**
 * Tool 9: buiry_sync
 *
 * Pushes all local session data from Build-Context-Memory.json to the Buiry
 * dashboard API. This is the bridge between offline MCP usage and the cloud
 * dashboard at https://buiry.vercel.app.
 *
 * When BUIRY_DASHBOARD_URL and BUIRY_API_KEY env vars are set, sessions are
 * also auto-synced at end_session time, making sync transparent.
 */
server.tool(
  "buiry_sync",
  "Sync all local sessions to the Buiry dashboard. Requires BUIRY_API_KEY.",
  syncArgs,
  async (args) => handleSync(args, detectProjectRoot)
);

/**
 * Bootstrap the server with stdio transport.
 *
 * We use console.error (not console.log) because stdout is reserved for
 * the MCP protocol's JSON-RPC messages. Logging to stderr keeps the
 * protocol channel clean while still providing visibility in agent logs.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("buiry-mcp server running on stdio");
}

// Fatal errors crash the process with exit code 1 so the parent agent host
// can detect the failure and retry or alert the user.
main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
