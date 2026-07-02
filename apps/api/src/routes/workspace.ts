import { Router, Request, Response } from 'express'
import { query } from '../db/pool.js'

export const workspaceRoutes = Router()

const HAS_DB = !!process.env.DATABASE_URL

interface Workspace {
  id: string
  name: string
  owner: string
  created: string
  datasets: string[]
}

const workspaces = new Map<string, Workspace>()

workspaceRoutes.post('/', async (req: Request, res: Response) => {
  const { name, description, ownerAddress } = req.body as { name?: string; description?: string; ownerAddress?: string }
  if (!name) return res.status(400).json({ error: 'name is required' })

  if (HAS_DB) {
    try {
      const result = await query(
        `INSERT INTO workspaces (name, description, owner_address)
         VALUES ($1, $2, $3)
         RETURNING id, name, description, owner_address, created_at`,
        [name, description || null, ownerAddress || 'api_user']
      )
      const row = result.rows[0]
      return res.json({
        id: `ws_${row.id}`,
        name: row.name,
        owner: row.owner_address,
        created: row.created_at,
        datasets: [],
      })
    } catch (err) {
      console.warn('[Workspace] DB insert failed:', err)
    }
  }

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

workspaceRoutes.get('/:id', async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

  if (HAS_DB) {
    try {
      const numericId = id.replace('ws_', '')
      const result = await query(
        `SELECT id, name, description, owner_address, created_at
         FROM workspaces
         WHERE id = $1`,
        [numericId]
      )
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Workspace not found' })
      }
      const row = result.rows[0]
      return res.json({
        id: `ws_${row.id}`,
        name: row.name,
        owner: row.owner_address,
        created: row.created_at,
        datasets: [],
      })
    } catch (err) {
      console.warn('[Workspace] DB query failed:', err)
    }
  }

  const ws = workspaces.get(id)
  if (!ws) return res.status(404).json({ error: 'Workspace not found' })
  res.json(ws)
})
