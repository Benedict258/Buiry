import { query, getPool } from '../db/pool.js'

export async function initApiKeysTable() {
  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      project_id VARCHAR(255) NOT NULL DEFAULT 'default',
      key_hash VARCHAR(64) NOT NULL UNIQUE,
      key_prefix VARCHAR(12) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_used_at TIMESTAMPTZ,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_by VARCHAR(255) DEFAULT 'system'
    )
  `)
  await pool.query(`
    ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id)
  `)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys (key_hash)
  `)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys (is_active) WHERE is_active = TRUE
  `)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys (user_id) WHERE user_id IS NOT NULL
  `)
}

export async function getKeyByHash(hash: string) {
  const result = await query(
    'SELECT id, name, project_id, key_prefix, is_active, last_used_at, created_by, user_id FROM api_keys WHERE key_hash = $1 AND is_active = TRUE',
    [hash]
  )
  return result.rows[0] || null
}

export async function listKeys(projectId?: string) {
  const rows = projectId
    ? (await query(
        'SELECT id, name, project_id, key_prefix, is_active, created_at, last_used_at FROM api_keys WHERE project_id = $1 ORDER BY created_at DESC',
        [projectId]
      )).rows
    : (await query(
        'SELECT id, name, project_id, key_prefix, is_active, created_at, last_used_at FROM api_keys ORDER BY created_at DESC'
      )).rows
  return rows
}

export async function createKey(name: string, keyHash: string, keyPrefix: string, projectId = 'default', createdBy?: string, userId?: string) {
  const result = await query(
    'INSERT INTO api_keys (name, project_id, key_hash, key_prefix, created_by, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, project_id, key_prefix, is_active, created_at',
    [name, projectId, keyHash, keyPrefix, createdBy || 'system', userId || null]
  )
  return result.rows[0]
}

export async function revokeKey(id: string) {
  const result = await query(
    'UPDATE api_keys SET is_active = FALSE WHERE id = $1 RETURNING id, name, is_active',
    [id]
  )
  return result.rows[0] || null
}

export async function touchKey(hash: string) {
  await query(
    'UPDATE api_keys SET last_used_at = NOW() WHERE key_hash = $1',
    [hash]
  )
}

export async function bootstrapDefaultKey(defaultHash: string, defaultPrefix: string) {
  const existing = await getKeyByHash(defaultHash)
  if (!existing) {
    await createKey('Default Dev Key', defaultHash, defaultPrefix, 'default')
    console.log('Bootstrapped default API key')
  }
}

export async function getUserByToken(token: string) {
  const result = await query(
    `SELECT users.id, users.email, users.name, users.created_at
     FROM tokens
     JOIN users ON users.id = tokens.user_id
     WHERE tokens.token = $1`,
    [token]
  )
  return result.rows[0] || null
}

export async function getOrCreateUserApiKey(userId: string, userEmail: string) {
  const existing = await query(
    'SELECT id, name, project_id, key_prefix, is_active, created_at, last_used_at FROM api_keys WHERE user_id = $1 AND is_active = TRUE LIMIT 1',
    [userId]
  )
  if (existing.rows.length > 0) {
    return existing.rows[0]
  }

  const crypto = await import('crypto')
  const rawKey = `buiry_sk_${crypto.randomBytes(24).toString('hex')}`
  const prefix = rawKey.slice(0, 12)
  const hash = crypto.createHash('sha256').update(rawKey).digest('hex')

  await createKey(userEmail, hash, prefix, 'default', userEmail, userId)

  return { raw_key: rawKey, key_prefix: prefix }
}
