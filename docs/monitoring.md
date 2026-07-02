# Monitoring & Observability

## Stack
- **Logging**: Structured JSON logs via console (Railway captures these)
- **Error Tracking**: Sentry (set VITE_SENTRY_DSN for frontend, SENTRY_DSN for backend)
- **Analytics**: PostHog (set VITE_POSTHOG_KEY)
- **Uptime**: UptimeRobot (free tier — monitor /health endpoint)

## Environment Variables
- SENTRY_DSN — Backend error tracking
- VITE_SENTRY_DSN — Frontend error tracking
- VITE_POSTHOG_KEY — Analytics key

## Health Check
GET /health → { status, version, uptime, timestamp, services }

## Log Format
All logs are structured JSON:
{
  "timestamp": "ISO-8601",
  "method": "GET",
  "path": "/api/session/start",
  "status": 200,
  "duration": "42ms",
  "ip": "127.0.0.1"
}
