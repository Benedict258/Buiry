// API Layer — Connects frontend to Buiry cloud backend
// Uses VITE_API_URL environment variable for backend URL
import type { BuildContextMemory, SessionObject } from './types';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');

function getApiKey(): string {
  const token = localStorage.getItem('buiry_token');
  return token ? `Bearer ${token}` : (import.meta.env.VITE_BUIRY_API_KEY || '');
}

async function apiRequest<T>(path: string, body?: unknown, method?: string): Promise<T | null> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const key = getApiKey();
    if (key) {
      if (key.startsWith('Bearer ')) {
        headers['Authorization'] = key;
      } else {
        headers['x-api-key'] = key;
      }
    }
    const res = await fetch(`${API_URL}${path}`, {
      method: method || (body ? 'POST' : 'GET'),
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
  const raw = await apiRequest<Record<string, any>>('/api/session/start', { projectId: 'buiry', agentId: 'web' });

  const sessions = (raw?.sessions || raw?.recentSessions || raw?.last_5_sessions || []).map((s: any) => ({
    session_id: s.session_id || s.id || '',
    timestamp: s.timestamp || '',
    ai_agent: s.ai_agent || '',
    current_phase: s.current_phase || '',
    progress: s.progress || { completed: [], in_progress: [], blocked: [] },
    last_session_summary: s.last_session_summary || '',
    changes_made: s.changes_made || [],
    file_module_map: s.file_module_map || [],
    decisions_log: (s.decisions_log || s.decisions || []).map((d: any) =>
      typeof d === 'string' ? { decision: d, reason: '', alternatives_considered: '' } : d
    ),
    known_issues: (s.known_issues || []).map((i: any) =>
      typeof i === 'string' ? { issue: i, severity: 'medium', status: 'open' } : i
    ),
    errors_encountered: s.errors_encountered || [],
    next_steps: s.next_steps || [],
    dataset_signals: s.dataset_signals || [],
  }));

  return {
    project_identity: raw?.project_identity || { name: 'Buiry', description: '', version: '', stack: [], architecture_summary: '', repo_url: '', created_at: '', buiry_version: '' },
    config: raw?.config || { max_sessions_in_context: 100, auto_summarize_after: 50, dataset_capture: false, dataset_domain: '' },
    summary: {
      current_phase: raw?.summary?.current_phase || raw?.summary || '',
      overall_status: raw?.summary?.overall_status || '',
      last_updated: raw?.summary?.last_updated || '',
      total_sessions: raw?.summary?.total_sessions || sessions.length,
      open_issues: raw?.summary?.open_issues || 0,
    },
    sessions,
  };
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

export async function getDatasets(): Promise<{ datasets: Dataset[]; storageError?: boolean }> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const key = getApiKey();
    if (key) {
      if (key.startsWith('Bearer ')) {
        headers['Authorization'] = key;
      } else {
        headers['x-api-key'] = key;
      }
    }
    const res = await fetch(`${API_URL}/api/datasets`, { headers });
    const body = await res.json();
    if (body.fallback) {
      return { datasets: [], storageError: true };
    }
    return { datasets: body.datasets ?? [] };
  } catch {
    return { datasets: [], storageError: true };
  }
}

export interface HealthStatus {
  status: string;
  version?: string;
  uptime?: number;
}

export async function getHealthCheck(): Promise<HealthStatus | null> {
  return apiRequest<HealthStatus>('/health');
}

// ─── Projects ────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  filename: string;
  content: string;
  updated_at: string;
}

export async function getProjects(): Promise<Project[]> {
  const data = await apiRequest<{ projects: Project[] }>('/api/projects');
  return data?.projects ?? [];
}

export async function createProject(name: string, description: string): Promise<Project | null> {
  const data = await apiRequest<{ project: Project }>('/api/projects', { name, description });
  return data?.project ?? null;
}

export async function getProjectDetail(id: string): Promise<{ project: Project; files: ProjectFile[] } | null> {
  return apiRequest(`/api/projects/${id}`);
}

export async function getProjectFiles(id: string): Promise<ProjectFile[]> {
  const data = await apiRequest<{ files: ProjectFile[] }>(`/api/projects/${id}/files`);
  return data?.files ?? [];
}

export async function getProjectFile(id: string, filename: string): Promise<ProjectFile | null> {
  const data = await apiRequest<{ file: ProjectFile }>(`/api/projects/${id}/files/${encodeURIComponent(filename)}`);
  return data?.file ?? null;
}

export async function saveProjectFile(id: string, filename: string, content: string): Promise<boolean> {
  const data = await apiRequest(`/api/projects/${id}/files/${encodeURIComponent(filename)}`, { content }, 'PUT');
  return data !== null;
}

export async function getProjectMemory(id: string): Promise<Record<string, unknown> | null> {
  return apiRequest(`/api/projects/${id}/memory`);
}

export async function deleteProject(id: string): Promise<boolean> {
  const data = await apiRequest<{ deleted: boolean }>(`/api/projects/${id}`, undefined, 'DELETE');
  return data?.deleted ?? false;
}

export { getApiKey };
