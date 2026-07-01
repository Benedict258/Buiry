import { Router, Request, Response } from 'express'

export const datasetRoutes = Router()

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

datasetRoutes.post('/list', (req: Request, res: Response) => {
  const { datasetId, price } = req.body as { datasetId?: string; price?: number }
  if (!datasetId) return res.status(400).json({ error: 'datasetId is required' })
  res.json({
    listingId: `lst_${Date.now()}`,
    datasetId,
    price: price ?? 0,
    status: 'listed',
    marketplace: 'buiry-hub',
  })
})
