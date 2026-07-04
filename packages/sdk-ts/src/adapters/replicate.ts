import type { BuiryAPI } from "../api/client.js";
import { createProxyWrapper } from "../wrapper/LLMWrapper.js";

export interface ReplicateClient {
  run: (model: string, options: { input: Record<string, unknown> }) => Promise<unknown>;
  predictions: {
    create: (...args: unknown[]) => Promise<unknown>;
  };
  [key: string]: unknown;
}

export function wrapReplicate(client: ReplicateClient, api: BuiryAPI, sessionId?: string): ReplicateClient {
  return createProxyWrapper(client, api, "replicate", sessionId);
}
