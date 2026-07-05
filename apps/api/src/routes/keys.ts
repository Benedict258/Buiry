import { Router, Request, Response } from 'express'
import crypto from 'crypto'
import { listKeys, createKey, revokeKey } from '../db/keys.js'

export const keyRoutes = Router()

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

// GET /api/keys — list all keys (masked)
keyRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const projectId = (req.query.project_id as string) || undefined
    const keys = await listKeys(projectId)
    res.json({ keys, total: keys.length })
  } catch (err) {
    console.error('List keys error:', err)
    res.status(500).json({ error: 'Failed to list keys' })
  }
})

// POST /api/keys — create a new API key
keyRoutes.post('/', async (req: Request, res: Response) => {
  try {
    const { name, project_id } = req.body

    if (!name || typeof name !== 'string' || name.length < 1 || name.length > 255) {
      return res.status(400).json({ error: 'Name is required (1-255 chars)' })
    }

    const rawKey = `buiry_sk_${crypto.randomBytes(24).toString('hex')}`
    const prefix = rawKey.slice(0, 12)
    const hash = hashKey(rawKey)

    const key = await createKey(name, hash, prefix, project_id || 'default')

    res.status(201).json({
      key: key,
      api_key: rawKey,
      warning: 'Store this key securely. It will not be shown again.',
    })
  } catch (err) {
    console.error('Create key error:', err)
    res.status(500).json({ error: 'Failed to create key' })
  }
})

// DELETE /api/keys/:id — revoke a key
keyRoutes.delete('/:id', async (req: Request, res: Response) => {
  try {
    const key = await revokeKey(req.params.id as string)
    if (!key) {
      return res.status(404).json({ error: 'Key not found' })
    }
    res.json({ revoked: key })
  } catch (err) {
    console.error('Revoke key error:', err)
    res.status(500).json({ error: 'Failed to revoke key' })
  }
})
