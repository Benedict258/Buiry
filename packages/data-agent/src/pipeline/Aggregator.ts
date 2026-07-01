import type { AggregateClaim, SanitizedInteraction } from '../types.js'

function hashString(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function inferClaim(interactions: SanitizedInteraction[]): string {
  const types = interactions.map((i) => i.decision_type)
  const counts = new Map<string, number>()
  for (const t of types) counts.set(t, (counts.get(t) ?? 0) + 1)

  let topType = types[0]
  let topCount = 0
  for (const [t, c] of counts) {
    if (c > topCount) {
      topType = t
      topCount = c
    }
  }
  const pct = ((topCount / types.length) * 100).toFixed(0)
  return `Dominant decision type is "${topType}" at ${pct}% of interactions`
}

export class Aggregator {
  private claims = new Map<string, AggregateClaim[]>()

  private claimKey(category: string, domain: string): string {
    return `${category}::${domain}`
  }

  merge(
    category: string,
    domain: string,
    interactions: SanitizedInteraction[],
  ): AggregateClaim[] {
    const key = this.claimKey(category, domain)
    const existing = this.claims.get(key) ?? []

    const claimText = inferClaim(interactions)
    const existingClaim = existing.find((c) => c.claim === claimText)

    if (existingClaim) {
      existingClaim.sample_size += interactions.length
      existingClaim.confidence = Math.min(
        0.99,
        existingClaim.confidence + interactions.length * 0.01,
      )
      existingClaim.last_updated = new Date().toISOString()
    } else {
      const confidence = Math.min(0.5, interactions.length * 0.05)
      existing.push({
        category,
        domain,
        claim: claimText,
        sample_size: interactions.length,
        confidence,
        last_updated: new Date().toISOString(),
      })
    }

    this.claims.set(key, existing)
    return existing
  }

  getClaims(category: string, domain: string): AggregateClaim[] {
    return this.claims.get(this.claimKey(category, domain)) ?? []
  }
}
