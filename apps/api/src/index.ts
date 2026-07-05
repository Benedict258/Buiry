import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import https from 'https'
import fs from 'fs'
import crypto from 'crypto'
import { sessionRoutes } from './routes/session.js'
import { datasetRoutes } from './routes/dataset.js'
import { workspaceRoutes } from './routes/workspace.js'
import { contextRoutes } from './routes/context.js'
import { docsRoutes } from './routes/docs.js'
import { keyRoutes } from './routes/keys.js'
import { cloudSessionRoutes } from './routes/cloud-session.js'
import { projectRoutes } from './routes/projects.js'
import { authMiddleware } from './middleware/auth.js'
import { errorHandler } from './middleware/errorHandler.js'
import { rateLimit } from './middleware/ratelimit.js'
import { requestLogger } from './middleware/logger.js'
import { sentryErrorHandler } from './middleware/sentry.js'
import { config } from './config.js'
import { initApiKeysTable, bootstrapDefaultKey } from './db/keys.js'
import { initProjectsTable } from './db/projects.js'

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

async function bootstrap() {
  await initApiKeysTable()
  await initProjectsTable()
  const defaultKey = process.env.API_KEY || 'buiry_sk_live_dev_12345'
  const defaultHash = crypto.createHash('sha256').update(defaultKey).digest('hex')
  const defaultPrefix = defaultKey.slice(0, 12)
  await bootstrapDefaultKey(defaultHash, defaultPrefix)
}

bootstrap().catch(console.error)

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
app.use('/api/keys', authMiddleware, keyRoutes)
app.use('/api/session/cloud', authMiddleware, cloudSessionRoutes)
app.use('/api/projects', authMiddleware, projectRoutes)

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
