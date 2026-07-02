import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { sessionRoutes } from './routes/session.js'
import { datasetRoutes } from './routes/dataset.js'
import { workspaceRoutes } from './routes/workspace.js'
import { contextRoutes } from './routes/context.js'
import { docsRoutes } from './routes/docs.js'
import { authMiddleware } from './middleware/auth.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(helmet())
app.use(express.json({ limit: '10mb' }))

app.get('/health', (req, res) => res.json({ status: 'ok', version: '0.1.0' }))

app.use('/api/session', authMiddleware, sessionRoutes)
app.use('/api/dataset', authMiddleware, datasetRoutes)
app.use('/api/workspace', authMiddleware, workspaceRoutes)
app.use('/api/context', authMiddleware, contextRoutes)
app.use('/api/docs', authMiddleware, docsRoutes)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Buiry API running on port ${PORT}`)
})
