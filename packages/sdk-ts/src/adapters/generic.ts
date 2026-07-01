import type { BuiryAPI } from "../api/client.js";
import { createProxyWrapper } from "../wrapper/LLMWrapper.js";

export interface GenericLLMClient {
  [key: string]: unknown;
}

export function wrapGeneric(
  client: GenericLLMClient,
  api: BuiryAPI,
  provider: string,
  sessionId?: string
): GenericLLMClient {
  return createProxyWrapper(client, api, provider, sessionId);
}
