import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import { getKeyByHash, touchKey } from '../db/keys.js'

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string

  if (!apiKey || !apiKey.startsWith('buiry_')) {
    return res.status(401).json({ error: 'Invalid or missing API key' })
  }

  const hash = hashKey(apiKey)

  getKeyByHash(hash)
    .then((keyRecord) => {
      if (!keyRecord) {
        return res.status(401).json({ error: 'Invalid API key — not found or revoked' })
      }

      touchKey(hash).catch(() => {})

      ;(req as any).apiKey = {
        id: keyRecord.id,
        name: keyRecord.name,
        projectId: keyRecord.project_id,
      }

      next()
    })
    .catch((err) => {
      console.error('Auth DB error:', err)
      res.status(500).json({ error: 'Authentication service unavailable' })
    })
}
