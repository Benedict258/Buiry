/**
 * Memory I/O Layer
 *
 * Handles reading, writing, and searching Build-Context-Memory.json.
 * This is the persistence backbone of the Buiry MCP server — all session
 * data flows through these three functions.
 *
 * Design choice: Single JSON file vs. database
 *   - Git-friendly (diffable, committable, reviewable in PRs)
 *   - Human-readable (developers can inspect it directly without tools)
 *   - Simple to reason about (no database dependency, no migration scripts)
 *   - Portable (works offline, no cloud dependency)
 *
 * Tradeoff: File-based storage doesn't scale to thousands of sessions, but
 * for a hackathon project with <100 sessions, it's the right choice.
 */

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { BuildContextMemorySchema } from "./types.js";
import type { BuildContextMemory, SessionObject } from "./types.js";

// The canonical filename for project memory — always at project root.
// Using a fixed name (not configurable) ensures all agents find the same file.
const MEMORY_FILENAME = "Build-Context-Memory.json";

/**
 * Load and validate the project's Build-Context-Memory.json from disk.
 *
 * The three-phase read pattern (read → parse → validate) provides specific
 * error messages for each failure mode, which is critical for agent debugging:
 *   - File not found → "Run buiry_init to create the memory file"
 *   - Invalid JSON → "The file was corrupted; restore from git"
 *   - Schema mismatch → Lists exact fields that are wrong
 *
 * @param projectRoot - Absolute path to the project directory
 * @returns Validated BuildContextMemory object ready for use by tool handlers
 * @throws Error with descriptive message on any failure
 */
export async function readMemory(
  projectRoot: string
): Promise<BuildContextMemory> {
  const filePath = join(projectRoot, MEMORY_FILENAME);
  let raw: string;
  try {
    raw = await readFile(filePath, "utf-8");
  } catch (err) {
    throw new Error(
      `Failed to read ${MEMORY_FILENAME} at ${filePath}: ${(err as Error).message}`
    );
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err: any) {
    console.error('[MCP] JSON parse failed:', err instanceof Error ? err.message : String(err))
    throw new Error(`${MEMORY_FILENAME} is not valid JSON`);
  }
  // Validate against the Zod schema — catches missing fields, wrong types, etc.
  // This is the "trust boundary": everything past this point is guaranteed valid.
  const result = BuildContextMemorySchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid ${MEMORY_FILENAME}: ${issues}`);
  }
  return result.data;
}

/**
 * Persist the BuildContextMemory object to disk.
 *
 * Design choice: 2-space indentation + trailing newline.
 *   - Indentation: Makes the JSON human-readable when inspecting in editors
 *   - Trailing newline: POSIX compliance, prevents noisy git diffs
 *   - No atomic write: For a hackathon, the risk of corruption is acceptable.
 *     A production system would write to a temp file then rename.
 *
 * @param projectRoot - Absolute path to the project directory
 * @param memory - The validated memory object to persist
 */
export async function writeMemory(
  projectRoot: string,
  memory: BuildContextMemory
): Promise<void> {
  const filePath = join(projectRoot, MEMORY_FILENAME);
  // 2-space indent + trailing newline: keeps git diffs clean and files POSIX-compliant
  const json = JSON.stringify(memory, null, 2) + "\n";
  await writeFile(filePath, json, "utf-8");
}

/**
 * Full-text search across all sessions in memory.
 *
 * Search strategy: Serialize-to-JSON substring match.
 *   1. Serialize each session to JSON string (catches ALL nested fields)
 *   2. Lowercase both the session blob and the query
 *   3. Check for substring inclusion
 *
 * Why this approach?
 *   - Simple: No indexing, no dependencies, works immediately
 *   - Comprehensive: Searches decisions, errors, file maps — everything
 *   - Fast enough: <100 sessions × small JSON blobs = <10ms
 *
 * Tradeoff: No fuzzy matching, no ranking, no semantic understanding.
 * A production system would use vector embeddings for semantic search,
 * but for a hackathon demo, substring match demonstrates the concept.
 *
 * @param memory - The loaded BuildContextMemory object
 * @param query - Search string (case-insensitive substring match)
 * @returns Array of matching SessionObject items (preserves original order)
 */
export function searchMemory(
  memory: BuildContextMemory,
  query: string
): SessionObject[] {
  const q = query.toLowerCase();
  return memory.sessions.filter((session) => {
    // Serialize the entire session to JSON to search all nested fields
    // This is intentionally broad — we'd rather have false positives than miss context
    const blob = JSON.stringify(session).toLowerCase();
    return blob.includes(q);
  });
}
