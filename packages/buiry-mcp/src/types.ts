import { z } from "zod";

export const SessionObjectSchema = z.object({
  session_id: z.string().min(1),
  timestamp: z.string().min(1),
  ai_agent: z.string().min(1),
  current_phase: z.string().min(1),
  progress: z.number().min(0).max(100),
  last_session_summary: z.string(),
  changes_made: z.array(z.string()),
  file_module_map: z.record(z.string(), z.array(z.string())),
  decisions_log: z.array(
    z.object({
      timestamp: z.string(),
      decision: z.string(),
      rationale: z.string(),
      alternatives_considered: z.array(z.string()).optional(),
    })
  ),
  known_issues: z.array(z.string()),
  errors_encountered: z.array(
    z.object({
      error: z.string(),
      resolution: z.string().optional(),
    })
  ),
  next_steps: z.array(z.string()).min(1, "next_steps must not be empty"),
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

export const ProjectIdentitySchema = z.object({
  name: z.string(),
  description: z.string(),
  version: z.string().optional(),
  language: z.string().optional(),
  framework: z.string().optional(),
});

export const MemoryConfigSchema = z.object({
  max_sessions: z.number().optional(),
  auto_archive: z.boolean().optional(),
});

export const BuildContextMemorySchema = z.object({
  $schema: z.string().optional(),
  project_identity: ProjectIdentitySchema,
  config: MemoryConfigSchema.optional(),
  summary: z.string(),
  sessions: z.array(SessionObjectSchema),
});

export type BuildContextMemory = z.infer<typeof BuildContextMemorySchema>;

export function validateSession(
  session: unknown
): { valid: true; session: SessionObject } | { valid: false; error: string } {
  const result = SessionObjectSchema.safeParse(session);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    return { valid: false, error: issues };
  }
  if (result.data.next_steps.length === 0) {
    return { valid: false, error: "next_steps must not be empty" };
  }
  return { valid: true, session: result.data };
}
