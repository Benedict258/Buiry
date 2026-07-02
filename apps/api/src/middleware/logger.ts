// Request Logger — Structured JSON logging for all requests
// Logs: timestamp, method, path, status, response time, IP, user agent
import { Request, Response, NextFunction } from 'express'

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    const log = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      apiKey: req.headers['x-api-key'] ? '***' : undefined,
    }

    if (res.statusCode >= 500) {
      console.error(JSON.stringify(log))
    } else if (res.statusCode >= 400) {
      console.warn(JSON.stringify(log))
    } else {
      console.log(JSON.stringify(log))
    }
  })

  next()
}
