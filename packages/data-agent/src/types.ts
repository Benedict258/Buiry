export interface RawInteraction {
  input: { prompt: string; context?: string }
  output: { response: string; metadata?: Record<string, unknown> }
  timestamp: string
  user_id: string
  session_id: string
  decision_type: 'question' | 'instruction' | 'correction' | 'clarification' | 'error-recovery'
  domain_signals: string[]
}

export interface SanitizedInteraction {
  input_pattern: string
  output_pattern: string
  decision_type: string
  domain_signals: string[]
  timestamp_relative: number
  interaction_hash: string
}

export interface AggregateClaim {
  category: string
  domain: string
  claim: string
  sample_size: number
  confidence: number
  last_updated: string
}

export type DatasetCategory =
  | 'behavioral_patterns'
  | 'decision_sequences'
  | 'error_recovery_patterns'
  | 'domain_knowledge'
  | 'workflow_execution_patterns'

export interface Dataset {
  id: string
  category: DatasetCategory
  domain: string
  claims: AggregateClaim[]
  sample_size: number
  privacy_score: number
  created_at: string
  walrus_blob_id?: string
  sui_object_id?: string
}
