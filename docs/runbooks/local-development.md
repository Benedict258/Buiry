# Local Development Setup

## Prerequisites
- Node.js 20+
- Docker
- Git

## Quick Start
1. Clone repo: git clone https://github.com/Benedict258/Buiry.git
2. Start databases: docker compose up -d postgres redis
3. Install deps: npm install (root)
4. Start backend: cd apps/api && npm run dev
5. Start frontend: cd apps/web && npm run dev
6. Start MCP: cd packages/buiry-mcp && npm run build && node dist/index.js

## Environment Variables
Copy .env.example to .env and fill in your values.

## Common Issues
- Port 5432 in use: docker compose down && docker compose up -d
- Port 6379 in use: redis-cli shutdown
- Node modules conflict: rm -rf node_modules && npm install
