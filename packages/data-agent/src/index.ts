import { randomUUID } from 'node:crypto'
import type { RawInteraction, Dataset, DatasetCategory } from './types.js'
import { runPrivacyPass } from './pipeline/PrivacyPass.js'
import { ThresholdCheck } from './pipeline/ThresholdCheck.js'
import { Aggregator } from './pipeline/Aggregator.js'
import { Categorizer } from './pipeline/Categorizer.js'

export interface DataAgentConfig {
  minSampleSize?: number
  categorizer?: { provider?: 'openai' | 'anthropic'; apiKey?: string }
}

export class DataAgent {
  private threshold: ThresholdCheck
  private aggregator: Aggregator
  private categorizer: Categorizer

  constructor(config?: DataAgentConfig) {
    this.threshold = new ThresholdCheck({ minSampleSize: config?.minSampleSize ?? 10 })
    this.aggregator = new Aggregator()
    this.categorizer = new Categorizer(config?.categorizer)
  }

  /**
   * Process a batch of raw interactions through the full privacy pipeline:
   *   RawInteraction → PrivacyPass → ThresholdCheck → Aggregator → Categorizer
   *
   * Returns datasets once the threshold buffer is ready for a domain.
   */
  process(interactions: RawInteraction[]): Dataset[] {
    if (interactions.length === 0) return []

    const sessionStart = interactions[0].timestamp

    // Step 1 & 2: Privacy pass and collect sanitized interactions by domain
    const byDomain = new Map<string, RawInteraction[]>()
    for (const raw of interactions) {
      const domain = raw.domain_signals[0] ?? 'general'
      const list = byDomain.get(domain) ?? []
      list.push(raw)
      byDomain.set(domain, list)
    }

    const datasets: Dataset[] = []

    for (const [domain, raws] of byDomain) {
      for (const raw of raws) {
        // Layer 1-4: PII detection, hashing, relativization, threshold reject
        const result = runPrivacyPass(raw, sessionStart)
        if (result.status === 'REJECTED') continue

        // Buffer until minimum sample size
        const thresholdResult = this.threshold.add(domain, result.interaction)
        if (!thresholdResult.ready) continue

        // Flush buffer and classify
        const buffered = this.threshold.flush(domain)
        const grouped = this.categorizer.classifyBatch(buffered)

        // Aggregate each category into claims
        for (const [category, categoryInteractions] of grouped) {
          const claims = this.aggregator.merge(category, domain, categoryInteractions)
          const avgConfidence =
            claims.reduce((sum, c) => sum + c.confidence, 0) / (claims.length || 1)

          datasets.push({
            id: randomUUID(),
            category: category as DatasetCategory,
            domain,
            claims,
            sample_size: categoryInteractions.length,
            privacy_score: avgConfidence,
            created_at: new Date().toISOString(),
          })
        }
      }
    }

    return datasets
  }
}

export { runPrivacyPass } from './pipeline/PrivacyPass.js'
export { ThresholdCheck } from './pipeline/ThresholdCheck.js'
export { Aggregator } from './pipeline/Aggregator.js'
export { Categorizer } from './pipeline/Categorizer.js'
export type * from './types.js'
