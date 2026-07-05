/**
 * Cloud Session Routes — MCP-native session storage in PostgreSQL.
 *
 * These endpoints are designed for the Buiry MCP server's cloud-first mode.
 * They accept the same session format as the MCP's Build-Context-Memory.json,
 * storing everything in PostgreSQL with local file as secondary cache.
 */
import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { query } from '../db/pool.js'

export const cloudSessionRoutes = Router()

const SESSION_FILE = join(process.cwd(), 'data', 'Build-Context-Memory.json')
const HAS_DB = !!process.env.DATABASE_URL

async function ensureFile(): Promise<void> {
  const dir = join(process.cwd(), 'data')
  if (!existsSync(dir)) await mkdir(dir, { recursive: true })
  if (!existsSync(SESSION_FILE)) {
    await writeFile(SESSION_FILE, JSON.stringify({ project_identity: { name: 'Buiry' }, sessions: [] }, null, 2))
  }
}

async function readFileCache(): Promise<{ project_identity: any; sessions: any[] }> {
  await ensureFile()
  try {
    return JSON.parse(await readFile(SESSION_FILE, 'utf-8'))
  } catch {
    return { project_identity: {}, sessions: [] }
  }
}

async function writeFileCache(data: { project_identity: any; sessions: any[] }): Promise<void> {
  await ensureFile()
  await writeFile(SESSION_FILE, JSON.stringify(data, null, 2))
}

// ─── Cloud Session Start ───────────────────────────────────
// Returns project identity, last 5 sessions, open issues, summary.
// Format matches what the MCP's buiry_start_session expects.

cloudSessionRoutes.post('/start', async (req: Request, res: Response) => {
  const mcpSession = req.body

  try {
    if (HAS_DB) {
      const result = await query(
        `SELECT data FROM sessions ORDER BY created_at DESC LIMIT 5`
      )
      const last5 = result.rows.map(r => r.data as Record<string, any>)
      const openIssues: string[] = []
      for (const s of last5) {
        if (s.known_issues) {
          openIssues.push(...(s.known_issues as string[]))
        }
      }
      const uniqueIssues = [...new Set(openIssues)]

      return res.json({
        project_identity: {
          name: mcpSession.project_identity?.name || 'Buiry',
          description: mcpSession.project_identity?.description || '',
          created: mcpSession.project_identity?.created || new Date().toISOString(),
        },
        summary: {
          total_sessions: (await query('SELECT COUNT(*) as c FROM sessions')).rows[0]?.c || 0,
          last_updated: last5[0]?.timestamp || new Date().toISOString(),
          active_phase: last5[0]?.current_phase || 'planning',
        },
        last_5_sessions: last5.map(s => ({
          session_id: s.session_id,
          timestamp: s.timestamp,
          ai_agent: s.ai_agent,
          current_phase: s.current_phase,
          progress: s.progress,
          last_session_summary: s.last_session_summary,
          next_steps: s.next_steps,
        })),
        open_issues: uniqueIssues,
      })
    }
  } catch (err) {
    console.warn('[CloudSession] DB start failed, using file cache:', err)
  }

  const cache = await readFileCache()
  const last5 = cache.sessions.slice(-5)
  const openIssues = [...new Set(cache.sessions.flatMap((s: any) => s.known_issues || []))]

  res.json({
    project_identity: cache.project_identity,
    summary: {
      total_sessions: cache.sessions.length,
      last_updated: last5[0]?.timestamp || new Date().toISOString(),
      active_phase: last5[0]?.current_phase || 'planning',
    },
    last_5_sessions: last5,
    open_issues: openIssues,
  })
})

// ─── Cloud Session End ─────────────────────────────────────
// Accepts full MCP session object, stores in PG + file cache.

cloudSessionRoutes.post('/end', async (req: Request, res: Response) => {
  const session = req.body

  if (!session.session_id) {
    return res.status(400).json({ error: 'session_id is required' })
  }

  // Inject project_id if provided (from buiry_init)
  const projectId = session.project_id || req.body.project_id || null
  if (projectId && !session.project_id) {
    session.project_id = projectId
  }

  try {
    if (HAS_DB) {
      await query(
        `INSERT INTO sessions (session_id, agent_id, current_phase, data)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (session_id) DO UPDATE SET data = $4, current_phase = $3, updated_at = NOW()`,
        [session.session_id, session.ai_agent || null, session.current_phase || null, JSON.stringify(session)]
      )
    }
  } catch (err) {
    console.warn('[CloudSession] DB end failed:', err)
  }

  try {
    const cache = await readFileCache()
    const idx = cache.sessions.findIndex((s: any) => s.session_id === session.session_id)
    if (idx >= 0) {
      cache.sessions[idx] = session
    } else {
      cache.sessions.push(session)
    }
    await writeFileCache(cache)
  } catch (err) {
    console.warn('[CloudSession] File cache write failed:', err)
  }

  res.json({
    success: true,
    session_id: session.session_id,
    stored_in: HAS_DB ? 'postgres' : 'file',
  })
})

