/**
 * HTTP Client for Buiry Dashboard API
 *
 * Used by MCP tools to sync local session data to the Buiry dashboard.
 * Runs alongside the stdio transport — this is an optional, outbound
 * HTTP call that doesn't interfere with the MCP protocol channel.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { BuildContextMemory, SessionObject } from "./types.js";

const MEMORY_FILENAME = "Build-Context-Memory.json";

export interface SyncResult {
  synced: number;
  failed: number;
  errors: string[];
  dashboard_url: string;
}

/**
 * Push all local sessions to the Buiry dashboard API.
 *
 * Strategy: POST each session individually to the dashboard's
 * /api/session/end endpoint. This is idempotent — the dashboard
 * deduplicates by session_id.
 */
export async function syncToDashboard(
  projectRoot: string,
  dashboardUrl: string,
  apiKey: string
): Promise<SyncResult> {
  const result: SyncResult = {
    synced: 0,
    failed: 0,
    errors: [],
    dashboard_url: dashboardUrl,
  };

  let memory: BuildContextMemory;
  try {
    const raw = await readFile(join(projectRoot, MEMORY_FILENAME), "utf-8");
    memory = JSON.parse(raw);
  } catch (err) {
    result.errors.push(`Failed to read memory: ${(err as Error).message}`);
    return result;
  }

  for (const session of memory.sessions) {
    try {
      const response = await fetch(`${dashboardUrl}/api/session/end`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": apiKey,
        },
        body: JSON.stringify(session),
      });

      if (response.ok) {
        result.synced++;
      } else {
        result.failed++;
        result.errors.push(
          `Session ${session.session_id}: HTTP ${response.status}`
        );
      }
    } catch (err) {
      result.failed++;
      result.errors.push(
        `Session ${session.session_id}: ${(err as Error).message}`
      );
    }
  }

  return result;
}

/**
 * Push a single session to the dashboard API.
 * Called from buiry_end_session when DASHBOARD_URL is set.
 */
export async function syncSingleSession(
  session: SessionObject,
  dashboardUrl: string,
  apiKey: string
): Promise<boolean> {
  try {
    const response = await fetch(`${dashboardUrl}/api/session/end`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify(session),
    });
    return response.ok;
  } catch {
    return false;
  }
}
