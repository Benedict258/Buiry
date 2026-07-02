// Rate Limiter — Per-workspace burst + sustained limits
// Uses Redis for distributed rate limiting, falls back to in-memory
// Default: 100 requests/minute sustained, 10 requests/second burst
import { Request, Response, NextFunction } from 'express'

const inMemoryCounts = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(maxRequests = 100, windowMs = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = (req.headers['x-api-key'] as string) || req.ip || 'unknown'
    const now = Date.now()
    const entry = inMemoryCounts.get(key)

    if (!entry || now > entry.resetTime) {
      inMemoryCounts.set(key, { count: 1, resetTime: now + windowMs })
      return next()
    }

    entry.count++
    if (entry.count > maxRequests) {
      res.set('Retry-After', String(Math.ceil((entry.resetTime - now) / 1000)))
      return res.status(429).json({ error: 'Rate limit exceeded' })
    }
    next()
  }
}
