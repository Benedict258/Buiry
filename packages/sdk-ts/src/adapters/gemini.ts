import type { BuiryAPI } from "../api/client.js";
import { createProxyWrapper } from "../wrapper/LLMWrapper.js";

export interface GeminiClient {
  models: {
    generateContent: (...args: unknown[]) => Promise<unknown>;
    streamGenerateContent: (...args: unknown[]) => Promise<unknown>;
  };
  [key: string]: unknown;
}

export function wrapGemini(client: GeminiClient, api: BuiryAPI, sessionId?: string): GeminiClient {
  return createProxyWrapper(client, api, "gemini", sessionId);
}
