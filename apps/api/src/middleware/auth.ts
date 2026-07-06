import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import { getKeyByHash, touchKey, getUserByToken, getOrCreateUserApiKey } from '../db/keys.js'

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const apiKeyHeader = req.headers['x-api-key'] as string
  const bearerHeader = req.headers.authorization

  if (apiKeyHeader && apiKeyHeader.startsWith('buiry_')) {
    const hash = hashKey(apiKeyHeader)

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
    return
  }

  if (bearerHeader && bearerHeader.startsWith('Bearer ')) {
    const token = bearerHeader.slice(7)
    if (!token) {
      return res.status(401).json({ error: 'Missing token' })
    }

    getUserByToken(token)
      .then((user) => {
        if (!user) {
          return res.status(401).json({ error: 'Invalid or expired token' })
        }

        getOrCreateUserApiKey(user.id, user.email)
          .then((apiKey) => {
            if ((apiKey as any).raw_key) {
              const newKey = apiKey as any
              ;(req as any).apiKey = {
                id: null,
                name: user.email,
                projectId: 'default',
              }
              ;(req as any)._freshApiKey = newKey.raw_key
            } else {
              ;(req as any).apiKey = {
                id: (apiKey as any).id,
                name: (apiKey as any).name,
                projectId: (apiKey as any).project_id || 'default',
              }
            }

            next()
          })
          .catch((err) => {
            console.error('User API key error:', err)
            res.status(500).json({ error: 'Failed to provision API key' })
          })
      })
      .catch((err) => {
        console.error('Bearer auth error:', err)
        res.status(500).json({ error: 'Authentication service unavailable' })
      })
    return
  }

  return res.status(401).json({ error: 'Invalid or missing API key. Provide x-api-key header or Authorization: Bearer <token>' })
}