// ─── Cloud Mid-Session Decision ────────────────────────────
// Logs a decision to an active session without ending it.

cloudSessionRoutes.post('/decision', async (req: Request, res: Response) => {
  const { session_id, timestamp, decision, rationale, alternatives_considered } = req.body

  if (!session_id) return res.status(400).json({ error: 'session_id is required' })
  if (!decision) return res.status(400).json({ error: 'decision is required' })

  const entry = { timestamp: timestamp || new Date().toISOString(), decision, rationale, alternatives_considered }

  try {
    if (HAS_DB) {
      const result = await query('SELECT data FROM sessions WHERE session_id = $1', [session_id])
      if (result.rows.length > 0) {
        const existing = result.rows[0].data as Record<string, any>
        const decisions = existing.decisions_log || []
        decisions.push(entry)
        existing.decisions_log = decisions
        await query(
          'UPDATE sessions SET data = $1, updated_at = NOW() WHERE session_id = $2',
          [JSON.stringify(existing), session_id]
        )
      }
    }
  } catch (err) {
    console.warn('[CloudSession] Decision log failed:', err)
  }

  // Update file cache
  try {
    const cache = await readFileCache()
    const session = cache.sessions.find((s: any) => s.session_id === session_id)
    if (session) {
      if (!session.decisions_log) session.decisions_log = []
      session.decisions_log.push(entry)
      await writeFileCache(cache)
    }
  } catch {}

  res.json({ success: true, session_id, decisions_logged: (req.body.entry ? 1 : 0) + 1 })
})

// ─── Cloud Mid-Session Issue ───────────────────────────────
// Flags an issue on an active session without ending it.

cloudSessionRoutes.post('/issue', async (req: Request, res: Response) => {
  const { session_id, issue } = req.body

  if (!session_id) return res.status(400).json({ error: 'session_id is required' })
  if (!issue) return res.status(400).json({ error: 'issue is required' })

  try {
    if (HAS_DB) {
      const result = await query('SELECT data FROM sessions WHERE session_id = $1', [session_id])
      if (result.rows.length > 0) {
        const existing = result.rows[0].data as Record<string, any>
        const issues = existing.known_issues || []
        if (!issues.includes(issue)) {
          issues.push(issue)
          existing.known_issues = issues
          await query(
            'UPDATE sessions SET data = $1, updated_at = NOW() WHERE session_id = $2',
            [JSON.stringify(existing), session_id]
          )
        }
      }
    }
  } catch (err) {
    console.warn('[CloudSession] Issue log failed:', err)
  }

  try {
    const cache = await readFileCache()
    const session = cache.sessions.find((s: any) => s.session_id === session_id)
    if (session) {
      if (!session.known_issues) session.known_issues = []
      if (!session.known_issues.includes(issue)) session.known_issues.push(issue)
      await writeFileCache(cache)
    }
  } catch {}

  res.json({ success: true, session_id, issue })
})

// ─── Cloud Context Search ──────────────────────────────────
// Searches across all sessions. MCP-match format.

cloudSessionRoutes.post('/search', async (req: Request, res: Response) => {
  const { query: q } = req.body
  if (!q) return res.status(400).json({ error: 'query is required' })

  let results: any[] = []

  try {
    if (HAS_DB) {
      const result = await query(
        `SELECT data FROM sessions
         WHERE data::text ILIKE '%' || $1 || '%'
         ORDER BY created_at DESC LIMIT 20`,
        [q]
      )
      results = result.rows.map(r => r.data)
      if (results.length > 0) {
        return res.json({ sessions: results, total: results.length, source: 'postgres' })
      }
    }
  } catch (err) {
    console.warn('[CloudSession] DB search failed:', err)
  }

  const cache = await readFileCache()
  const ql = q.toLowerCase()
  results = cache.sessions.filter((s: any) =>
    JSON.stringify(s).toLowerCase().includes(ql)
  )

  res.json({ sessions: results, total: results.length, source: 'file' })
})
