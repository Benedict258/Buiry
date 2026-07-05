import type { BuiryConfig } from "./types.js";
import { BuiryConfigSchema } from "./types.js";
import { BuiryAPI } from "./api/client.js";
import { wrapAnthropic, type AnthropicClient } from "./adapters/anthropic.js";
import { wrapOpenAI, type OpenAIClient } from "./adapters/openai.js";
import { wrapGemini, type GeminiClient } from "./adapters/gemini.js";
import { wrapGroq, type GroqClient } from "./adapters/groq.js";
import { wrapMistral, type MistralClient } from "./adapters/mistral.js";
import { wrapCohere, type CohereClient } from "./adapters/cohere.js";
import { wrapXAIClient, type XAIClient } from "./adapters/xai.js";
import { wrapDeepSeek, type DeepSeekClient } from "./adapters/deepseek.js";
import { wrapTogether, type TogetherClient } from "./adapters/together.js";
import { wrapFireworks, type FireworksClient } from "./adapters/fireworks.js";
import { wrapPerplexity, type PerplexityClient } from "./adapters/perplexity.js";
import { wrapReplicate, type ReplicateClient } from "./adapters/replicate.js";
import { wrapOllama, type OllamaClient } from "./adapters/ollama.js";
import { wrapGeneric, type GenericLLMClient } from "./adapters/generic.js";
import { createProxyWrapper } from "./wrapper/LLMWrapper.js";

type KnownProvider =
  | "anthropic" | "openai" | "gemini" | "groq" | "mistral"
  | "cohere" | "xai" | "deepseek" | "together" | "fireworks"
  | "perplexity" | "replicate" | "ollama" | "generic";

// Runtime type checks — use `any` because we probe unknown objects
const PROVIDER_DETECTORS: Array<{
  detect: (client: any) => boolean;
  provider: KnownProvider;
}> = [
  { detect: (c: any) => typeof c?.chat?.completions?.create === "function" && typeof c?.models?.list === "undefined", provider: "openai" },
  { detect: (c: any) => typeof c?.messages?.create === "function" || typeof c?.messages?.stream === "function", provider: "anthropic" },
  { detect: (c: any) => typeof c?.models?.generateContent === "function" || typeof c?.getGenerativeModel === "function", provider: "gemini" },
  { detect: (c: any) => typeof c?.chat?.completions?.create === "function" && c?.constructor?.name?.includes?.("Groq"), provider: "groq" },
  { detect: (c: any) => typeof c?.chat?.complete === "function" && typeof c?.embeddings?.create === "function", provider: "mistral" },
  { detect: (c: any) => typeof c?.chat === "function" && typeof c?.embed === "function", provider: "cohere" },
  { detect: (c: any) => typeof c?.chat?.completions?.create === "function" && c?.constructor?.name?.includes?.("XAIClient"), provider: "xai" },
  { detect: (c: any) => typeof c?.chat?.completions?.create === "function" && c?.constructor?.name?.includes?.("DeepSeek"), provider: "deepseek" },
  { detect: (c: any) => typeof c?.chat?.completions?.create === "function" && typeof c?.completions?.create === "function" && typeof c?.embeddings?.create === "function", provider: "together" },
  { detect: (c: any) => typeof c?.chat?.completions?.create === "function" && typeof c?.completions?.create === "function" && c?.constructor?.name?.includes?.("Fireworks"), provider: "fireworks" },
  { detect: (c: any) => typeof c?.chat?.completions?.create === "function" && c?.constructor?.name?.includes?.("Perplexity"), provider: "perplexity" },
  { detect: (c: any) => typeof c?.run === "function" || typeof c?.predictions?.create === "function", provider: "replicate" },
  { detect: (c: any) => typeof c?.chat === "function" && typeof c?.generate === "function" && typeof c?.pull === "function", provider: "ollama" },
];

function detectProvider(client: Record<string, unknown>): KnownProvider {
  for (const { detect, provider } of PROVIDER_DETECTORS) {
    if (detect(client)) return provider;
  }
  return "generic";
}

export class Buiry {
  private config: BuiryConfig;
  private api: BuiryAPI;
  private sessionId: string;
  private memory: Map<string, string>;
  public failedCaptures = 0;

  constructor(config: BuiryConfig) {
    this.config = BuiryConfigSchema.parse(config);
    this.api = new BuiryAPI(this.config);
    this.sessionId = crypto.randomUUID();
    this.memory = new Map();
  }

  wrap<T extends Record<string, unknown>>(client: T): T {
    if (!this.config.capture) return client;
    const provider = detectProvider(client);
    return createProxyWrapper(client, this.api, provider, this.sessionId);
  }

  wrapAnthropic(client: AnthropicClient): AnthropicClient { if (!this.config.capture) return client; return wrapAnthropic(client, this.api, this.sessionId); }
  wrapOpenAI(client: OpenAIClient): OpenAIClient { if (!this.config.capture) return client; return wrapOpenAI(client, this.api, this.sessionId); }
  wrapGemini(client: GeminiClient): GeminiClient { if (!this.config.capture) return client; return wrapGemini(client, this.api, this.sessionId); }
  wrapGroq(client: GroqClient): GroqClient { if (!this.config.capture) return client; return wrapGroq(client, this.api, this.sessionId); }
  wrapMistral(client: MistralClient): MistralClient { if (!this.config.capture) return client; return wrapMistral(client, this.api, this.sessionId); }
  wrapCohere(client: CohereClient): CohereClient { if (!this.config.capture) return client; return wrapCohere(client, this.api, this.sessionId); }
  wrapXAI(client: XAIClient): XAIClient { if (!this.config.capture) return client; return wrapXAIClient(client, this.api, this.sessionId); }
  wrapDeepSeek(client: DeepSeekClient): DeepSeekClient { if (!this.config.capture) return client; return wrapDeepSeek(client, this.api, this.sessionId); }
  wrapTogether(client: TogetherClient): TogetherClient { if (!this.config.capture) return client; return wrapTogether(client, this.api, this.sessionId); }
  wrapFireworks(client: FireworksClient): FireworksClient { if (!this.config.capture) return client; return wrapFireworks(client, this.api, this.sessionId); }
  wrapPerplexity(client: PerplexityClient): PerplexityClient { if (!this.config.capture) return client; return wrapPerplexity(client, this.api, this.sessionId); }
  wrapReplicate(client: ReplicateClient): ReplicateClient { if (!this.config.capture) return client; return wrapReplicate(client, this.api, this.sessionId); }
  wrapOllama(client: OllamaClient): OllamaClient { if (!this.config.capture) return client; return wrapOllama(client, this.api, this.sessionId); }
  wrapGeneric(client: GenericLLMClient, provider: string): GenericLLMClient { if (!this.config.capture) return client; return wrapGeneric(client, this.api, provider, this.sessionId); }

  async getDatasets(): Promise<unknown> { return this.api.getDatasets(this.sessionId); }
  async getSessions(): Promise<unknown> { return this.api.getSessions(); }

  remember(key: string, value: string): void {
    this.memory.set(key, value);
    this.api.storeMemory({ key, value, sessionId: this.sessionId, timestamp: new Date().toISOString() }).catch((err) => { this.failedCaptures++; console.warn('[Buiry SDK] Memory store failed:', err?.message || err) });
  }

  recall(query: string): Promise<import("./types.js").MemoryEntry[]> { return this.api.searchMemory(query, this.sessionId); }
  getSessionId(): string { return this.sessionId; }
  async healthCheck() { return this.api.healthCheck(); }
  async startSession() { return this.api.startSession(); }
}
