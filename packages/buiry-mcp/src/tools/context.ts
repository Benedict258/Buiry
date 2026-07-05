// Context Tool — buiry_get_context
// Cloud-first: searches Buiry Cloud API first, local file as fallback.

import { z } from "zod";
import { CloudClient } from "../cloud-client.js";

export const getContextArgs = {
  project_root: z
    .string()
    .optional()
    .describe("Path to project root (defaults to cwd or BUIRY_PROJECT_ROOT)"),
  query: z.string().min(1).describe("Keyword search query"),
  limit: z
    .number()
    .min(1)
    .max(50)
    .optional()
    .describe("Max number of results to return"),
};

export async function handleGetContext(
  args: { project_root?: string; query: string; limit?: number },
  detectProjectRoot: () => string
) {
  const root = args.project_root ?? detectProjectRoot();
  const cloud = new CloudClient(root);

  if (cloud.requiresApiKey) {
    return {
      content: [{ type: "text" as const, text: JSON.stringify({ error: "API key required" }) }],
      isError: true,
    };
  }

  try {
    const result = await cloud.searchContext(args.query);
    if (args.limit && result.sessions.length > args.limit) {
      result.sessions = result.sessions.slice(0, args.limit);
    }

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
