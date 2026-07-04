import type { BuiryAPI } from "../api/client.js";
import { createProxyWrapper } from "../wrapper/LLMWrapper.js";

export interface OllamaClient {
  chat: (...args: unknown[]) => Promise<unknown>;
  generate: (...args: unknown[]) => Promise<unknown>;
  embeddings: (...args: unknown[]) => Promise<unknown>;
  pull: (...args: unknown[]) => Promise<unknown>;
  list: (...args: unknown[]) => Promise<unknown>;
  [key: string]: unknown;
}

export function wrapOllama(client: OllamaClient, api: BuiryAPI, sessionId?: string): OllamaClient {
  return createProxyWrapper(client, api, "ollama", sessionId);
}
