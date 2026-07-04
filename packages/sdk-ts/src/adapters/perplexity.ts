import type { BuiryAPI } from "../api/client.js";
import { createProxyWrapper } from "../wrapper/LLMWrapper.js";

export interface PerplexityClient {
  chat: {
    completions: { create: (...args: unknown[]) => Promise<unknown>; };
  };
  [key: string]: unknown;
}

export function wrapPerplexity(client: PerplexityClient, api: BuiryAPI, sessionId?: string): PerplexityClient {
  return createProxyWrapper(client, api, "perplexity", sessionId);
}
