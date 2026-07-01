import { Router, Request, Response } from 'express'

export const workspaceRoutes = Router()

interface Workspace {
  id: string
  name: string
  owner: string
  created: string
  datasets: string[]
}

const workspaces = new Map<string, Workspace>()

workspaceRoutes.post('/', (req: Request, res: Response) => {
  const { name } = req.body as { name?: string }
  if (!name) return res.status(400).json({ error: 'name is required' })
  const ws: Workspace = {
    id: `ws_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    owner: 'api_user',
    created: new Date().toISOString(),
    datasets: [],
  }
  workspaces.set(ws.id, ws)
  res.json(ws)
})

workspaceRoutes.get('/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const ws = workspaces.get(id)
  if (!ws) return res.status(404).json({ error: 'Workspace not found' })
  res.json(ws)
})
