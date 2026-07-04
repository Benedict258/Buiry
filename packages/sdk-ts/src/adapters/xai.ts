import type { BuiryAPI } from "../api/client.js";
import { createProxyWrapper } from "../wrapper/LLMWrapper.js";

export interface XAIClient {
  chat: {
    completions: { create: (...args: unknown[]) => Promise<unknown>; };
  };
  [key: string]: unknown;
}

export function wrapXAIClient(client: XAIClient, api: BuiryAPI, sessionId?: string): XAIClient {
  return createProxyWrapper(client, api, "xai", sessionId);
}
