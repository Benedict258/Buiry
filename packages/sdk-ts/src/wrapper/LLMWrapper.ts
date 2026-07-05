import type { InteractionPattern, DecisionType } from "../types.js";
import type { BuiryAPI } from "../api/client.js";

const PII_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  /\b\d{3}-\d{2}-\d{4}\b/g,
  /\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g,
  /\d+\s+[A-Za-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b/gi,
  /\+\d{1,3}[\s-]?\d{3,4}[\s-]?\d{3,4}[\s-]?\d{3,4}\b/g,
];

function stripPII(text: string): string {
  let result = text;
  for (const pattern of PII_PATTERNS) {
    result = result.replace(pattern, "[REDACTED]");
  }
  return result;
}

function detectDecisionType(method: string, args: unknown[]): DecisionType {
  if (method === "chat" || method === "chatCompletions" || method === "messages") {
    const last = args[args.length - 1];
    if (typeof last === "object" && last !== null && "tools" in last) {
      return "tool_use";
    }
    return "conversation";
  }
  if (method.includes("complete") || method.includes("completion")) {
    return "generation";
  }
  return "conversation";
}

function extractDomainSignals(args: unknown[]): string[] {
  const signals: string[] = [];
  for (const arg of args) {
    if (typeof arg === "object" && arg !== null) {
      const str = JSON.stringify(arg).toLowerCase();
      if (str.includes("code") || str.includes("programming")) signals.push("code");
      if (str.includes("analysis") || str.includes("data")) signals.push("analysis");
      if (str.includes("creative") || str.includes("story")) signals.push("creative");
      if (str.includes("translate")) signals.push("translation");
    }
  }
  return signals;
}

export function createProxyWrapper<T extends Record<string, unknown>>(
  target: T,
  api: BuiryAPI,
  provider: string,
  sessionId?: string
): T {
  return new Proxy(target, {
    get(obj, prop: string) {
      const value = obj[prop];
      if (typeof value !== "function") {
        if (typeof value === "object" && value !== null) {
          return createProxyWrapper(value as Record<string, unknown>, api, provider, sessionId);
        }
        return value;
      }

      return async function (this: unknown, ...args: unknown[]) {
        const start = performance.now();

        const result = await (value as Function).apply(obj, args);

        const latencyMs = performance.now() - start;

        captureAsync(api, provider, prop, args, result, latencyMs, sessionId);

        return result;
      };
    },
  });
}

async function captureAsync(
  api: BuiryAPI,
  provider: string,
  method: string,
  args: unknown[],
  result: unknown,
  latencyMs: number,
  sessionId?: string
): Promise<void> {
  try {
    const inputStripped = args.map((a) =>
      typeof a === "string" ? stripPII(a) : a
    );

    const pattern: InteractionPattern = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      model: extractModel(args, result),
      provider,
      decisionType: detectDecisionType(method, args),
      domainSignals: extractDomainSignals(args),
      inputStructure: summarizeStructure(inputStripped),
      outputStructure: summarizeStructure(result),
      usage: extractUsage(result),
      latencyMs: Math.round(latencyMs),
      sessionId,
    };

    await api.captureInteraction(pattern);
  } catch (err: any) {
    console.warn('[Buiry SDK] Interaction capture failed:', err?.message || err)
  }
}

function extractModel(args: unknown[], result: unknown): string {
  for (const arg of args) {
    if (typeof arg === "object" && arg !== null && "model" in arg) {
      return String((arg as Record<string, unknown>).model);
    }
  }
  if (typeof result === "object" && result !== null && "model" in result) {
    return String((result as Record<string, unknown>).model);
  }
  return "unknown";
}

function extractUsage(result: unknown): { promptTokens?: number; completionTokens?: number; totalTokens?: number } | undefined {
  if (typeof result === "object" && result !== null && "usage" in result) {
    const u = (result as Record<string, unknown>).usage as Record<string, unknown>;
    return {
      promptTokens: typeof u.prompt_tokens === "number" ? u.prompt_tokens : undefined,
      completionTokens: typeof u.completion_tokens === "number" ? u.completion_tokens : undefined,
      totalTokens: typeof u.total_tokens === "number" ? u.total_tokens : undefined,
    };
  }
  return undefined;
}

function summarizeStructure(value: unknown): Record<string, unknown> {
  if (value === null || value === undefined) return { type: "null" };
  if (Array.isArray(value)) return { type: "array", length: value.length };
  if (typeof value === "object") {
    const keys = Object.keys(value as Record<string, unknown>);
    return { type: "object", keys: keys.slice(0, 20) };
  }
  return { type: typeof value };
}
