// Session Tools — buiry_start_session, buiry_end_session, buiry_log_decision, buiry_flag_issue
// These tools manage the session lifecycle: starting, ending, and mid-session logging.
// Each tool validates input and returns MCP-format responses.

import { z } from "zod";
import { readMemory, writeMemory } from "../memory.js";
import { validateSession } from "../types.js";
import type { BuildContextMemory, SessionObject } from "../types.js";

export const startSessionArgs = {
  project_root: z
    .string()
    .optional()
    .describe("Path to project root (defaults to cwd or BUIRY_PROJECT_ROOT)"),
};

export async function handleStartSession(
  args: { project_root?: string },
  detectProjectRoot: () => string
) {
  const root = args.project_root ?? detectProjectRoot();
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

export const endSessionArgs = {
  project_root: z
    .string()
    .optional()
    .describe("Path to project root (defaults to cwd or BUIRY_PROJECT_ROOT)"),
  session: z
    .record(z.string(), z.unknown())
    .describe("Session object to validate and append"),
};

export async function handleEndSession(
  args: { project_root?: string; session: Record<string, unknown> },
  detectProjectRoot: () => string
) {
  const root = args.project_root ?? detectProjectRoot();
  const validation = validateSession(args.session);
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

export const logDecisionArgs = {
  project_root: z
    .string()
    .optional()
    .describe("Path to project root (defaults to cwd or BUIRY_PROJECT_ROOT)"),
  timestamp: z.string().min(1).describe("ISO timestamp of the decision"),
  decision: z.string().min(1).describe("The decision that was made"),
  rationale: z.string().min(1).describe("Why this decision was made"),
  alternatives_considered: z
    .array(z.string())
    .optional()
    .describe("Other options that were considered"),
};

export async function handleLogDecision(
  args: {
    project_root?: string;
    timestamp: string;
    decision: string;
    rationale: string;
    alternatives_considered?: string[];
  },
  detectProjectRoot: () => string
) {
  const root = args.project_root ?? detectProjectRoot();
  try {
    const memory = await readMemory(root);
    if (memory.sessions.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: "No active session found. Start a session first with buiry_start_session.",
          },
        ],
        isError: true,
      };
    }

    const lastSession = memory.sessions[memory.sessions.length - 1];
    lastSession.decisions_log.push({
      timestamp: args.timestamp,
      decision: args.decision,
      rationale: args.rationale,
      alternatives_considered: args.alternatives_considered,
    });

    await writeMemory(root, memory);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              success: true,
              session_id: lastSession.session_id,
              decisions_logged: lastSession.decisions_log.length,
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

export const flagIssueArgs = {
  project_root: z
    .string()
    .optional()
    .describe("Path to project root (defaults to cwd or BUIRY_PROJECT_ROOT)"),
  issue: z.string().min(1).describe("Description of the issue to flag"),
};

export async function handleFlagIssue(
  args: { project_root?: string; issue: string },
  detectProjectRoot: () => string
) {
  const root = args.project_root ?? detectProjectRoot();
  try {
    const memory = await readMemory(root);
    if (memory.sessions.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: "No active session found. Start a session first with buiry_start_session.",
          },
        ],
        isError: true,
      };
    }

    const lastSession = memory.sessions[memory.sessions.length - 1];
    lastSession.known_issues.push(args.issue);

    await writeMemory(root, memory);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              success: true,
              session_id: lastSession.session_id,
              known_issues: lastSession.known_issues,
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
