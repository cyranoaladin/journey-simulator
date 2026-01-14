#!/bin/bash
set -euo pipefail

OUT="artifacts/proof/lead_claude_audit_run_001"
mkdir -p "$OUT"

echo "=== AUDIT E2E RUN START ==="

# 1. Build frontend
echo "Building frontend..."
cd journey-simulator
npm run build 2>&1 | tee "$OUT/frontend_build.log"
BUILD_EXIT=$?
cd ..
if [ $BUILD_EXIT -ne 0 ]; then
    echo "FAIL_BLOCKING: Frontend build failed"
    exit 1
fi

# 2. Start backend (prod mode) in background
echo "Starting backend..."
cd mf-back
npm start > "$OUT/backend.log" 2>&1 &
BACKEND_PID=$!
cd ..
echo "Backend PID: $BACKEND_PID" | tee "$OUT/backend_pid.txt"

# 3. Start frontend preview in background
echo "Starting frontend preview..."
cd journey-simulator
npm run preview > "$OUT/frontend_preview.log" 2>&1 &
PREVIEW_PID=$!
cd ..
echo "Preview PID: $PREVIEW_PID" | tee "$OUT/preview_pid.txt"

# 4. Wait for services to be ready
echo "Waiting for services..."
sleep 10

# 5. Check health
curl -f http://127.0.0.1:3000/ > "$OUT/backend_health.txt" 2>&1 || echo "Backend health check failed"
curl -f http://127.0.0.1:3003/ > "$OUT/frontend_health.txt" 2>&1 || echo "Frontend health check failed"

# 6. Run E2E tests with AUDIT_MODE
echo "Running E2E tests..."
cd journey-simulator
export AUDIT_MODE=true
export MFAI_ONCHAIN_MODE="connect-only"
export MFAI_SIMULATION_ONLY="true"
export PROOF_OUT_DIR="../$OUT"
export PROOF_OUT_FILENAME="routes_visited_raw.txt"

npx playwright test --forbid-only 2>&1 | tee "$OUT/e2e_output.log"
E2E_EXIT=$?
cd ..

echo "E2E_EXIT_CODE=$E2E_EXIT" | tee "$OUT/e2e_exit_code.txt"

# 7. Cleanup processes
echo "Cleaning up..."
kill $BACKEND_PID 2>/dev/null || true
kill $PREVIEW_PID 2>/dev/null || true
sleep 2
kill -9 $BACKEND_PID 2>/dev/null || true
kill -9 $PREVIEW_PID 2>/dev/null || true

# 8. Process results
if [ -f "journey-simulator/playwright_report.json" ]; then
    cp journey-simulator/playwright_report.json "$OUT/"
    echo "JSON report copied"
else
    echo "WARNING: playwright_report.json not found"
fi

# 9. Parse JSON counts
if [ -f "$OUT/playwright_report.json" ]; then
    node artifacts/parse_playwright_json_counts.js "$OUT/playwright_report.json" | tee "$OUT/e2e_json_counts.txt"
else
    echo "FAIL_BLOCKING: playwright_report.json missing"
    exit 1
fi

# 10. Process routes
if [ -f "$OUT/routes_visited_raw.txt" ]; then
    bash "$OUT/process_routes.sh" "$OUT" || true
else
    echo "WARNING: routes_visited_raw.txt not found"
fi

echo "=== AUDIT E2E RUN COMPLETE ==="
exit $E2E_EXIT
