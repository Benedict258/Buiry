import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

export const sessionRoutes = Router()

const SESSION_FILE = join(process.cwd(), 'data', 'Build-Context-Memory.json')

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
  } catch {
    return { project_identity: {}, sessions: [] }
  }
}

async function writeContext(data: BuildContextMemory): Promise<void> {
  const dir = join(process.cwd(), 'data')
  if (!existsSync(dir)) await mkdir(dir, { recursive: true })
  await writeFile(SESSION_FILE, JSON.stringify(data, null, 2))
}

sessionRoutes.post('/start', async (req: Request, res: Response) => {
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
  const context = await readContext()
  const session: Session = {
    id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...parsed.data,
  }
  context.sessions.push(session)
  await writeContext(context)
  res.json({ sessionId: session.id, timestamp: session.timestamp })
})

sessionRoutes.get('/:id', async (req: Request, res: Response) => {
  const context = await readContext()
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const session = context.sessions.find(s => s.id === id)
  if (!session) return res.status(404).json({ error: 'Session not found' })
  res.json(session)
})

sessionRoutes.post('/search', async (req: Request, res: Response) => {
  const { query } = req.body as { query?: string }
  if (!query) return res.status(400).json({ error: 'query is required' })
  const context = await readContext()
  const q = query.toLowerCase()
  const results = context.sessions.filter(s =>
    s.summary.toLowerCase().includes(q) ||
    s.decisions.some(d => d.toLowerCase().includes(q)) ||
    s.nextSteps.some(n => n.toLowerCase().includes(q))
  )
  res.json({ results, total: results.length })
})
