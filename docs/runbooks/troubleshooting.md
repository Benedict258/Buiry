# Troubleshooting Guide

## MCP Server Issues
- "Module not found": Run npm install in packages/buiry-mcp
- "Syntax error": Run npx tsc --noEmit to check types
- Tools not appearing: Check dist/index.js exists

## React App Issues
- "Module not found": Run npm install in apps/web
- "Type error": Run npx tsc --noEmit
- API calls failing: Check VITE_API_URL in .env

## Cloud Backend Issues
- "Port 3001 in use": Kill process on port 3001
- "Database connection failed": docker compose up -d postgres
- "Redis connection failed": docker compose up -d redis

## ADK Agent Issues
- "Module not found: google_adk": pip install google-adk
- "API key not found": Set GEMINI_API_KEY env var
