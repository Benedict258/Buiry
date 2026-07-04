import type { BuiryAPI } from "../api/client.js";
import { createProxyWrapper } from "../wrapper/LLMWrapper.js";

export interface TogetherClient {
  chat: {
    completions: { create: (...args: unknown[]) => Promise<unknown>; };
  };
  completions: { create: (...args: unknown[]) => Promise<unknown>; };
  embeddings: { create: (...args: unknown[]) => Promise<unknown>; };
  [key: string]: unknown;
}

export function wrapTogether(client: TogetherClient, api: BuiryAPI, sessionId?: string): TogetherClient {
  return createProxyWrapper(client, api, "together", sessionId);
}
