import { Request, Response, NextFunction } from 'express'

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string
  if (!apiKey || !apiKey.startsWith('buiry_')) {
    return res.status(401).json({ error: 'Invalid or missing API key' })
  }
  next()
}
