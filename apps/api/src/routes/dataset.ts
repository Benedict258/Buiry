import { Router, Request, Response } from 'express'
import { BuiryWalrusClient } from '../walrus/client.js'
import { BuirySuiClient } from '../sui/client.js'

export const datasetRoutes = Router()

const walrusClient = new BuiryWalrusClient()
const suiClient = new BuirySuiClient()
walrusClient.connect().catch(() => {})

const mockDatasets = [
  { id: 'ds_1', name: 'Session Logs', rows: 1240, size: '4.2 MB', created: '2026-06-15' },
  { id: 'ds_2', name: 'Code Embeddings', rows: 8900, size: '12.8 MB', created: '2026-06-20' },
  { id: 'ds_3', name: 'Decision History', rows: 340, size: '1.1 MB', created: '2026-06-28' },
]

datasetRoutes.get('/', (req: Request, res: Response) => {
  res.json({ datasets: mockDatasets })
})

datasetRoutes.get('/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const ds = mockDatasets.find(d => d.id === id)
  if (!ds) return res.status(404).json({ error: 'Dataset not found' })
  res.json(ds)
})

datasetRoutes.post('/list', async (req: Request, res: Response) => {
  const { datasetId, price } = req.body as { datasetId?: string; price?: number }
  if (!datasetId) return res.status(400).json({ error: 'datasetId is required' })

  // Use Sui client to list on marketplace
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

  // Fallback: mock listing
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

  // Upload to Walrus if available
  if (walrusClient.isAvailable()) {
    try {
      const buffer = Buffer.from(data, 'base64')
      const result = await walrusClient.uploadBlob(buffer, metadata || {})
      if (result) {
        return res.json({ blobId: result.blobId, status: 'uploaded', storage: 'walrus' })
      }
    } catch (err) {
      console.warn('[Dataset] Walrus upload failed:', err)
    }
  }

  res.json({ blobId: `blob_${Date.now()}`, status: 'uploaded', storage: 'local' })
})
