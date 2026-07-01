// Context Tools — buiry_get_context
// Searches across all session memory for relevant context.
// Local mode: keyword search. Cloud mode: semantic search via MemWal.

import { z } from "zod";
import { readMemory, searchMemory } from "../memory.js";

export const getContextArgs = {
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
};

export async function handleGetContext(
  args: { project_root?: string; query: string; limit?: number },
  detectProjectRoot: () => string
) {
  const root = args.project_root ?? detectProjectRoot();
  try {
    const memory = await readMemory(root);
    const matches = searchMemory(memory, args.query);
    const maxResults = args.limit ?? 10;
    const results = matches.slice(-maxResults);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              query: args.query,
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
