import type { BuiryAPI } from "../api/client.js";
import { createProxyWrapper } from "../wrapper/LLMWrapper.js";

export interface CohereClient {
  chat: (...args: unknown[]) => Promise<unknown>;
  chatStream: (...args: unknown[]) => Promise<unknown>;
  generate: (...args: unknown[]) => Promise<unknown>;
  embed: (...args: unknown[]) => Promise<unknown>;
  [key: string]: unknown;
}

export function wrapCohere(client: CohereClient, api: BuiryAPI, sessionId?: string): CohereClient {
  return createProxyWrapper(client, api, "cohere", sessionId);
}
