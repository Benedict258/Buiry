# Deployment Runbook

## Prerequisites
- Docker installed
- Railway account (or Docker locally)
- Vercel account
- Git access to main branch

## Step 1: Start Infrastructure (Local)
docker compose up -d postgres redis
docker compose ps  # Verify both running

## Step 2: Start Cloud Backend
cd apps/api
npm install
npm run dev
# Server runs on http://localhost:3001

## Step 3: Start React Frontend
cd apps/web
npm install
npm run dev
# Frontend runs on http://localhost:5173

## Step 4: Deploy to Production
# Frontend: Vercel auto-deploys on push to main
# Backend: Railway auto-deploys on push to main

## Step 5: Verify
curl http://localhost:3001/health
# Should return: {"status":"ok","version":"0.1.0"}
