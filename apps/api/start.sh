#!/bin/bash
# Buiry Platform Start Script
# Runs both the Node.js API backend and the Python ADK bridge server.

echo "Starting Buiry Platform..."

# Start the Python ADK bridge server on port 8765
echo "Starting ADK bridge server on port 8765..."
cd /app/packages/adk-agents && python3 server.py --port 8765 &
ADK_PID=$!

# Start the Node.js API backend on port 3001 (or PORT env var)
echo "Starting API server..."
cd /app/apps/api && node dist/index.js &
API_PID=$!

# Wait for any process to exit
wait -n

# If one exits, kill the other
kill $ADK_PID $API_PID 2>/dev/null
exit 1
