import type { BuiryConfig, InteractionPattern, MemoryEntry } from "../types.js";

export class BuiryAPI {
  private config: BuiryConfig;

  constructor(config: BuiryConfig) {
    this.config = config;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${this.config.domain}${path}`;
    const res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
        "X-Project-Id": this.config.projectId,
        ...init?.headers,
      },
    });
    if (!res.ok) {
      throw new Error(`Buiry API error: ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<T>;
  }

  async captureInteraction(pattern: InteractionPattern): Promise<void> {
    await this.request("/v1/interactions", {
      method: "POST",
      body: JSON.stringify(pattern),
    });
  }

  async storeMemory(entry: MemoryEntry): Promise<void> {
    await this.request("/v1/memory", {
      method: "POST",
      body: JSON.stringify(entry),
    });
  }

  async searchMemory(
    query: string,
    sessionId?: string
  ): Promise<MemoryEntry[]> {
    const params = new URLSearchParams({ query });
    if (sessionId) params.set("sessionId", sessionId);
    return this.request<MemoryEntry[]>(`/v1/memory/search?${params}`);
  }
}
