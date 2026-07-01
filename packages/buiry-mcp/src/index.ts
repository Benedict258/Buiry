import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readMemory, writeMemory, searchMemory } from "./memory.js";
import { validateSession } from "./types.js";

function detectProjectRoot(): string {
  const envRoot = process.env.BUIRY_PROJECT_ROOT;
  if (envRoot) return envRoot;
  return process.cwd();
}

const server = new McpServer({
  name: "buiry-mcp",
  version: "0.1.0",
});

server.tool(
  "buiry_start_session",
  "Read Build-Context-Memory.json and return the last 5 sessions with project identity, summary, next_steps, and open_issues.",
  {
    project_root: z
      .string()
      .optional()
      .describe("Path to project root (defaults to cwd or BUIRY_PROJECT_ROOT)"),
  },
  async ({ project_root }) => {
    const root = project_root ?? detectProjectRoot();
    try {
      const memory = await readMemory(root);
      const last5 = memory.sessions.slice(-5);
      const openIssues = memory.sessions
        .flatMap((s) => s.known_issues)
        .filter((issue, i, arr) => arr.indexOf(issue) === i);

      const response = {
        project_identity: memory.project_identity,
        summary: memory.summary,
        last_5_sessions: last5.map((s) => ({
          session_id: s.session_id,
          timestamp: s.timestamp,
          ai_agent: s.ai_agent,
          current_phase: s.current_phase,
          progress: s.progress,
          last_session_summary: s.last_session_summary,
          next_steps: s.next_steps,
        })),
        open_issues: openIssues,
      };

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    } catch (err) {
      return {
        content: [{ type: "text" as const, text: `Error: ${(err as Error).message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "buiry_end_session",
  "Validate and append a session object to Build-Context-Memory.json.",
  {
    project_root: z
      .string()
      .optional()
      .describe("Path to project root (defaults to cwd or BUIRY_PROJECT_ROOT)"),
    session: z
      .record(z.string(), z.unknown())
      .describe("Session object to validate and append"),
  },
  async ({ project_root, session }) => {
    const root = project_root ?? detectProjectRoot();
    const validation = validateSession(session);
    if (!validation.valid) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Validation failed: ${validation.error}`,
          },
        ],
        isError: true,
      };
    }

    try {
      const memory = await readMemory(root);
      memory.sessions.push(validation.session);
      const maxSessions = memory.config?.max_sessions;
      if (maxSessions && memory.sessions.length > maxSessions) {
        memory.sessions = memory.sessions.slice(-maxSessions);
      }
      await writeMemory(root, memory);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                session_id: validation.session.session_id,
                total_sessions: memory.sessions.length,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text" as const, text: `Error: ${(err as Error).message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "buiry_get_context",
  "Search across all sessions for a query string and return matching sessions with context.",
  {
    project_root: z
      .string()
      .optional()
      .describe("Path to project root (defaults to cwd or BUIRY_PROJECT_ROOT)"),
    query: z.string().min(1).describe("Keyword search query"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe("Max number of results to return"),
  },
  async ({ project_root, query, limit }) => {
    const root = project_root ?? detectProjectRoot();
    try {
      const memory = await readMemory(root);
      const matches = searchMemory(memory, query);
      const maxResults = limit ?? 10;
      const results = matches.slice(-maxResults);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                query,
                match_count: matches.length,
                returned_count: results.length,
                sessions: results,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text" as const, text: `Error: ${(err as Error).message}` }],
        isError: true,
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("buiry-mcp server running on stdio");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
