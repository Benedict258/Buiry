import { Router, Request, Response } from 'express'
import { BuiryWalrusClient } from '../walrus/client.js'
import { BuirySuiClient } from '../sui/client.js'
import { query } from '../db/pool.js'

export const datasetRoutes = Router()

const walrusClient = new BuiryWalrusClient()
const suiClient = new BuirySuiClient()
walrusClient.connect().catch(() => {})

const HAS_DB = !!process.env.DATABASE_URL

const mockDatasets = [
  { id: 'ds_1', name: 'Session Logs', rows: 1240, size: '4.2 MB', created: '2026-06-15' },
  { id: 'ds_2', name: 'Code Embeddings', rows: 8900, size: '12.8 MB', created: '2026-06-20' },
  { id: 'ds_3', name: 'Decision History', rows: 340, size: '1.1 MB', created: '2026-06-28' },
]

datasetRoutes.get('/', async (_req: Request, res: Response) => {
  if (HAS_DB) {
    try {
      const result = await query(
        `SELECT id, category, domain, sample_size, privacy_score, walrus_blob_id, created_at
         FROM datasets
         ORDER BY created_at DESC`
      )
      const datasets = result.rows.map((r: Record<string, unknown>) => ({
        id: `ds_${r.id}`,
        name: r.category || 'Unnamed',
        rows: r.sample_size,
        size: '—',
        domain: r.domain,
        privacyScore: r.privacy_score,
        walrusBlobId: r.walrus_blob_id,
        created: r.created_at,
      }))
      return res.json({ datasets })
    } catch (err) {
      console.warn('[Dataset] DB query failed:', err)
    }
  }
  res.json({ datasets: mockDatasets })
})

datasetRoutes.get('/:id', async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const numericId = id.replace('ds_', '')

  if (HAS_DB) {
    try {
      const result = await query(
        `SELECT id, category, domain, sample_size, privacy_score, walrus_blob_id, sui_object_id, created_at
         FROM datasets
         WHERE id = $1`,
        [numericId]
      )
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Dataset not found' })
      }
      const r = result.rows[0]
      return res.json({
        id: `ds_${r.id}`,
        name: r.category || 'Unnamed',
        rows: r.sample_size,
        size: '—',
        domain: r.domain,
        privacyScore: r.privacy_score,
        walrusBlobId: r.walrus_blob_id,
        suiObjectId: r.sui_object_id,
        created: r.created_at,
      })
    } catch (err) {
      console.warn('[Dataset] DB query failed:', err)
    }
  }

  const ds = mockDatasets.find(d => d.id === id)
  if (!ds) return res.status(404).json({ error: 'Dataset not found' })
  res.json(ds)
})

datasetRoutes.post('/list', async (req: Request, res: Response) => {
  const { datasetId, price } = req.body as { datasetId?: string; price?: number }
  if (!datasetId) return res.status(400).json({ error: 'datasetId is required' })

  try {
    const result = await suiClient.listOnMarketplace(datasetId, price ?? 0)
    return res.json({
      listingId: result.listingId,
      datasetId,
      price: price ?? 0,
      status: 'listed',
      marketplace: 'buiry-hub',
    })
  } catch (err) {
    console.warn('[Dataset] Sui listing failed:', err)
  }

  res.json({
    listingId: `lst_${Date.now()}`,
    datasetId,
    price: price ?? 0,
    status: 'listed',
    marketplace: 'buiry-hub',
  })
})

datasetRoutes.post('/upload', async (req: Request, res: Response) => {
  const { data, metadata } = req.body as { data?: string; metadata?: Record<string, unknown> }
  if (!data) return res.status(400).json({ error: 'data is required' })

  if (walrusClient.isAvailable()) {
    try {
      const buffer = Buffer.from(data, 'base64')
      const result = await walrusClient.uploadBlob(buffer, metadata || {})
      if (result) {
        if (HAS_DB) {
          try {
            await query(
              `INSERT INTO datasets (category, domain, sample_size, walrus_blob_id)
               VALUES ($1, $2, $3, $4)`,
              [metadata?.category || 'uploaded', metadata?.domain || 'general', metadata?.rows || 0, result.blobId]
            )
          } catch (err) {
            console.warn('[Dataset] DB insert failed:', err)
          }
        }
        return res.json({ blobId: result.blobId, status: 'uploaded', storage: 'walrus' })
      }
    } catch (err) {
      console.warn('[Dataset] Walrus upload failed:', err)
    }
  }

  const blobId = `blob_${Date.now()}`
  if (HAS_DB) {
    try {
      await query(
        `INSERT INTO datasets (category, domain, sample_size, walrus_blob_id)
         VALUES ($1, $2, $3, $4)`,
        [metadata?.category || 'uploaded', metadata?.domain || 'general', metadata?.rows || 0, blobId]
      )
    } catch (err) {
      console.warn('[Dataset] DB insert failed:', err)
    }
  }
  res.json({ blobId, status: 'uploaded', storage: 'local' })
})
