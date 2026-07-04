import type { BuiryAPI } from "../api/client.js";
import { createProxyWrapper } from "../wrapper/LLMWrapper.js";

export interface DeepSeekClient {
  chat: {
    completions: { create: (...args: unknown[]) => Promise<unknown>; };
  };
  [key: string]: unknown;
}

export function wrapDeepSeek(client: DeepSeekClient, api: BuiryAPI, sessionId?: string): DeepSeekClient {
  return createProxyWrapper(client, api, "deepseek", sessionId);
}
