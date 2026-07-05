import { randomUUID } from 'node:crypto'
import type { RawInteraction, Dataset, DatasetCategory, SanitizedInteraction } from './types.js'
import { runPrivacyPass } from './pipeline/PrivacyPass.js'
import { ThresholdCheck } from './pipeline/ThresholdCheck.js'
import { Aggregator } from './pipeline/Aggregator.js'
import { Categorizer } from './pipeline/Categorizer.js'

export interface DataAgentConfig {
  minSampleSize?: number
  categorizer?: { provider?: 'openai' | 'anthropic'; apiKey?: string }
  adkUrl?: string
}

export class DataAgent {
  private threshold: ThresholdCheck
  private aggregator: Aggregator
  private categorizer: Categorizer
  private adkUrl: string

  constructor(config?: DataAgentConfig) {
    this.threshold = new ThresholdCheck({ minSampleSize: config?.minSampleSize ?? 10 })
    this.aggregator = new Aggregator()
    this.categorizer = new Categorizer(config?.categorizer)
    this.adkUrl = config?.adkUrl ?? process.env.ADK_SERVICE_URL ?? 'http://localhost:8765'
  }

  /**
   * Process a batch of raw interactions through the full privacy pipeline:
   *   RawInteraction → PrivacyPass → ThresholdCheck → Aggregator → Categorizer
   *
   * Returns datasets once the threshold buffer is ready for a domain.
   */
  async process(interactions: RawInteraction[]): Promise<Dataset[]> {
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

        // ADK Bridge: second-pass Gemini PII check
        const adkPiiResult = await this.adkCheckPii(raw.input.prompt + ' ' + raw.output.response)
        if (adkPiiResult.pii_found) {
          console.warn('[DataAgent] ADK found PII missed by regex, rejecting interaction:', adkPiiResult.findings)
          continue
        }

        // Buffer until minimum sample size
        const thresholdResult = this.threshold.add(domain, result.interaction)
        if (!thresholdResult.ready) continue

        // Flush buffer and classify
        const buffered = this.threshold.flush(domain)

        // Try ADK classification first, fall back to keyword
        let grouped: Map<string, SanitizedInteraction[]>
        try {
          grouped = await this.adkClassify(buffered)
        } catch {
          grouped = this.categorizer.classifyBatch(buffered)
        }

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

          // ADK quality audit
          const audit = await this.adkQualityAudit(datasets[datasets.length - 1])
          if (audit.score < 60) {
            console.warn(`[DataAgent] Dataset ${datasets[datasets.length - 1].id} rejected by quality audit: ${audit.score}/100`)
            datasets.pop()
          }
        }
      }
    }

    return datasets
  }

  private async adkCheckPii(text: string): Promise<{ pii_found: boolean; findings: any[] }> {
    try {
      const res = await fetch(`${this.adkUrl}/pii-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(10000),
      })
      if (!res.ok) return { pii_found: false, findings: [] }
      return await res.json()
    } catch (err) {
      console.warn('[DataAgent] ADK PII check unavailable, using regex only:', (err as Error).message)
      return { pii_found: false, findings: [] }
    }
  }

  private async adkClassify(interactions: SanitizedInteraction[]): Promise<Map<string, SanitizedInteraction[]>> {
    const res = await fetch(`${this.adkUrl}/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interactions }),
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) throw new Error('ADK classify failed')
    const data = await res.json()
    const map = new Map<string, SanitizedInteraction[]>()
    for (const [category, ids] of Object.entries(data.categories || {})) {
      map.set(category, interactions.filter((_, i) => (ids as number[]).includes(i)))
    }
    return map
  }

  private async adkQualityAudit(dataset: any): Promise<{ score: number; verdict: string }> {
    try {
      const res = await fetch(`${this.adkUrl}/quality-audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataset }),
        signal: AbortSignal.timeout(10000),
      })
      if (!res.ok) return { score: 100, verdict: 'APPROVE' }
      return await res.json()
    } catch {
      return { score: 100, verdict: 'APPROVE' }
    }
  }
}

export { runPrivacyPass } from './pipeline/PrivacyPass.js'
export { ThresholdCheck } from './pipeline/ThresholdCheck.js'
export { Aggregator } from './pipeline/Aggregator.js'
export { Categorizer } from './pipeline/Categorizer.js'
export type * from './types.js'
