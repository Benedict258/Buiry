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

export interface SessionProgress {
  completed: string[];
  in_progress: string[];
  blocked: string[];
}

export interface FileModuleMap {
  file: string;
  purpose: string;
  last_modified: string;
}

export interface DecisionLog {
  decision: string;
  reason: string;
  alternatives_considered: string;
}

export interface KnownIssue {
  issue: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved';
}

export interface ErrorEncountered {
  error: string;
  context: string;
  resolution: string;
}

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
