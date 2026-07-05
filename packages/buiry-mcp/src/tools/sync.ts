/**
 * buiry_sync — Push local session memory to the Buiry Cloud.
 *
 * Cloud-first sync tool. When users have been working offline,
 * this pushes all local sessions to the cloud in one batch.
 */
import { z } from "zod";
import { CloudClient } from "../cloud-client.js";

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
  const root = args.project_root || detectProjectRoot();
  const cloud = new CloudClient(root);

  if (cloud.requiresApiKey && !args.api_key) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            error: "No API key provided.",
            help: "Set BUIRY_API_KEY env var or pass api_key parameter. Get your key at https://buiry.vercel.app/settings",
          }, null, 2),
        },
      ],
    };
  }

  const result = await cloud.syncAll();

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({
          message: result.synced > 0
            ? `Synced ${result.synced} sessions to cloud`
            : "No sessions to sync",
          ...result,
          view_url: "https://buiry.vercel.app/sessions",
        }, null, 2),
      },
    ],
  };
}
