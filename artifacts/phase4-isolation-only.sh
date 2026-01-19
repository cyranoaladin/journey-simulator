#!/bin/bash
set -e

# Setup environment
export NEXT_PUBLIC_API_URL="http://127.0.0.1:3002"
export MFAI_LIMIT_CONCURRENCY=true

echo "=== Phase 4 Isolation Test Only ==="

# Execute only the isolation test
cd journey-simulator
npx playwright test tests/e2e/05-agents-orchestration/multi-user-isolation.spec.ts \
  --project=chromium \
  --reporter=list
