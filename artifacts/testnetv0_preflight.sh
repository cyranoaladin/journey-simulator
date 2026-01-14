#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

# 1) Kill old ports if needed (non-fatal)
lsof -ti:3000,3002,4173 | xargs -r kill -9 || true

# 2) Start backend (port 3002) in background with logs
mkdir -p artifacts/proof
# check where package.json for backend is
if [ -d "mf-back" ]; then
    echo "Starting backend..."
    ( cd mf-back && PORT=3002 npm run dev ) > artifacts/proof/testnetv0_backend.log 2>&1 &
    echo $! > artifacts/proof/testnetv0_backend.pid
else
    echo "FAIL: mf-back not found"
    exit 1
fi

# 3) Start frontend
# User says "Option A: Vite dev on 3000". But is it in journey-simulator?
# I need to check where the NEXTJS or frontend app is.
# User mentioned journey-simulator previously for E2E.
# Usually journey-ui or similar.
# Let's assume journey-simulator IS the frontend container OR journey-ui.
# I will check existence before running.

if [ -d "journey-ui" ]; then
     echo "Starting frontend (journey-ui)..."
    ( cd journey-ui && npm run dev -- --host 127.0.0.1 --port 3000 ) > artifacts/proof/testnetv0_frontend.log 2>&1 &
    echo $! > artifacts/proof/testnetv0_frontend.pid
elif [ -d "journey-simulator" ]; then
     echo "Starting frontend (journey-simulator)..."
    ( cd journey-simulator && npm run dev -- --host 127.0.0.1 --port 3000 ) > artifacts/proof/testnetv0_frontend.log 2>&1 &
    echo $! > artifacts/proof/testnetv0_frontend.pid
else
    echo "FAIL: Frontend dir not found (tried journey-ui, journey-simulator)"
    exit 1
fi

sleep 5  # Give them time

# 4) Health checks
echo "Checking Backend Health..."
curl -fsS http://127.0.0.1:3002/health | tee artifacts/proof/testnetv0_backend_health.json
echo "Checking Frontend Health..."
curl -fsS http://127.0.0.1:3000/ | head -n 5 | tee artifacts/proof/testnetv0_frontend_head.txt
echo "PREFLIGHT_OK_SCRIPT"
