import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { query, getPool } from '../db/pool.js'

export const settingsRoutes = Router()

export async function initUserSettingsTable() {
  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      api_key_id UUID NOT NULL UNIQUE REFERENCES api_keys(id) ON DELETE CASCADE,
      auto_capture BOOLEAN DEFAULT TRUE,
      custom_domain VARCHAR(255),
      region VARCHAR(255) DEFAULT 'us-east-1',
      log_retention VARCHAR(255) DEFAULT '30 days',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_user_settings_api_key ON user_settings (api_key_id)
  `)
}

const SettingsSchema = z.object({
  auto_capture: z.boolean().optional(),
  custom_domain: z.string().max(255).optional(),
  region: z.string().max(255).optional(),
  log_retention: z.string().max(255).optional(),
})

settingsRoutes.get('/profile', async (req: Request, res: Response) => {
  try {
    const apiKey = (req as any).apiKey
    if (!apiKey?.id) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const result = await query(
      'SELECT auto_capture, custom_domain, region, log_retention, updated_at FROM user_settings WHERE api_key_id = $1',
      [apiKey.id]
    )

    const row = result.rows[0] || {}
    const settings = {
      auto_capture: row.auto_capture ?? true,
      custom_domain: row.custom_domain ?? null,
      region: row.region ?? 'us-east-1',
      log_retention: row.log_retention ?? '30 days',
    }

    res.json({ settings })
  } catch (err) {
    console.error('Get settings error:', err)
    res.status(500).json({ error: 'Failed to get settings' })
  }
})

settingsRoutes.put('/profile', async (req: Request, res: Response) => {
  try {
    const apiKey = (req as any).apiKey
    if (!apiKey?.id) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const parsed = SettingsSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() })
    }

    const { auto_capture, custom_domain, region, log_retention } = parsed.data

    const result = await query(
      `INSERT INTO user_settings (api_key_id, auto_capture, custom_domain, region, log_retention)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (api_key_id)
       DO UPDATE SET
         auto_capture = COALESCE($2, user_settings.auto_capture),
         custom_domain = COALESCE($3, user_settings.custom_domain),
         region = COALESCE($4, user_settings.region),
         log_retention = COALESCE($5, user_settings.log_retention),
         updated_at = NOW()
       RETURNING auto_capture, custom_domain, region, log_retention, updated_at`,
      [apiKey.id, auto_capture ?? null, custom_domain ?? null, region ?? null, log_retention ?? null]
    )

    const row = result.rows[0]
    const settings = {
      auto_capture: row.auto_capture ?? true,
      custom_domain: row.custom_domain ?? null,
      region: row.region ?? 'us-east-1',
      log_retention: row.log_retention ?? '30 days',
    }

    res.json({ settings, updated: true })
  } catch (err) {
    console.error('Update settings error:', err)
    res.status(500).json({ error: 'Failed to update settings' })
  }
})
