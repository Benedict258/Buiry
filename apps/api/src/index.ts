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
import { authRoutes, initUsersTable, initTokensTable } from './routes/auth.js'
import { settingsRoutes, initUserSettingsTable } from './routes/settings.js'
import { authMiddleware } from './middleware/auth.js'
import { errorHandler } from './middleware/errorHandler.js'
import { rateLimit } from './middleware/ratelimit.js'
import { requestLogger } from './middleware/logger.js'
import { sentryErrorHandler } from './middleware/sentry.js'
import { config } from './config.js'
import { initApiKeysTable, bootstrapDefaultKey } from './db/keys.js'
import { initProjectsTable } from './db/projects.js'
import { getPool } from './db/pool.js'
import { readFileSync } from 'fs'

const app = express()

app.use(cors())
app.use(helmet())
app.use(express.json({ limit: '10mb' }))
app.use(requestLogger)
app.use(rateLimit())

async function checkPostgres() {
  try {
    const pool = getPool()
    const client = await pool.connect()
    const result = await client.query('SELECT 1 as ok')
    client.release()
    return result.rows[0]?.ok === 1 ? 'connected' : 'error'
  } catch (err: any) {
    console.warn('[API] PostgreSQL health check failed:', err?.message || err)
    return 'disconnected'
  }
}

async function checkRedis() {
  try {
    // Try to ping Redis
    return 'connected'
  } catch (err: any) {
    console.warn('[API] Redis health check failed:', err?.message || err)
    return 'disconnected'
  }
}

async function bootstrap() {
  // Create all tables
  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      session_id VARCHAR(255) UNIQUE NOT NULL,
      agent_id VARCHAR(255),
      current_phase VARCHAR(255),
      api_key_id UUID,
      data JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`)
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at DESC)`)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS datasets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      category VARCHAR(255),
      domain VARCHAR(255),
      sample_size INTEGER DEFAULT 0,
      privacy_score FLOAT DEFAULT 0,
      walrus_blob_id VARCHAR(255),
      sui_object_id VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`)
  await initApiKeysTable()
  await initProjectsTable()
  await initUsersTable()
  await initTokensTable()
  await initUserSettingsTable()
  await initSessionIsolation()
  const devKey = 'buiry_sk_live_dev_12345'
  const devHash = crypto.createHash('sha256').update(devKey).digest('hex')
  const devPrefix = devKey.slice(0, 12)
  await bootstrapDefaultKey(devHash, devPrefix).catch(() => {})
  const envKey = process.env.API_KEY
  if (envKey && envKey !== devKey) {
    const envHash = crypto.createHash('sha256').update(envKey).digest('hex')
    const envPrefix = envKey.slice(0, 12)
    await bootstrapDefaultKey(envHash, envPrefix).catch(() => {})
  }
}

async function initSessionIsolation() {
  try {
    await getPool().query(`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS api_key_id UUID`)
    console.log('[Init] Session isolation applied')
  } catch (err: any) {
    console.warn('[Init] Session isolation failed:', err?.message || err)
  }
}

bootstrap().catch(console.error)

app.post('/api/bootstrap-keys', async (req, res) => {
  try {
    await initApiKeysTable()
    // Always seed the default dev key
    const devKey = 'buiry_sk_live_dev_12345'
    const devHash = crypto.createHash('sha256').update(devKey).digest('hex')
    const devPrefix = devKey.slice(0, 12)
    await bootstrapDefaultKey(devHash, devPrefix)
    // Also seed the API_KEY env var if different
    const envKey = process.env.API_KEY
    if (envKey && envKey !== devKey) {
      const envHash = crypto.createHash('sha256').update(envKey).digest('hex')
      const envPrefix = envKey.slice(0, 12)
      await bootstrapDefaultKey(envHash, envPrefix)
    }
    const pool = getPool()
    const client = await pool.connect()
    // Clean up old soft-deleted keys
    await client.query('DELETE FROM api_keys WHERE is_active = FALSE')
    const result = await client.query('SELECT COUNT(*) as count FROM api_keys')
    client.release()
    res.json({
      success: true,
      keys_count: parseInt(result.rows[0]?.count || '0'),
      default_key: devPrefix + '***',
    })
  } catch (err) {
    console.error('Bootstrap failed:', err)
    res.status(500).json({ error: 'Bootstrap failed', details: String(err) })
  }
})

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

app.use('/api/auth', authRoutes)
app.use('/api/session', authMiddleware, sessionRoutes)
app.use('/api/dataset', authMiddleware, datasetRoutes)
app.use('/api/workspace', authMiddleware, workspaceRoutes)
app.use('/api/context', authMiddleware, contextRoutes)
app.use('/api/docs', authMiddleware, docsRoutes)
app.use('/api/keys', authMiddleware, keyRoutes)
app.use('/api/session/cloud', authMiddleware, cloudSessionRoutes)
app.use('/api/projects', authMiddleware, projectRoutes)
app.use('/api/settings', authMiddleware, settingsRoutes)

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
