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
};

export async function handleInit(
  args: { project_root?: string; project_name: string; project_description: string },
  detectProjectRoot: () => string
) {
  const root = args.project_root ?? detectProjectRoot();
  const cloud = new CloudClient(root);

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

  const success = await cloud.initProject(args.project_name, args.project_description);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({
          success,
          project_name: args.project_name,
          project_description: args.project_description,
          files_created: ["Build-Context-Memory.json"],
          message: success
            ? `Project "${args.project_name}" initialized in Buiry Cloud.`
            : "Failed to initialize project.",
        }, null, 2),
      },
    ],
  };
}
