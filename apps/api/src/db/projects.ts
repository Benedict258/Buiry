import { query, getPool } from '../db/pool.js'

export async function initProjectsTable() {
  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      description TEXT DEFAULT '',
      api_key_id UUID REFERENCES api_keys(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS project_files (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      filename VARCHAR(255) NOT NULL,
      content TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(project_id, filename)
    )
  `)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_project_files_project ON project_files (project_id)
  `)
}

export interface Project {
  id: string
  name: string
  description: string
  api_key_id: string | null
  created_at: string
  updated_at: string
}

export interface ProjectFile {
  id: string
  project_id: string
  filename: string
  content: string
  updated_at: string
}

export async function createProject(name: string, description: string, apiKeyId?: string): Promise<Project> {
  const result = await query(
    'INSERT INTO projects (name, description, api_key_id) VALUES ($1, $2, $3) RETURNING *',
    [name, description, apiKeyId || null]
  )
  return result.rows[0] as Project
}

export async function listProjects(apiKeyId?: string): Promise<Project[]> {
  let result
  if (apiKeyId) {
    result = await query(
      'SELECT * FROM projects WHERE api_key_id = $1 ORDER BY updated_at DESC',
      [apiKeyId]
    )
  } else {
    result = await query('SELECT * FROM projects ORDER BY updated_at DESC')
  }
  return result.rows as Project[]
}

export async function getProject(id: string): Promise<Project | null> {
  const result = await query('SELECT * FROM projects WHERE id = $1', [id])
  return (result.rows[0] as Project) || null
}

export async function deleteProject(id: string): Promise<boolean> {
  const result = await query('DELETE FROM projects WHERE id = $1 RETURNING id', [id])
  return (result.rowCount ?? 0) > 0
}

// ─── Files ────────────────────────────────────────────────────

export async function listFiles(projectId: string): Promise<ProjectFile[]> {
  const result = await query(
    'SELECT * FROM project_files WHERE project_id = $1 ORDER BY filename',
    [projectId]
  )
  return result.rows as ProjectFile[]
}

export async function getFile(projectId: string, filename: string): Promise<ProjectFile | null> {
  const result = await query(
    'SELECT * FROM project_files WHERE project_id = $1 AND filename = $2',
    [projectId, filename]
  )
  return (result.rows[0] as ProjectFile) || null
}

export async function upsertFile(projectId: string, filename: string, content: string): Promise<ProjectFile> {
  const result = await query(
    `INSERT INTO project_files (project_id, filename, content)
     VALUES ($1, $2, $3)
     ON CONFLICT (project_id, filename)
     DO UPDATE SET content = $3, updated_at = NOW()
     RETURNING *`,
    [projectId, filename, content]
  )
  return result.rows[0] as ProjectFile
}

export async function getBuiryInitFiles(projectId: string): Promise<{ filename: string; content: string }[]> {
  const files = await listFiles(projectId)
  return files.map(f => ({ filename: f.filename, content: f.content }))
}

// ─── Memory Compose ───────────────────────────────────────────
// Reconstructs Build-Context-Memory.json from PostgreSQL sessions.

export async function composeMemory(projectId: string): Promise<Record<string, unknown>> {
  const project = await getProject(projectId)
  const files = await getBuiryInitFiles(projectId)

  // Get all sessions for this project
  const sessionsResult = await query(
    `SELECT data FROM sessions
     WHERE data->>'project_id' = $1
     ORDER BY created_at DESC
     LIMIT 100`,
    [projectId]
  )

  const sessions = sessionsResult.rows.map(r => r.data)

  const memory: Record<string, unknown> = {
    project_identity: {
      name: project?.name || 'Unknown',
      description: project?.description || '',
      version: '0.1.0',
    },
    config: {
      max_sessions: 100,
    },
    summary: `${sessions.length} sessions across ${files.length} project files`,
    sessions,
    project_files: files.map(f => f.filename),
  }

  return memory
}
