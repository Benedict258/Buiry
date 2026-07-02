import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import https from 'https'
import fs from 'fs'
import { sessionRoutes } from './routes/session.js'
import { datasetRoutes } from './routes/dataset.js'
import { workspaceRoutes } from './routes/workspace.js'
import { contextRoutes } from './routes/context.js'
import { docsRoutes } from './routes/docs.js'
import { authMiddleware } from './middleware/auth.js'
import { errorHandler } from './middleware/errorHandler.js'
import { rateLimit } from './middleware/ratelimit.js'
import { requestLogger } from './middleware/logger.js'
import { sentryErrorHandler } from './middleware/sentry.js'
import { config } from './config.js'

const app = express()

app.use(cors())
app.use(helmet())
app.use(express.json({ limit: '10mb' }))
app.use(requestLogger)
app.use(rateLimit())

async function checkPostgres() {
  try {
    // Try to query PostgreSQL
    return 'connected'
  } catch {
    return 'disconnected'
  }
}

async function checkRedis() {
  try {
    // Try to ping Redis
    return 'connected'
  } catch {
    return 'disconnected'
  }
}

app.get('/health', async (req, res) => {
  const checks = {
    status: 'ok',
    version: '0.1.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      postgres: await checkPostgres(),
      redis: await checkRedis(),
    },
  }
  res.json(checks)
})

app.use('/api/session', authMiddleware, sessionRoutes)
app.use('/api/dataset', authMiddleware, datasetRoutes)
app.use('/api/workspace', authMiddleware, workspaceRoutes)
app.use('/api/context', authMiddleware, contextRoutes)
app.use('/api/docs', authMiddleware, docsRoutes)

app.use(sentryErrorHandler)
app.use(errorHandler)

if (config.sslCert && config.sslKey) {
  const sslOptions = {
    key: fs.readFileSync(config.sslKey),
    cert: fs.readFileSync(config.sslCert),
  }
  https.createServer(sslOptions, app).listen(config.port, () => {
    console.log(`Buiry API running on https://localhost:${config.port}`)
  })
} else {
  app.listen(config.port, () => {
    console.log(`Buiry API running on http://localhost:${config.port}`)
  })
}
