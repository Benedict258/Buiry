import { Router, Request, Response } from 'express'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

export const contextRoutes = Router()

interface Session {
  id: string
  timestamp: string
  summary: string
  decisions: string[]
  nextSteps: string[]
}

contextRoutes.post('/search', async (req: Request, res: Response) => {
  const { query } = req.body as { query?: string }
  if (!query) return res.status(400).json({ error: 'query is required' })

  const sessionFile = join(process.cwd(), 'data', 'Build-Context-Memory.json')
  if (!existsSync(sessionFile)) return res.json({ results: [], total: 0 })

  const raw = await readFile(sessionFile, 'utf-8')
  const { sessions } = JSON.parse(raw) as { sessions: Session[] }
  const q = query.toLowerCase()
  const results = sessions.filter(s =>
    s.summary.toLowerCase().includes(q) ||
    s.decisions.some(d => d.toLowerCase().includes(q)) ||
    s.nextSteps.some(n => n.toLowerCase().includes(q))
  )
  res.json({ results, total: results.length })
})
