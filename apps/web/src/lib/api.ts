import { mockMemory } from './mock-data';
import type { BuildContextMemory, SessionObject } from './types';

export async function getMemory(): Promise<BuildContextMemory> {
  // In production, this would fetch from the MCP server
  return mockMemory;
}

export async function getSessions(): Promise<SessionObject[]> {
  const memory = await getMemory();
  return memory.sessions;
}

export async function getSession(sessionId: string): Promise<SessionObject | undefined> {
  const sessions = await getSessions();
  return sessions.find((s) => s.session_id === sessionId);
}

export async function searchContext(query: string): Promise<SessionObject[]> {
  const sessions = await getSessions();
  const q = query.toLowerCase();
  return sessions.filter((s) => {
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
