/**
 * Cloud Client — Primary data layer for the Buiry MCP server.
 *
 * In cloud-first mode, every MCP tool call goes to the Buiry Cloud API
 * (https://buiry.up.railway.app). The local Build-Context-Memory.json
 * is a secondary cache, written only as a fallback when the cloud is
 * unreachable.
 *
 * Users get their API key from https://buiry.vercel.app/settings,
 * set it as BUIRY_API_KEY in their MCP config, and everything syncs
 * automatically. No local file management needed.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { BuildContextMemory, SessionObject } from "./types.js";

const MEMORY_FILENAME = "Build-Context-Memory.json";
const DEFAULT_CLOUD_URL = "https://buiry.up.railway.app";

export interface StartSessionResult {
  project_identity: Record<string, unknown>;
  summary: Record<string, unknown>;
  last_5_sessions: Array<Record<string, unknown>>;
  open_issues: string[];
  source: "cloud" | "local";
}

export interface SearchResponse {
  sessions: Array<Record<string, unknown>>;
  total: number;
  source: string;
}

export class CloudClient {
  private cloudUrl: string;
  private apiKey: string;
  private projectRoot: string;
  private isCloudAvailable: boolean;

  constructor(projectRoot: string) {
    this.cloudUrl = process.env.BUIRY_CLOUD_URL || DEFAULT_CLOUD_URL;
    this.apiKey = process.env.BUIRY_API_KEY || "";
    this.projectRoot = projectRoot;
    this.isCloudAvailable = !!this.apiKey;
  }

  get requiresApiKey(): boolean {
    return !this.apiKey || this.apiKey.length < 8;
  }

  private get memoryPath(): string {
    return join(this.projectRoot, MEMORY_FILENAME);
  }

  // ─── HTTP Helpers ──────────────────────────────────────────

  private async apiPost<T>(path: string, body: unknown): Promise<T | null> {
    if (!this.apiKey) return null;
    try {
      const res = await fetch(`${this.cloudUrl}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": this.apiKey,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      this.isCloudAvailable = false;
      return null;
    }
  }

  // ─── Local File Cache ──────────────────────────────────────

  async readLocalMemory(): Promise<BuildContextMemory> {
    try {
      const raw = await readFile(this.memoryPath, "utf-8");
      return JSON.parse(raw);
    } catch {
      return {
        project_identity: { name: "Buiry", description: "MCP-first AI workspace" },
        sessions: [],
        config: { max_sessions: 100 },
        summary: "No sessions yet",
      };
    }
  }

  async writeLocalMemory(memory: BuildContextMemory): Promise<void> {
    try {
      const json = JSON.stringify(memory, null, 2) + "\n";
      await writeFile(this.memoryPath, json, "utf-8");
    } catch {}
  }

  // ─── Session Lifecycle ─────────────────────────────────────

  async startSession(): Promise<StartSessionResult> {
    // Try cloud first
    const cloudData = await this.apiPost<any>(
      "/api/session/cloud/start",
      {}
    );
    if (cloudData) {
      return {
        project_identity: cloudData.project_identity || {},
        summary: cloudData.summary || {},
        last_5_sessions: cloudData.last_5_sessions || [],
        open_issues: cloudData.open_issues || [],
        source: "cloud",
      };
    }

    // Fallback to local file
    const memory = await this.readLocalMemory();
    const last5 = memory.sessions.slice(-5);
    const openIssues = memory.sessions.flatMap((s) => s.known_issues).filter(
      (v, i, a) => a.indexOf(v) === i
    );

    return {
      project_identity: memory.project_identity,
      summary: {
        total_sessions: memory.sessions.length,
        last_updated: memory.sessions[memory.sessions.length - 1]?.timestamp || new Date().toISOString(),
        active_phase: memory.sessions[memory.sessions.length - 1]?.current_phase || "planning",
      } as Record<string, unknown>,
      last_5_sessions: last5.map((s) => ({
        session_id: s.session_id,
        timestamp: s.timestamp,
        ai_agent: s.ai_agent,
        current_phase: s.current_phase,
        progress: s.progress,
        last_session_summary: s.last_session_summary,
        next_steps: s.next_steps,
      })),
      open_issues: openIssues,
      source: "local",
    };
  }

  async endSession(session: SessionObject): Promise<{
    success: boolean;
    session_id: string;
    source: "cloud" | "local";
  }> {
    // Try cloud first
    const cloudResult = await this.apiPost<{ success: boolean }>(
      "/api/session/cloud/end",
      session
    );
    if (cloudResult?.success) {
      // Also update local cache
      try {
        const memory = await this.readLocalMemory();
        const idx = memory.sessions.findIndex(
          (s) => s.session_id === session.session_id
        );
        if (idx >= 0) memory.sessions[idx] = session;
        else memory.sessions.push(session);
        await this.writeLocalMemory(memory);
      } catch {}
      return { success: true, session_id: session.session_id, source: "cloud" };
    }

    // Fallback to local file
    try {
      const memory = await this.readLocalMemory();
      memory.sessions.push(session);
      const maxSessions = memory.config?.max_sessions;
      if (maxSessions && memory.sessions.length > maxSessions) {
        memory.sessions = memory.sessions.slice(-maxSessions);
      }
      await this.writeLocalMemory(memory);
      return { success: true, session_id: session.session_id, source: "local" };
    } catch (err) {
      return { success: false, session_id: session.session_id, source: "local" };
    }
  }

  // ─── Mid-Session Operations ────────────────────────────────

  async logDecision(
    sessionId: string,
    timestamp: string,
    decision: string,
    rationale: string,
    alternativesConsidered?: string[]
  ): Promise<boolean> {
    // Try cloud first
    const cloudResult = await this.apiPost("/api/session/cloud/decision", {
      session_id: sessionId,
      timestamp,
      decision,
      rationale,
      alternatives_considered: alternativesConsidered,
    });
    if (cloudResult) return true;

    // Fallback to local file
    try {
      const memory = await this.readLocalMemory();
      const session = memory.sessions.find((s) => s.session_id === sessionId);
      if (session) {
        session.decisions_log.push({
          timestamp,
          decision,
          rationale,
          alternatives_considered: alternativesConsidered,
        });
        await this.writeLocalMemory(memory);
      }
      return true;
    } catch {
      return false;
    }
  }

  async flagIssue(sessionId: string, issue: string): Promise<boolean> {
    // Try cloud first
    const cloudResult = await this.apiPost("/api/session/cloud/issue", {
      session_id: sessionId,
      issue,
    });
    if (cloudResult) return true;

    // Fallback to local file
    try {
      const memory = await this.readLocalMemory();
      const session = memory.sessions.find((s) => s.session_id === sessionId);
      if (session) {
        session.known_issues.push(issue);
        await this.writeLocalMemory(memory);
      }
      return true;
    } catch {
      return false;
    }
  }

  // ─── Context Search ────────────────────────────────────────

  async searchContext(query: string): Promise<{
    sessions: Array<Record<string, unknown>>;
    total: number;
    source: string;
  }> {
    // Try cloud first
    const cloudData = await this.apiPost<SearchResponse>(
      "/api/session/cloud/search",
      { query }
    );
    if (cloudData && cloudData.sessions?.length > 0) {
      return { ...cloudData, source: "cloud" };
    }

    // Fallback to local file
    const memory = await this.readLocalMemory();
    const q = query.toLowerCase();
    const results = memory.sessions.filter((s) =>
      JSON.stringify(s).toLowerCase().includes(q)
    );

    return {
      sessions: results,
      total: results.length,
      source: "local",
    };
  }

  // ─── Init ──────────────────────────────────────────────────

  async initProject(projectName: string, projectDescription: string): Promise<{
    success: boolean;
    project_id?: string;
    files_created?: string[];
  }> {
    // Try cloud — creates project + ALL init files in one call
    const cloudResult = await this.apiPost<{
      project?: { id: string; name: string };
      files_created?: string[];
    }>("/api/projects", {
      name: projectName,
      description: projectDescription,
    });
    if (cloudResult?.project) {
      return {
        success: true,
        project_id: cloudResult.project.id,
        files_created: cloudResult.files_created,
      };
    }

    // Fallback to local file
    const memory: BuildContextMemory = {
      project_identity: {
        name: projectName,
        description: projectDescription,
      },
      sessions: [],
      config: { max_sessions: 100 },
      summary: `Project ${projectName} initialized`,
    };
    await this.writeLocalMemory(memory);
    return { success: true };
  }

  // ─── Sync ──────────────────────────────────────────────────

  async syncAll(): Promise<{ synced: number; failed: number; errors: string[] }> {
    const memory = await this.readLocalMemory();
    const errors: string[] = [];
    let synced = 0;
    let failed = 0;

    for (const session of memory.sessions) {
      try {
        const res = await fetch(`${this.cloudUrl}/api/session/cloud/end`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": this.apiKey,
          },
          body: JSON.stringify(session),
        });
        if (res.ok) synced++;
        else { failed++; errors.push(`Session ${session.session_id}: HTTP ${res.status}`); }
      } catch (err) {
        failed++;
        errors.push(`Session ${session.session_id}: ${(err as Error).message}`);
      }
    }

    return { synced, failed, errors };
  }
}
