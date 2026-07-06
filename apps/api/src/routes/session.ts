import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { MemWalClient } from '../memwal/client.js'
import { query } from '../db/pool.js'

export const sessionRoutes = Router()

const memwal = new MemWalClient()
memwal.connect().catch((err) => { console.warn('[Session] MemWal connect failed:', err?.message || err) })

const SESSION_FILE = join(process.cwd(), 'data', 'Build-Context-Memory.json')
const HAS_DB = !!process.env.DATABASE_URL

interface Session {
  id: string
  timestamp: string
  project: string
  summary: string
  decisions: string[]
  nextSteps: string[]
  [key: string]: unknown
}

interface BuildContextMemory {
  project_identity: Record<string, unknown>
  sessions: Session[]
}

const SessionSchema = z.object({
  project: z.string().min(1),
  summary: z.string().min(1),
  decisions: z.array(z.string()).optional().default([]),
  nextSteps: z.array(z.string()).optional().default([]),
})

async function readContext(): Promise<BuildContextMemory> {
  try {
    if (!existsSync(SESSION_FILE)) {
      const dir = join(process.cwd(), 'data')
      if (!existsSync(dir)) await mkdir(dir, { recursive: true })
      const initial: BuildContextMemory = {
        project_identity: { name: 'Buiry', description: 'MCP-first AI workspace' },
        sessions: [],
      }
      await writeFile(SESSION_FILE, JSON.stringify(initial, null, 2))
      return initial
    }
    const raw = await readFile(SESSION_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch (err: any) {
    console.warn('[Session] File read failed:', err?.message || err)
    return { project_identity: {}, sessions: [] }
  }
}

async function writeContext(data: BuildContextMemory): Promise<void> {
  const dir = join(process.cwd(), 'data')
  if (!existsSync(dir)) await mkdir(dir, { recursive: true })
  await writeFile(SESSION_FILE, JSON.stringify(data, null, 2))
}

sessionRoutes.post('/start', async (req: Request, res: Response) => {
  const apiKey = (req as any).apiKey
  if (HAS_DB) {
    try {
      const result = await query(
        `SELECT session_id, data, created_at
         FROM sessions
         ORDER BY created_at DESC
         LIMIT 5`
      )
      const recentSessions = result.rows.map((row: Record<string, unknown>) => ({
        id: row.session_id as string,
        ...(row.data as Record<string, unknown>),
        timestamp: row.created_at as string,
      }))
      const lastSession = recentSessions[recentSessions.length - 1] as Record<string, unknown> | undefined
      const nextSteps = lastSession
        ? (lastSession.nextSteps as string[]) || ['Initialize project structure']
        : ['Initialize project structure']
      return res.json({
        project_identity: { name: 'Buiry', description: 'MCP-first AI workspace' },
        recentSessions,
        nextSteps,
      })
    } catch (err) {
      console.warn('[Session] DB query failed, falling back to file:', err)
    }
  }

  const context = await readContext()
  const lastSessions = context.sessions.slice(-5)
  const nextSteps = lastSessions.length > 0
    ? lastSessions[lastSessions.length - 1].nextSteps
    : ['Initialize project structure']
  res.json({
    project_identity: context.project_identity,
    recentSessions: lastSessions,
    nextSteps,
  })
})

sessionRoutes.post('/end', async (req: Request, res: Response) => {
  const parsed = SessionSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const session: Session = {
    id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...parsed.data,
  }

  const apiKey = (req as any).apiKey
  let dbStored = !HAS_DB

  if (HAS_DB) {
    try {
      await query(
        `INSERT INTO sessions (session_id, agent_id, current_phase, api_key_id, data)
         VALUES ($1, $2, $3, $4, $5)`,
        [session.id, null, null, apiKey?.id || null, JSON.stringify(session)]
      )
      dbStored = true
    } catch (err) {
      console.warn('[Session] DB insert failed:', err)
    }
  }

  let fileStored = false
  try {
    const context = await readContext()
    context.sessions.push(session)
    await writeContext(context)
    fileStored = true
  } catch (err: any) {
    console.warn('[Session] File cache write failed:', err?.message || err)
  }

  if (memwal.isAvailable()) {
    try {
      await memwal.writeSession(session.project, session)
    } catch (err) {
      console.warn('[Session] MemWal write failed:', err)
    }
  }

  if (!dbStored && !fileStored) {
    return res.status(503).json({ error: 'Storage unavailable' })
  }

  res.json({ sessionId: session.id, timestamp: session.timestamp })
})

sessionRoutes.get('/:id', async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const apiKey = (req as any).apiKey

  if (HAS_DB) {
    try {
      const result = await query(
        `SELECT session_id, data, created_at
         FROM sessions
         WHERE session_id = $1 AND api_key_id = $2`,
        [id, apiKey?.id || null]
      )
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Session not found' })
      }
      const row = result.rows[0]
      return res.json({ id: row.session_id, ...(row.data as Record<string, unknown>), timestamp: row.created_at })
    } catch (err) {
      console.warn('[Session] DB query failed:', err)
    }
  }

  const context = await readContext()
  const session = context.sessions.find(s => s.id === id)
  if (!session) return res.status(404).json({ error: 'Session not found' })
  res.json(session)
})

sessionRoutes.post('/search', async (req: Request, res: Response) => {
  const { query: q } = req.body as { query?: string }
  if (!q) return res.status(400).json({ error: 'query is required' })
  const apiKey = (req as any).apiKey

  if (memwal.isAvailable()) {
    try {
      const result = await memwal.recall('*', q, 10)
      if (result && result.results.length > 0) {
        return res.json({ results: result.results, total: result.results.length, source: 'memwal' })
      }
    } catch (err) {
      console.warn('[Session] MemWal recall failed, falling back:', err)
    }
  }

  if (HAS_DB) {
    try {
      const result = await query(
        `SELECT session_id, data, created_at
         FROM sessions
         WHERE api_key_id = $1 AND (data::text ILIKE '%' || $2 || '%')
         ORDER BY created_at DESC
         LIMIT 20`,
        [apiKey?.id || null, q]
      )
      const results = result.rows.map((row: Record<string, unknown>) => ({
        id: row.session_id,
        ...(row.data as Record<string, unknown>),
        timestamp: row.created_at,
      }))
      return res.json({ results, total: results.length, source: 'postgres' })
    } catch (err) {
      console.warn('[Session] DB search failed:', err)
    }
  }

  const context = await readContext()
  const ql = q.toLowerCase()
  const results = context.sessions.filter(s =>
    s.summary.toLowerCase().includes(ql) ||
    s.decisions.some(d => d.toLowerCase().includes(ql)) ||
    s.nextSteps.some(n => n.toLowerCase().includes(ql))
  )
  res.json({ results, total: results.length, source: 'local' })
})
