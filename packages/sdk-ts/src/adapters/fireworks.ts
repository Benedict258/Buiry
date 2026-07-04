import type { BuiryAPI } from "../api/client.js";
import { createProxyWrapper } from "../wrapper/LLMWrapper.js";

export interface FireworksClient {
  chat: {
    completions: { create: (...args: unknown[]) => Promise<unknown>; };
  };
  completions: { create: (...args: unknown[]) => Promise<unknown>; };
  [key: string]: unknown;
}

export function wrapFireworks(client: FireworksClient, api: BuiryAPI, sessionId?: string): FireworksClient {
  return createProxyWrapper(client, api, "fireworks", sessionId);
}
