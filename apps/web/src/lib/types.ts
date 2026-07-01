/**
 * Frontend Type Definitions
 *
 * TypeScript interfaces for the Buiry frontend. These mirror the MCP server's
 * Zod schemas but as compile-time types (no runtime validation on the frontend).
 *
 * Design choice: The frontend has its own type definitions rather than importing
 * from the MCP package because:
 *   1. The frontend runs in the browser, the MCP server runs in Node.js
 *   2. Frontend types can have UI-specific fields (e.g., notes) not in the schema
 *   3. Decouples frontend development from backend schema changes
 *
 * These types are used by:
 *   - api.ts: Return types for data-fetching functions
 *   - Components: Props and state typing
 *   - Pages: Data transformation functions
 */

/**
 * ProjectIdentity — Static project metadata displayed in the sidebar header.
 * Populated from Build-Context-Memory.json's project_identity field.
 */
export interface ProjectIdentity {
  name: string;
  description: string;
  version: string;
  stack: string[];
  architecture_summary: string;
  repo_url: string;
  created_at: string;
  buiry_version: string;
}

/**
 * SessionProgress — Task lists for a coding session.
 * Tracks what's done, what's in progress, and what's blocked.
 * Used in the dashboard stats grid and session detail modal.
 */
export interface SessionProgress {
  completed: string[];
  in_progress: string[];
  blocked: string[];
}

/**
 * FileModuleMap — Maps a file path to its purpose in the project.
 * Used for context search ("which files handle authentication?").
 */
export interface FileModuleMap {
  file: string;
  purpose: string;
  last_modified: string;
}

/**
 * DecisionLog — An architectural or design decision with rationale.
 * The alternatives_considered field provides audit trail context.
 */
export interface DecisionLog {
  decision: string;
  reason: string;
  alternatives_considered: string;
}

/**
 * KnownIssue — An unresolved problem tracked across sessions.
 * Severity and status enable prioritization and filtering.
 */
export interface KnownIssue {
  issue: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved';
}

/**
 * ErrorEncountered — An error with context and resolution.
 * When resolution is empty, the error is still open for future agents.
 */
export interface ErrorEncountered {
  error: string;
  context: string;
  resolution: string;
}

/**
 * SessionObject — Complete data for a single coding session.
 * This is the core data unit that flows from the MCP server to the frontend.
 * Every session captures the full context needed for cross-session continuity.
 *
 * The notes field is optional and UI-specific — it's used for status inference
 * in the Session Explorer (active/completed/archived).
 */
export interface SessionObject {
  session_id: string;
  timestamp: string;
  ai_agent: string;
  current_phase: string;
  progress: SessionProgress;
  last_session_summary: string;
  changes_made: string[];
  file_module_map: FileModuleMap[];
  decisions_log: DecisionLog[];
  known_issues: KnownIssue[];
  errors_encountered: ErrorEncountered[];
  next_steps: string[];
  dataset_signals: unknown[];
  notes?: string;
}

/**
 * BuildContextMemory — Root data structure for the entire project memory.
 * This is the TypeScript equivalent of the MCP server's BuildContextMemorySchema.
 * The frontend fetches this object via getMemory() and derives all page data from it.
 *
 * The summary field provides a quick project status without reading all sessions.
 * The config field controls memory behavior (max sessions, auto-summarize, etc.).
 */
export interface BuildContextMemory {
  $schema?: string;
  project_identity: ProjectIdentity;
  config: {
    max_sessions_in_context: number;
    auto_summarize_after: number;
    dataset_capture: boolean;
    dataset_domain: string;
  };
  summary: {
    current_phase: string;
    overall_status: string;
    last_updated: string;
    total_sessions: number;
    open_issues: number;
  };
  sessions: SessionObject[];
}
