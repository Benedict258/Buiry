import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import crypto from 'crypto'
import { query, getPool } from '../db/pool.js'
import { getOrCreateUserApiKey, getUserByToken, createKey } from '../db/keys.js'

export const authRoutes = Router()

export async function initUsersTable() {
  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255),
      password_hash VARCHAR(128) NOT NULL,
      salt VARCHAR(64) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)
  `)
}

export async function initTokensTable() {
  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(128) UNIQUE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_tokens_token ON tokens (token)
  `)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON tokens (user_id)
  `)
}

function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(32).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return { hash, salt }
}

function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return hash === storedHash
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function bearerAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' })
  }
  const token = header.slice(7)
  if (!token) {
    return res.status(401).json({ error: 'Missing token' })
  }

  getUserByToken(token)
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: 'Invalid or expired token' })
      }
      ;(req as any).user = user
      ;(req as any).token = token
      next()
    })
    .catch((err) => {
      console.error('Bearer auth error:', err)
      res.status(500).json({ error: 'Authentication service unavailable' })
    })
}

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(255).optional(),
})

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

authRoutes.post('/signup', async (req: Request, res: Response) => {
  try {
    const parsed = SignupSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() })
    }

    const { email, password, name } = parsed.data

    const existing = await query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const { hash, salt } = hashPassword(password)
    const result = await query(
      'INSERT INTO users (email, name, password_hash, salt) VALUES ($1, $2, $3, $4) RETURNING id, email, name, created_at',
      [email, name || null, hash, salt]
    )
    const user = result.rows[0]

    const token = generateToken()
    await query(
      'INSERT INTO tokens (user_id, token) VALUES ($1, $2)',
      [user.id, token]
    )

    const apiKeyResult = await getOrCreateUserApiKey(user.id, user.email)
    const apiKey = (apiKeyResult as any).raw_key

    res.status(201).json({ user, token, api_key: apiKey })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ error: 'Failed to create account' })
  }
})

authRoutes.post('/login', async (req: Request, res: Response) => {
  try {
    const parsed = LoginSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() })
    }

    const { email, password } = parsed.data

    const result = await query(
      'SELECT id, email, name, password_hash, salt, created_at FROM users WHERE email = $1',
      [email]
    )
    const user = result.rows[0]
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    if (!verifyPassword(password, user.salt, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = generateToken()
    await query(
      'INSERT INTO tokens (user_id, token) VALUES ($1, $2)',
      [user.id, token]
    )

    const { password_hash, salt, ...safeUser } = user

    const existingKey = await query(
      'SELECT key_prefix FROM api_keys WHERE user_id = $1 AND is_active = TRUE LIMIT 1',
      [user.id]
    )
    const apiKeyPrefix = existingKey.rows[0]?.key_prefix || null

    res.json({ user: safeUser, token, api_key_prefix: apiKeyPrefix })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Failed to login' })
  }
})

authRoutes.get('/me', bearerAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user
    res.json({ user })
  } catch (err) {
    console.error('Get me error:', err)
    res.status(500).json({ error: 'Failed to get user' })
  }
})

authRoutes.post('/key', bearerAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user

    const rawKey = `buiry_sk_${crypto.randomBytes(24).toString('hex')}`
    const prefix = rawKey.slice(0, 12)
    const hash = crypto.createHash('sha256').update(rawKey).digest('hex')

    const key = await createKey(user.email, hash, prefix, 'default', user.email, user.id)

    res.status(201).json({
      key,
      api_key: rawKey,
      warning: 'Store this key securely. It will not be shown again.',
    })
  } catch (err) {
    console.error('Create user key error:', err)
    res.status(500).json({ error: 'Failed to create API key' })
  }
})

authRoutes.get('/key', bearerAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user

    const result = await query(
      'SELECT id, name, project_id, key_prefix, is_active, created_at, last_used_at FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id]
    )

    res.json({ keys: result.rows })
  } catch (err) {
    console.error('Get user keys error:', err)
    res.status(500).json({ error: 'Failed to get API keys' })
  }
})
