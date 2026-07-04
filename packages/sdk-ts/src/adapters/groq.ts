import type { BuiryAPI } from "../api/client.js";
import { createProxyWrapper } from "../wrapper/LLMWrapper.js";

export interface GroqClient {
  chat: {
    completions: { create: (...args: unknown[]) => Promise<unknown>; };
  };
  [key: string]: unknown;
}

export function wrapGroq(client: GroqClient, api: BuiryAPI, sessionId?: string): GroqClient {
  return createProxyWrapper(client, api, "groq", sessionId);
}
