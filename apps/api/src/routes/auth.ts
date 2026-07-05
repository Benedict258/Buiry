import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import crypto from 'crypto'
import { query, getPool } from '../db/pool.js'

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

async function getUserByToken(token: string) {
  const result = await query(
    `SELECT users.id, users.email, users.name, users.created_at
     FROM tokens
     JOIN users ON users.id = tokens.user_id
     WHERE tokens.token = $1`,
    [token]
  )
  return result.rows[0] || null
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

    res.status(201).json({ user, token })
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
    res.json({ user: safeUser, token })
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
