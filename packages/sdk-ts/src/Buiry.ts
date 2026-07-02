import type { BuiryConfig } from "./types.js";
import { BuiryConfigSchema } from "./types.js";
import { BuiryAPI } from "./api/client.js";
import { wrapAnthropic, type AnthropicClient } from "./adapters/anthropic.js";
import { wrapOpenAI, type OpenAIClient } from "./adapters/openai.js";
import { wrapGeneric, type GenericLLMClient } from "./adapters/generic.js";
import { createProxyWrapper } from "./wrapper/LLMWrapper.js";

export class Buiry {
  private config: BuiryConfig;
  private api: BuiryAPI;
  private sessionId: string;
  private memory: Map<string, string>;

  constructor(config: BuiryConfig) {
    this.config = BuiryConfigSchema.parse(config);
    this.api = new BuiryAPI(this.config);
    this.sessionId = crypto.randomUUID();
    this.memory = new Map();
  }

  wrap<T extends Record<string, unknown>>(client: T): T {
    if (!this.config.capture) return client;
    return createProxyWrapper(client, this.api, "unknown", this.sessionId);
  }

  wrapAnthropic(client: AnthropicClient): AnthropicClient {
    if (!this.config.capture) return client;
    return wrapAnthropic(client, this.api, this.sessionId);
  }

  wrapOpenAI(client: OpenAIClient): OpenAIClient {
    if (!this.config.capture) return client;
    return wrapOpenAI(client, this.api, this.sessionId);
  }

  wrapGeneric(client: GenericLLMClient, provider: string): GenericLLMClient {
    if (!this.config.capture) return client;
    return wrapGeneric(client, this.api, provider, this.sessionId);
  }

  remember(key: string, value: string): void {
    this.memory.set(key, value);
    this.api.storeMemory({
      key,
      value,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    }).catch(() => {});
  }

  recall(query: string): Promise<import("./types.js").MemoryEntry[]> {
    return this.api.searchMemory(query, this.sessionId);
  }

  getSessionId(): string {
    return this.sessionId;
  }

  async healthCheck() {
    return this.api.healthCheck();
  }

  async startSession() {
    return this.api.startSession();
  }
}
