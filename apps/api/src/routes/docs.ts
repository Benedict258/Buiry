import { Router, Request, Response } from 'express'

export const docsRoutes = Router()

docsRoutes.post('/generate', (req: Request, res: Response) => {
  const { type, context } = req.body as { type?: string; context?: string }
  res.json({
    docId: `doc_${Date.now()}`,
    type: type ?? 'readme',
    context: context ?? '',
    status: 'generated',
    content: `# Generated Document\n\nType: ${type ?? 'readme'}\nGenerated at: ${new Date().toISOString()}\n\nThis is a placeholder. Connect a generation provider for real output.`,
  })
})
