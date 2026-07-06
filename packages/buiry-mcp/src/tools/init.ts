// Init Tool — buiry_init
// Cloud-first: registers project in Buiry Cloud, creates local cache.

import { z } from "zod";
import { CloudClient } from "../cloud-client.js";

export const initArgs = {
  project_root: z
    .string()
    .optional()
    .describe("Path to project root (defaults to cwd or BUIRY_PROJECT_ROOT)"),
  project_name: z.string().min(1).describe("Name of the project"),
  project_description: z.string().min(1).describe("Short description of the project"),
  api_key: z
    .string()
    .optional()
    .describe("Buiry API key (defaults to BUIRY_API_KEY env var)"),
};

export async function handleInit(
  args: { project_root?: string; project_name: string; project_description: string; api_key?: string },
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

  const result = await cloud.initProject(args.project_name, args.project_description);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({
          success: result.success,
          project_name: args.project_name,
          project_id: result.project_id,
          files_created: result.files_created || ["Build-Context-Memory.json (local)"],
          message: result.success
            ? `Project "${args.project_name}" initialized. View at https://buiry.vercel.app/projects`
            : "Failed to initialize project.",
        }, null, 2),
      },
    ],
  };
}
