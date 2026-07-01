/**
 * API Layer — Data fetching functions for the Buiry frontend.
 *
 * This module abstracts data access so components don't know whether data
 * comes from mock data, the MCP server, or a REST API. This makes it easy
 * to swap the backend without changing any UI code.
 *
 * Design choice: For the hackathon demo, all functions return mock data.
 * In production, getMemory() would call the MCP server's buiry_get_context
 * tool via a backend proxy (the MCP server runs in Node.js, not the browser).
 *
 * The searchContext() function mirrors the MCP server's searchMemory() but
 * runs client-side for instant results. Production would use server-side
 * semantic search for better accuracy.
 */

import { mockMemory } from './mock-data';
import type { BuildContextMemory, SessionObject } from './types';

/**
 * Fetch the complete project memory.
 * Returns the full BuildContextMemory object including project identity,
 * config, summary, and all sessions.
 *
 * @returns The complete project memory from Build-Context-Memory.json
 */
export async function getMemory(): Promise<BuildContextMemory> {
  // In production, this would fetch from the MCP server via a backend proxy.
  // The MCP server runs as a child process (stdio transport), so a REST
  // wrapper would be needed to expose it to the browser.
  return mockMemory;
}

/**
 * Fetch all sessions from memory.
 * Convenience wrapper that extracts the sessions array from getMemory().
 *
 * @returns Array of all SessionObject items, ordered chronologically
 */
export async function getSessions(): Promise<SessionObject[]> {
  const memory = await getMemory();
  return memory.sessions;
}

/**
 * Fetch a single session by ID.
 * Returns undefined if no session matches the given ID.
 *
 * @param sessionId - The full session_id string (e.g., "sess_1234567890")
 * @returns The matching SessionObject or undefined
 */
export async function getSession(sessionId: string): Promise<SessionObject | undefined> {
  const sessions = await getSessions();
  return sessions.find((s) => s.session_id === sessionId);
}

/**
 * Search across all sessions for a query string.
 * Performs case-insensitive substring matching against multiple fields:
 *   - last_session_summary
 *   - current_phase
 *   - changes_made (file paths)
 *   - decisions_log (decision + reason)
 *   - next_steps
 *
 * This mirrors the MCP server's searchMemory() function but runs client-side
 * for instant results. Production would use server-side semantic search.
 *
 * @param query - Search string (case-insensitive)
 * @returns Array of matching SessionObject items
 */
export async function searchContext(query: string): Promise<SessionObject[]> {
  const sessions = await getSessions();
  const q = query.toLowerCase();
  return sessions.filter((s) => {
    // Concatenate all searchable fields into one string for broad matching
    const text = [
      s.last_session_summary,
      s.current_phase,
      s.changes_made.join(' '),
      s.decisions_log.map((d) => `${d.decision} ${d.reason}`).join(' '),
      s.next_steps.join(' '),
    ]
      .join(' ')
      .toLowerCase();
    return text.includes(q);
  });
}
