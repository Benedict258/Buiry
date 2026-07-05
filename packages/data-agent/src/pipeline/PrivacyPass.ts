import { createHash } from 'node:crypto'
import type { RawInteraction, SanitizedInteraction } from '../types.js'

const PII_PATTERNS: Array<{ type: string; regex: RegExp }> = [
  { type: 'email', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g },
  { type: 'phone', regex: /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/g },
  { type: 'ssn', regex: /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g },
  { type: 'credit_card', regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g },
  { type: 'ipv4', regex: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g },
  { type: 'ipv6', regex: /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g },
  { type: 'uuid', regex: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi },
  { type: 'name', regex: /\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g },
  { type: 'address', regex: /\d+\s+[A-Za-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b/gi },
  { type: 'intl_phone', regex: /\+\d{1,3}[\s-]?\d{3,4}[\s-]?\d{3,4}[\s-]?\d{3,4}\b/g },
]

function detectPII(text: string): { cleaned: string; piiCount: number; totalLength: number } {
  let cleaned = text
  let piiCount = 0

  for (const { regex } of PII_PATTERNS) {
    const matches = cleaned.match(regex)
    if (matches) {
      piiCount += matches.length
      cleaned = cleaned.replace(regex, '[REDACTED]')
    }
  }

  return { cleaned, piiCount, totalLength: text.length }
}

function hashUserId(userId: string): string {
  return createHash('sha256').update(userId).digest('hex').slice(0, 16)
}

function computeInteractionHash(interaction: SanitizedInteraction): string {
  const payload = `${interaction.input_pattern}|${interaction.output_pattern}|${interaction.decision_type}|${interaction.domain_signals.join(',')}`
  return createHash('sha256').update(payload).digest('hex').slice(0, 16)
}

export type PrivacyPassResult =
  | { status: 'OK'; interaction: SanitizedInteraction }
  | { status: 'REJECTED'; reason: string }

export function runPrivacyPass(
  raw: RawInteraction,
  sessionStartTimestamp: string,
): PrivacyPassResult {
  const inputText = raw.input.context
    ? `${raw.input.prompt}\n${raw.input.context}`
    : raw.input.prompt
  const outputText = raw.output.response

  const inputPII = detectPII(inputText)
  const outputPII = detectPII(outputText)

  const totalLength = inputPII.totalLength + outputPII.totalLength
  const totalPII = inputPII.piiCount + outputPII.piiCount

  // Layer 4: Reject if >5% of content is PII tokens
  // Heuristic: each PII token ~20 chars average
  const piiCharEstimate = totalPII * 20
  const piiRatio = totalLength > 0 ? piiCharEstimate / totalLength : 0
  if (piiRatio > 0.05) {
    return { status: 'REJECTED', reason: `PII ratio ${(piiRatio * 100).toFixed(1)}% exceeds 5% threshold` }
  }

  const hashedUserId = hashUserId(raw.user_id)
  const sessionStart = new Date(sessionStartTimestamp).getTime()
  const interactionTime = new Date(raw.timestamp).getTime()
  const timestampRelative = Math.max(0, (interactionTime - sessionStart) / 1000)

  const sanitized: SanitizedInteraction = {
    input_pattern: inputPII.cleaned,
    output_pattern: outputPII.cleaned,
    decision_type: raw.decision_type,
    domain_signals: raw.domain_signals,
    timestamp_relative: timestampRelative,
    interaction_hash: '',
  }
  sanitized.interaction_hash = computeInteractionHash(sanitized)

  return { status: 'OK', interaction: sanitized }
}
