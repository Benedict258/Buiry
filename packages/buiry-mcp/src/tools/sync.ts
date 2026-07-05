/**
 * buiry_sync — Push local session memory to the Buiry dashboard.
 *
 * This is the bridge between offline MCP usage and the cloud dashboard.
 * Users run `buiry_sync` after a session to see their work at buiry.vercel.app.
 */
import { z } from "zod";
import { syncToDashboard } from "../api-client.js";

export const syncArgs = {
  dashboard_url: z
    .string()
    .optional()
    .describe("Buiry dashboard API URL (default: https://buiry.up.railway.app)"),
  api_key: z
    .string()
    .optional()
    .describe("Buiry API key (default: BUIRY_API_KEY env var)"),
  project_root: z
    .string()
    .optional()
    .describe("Project root directory (default: BUIRY_PROJECT_ROOT or cwd)"),
};

export async function handleSync(
  args: {
    dashboard_url?: string | undefined;
    api_key?: string | undefined;
    project_root?: string | undefined;
  },
  detectProjectRoot: () => string
) {
  const projectRoot = args.project_root || detectProjectRoot();
  const dashboardUrl = args.dashboard_url || process.env.BUIRY_DASHBOARD_URL || "https://buiry.up.railway.app";
  const apiKey = args.api_key || process.env.BUIRY_API_KEY || "";

  if (!apiKey) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              error: "No API key provided. Set BUIRY_API_KEY env var or pass api_key parameter.",
              help: "Get your API key from https://buiry.vercel.app/settings",
            },
            null,
            2
          ),
        },
      ],
    };
  }

  const result = await syncToDashboard(projectRoot, dashboardUrl, apiKey);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            message:
              result.synced > 0
                ? `Synced ${result.synced} sessions to ${dashboardUrl}`
                : "No sessions to sync",
            ...result,
            view_url: "https://buiry.vercel.app/sessions",
          },
          null,
          2
        ),
      },
    ],
  };
}
