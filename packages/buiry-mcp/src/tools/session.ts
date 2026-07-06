// Session Tools — buiry_start_session, buiry_end_session, buiry_log_decision, buiry_flag_issue
// Cloud-first architecture: All operations go to Buiry Cloud API first, local file as fallback.

import { z } from "zod";
import { validateSession } from "../types.js";
import { CloudClient } from "../cloud-client.js";

export const startSessionArgs = {
  project_root: z.string().optional().describe("Path to project root (defaults to cwd or BUIRY_PROJECT_ROOT)"),
  api_key: z.string().optional().describe("Buiry API key (defaults to BUIRY_API_KEY env var)"),
};

export async function handleStartSession(
  args: { project_root?: string; api_key?: string },
  detectProjectRoot: () => string
) {
  const root = args.project_root ?? detectProjectRoot();
  const cloud = new CloudClient(root, args.api_key);

  if (cloud.requiresApiKey) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            error: "API key required for cloud-first mode.",
            help: "Get your key at https://buiry.vercel.app/settings and set BUIRY_API_KEY in your environment.",
            local_fallback: "Set BUIRY_API_KEY=local to use file-only mode (no cloud sync).",
          }, null, 2),
        },
      ],
      isError: true,
    };
  }

  try {
    const result = await cloud.startSession();
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    return {
      content: [{ type: "text" as const, text: `Error: ${(err as Error).message}` }],
      isError: true,
    };
  }
}

export const endSessionArgs = {
  project_root: z.string().optional().describe("Path to project root (defaults to cwd or BUIRY_PROJECT_ROOT)"),
  session: z.record(z.string(), z.unknown()).describe("Session object to validate and append"),
  api_key: z.string().optional().describe("Buiry API key (defaults to BUIRY_API_KEY env var)"),
};

export async function handleEndSession(
  args: { project_root?: string; session: Record<string, unknown>; api_key?: string },
  detectProjectRoot: () => string
) {
  const root = args.project_root ?? detectProjectRoot();
  const cloud = new CloudClient(root, args.api_key);

  if (cloud.requiresApiKey) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            error: "API key required. Get one at https://buiry.vercel.app/settings",
          }, null, 2),
        },
      ],
      isError: true,
    };
  }

  const validation = validateSession(args.session);
  if (!validation.valid) {
    return {
      content: [
        { type: "text" as const, text: `Validation failed: ${validation.error}` },
      ],
      isError: true,
    };
  }

  try {
    const result = await cloud.endSession(validation.session);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            success: result.success,
            session_id: result.session_id,
            stored_in: result.source,
          }, null, 2),
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
  project_root: z.string().optional().describe("Path to project root (defaults to cwd or BUIRY_PROJECT_ROOT)"),
  timestamp: z.string().min(1).describe("ISO timestamp of the decision"),
  decision: z.string().min(1).describe("The decision that was made"),
  rationale: z.string().min(1).describe("Why this decision was made"),
  alternatives_considered: z.array(z.string()).optional().describe("Other options that were considered"),
  api_key: z.string().optional().describe("Buiry API key (defaults to BUIRY_API_KEY env var)"),
};

export async function handleLogDecision(
  args: {
    project_root?: string;
    timestamp: string;
    decision: string;
    rationale: string;
    alternatives_considered?: string[];
    api_key?: string;
  },
  detectProjectRoot: () => string
) {
  const root = args.project_root ?? detectProjectRoot();
  const cloud = new CloudClient(root, args.api_key);

  if (cloud.requiresApiKey) {
    return {
      content: [{ type: "text" as const, text: JSON.stringify({ error: "API key required" }) }],
      isError: true,
    };
  }

  try {
    // Get active session ID from a quick start call
    const sessionInfo = await cloud.startSession();
    const lastSession = sessionInfo.last_5_sessions?.[0] as Record<string, unknown> | undefined;
    const sessionId = (lastSession?.session_id as string) || "unknown";

    await cloud.logDecision(sessionId, args.timestamp, args.decision, args.rationale, args.alternatives_considered);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ success: true, session_id: sessionId, decision: args.decision }, null, 2),
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
  project_root: z.string().optional().describe("Path to project root (defaults to cwd or BUIRY_PROJECT_ROOT)"),
  issue: z.string().min(1).describe("Description of the issue to flag"),
  api_key: z.string().optional().describe("Buiry API key (defaults to BUIRY_API_KEY env var)"),
};

export async function handleFlagIssue(
  args: { project_root?: string; issue: string; api_key?: string },
  detectProjectRoot: () => string
) {
  const root = args.project_root ?? detectProjectRoot();
  const cloud = new CloudClient(root, args.api_key);

  if (cloud.requiresApiKey) {
    return {
      content: [{ type: "text" as const, text: JSON.stringify({ error: "API key required" }) }],
      isError: true,
    };
  }

  try {
    const sessionInfo = await cloud.startSession();
    const lastSession = sessionInfo.last_5_sessions?.[0] as Record<string, unknown> | undefined;
    const sessionId = (lastSession?.session_id as string) || "unknown";

    await cloud.flagIssue(sessionId, args.issue);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ success: true, session_id: sessionId, issue: args.issue }, null, 2),
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
