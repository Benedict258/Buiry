// API Layer — Connects frontend to Buiry cloud backend
// Uses VITE_API_URL environment variable for backend URL
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

export async function getMemory(): Promise<BuildContextMemory | null> {
  return apiRequest<BuildContextMemory>('/api/session/start', { projectId: 'buiry', agentId: 'web' });
}

export async function getSessions(): Promise<SessionObject[]> {
  const memory = await getMemory();
  return memory?.sessions ?? [];
}

export async function getSession(sessionId: string): Promise<SessionObject | undefined> {
  const sessions = await getSessions();
  return sessions.find(s => s.session_id === sessionId);
}

export async function searchContext(query: string): Promise<SessionObject[]> {
  const api = await apiRequest<{ sessions: SessionObject[] }>('/api/context/search', { query, maxResults: 5 });
  return api?.sessions ?? [];
}

export interface Dataset {
  name: string;
  icon: string;
  suiId: string;
  cid: string;
  privacyScore: number;
  epoch: string;
  badge: string;
}

export async function getDatasets(): Promise<Dataset[]> {
  return (await apiRequest<Dataset[]>('/api/datasets')) ?? [];
}

export interface HealthStatus {
  status: string;
  version?: string;
  uptime?: number;
}

export async function getHealthCheck(): Promise<HealthStatus | null> {
  return apiRequest<HealthStatus>('/health');
}
