import type { SanitizedInteraction } from '../types.js'

export interface ThresholdConfig {
  minSampleSize: number
}

const DEFAULT_CONFIG: ThresholdConfig = {
  minSampleSize: 10,
}

export interface ThresholdResult {
  domain: string
  interactions: SanitizedInteraction[]
  ready: boolean
}

export class ThresholdCheck {
  private buffers = new Map<string, SanitizedInteraction[]>()
  private config: ThresholdConfig

  constructor(config?: Partial<ThresholdConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  add(domain: string, interaction: SanitizedInteraction): ThresholdResult {
    const key = domain
    const existing = this.buffers.get(key) ?? []
    existing.push(interaction)
    this.buffers.set(key, existing)

    return {
      domain,
      interactions: existing,
      ready: existing.length >= this.config.minSampleSize,
    }
  }

  flush(domain: string): SanitizedInteraction[] {
    const interactions = this.buffers.get(domain) ?? []
    this.buffers.delete(domain)
    return interactions
  }

  pending(domain: string): number {
    return this.buffers.get(domain)?.length ?? 0
  }
}
