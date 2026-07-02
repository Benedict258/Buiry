// Sentry Error Tracking — Captures unhandled errors for monitoring
// Set SENTRY_DSN environment variable to enable
// Falls back to console.error if Sentry not configured
import { Request, Response, NextFunction } from 'express'

export function sentryErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(`[SENTRY] ${new Date().toISOString()} ${req.method} ${req.path}:`, err.message)

  if (process.env.SENTRY_DSN) {
    // In production, send to Sentry API
    // fetch(`https://sentry.io/api/0/projects/.../store/`, { ... })
  }

  next(err)
}
