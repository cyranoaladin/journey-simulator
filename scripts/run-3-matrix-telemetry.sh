#!/bin/bash
# Run 3-matrix with backend log capture

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ARTIFACTS_DIR="$PROJECT_ROOT/artifacts"
BACKEND_LOG="$ARTIFACTS_DIR/backend-raw.log"
TELEMETRY_NDJSON="$ARTIFACTS_DIR/orchestration-telemetry.ndjson"

echo "[matrix] Starting 3-run matrix with backend telemetry capture"
echo "[matrix] Backend logs will be captured to: $BACKEND_LOG"
echo "[matrix] NDJSON telemetry will be extracted to: $TELEMETRY_NDJSON"

# Clear old logs
> "$BACKEND_LOG"
echo "# Backend Orchestration Telemetry NDJSON" > "$TELEMETRY_NDJSON"
echo "# Generated: $(date -Iseconds)" >> "$TELEMETRY_NDJSON"

# Function to extract NDJSON from backend log
extract_ndjson() {
  grep -E '^\{"type":"orchestration_' "$BACKEND_LOG" >> "$TELEMETRY_NDJSON" 2>/dev/null || true
}

# Function to run orchestration and capture logs
run_orchestration() {
  local prompt="$1"
  local timeout="${2:-200000}"
  
  echo "[matrix] Running: prompt='$prompt', timeout=${timeout}ms"
  
  # Capture backend stdout/stderr to log file
  (tail -f /tmp/backend.log 2>/dev/null || journalctl -f -u "node*" 2>/dev/null || echo "No backend logs accessible") >> "$BACKEND_LOG" &
  TAIL_PID=$!
  
  # Run orchestration
  MFAI_SPAWN_BACKEND=false MFAI_ORCHESTRATION_TIMEOUT="$timeout" \
    node "$PROJECT_ROOT/scripts/repro_orchestration_real.js" --prompt "$prompt" || true
  
  # Stop log capture
  kill $TAIL_PID 2>/dev/null || true
  sleep 1
  
  # Extract NDJSON
  extract_ndjson
}

# Run 1 — MISS (unique prompt)
echo ""
echo "[matrix] === RUN 1: PROMPT_A (MISS expected) ==="
run_orchestration "PROMPT_A_UNIQUE_CACHE_MISS_TEST" 200000
sleep 2

# Run 2 — HIT (same prompt)
echo ""
echo "[matrix] === RUN 2: PROMPT_A (HIT expected) ==="
run_orchestration "PROMPT_A_UNIQUE_CACHE_MISS_TEST" 200000
sleep 2

# Run 3 — MISS (different prompt)
echo ""
echo "[matrix] === RUN 3: PROMPT_B (MISS expected) ==="
run_orchestration "Explain the complete roadmap for launching a DAO with governance tokens" 200000

echo ""
echo "[matrix] Matrix complete. Telemetry saved to: $TELEMETRY_NDJSON"
echo "[matrix] Lines captured: $(grep -c '^{' "$TELEMETRY_NDJSON" || echo 0)"
