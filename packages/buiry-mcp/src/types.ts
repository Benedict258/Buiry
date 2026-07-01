/**
 * MCP Schema Definitions
 *
 * Zod schemas that define the shape of Build-Context-Memory.json.
 * These schemas are used by:
 *   - readMemory() to validate on-disk JSON
 *   - validateSession() to validate incoming session objects before persistence
 *   - The MCP server to define tool input shapes
 *
 * The schema enforces that:
 *   - Every session has required metadata (id, timestamp, agent, phase)
 *   - next_steps is never empty (agents must always plan ahead)
 *   - progress is bounded 0-100
 *   - decisions_log includes rationale for audit trails
 */

import { z } from "zod";

/**
 * SessionObjectSchema — The core data unit for Buiry memory.
 *
 * Represents a single coding session's complete context. Each session captures:
 *   - Identity: session_id, timestamp, ai_agent (which AI tool ran this)
 *   - Progress: percentage complete, completed/in_progress/blocked task lists
 *   - Artifacts: changes_made (file paths), file_module_map (file → purpose mapping)
 *   - Decisions: decisions_log with rationale and alternatives considered
 *   - Issues: known_issues and errors_encountered for continuity across sessions
 *   - Next Steps: always non-empty to ensure agents pick up where others left off
 *   - Dataset Signals: optional test/coverage/lint metrics for dataset harvesting
 *
 * Design choice: We use Zod (runtime validation) rather than TypeScript types alone
 * because MCP tool inputs come from external agents — we cannot trust their types
 * at compile time. Zod catches malformed data at the protocol boundary.
 */
export const SessionObjectSchema = z.object({
  // Unique identifier for this session (format: "sess_<timestamp>")
  session_id: z.string().min(1),
  // ISO 8601 timestamp — used for chronological ordering and relative time display
  timestamp: z.string().min(1),
  // Which AI agent ran this session (e.g., "Claude Code", "Cursor", "Copilot")
  // Used in the UI to show agent-specific badges and colors
  ai_agent: z.string().min(1),
  // Current development phase (e.g., "Feature Addition", "Debugging", "Optimization")
  // Drives phase-based filtering in the Session Explorer
  current_phase: z.string().min(1),
  // Percentage complete (0-100). Bounded to prevent nonsensical values from agents.
  progress: z.number().min(0).max(100),
  // Human-readable summary of what happened in this session
  last_session_summary: z.string(),
  // List of file paths that were modified — used for change tracking and diff display
  changes_made: z.array(z.string()),
  // Maps file paths to their purposes (e.g., {"src/auth.ts": ["authentication", "JWT"]})
  // This creates a searchable index of what each file does, enabling context search
  file_module_map: z.record(z.string(), z.array(z.string())),
  // Architectural/design decisions made during this session
  decisions_log: z.array(
    z.object({
      timestamp: z.string(),
      decision: z.string(),
      rationale: z.string(),
      // Alternatives are optional — not every decision requires documenting rejected options
      // When present, they help future agents understand why a particular approach was chosen
      alternatives_considered: z.array(z.string()).optional(),
    })
  ),
  // Known issues that still need attention — persisted across sessions
  // Future agents read this list to pick up unresolved work
  known_issues: z.array(z.string()),
  // Errors encountered during the session, with optional resolution steps
  // When resolution is present, it serves as a "recipe" for fixing similar errors
  errors_encountered: z.array(
    z.object({
      error: z.string(),
      // Resolution is optional — issues may be unresolved at session end
      resolution: z.string().optional(),
    })
  ),
  // next_steps must be non-empty: agents always leave actionable breadcrumbs for the next session.
  // This is the key invariant that enables session-to-session continuity.
  next_steps: z.array(z.string()).min(1, "next_steps must not be empty"),
  // dataset_signals is optional — only captured when dataset harvesting is enabled.
  // These metrics (test pass rate, coverage, lint violations) are used to generate
  // training datasets for fine-tuning coding models.
  dataset_signals: z
    .object({
      test_pass_rate: z.number().optional(),
      coverage_delta: z.number().optional(),
      lint_violations: z.number().optional(),
      type_errors: z.number().optional(),
    })
    .optional(),
});

export type SessionObject = z.infer<typeof SessionObjectSchema>;

/**
 * ProjectIdentitySchema — Static project metadata.
 *
 * Stored once at the top of Build-Context-Memory.json and rarely changes.
 * Provides agents with project-level context (name, stack, version) so they
 * can make informed decisions about code style, dependencies, and conventions.
 *
 * Design choice: Kept minimal to avoid stale data. Agents can always read
 * package.json or similar files for detailed project info.
 */
export const ProjectIdentitySchema = z.object({
  name: z.string(),
  description: z.string(),
  version: z.string().optional(),
  language: z.string().optional(),
  framework: z.string().optional(),
});

/**
 * MemoryConfigSchema — Configuration for memory behavior.
 *
 * Controls how the MCP server manages session history:
 *   - max_sessions: Caps total sessions in memory to prevent file bloat
 *   - auto_archive: When true, old sessions are summarized rather than kept verbatim
 *
 * Design choice: Both fields are optional so projects can use sensible defaults
 * without explicit configuration. This reduces setup friction.
 */
export const MemoryConfigSchema = z.object({
  max_sessions: z.number().optional(),
  auto_archive: z.boolean().optional(),
});

/**
 * BuildContextMemorySchema — Top-level schema for the memory file.
 *
 * This is the root schema that validates the entire Build-Context-Memory.json file.
 * Structure:
 *   $schema (optional) — JSON Schema URI for external validation tools
 *   project_identity — Static project metadata
 *   config (optional) — Memory management configuration
 *   summary — High-level project status (current phase, open issues)
 *   sessions — Array of SessionObject, ordered chronologically
 *
 * Design choice: The summary field is a simple string rather than a structured object.
 * This gives agents flexibility in how they describe project status, at the cost of
 * less structured querying. For a hackathon, this tradeoff favors speed of iteration.
 */
export const BuildContextMemorySchema = z.object({
  $schema: z.string().optional(),
  project_identity: ProjectIdentitySchema,
  config: MemoryConfigSchema.optional(),
  summary: z.string(),
  sessions: z.array(SessionObjectSchema),
});

export type BuildContextMemory = z.infer<typeof BuildContextMemorySchema>;

/**
 * validateSession — Validates an unknown object against SessionObjectSchema.
 *
 * Returns a discriminated union:
 *   - { valid: true, session: SessionObject } — Safe to persist
 *   - { valid: false, error: string } — Human-readable error message listing all issues
 *
 * The extra next_steps.length check provides a clearer error message than the
 * Zod min(1) constraint alone, which is important for agent-facing error reporting.
 *
 * @param session - Any unknown object (typically from an MCP tool call)
 * @returns Discriminated union for safe type narrowing
 */
export function validateSession(
  session: unknown
): { valid: true; session: SessionObject } | { valid: false; error: string } {
  const result = SessionObjectSchema.safeParse(session);
  if (!result.success) {
    // Format all validation issues into a single human-readable string
    // Agents can read this error to understand exactly what fields are missing/wrong
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    return { valid: false, error: issues };
  }
  // Double-check next_steps for a clearer error message than Zod's min(1)
  if (result.data.next_steps.length === 0) {
    return { valid: false, error: "next_steps must not be empty" };
  }
  return { valid: true, session: result.data };
}
