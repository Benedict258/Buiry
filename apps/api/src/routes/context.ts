import { Router, Request, Response } from 'express'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { query } from '../db/pool.js'

export const contextRoutes = Router()

const HAS_DB = !!process.env.DATABASE_URL

contextRoutes.post('/search', async (req: Request, res: Response) => {
  const { query: q } = req.body as { query?: string }
  if (!q) return res.status(400).json({ error: 'query is required' })

  const apiKeyId = (req as any).apiKey?.id

  // PostgreSQL path with api_key_id scoping
  if (HAS_DB) {
    try {
      const result = await query(
        `SELECT data FROM sessions
         WHERE api_key_id = $1
           AND data::text ILIKE '%' || $2 || '%'
         ORDER BY created_at DESC
         LIMIT 20`,
        [apiKeyId || null, q]
      )
      const results = result.rows.map(r => r.data)
      return res.json({ results, total: results.length, source: 'postgres' })
    } catch (err) {
      console.warn('[Context] DB search failed:', err)
    }
  }

  // MemWal recall fallback (namespace-scoped, not api_key_id)
  try {
    const { MemWalClient } = await import('../memwal/client.js')
    const memwal = new MemWalClient()
    await memwal.connect()
    if (memwal.isAvailable()) {
      const result = await memwal.recall('*', q, 10)
      if (result && result.results.length > 0) {
        return res.json({ results: result.results, total: result.results.length, source: 'memwal' })
      }
    }
  } catch (err) {
    console.warn('[Context] MemWal recall failed:', err)
  }

  // File fallback (unscoped — warning logged)
  console.warn('[Context] Using unscoped file search — no api_key_id filtering available')
  try {
    const sessionFile = join(process.cwd(), 'data', 'Build-Context-Memory.json')
    if (existsSync(sessionFile)) {
      const raw = await readFile(sessionFile, 'utf-8')
      const { sessions } = JSON.parse(raw) as { sessions: any[] }
      const ql = q.toLowerCase()
      const results = sessions.filter((s: any) =>
        JSON.stringify(s).toLowerCase().includes(ql)
      )
      return res.json({ results, total: results.length, source: 'file', warning: 'File mode — sessions not scoped to API key' })
    }
  } catch (err) {
    console.warn('[Context] File fallback failed:', err)
  }

  res.json({ results: [], total: 0, source: 'none' })
})
