// API Layer — Connects frontend to Buiry cloud backend
// Uses VITE_API_URL environment variable for backend URL
// Falls back to mock data if API is unavailable
import { mockMemory } from './mock-data';
import type { BuildContextMemory, SessionObject } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_KEY = import.meta.env.VITE_BUIRY_API_KEY || '';

async function apiRequest<T>(path: string, body?: unknown): Promise<T | null> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (API_KEY) headers['x-api-key'] = API_KEY;
    const res = await fetch(`${API_URL}${path}`, {
      method: body ? 'POST' : 'GET',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getMemory(): Promise<BuildContextMemory> {
  const api = await apiRequest<BuildContextMemory>('/api/session/start', { projectId: 'buiry', agentId: 'web' });
  return api || mockMemory;
}

export async function getSessions(): Promise<SessionObject[]> {
  const memory = await getMemory();
  return memory.sessions;
}

export async function getSession(sessionId: string): Promise<SessionObject | undefined> {
  const sessions = await getSessions();
  return sessions.find(s => s.session_id === sessionId);
}

export async function searchContext(query: string): Promise<SessionObject[]> {
  const api = await apiRequest<{ sessions: SessionObject[] }>('/api/context/search', { query, maxResults: 5 });
  if (api) return api.sessions;
  const sessions = await getSessions();
  const q = query.toLowerCase();
  return sessions.filter(s => {
    const text = [s.last_session_summary, s.current_phase, s.changes_made.join(' '), s.decisions_log.map(d => `${d.decision} ${d.reason}`).join(' '), s.next_steps.join(' ')].join(' ').toLowerCase();
    return text.includes(q);
  });
}
