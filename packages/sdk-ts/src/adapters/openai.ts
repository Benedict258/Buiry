import type { BuiryAPI } from "../api/client.js";
import { createProxyWrapper } from "../wrapper/LLMWrapper.js";

export interface OpenAIClient {
  chat: {
    completions: {
      create: (...args: unknown[]) => Promise<unknown>;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export function wrapOpenAI(
  client: OpenAIClient,
  api: BuiryAPI,
  sessionId?: string
): OpenAIClient {
  return createProxyWrapper(client, api, "openai", sessionId);
}
