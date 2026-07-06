# QuizPulse + Buiry — Demo Script
# Copy-paste each prompt into OpenCode Chat in order.
# OpenCode must have @buiry/mcp@0.1.4 attached (see setup below).

# ═══════════════════════════════════════════════
# ONCE: Create opencode.json in your QuizPulse project root
# ═══════════════════════════════════════════════
{
  "mcpServers": {
    "buiry": {
      "command": "npx",
      "args": ["-y", "@buiry/mcp@0.1.4"],
      "env": {
        "BUIRY_API_KEY": "<your-api-key-from-dashboard>",
        "BUIRY_CLOUD_URL": "https://buiry.up.railway.app"
      }
    }
  }
}

# ═══════════════════════════════════════════════
# DEMO FLOW — 12 prompts total. ~5 minutes.
# ═══════════════════════════════════════════════

# SETUP: Initialize a Buiry project and session
═══════════════════════════════════════

  1. Initialize a Buiry project called QuizPulse. It's a real-time multiplayer quiz platform like Kahoot built with Next.js, Socket.io, and PostgreSQL.

  2. Start a Buiry session. Agent OpenCode, phase Core Architecture. We're building the MVP of QuizPulse.

# PHASE 1: Core Architecture (WebSocket + DB schema)
═══════════════════════════════════════

  3. Log a decision: we chose Socket.io over raw WebSockets because it provides automatic reconnection and room management out of the box. Alternatives were WS library and SSE.

  4. Log a decision: we chose PostgreSQL for persistent data (users, quizzes, scores) and Redis for real-time game state (active games, player answers, live leaderboard). Redis handles the hot path, PG handles the cold path.

  5. Flag an issue: need to handle Redis connection failures gracefully. If Redis is down, the game should fall back to in-memory state and warn the host.

# PHASE 2: Quiz Creator Flow
═══════════════════════════════════

  6. Log a decision: the quiz builder UI uses a step-based form with drag-and-drop question reordering. Each question has 2-4 options, a timer (10s-60s), and point allocation (1000/2000).

  7. Flag an issue: the image upload for quiz questions isn't working. Need to implement S3 presigned URLs for direct browser uploads to keep the server lightweight.

# PHASE 3: Real-time Gameplay Loop
═══════════════════════════════════

  8. Log a decision: the scoring algorithm uses Points = BasePoints * (1 - (responseTime / totalTime) * 0.5), rewarding speed. Consecutive correct answers get a 1.1x streak multiplier.

  9. Log a decision: the game lobby generates a 6-digit PIN. Players join with just a PIN and nickname — no authentication required. The host sees a live grid of joined players with a kick option.

# PHASE 4: Polish & Wrap Up
═══════════════════════════════════

  10. Flag an issue: the profanity filter for player nicknames is too aggressive — it's blocking normal names. Need to switch from regex blacklist to a more nuanced approach.

  11. Search Buiry memory for PostgreSQL. Show me all past decisions about database architecture.

  12. End the Buiry session. Summary: built QuizPulse MVP with WebSocket game engine, quiz builder UI, scoring algorithm, lobby system, and profanity filter. Progress: 75%. Next steps: add Redis failover, fix image upload, deploy to Vercel, load test with 500 concurrent players.

# ═══════════════════════════════════════════════
# VERIFICATION: Open https://buiry.vercel.app
# ═══════════════════════════════════════════════
# • Sessions page → see QuizPulse session with 6 decisions, 3 issues
# • Projects page → QuizPulse with AI_Starter.md, PRD.md, ARCHITECTURE.md, DEV_PLAN.md
# • Settings page → your API keys with copy buttons
