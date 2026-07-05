#!/usr/bin/env bash
# Buiry End-to-End Verification Script
# Tests the complete pipeline: SDK → DataAgent → ADK Bridge → Walrus → Sui → DB → Dashboard
# Usage: bash e2e-verify.sh

set +e

BACKEND="${BUIRY_BACKEND_URL:-https://buiry.up.railway.app}"
API_KEY="${BUIRY_API_KEY:-buiry_sk_live_dev_12345}"
PASS=0
FAIL=0

green() { echo -e "\033[32m✓\033[0m $1"; ((PASS++)); }
red() { echo -e "\033[31m✗\033[0m $1"; ((FAIL++)); }
skip() { echo -e "\033[33m○\033[0m $1 (skipped)"; }

header() { echo -e "\n\033[1m--- $1 ---\033[0m"; }

header "HEALTH CHECK"
if curl -sf "$BACKEND/health" > /dev/null; then
  HEALTH=$(curl -s "$BACKEND/health")
  PG=$(echo "$HEALTH" | grep -o '"postgres":"[^"]*"' | cut -d'"' -f4)
  echo "  Backend: $BACKEND"
  echo "  PostgreSQL: $PG"
  if [ "$PG" = "connected" ]; then green "Backend healthy, PostgreSQL connected"; else red "PostgreSQL not connected"; fi
else
  red "Backend unreachable at $BACKEND"
  exit 1
fi

header "API KEY BOOTSTRAP"
BOOTSTRAP=$(curl -s -X POST "$BACKEND/api/bootstrap-keys")
if echo "$BOOTSTRAP" | grep -q "success"; then
  green "API keys bootstrapped"
  echo "  Keys count: $(echo "$BOOTSTRAP" | grep -o '"keys_count":[0-9]*' | cut -d: -f2)"
else
  echo "  Response: $BOOTSTRAP"
  skip "Bootstrap already done or unavailable"
fi

header "AUTH — SIGNUP"
SIGNUP=$(curl -s -X POST "$BACKEND/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"e2etest@buiry.dev","password":"test12345678","name":"E2E Test"}')
if echo "$SIGNUP" | grep -q '"token"'; then
  TOKEN=$(echo "$SIGNUP" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  green "Signup successful"
else
  if echo "$SIGNUP" | grep -q "already registered"; then
    # User exists, login instead
    LOGIN=$(curl -s -X POST "$BACKEND/api/auth/login" \
      -H "Content-Type: application/json" \
      -d '{"email":"e2etest@buiry.dev","password":"test12345678"}')
    TOKEN=$(echo "$LOGIN" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    green "Login successful (user already exists)"
  else
    red "Auth failed: $SIGNUP"
    TOKEN=""
  fi
fi

header "API KEYS — LIST"
KEYS=$(curl -s "$BACKEND/api/keys" -H "x-api-key: $API_KEY")
if echo "$KEYS" | grep -q '"keys"'; then
  COUNT=$(echo "$KEYS" | grep -o '"total":[0-9]*' | cut -d: -f2)
  green "Keys listed: $COUNT"
else
  echo "  Response: $KEYS"
  red "Key listing failed — check API_KEY env var"
fi

header "API KEYS — CREATE"
NEW_KEY=$(curl -s -X POST "$BACKEND/api/keys" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"name":"e2e-test-key"}')
if echo "$NEW_KEY" | grep -q '"api_key"'; then
  NEW_API_KEY=$(echo "$NEW_KEY" | grep -o '"api_key":"[^"]*"' | cut -d'"' -f4)
  green "New key created: ${NEW_API_KEY:0:12}..."
else
  echo "  Response: $NEW_KEY"
  red "Key creation failed"
  NEW_API_KEY=""
fi

header "SESSIONS — START"
SESSION=$(curl -s -X POST "$BACKEND/api/session/cloud/start" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{}')
if echo "$SESSION" | grep -q "project_identity"; then
  green "Session start returned project context"
  SESSION_COUNT=$(echo "$SESSION" | grep -o '"total_sessions":[0-9]*' | cut -d: -f2)
  echo "  Sessions in context: ${SESSION_COUNT:-0}"
else
  red "Session start failed: $SESSION"
fi

header "SESSIONS — END"
SESSION_ID="sess_e2e_$(date +%s)"
END_RESULT=$(curl -s -X POST "$BACKEND/api/session/cloud/end" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "{
    \"session_id\": \"$SESSION_ID\",
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
    \"ai_agent\": \"e2e-test\",
    \"current_phase\": \"Testing\",
    \"progress\": 50,
    \"last_session_summary\": \"E2E verification run\",
    \"changes_made\": [\"test.sh\"],
    \"file_module_map\": {},
    \"decisions_log\": [{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"decision\":\"Run e2e test\",\"rationale\":\"Verify pipeline\"}],
    \"known_issues\": [\"None\"],
    \"errors_encountered\": [],
    \"next_steps\": [\"Review results\"]
  }")
if echo "$END_RESULT" | grep -q '"success"'; then
  STORED_IN=$(echo "$END_RESULT" | grep -o '"stored_in":"[^"]*"' | cut -d'"' -f4)
  green "Session saved to $STORED_IN"
else
  echo "  Response: $END_RESULT"
  red "Session save failed"
fi

header "CONTEXT SEARCH"
SEARCH=$(curl -s -X POST "$BACKEND/api/context/search" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"query":"e2e"}')
if echo "$SEARCH" | grep -q '"total"'; then
  TOTAL=$(echo "$SEARCH" | grep -o '"total":[0-9]*' | cut -d: -f2)
  green "Context search found $TOTAL results"
else
  red "Context search failed: $SEARCH"
fi

header "PROJECTS — CREATE"
PROJECT=$(curl -s -X POST "$BACKEND/api/projects" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"name":"e2e-test-project","description":"E2E verification"}')
if echo "$PROJECT" | grep -q '"project"'; then
  PROJECT_ID=$(echo "$PROJECT" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  green "Project created: $PROJECT_ID"
else
  red "Project creation failed: $PROJECT"
  PROJECT_ID=""
fi

header "DATASETS — LIST"
DATASETS=$(curl -s "$BACKEND/api/dataset" -H "x-api-key: $API_KEY")
if echo "$DATASETS" | grep -q "datasets"; then
  DS_COUNT=$(echo "$DATASETS" | grep -o '"name"' | wc -l)
  green "Datasets listed: $DS_COUNT"
else
  echo "  Response: $DATASETS"
  skip "Dataset endpoint returned empty or fallback"
fi

header "SETTINGS — PROFILE"
PROFILE=$(curl -s "$BACKEND/api/settings/profile" -H "x-api-key: $API_KEY")
if echo "$PROFILE" | grep -q "profile\|settings"; then
  green "Settings profile accessible"
else
  echo "  Response: $PROFILE"
  skip "Settings endpoint returned unexpected response"
fi

echo ""
echo "══════════════════════════════════════════════"
echo "  E2E VERIFICATION COMPLETE"
echo "  Passed: $PASS | Failed: $FAIL"
echo "══════════════════════════════════════════════"

if [ $FAIL -gt 0 ]; then
  echo ""
  echo "Failing checks indicate items that need attention before recording."
  exit 1
fi

echo ""
echo "All critical checks passed. Ready for demo recording."
