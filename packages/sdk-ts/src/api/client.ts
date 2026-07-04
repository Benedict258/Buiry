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
        "X-Api-Key": this.config.apiKey,
        ...init?.headers,
      },
    });
    if (!res.ok) {
      throw new Error(`Buiry API error: ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<T>;
  }

  async captureInteraction(pattern: InteractionPattern): Promise<void> {
    await this.request("/api/session/search", {
      method: "POST",
      body: JSON.stringify({ query: pattern.provider, ...pattern }),
    });
  }

  async storeMemory(entry: MemoryEntry): Promise<void> {
    await this.request("/api/session/end", {
      method: "POST",
      body: JSON.stringify({
        project: entry.sessionId || "sdk",
        summary: `${entry.key}: ${entry.value}`,
        decisions: [],
        nextSteps: [],
      }),
    });
  }

  async searchMemory(
    query: string,
    sessionId?: string
  ): Promise<MemoryEntry[]> {
    const res = await this.request<{ results: MemoryEntry[]; total: number }>(
      "/api/context/search",
      {
        method: "POST",
        body: JSON.stringify({ query }),
      }
    );
    return res.results || [];
  }

  async healthCheck(): Promise<{ status: string; version: string; services: Record<string, string> }> {
    return this.request("/health");
  }

  async startSession(): Promise<Record<string, unknown>> {
    return this.request("/api/session/start", {
      method: "POST",
      body: JSON.stringify({}),
    });
  }

  async getDatasets(sessionId: string): Promise<unknown> {
    return this.request("/api/dataset/list", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    }).catch(() => []);
  }

  async getSessions(): Promise<unknown> {
    return this.request("/api/session/search", {
      method: "POST",
      body: JSON.stringify({ query: "", limit: 50 }),
    });
  }
}
