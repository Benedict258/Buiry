import type { DatasetCategory, SanitizedInteraction } from '../types.js'

const DECISION_TYPE_MAP: Record<string, DatasetCategory> = {
  question: 'behavioral_patterns',
  instruction: 'workflow_execution_patterns',
  correction: 'error_recovery_patterns',
  clarification: 'decision_sequences',
  'error-recovery': 'error_recovery_patterns',
}

const DOMAIN_SIGNAL_KEYWORDS: Record<string, DatasetCategory> = {
  code: 'domain_knowledge',
  debug: 'error_recovery_patterns',
  refactor: 'workflow_execution_patterns',
  explain: 'behavioral_patterns',
  plan: 'decision_sequences',
}

function ruleBasedClassify(interaction: SanitizedInteraction): DatasetCategory {
  for (const signal of interaction.domain_signals) {
    const lower = signal.toLowerCase()
    for (const [keyword, cat] of Object.entries(DOMAIN_SIGNAL_KEYWORDS)) {
      if (lower.includes(keyword)) return cat
    }
  }

  return DECISION_TYPE_MAP[interaction.decision_type] ?? 'behavioral_patterns'
}

export interface CategorizerConfig {
  provider?: 'openai' | 'anthropic'
  apiKey?: string
}

export class Categorizer {
  private config: CategorizerConfig

  constructor(config?: CategorizerConfig) {
    this.config = config ?? {}
  }

  classify(interaction: SanitizedInteraction): DatasetCategory {
    // In production this would call the LLM API using this.config.provider/apiKey.
    // Fallback to rule-based classifier.
    return ruleBasedClassify(interaction)
  }

  classifyBatch(interactions: SanitizedInteraction[]): Map<DatasetCategory, SanitizedInteraction[]> {
    const grouped = new Map<DatasetCategory, SanitizedInteraction[]>()
    for (const interaction of interactions) {
      const cat = this.classify(interaction)
      const existing = grouped.get(cat) ?? []
      existing.push(interaction)
      grouped.set(cat, existing)
    }
    return grouped
  }
}
