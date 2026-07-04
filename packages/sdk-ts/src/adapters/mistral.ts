import type { BuiryAPI } from "../api/client.js";
import { createProxyWrapper } from "../wrapper/LLMWrapper.js";

export interface MistralClient {
  chat: {
    complete: (...args: unknown[]) => Promise<unknown>;
    stream: (...args: unknown[]) => Promise<unknown>;
  };
  embeddings: { create: (...args: unknown[]) => Promise<unknown>; };
  [key: string]: unknown;
}

export function wrapMistral(client: MistralClient, api: BuiryAPI, sessionId?: string): MistralClient {
  return createProxyWrapper(client, api, "mistral", sessionId);
}
