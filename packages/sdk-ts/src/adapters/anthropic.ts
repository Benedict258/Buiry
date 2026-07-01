import type { BuiryAPI } from "../api/client.js";
import { createProxyWrapper } from "../wrapper/LLMWrapper.js";

export interface AnthropicClient {
  messages: {
    create: (...args: unknown[]) => Promise<unknown>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export function wrapAnthropic(
  client: AnthropicClient,
  api: BuiryAPI,
  sessionId?: string
): AnthropicClient {
  return createProxyWrapper(client, api, "anthropic", sessionId);
}
