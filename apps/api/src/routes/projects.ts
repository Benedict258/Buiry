/**
 * Projects Routes — Project management + file storage + memory view.
 *
 * Users create projects on the dashboard, MCP initializes files in the cloud,
 * and sessions continuously update the memory view. Every API key scopes to
 * its own projects.
 */
import { Router, Request, Response } from 'express'
import {
  createProject,
  listProjects,
  getProject,
  deleteProject,
  listFiles,
  getFile,
  upsertFile,
  composeMemory,
} from '../db/projects.js'

export const projectRoutes = Router()

// ─── Project CRUD ─────────────────────────────────────────────

// GET /api/projects — list all projects (scoped to the API key's key_id)
projectRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const apiKey = (req as any).apiKey
    const projects = await listProjects(apiKey?.id)
    res.json({ projects, total: projects.length })
  } catch (err) {
    console.error('List projects error:', err)
    res.status(500).json({ error: 'Failed to list projects' })
  }
})

// POST /api/projects — create a new project
projectRoutes.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body
    if (!name || typeof name !== 'string' || name.length < 1 || name.length > 255) {
      return res.status(400).json({ error: 'Name is required (1-255 chars)' })
    }

    const apiKey = (req as any).apiKey
    const project = await createProject(name, description || '', apiKey?.id)

    // Create default buiry_init files
    const defaultFiles: Record<string, string> = {
      'AI_Starter.md': `# ${name} — AI Agent Starter\n\n## Project Overview\n${description || 'No description provided.'}\n\n## Getting Started\n1. Clone this repository\n2. Install dependencies\n3. Run the development server\n\n## Agent Instructions\nThis file provides context for AI agents working on this project.`,
      'PRD.md': `# Product Requirements Document — ${name}\n\n## Problem Statement\n\n## Target Users\n\n## Core Features\n\n## Success Metrics\n\n## Timeline`,
      'ARCHITECTURE.md': `# Architecture — ${name}\n\n## Tech Stack\n\n## System Design\n\n## Data Flow\n\n## Deployment`,
      'DEV_PLAN.md': `# Development Plan — ${name}\n\n## Phase 1: Foundation\n\n## Phase 2: Core Features\n\n## Phase 3: Polish\n\n## Phase 4: Launch`,
    }

    for (const [filename, content] of Object.entries(defaultFiles)) {
      await upsertFile(project.id, filename, content)
    }

    res.status(201).json({
      project,
      files_created: Object.keys(defaultFiles),
    })
  } catch (err) {
    console.error('Create project error:', err)
    res.status(500).json({ error: 'Failed to create project' })
  }
})

// GET /api/projects/:id — project detail + file list
projectRoutes.get('/:id', async (req: Request, res: Response) => {
  try {
    const project = await getProject(req.params.id as string)
    if (!project) return res.status(404).json({ error: 'Project not found' })

    const files = await listFiles(project.id)

    res.json({ project, files, total_files: files.length })
  } catch (err) {
    console.error('Get project error:', err)
    res.status(500).json({ error: 'Failed to get project' })
  }
})

// DELETE /api/projects/:id — delete project (cascades to files)
projectRoutes.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await deleteProject(req.params.id as string)
    if (!deleted) return res.status(404).json({ error: 'Project not found' })
    res.json({ deleted: true })
  } catch (err) {
    console.error('Delete project error:', err)
    res.status(500).json({ error: 'Failed to delete project' })
  }
})

// ─── File Operations ──────────────────────────────────────────

// GET /api/projects/:id/files — list files for a project
projectRoutes.get('/:id/files', async (req: Request, res: Response) => {
  try {
    const files = await listFiles(req.params.id as string)
    res.json({ files, total: files.length })
  } catch (err) {
    console.error('List files error:', err)
    res.status(500).json({ error: 'Failed to list files' })
  }
})

// GET /api/projects/:id/files/:filename — get file content
projectRoutes.get('/:id/files/:filename', async (req: Request, res: Response) => {
  try {
    const file = await getFile(req.params.id as string, req.params.filename as string)
    if (!file) return res.status(404).json({ error: 'File not found' })

    res.json({ file })
  } catch (err) {
    console.error('Get file error:', err)
    res.status(500).json({ error: 'Failed to get file' })
  }
})

// PUT /api/projects/:id/files/:filename — upsert file content
projectRoutes.put('/:id/files/:filename', async (req: Request, res: Response) => {
  try {
    const { content } = req.body
    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'content is required' })
    }

    const file = await upsertFile(
      req.params.id as string,
      req.params.filename as string,
      content
    )

    res.json({ file, updated: true })
  } catch (err) {
    console.error('Upsert file error:', err)
    res.status(500).json({ error: 'Failed to save file' })
  }
})

// ─── Memory View ──────────────────────────────────────────────

// GET /api/projects/:id/memory — get Build-Context-Memory.json
projectRoutes.get('/:id/memory', async (req: Request, res: Response) => {
  try {
    const memory = await composeMemory(req.params.id as string)
    res.json(memory)
  } catch (err) {
    console.error('Memory compose error:', err)
    res.status(500).json({ error: 'Failed to compose memory' })
  }
})
