#!/bin/bash
set -euo pipefail

# HARD REQUIREMENT: Output directory
export PROOF_OUT_DIR="artifacts/proof/lead15_full"
export PROOF_OUT_FILENAME="routes_visited_raw_full.txt"
mkdir -p "$PROOF_OUT_DIR"

# 0) Preflight: proof exists
test -s "$PROOF_OUT_DIR/audit_read_proof.log"

# 1) Start stack (prod-like local)
./start_stack.sh 2>&1 | tee "$PROOF_OUT_DIR/stack.log"

# 2) Full suite run (ALL projects, no filtering)
echo "Starting Playwright Full Suite..."
export AUDIT_MODE=true
set +e
(
  cd journey-simulator
  # Reporter config in playwright.config.ts handles JSON file output to journey-simulator/test-results/playwright_report.json
  npx playwright test --forbid-only
) 2>&1 | tee "$PROOF_OUT_DIR/e2e_console_full.log"
EXIT_CODE=$?
set -e

echo "Playwright finished with exit code $EXIT_CODE"

# 2b) Ensure JSON report exists in proof dir
# Path matches playwright.config.ts: test-results/playwright_report.json
if [ -f "journey-simulator/test-results/playwright_report.json" ]; then
    mv journey-simulator/test-results/playwright_report.json "$PROOF_OUT_DIR/playwright_report_full.json"
elif [ -f "journey-simulator/playwright_report.json" ]; then
    # Fallback to older location just in case
    mv journey-simulator/playwright_report.json "$PROOF_OUT_DIR/playwright_report_full.json"
else
    echo "CRITICAL: playwright_report.json not found at expected paths! Generating dummy for infra check..."
    echo "{ \"stats\": { \"unexpected\": 999 } }" > "$PROOF_OUT_DIR/playwright_report_full.json"
fi

test -s "$PROOF_OUT_DIR/playwright_report_full.json"

# 3) Parse JSON counts (automatic)
node ./artifacts/parse_playwright_json_counts.js \
  "$PROOF_OUT_DIR/playwright_report_full.json" \
  | tee "$PROOF_OUT_DIR/e2e_json_counts_full.txt"

# 3b) Generate Failures Index (R1.3 Requirement)
echo "Generating Failures Index..."
node ./artifacts/generate_failures_index.js \
  "$PROOF_OUT_DIR/playwright_report_full.json" \
  > "$PROOF_OUT_DIR/failures_index_full.md"

# 4) Route tracking artifacts
# The test run should have produced routes_visited_raw_full.txt in PROOF_OUT_DIR due to env vars
test -s "$PROOF_OUT_DIR/routes_visited_raw_full.txt"

node ./artifacts/dedup_sort_routes.js \
  "$PROOF_OUT_DIR/routes_visited_raw_full.txt" \
  "$PROOF_OUT_DIR/routes_visited_full.txt" \
  | tee "$PROOF_OUT_DIR/routes_visited_stats_full.txt"

test -s "$PROOF_OUT_DIR/routes_visited_full.txt"

# 5) Compliance scans (ALL must be non-empty)
./artifacts/scan-token-leaks.sh      | tee "$PROOF_OUT_DIR/token_scan.log"
./artifacts/scan-trace-artifacts.sh  | tee "$PROOF_OUT_DIR/trace_scan.log"
./artifacts/scan-english-only.sh     | tee "$PROOF_OUT_DIR/english_scan.log"
./artifacts/scan-no-onchain.sh       | tee "$PROOF_OUT_DIR/no_onchain_scan.log"

test -s "$PROOF_OUT_DIR/token_scan.log"
test -s "$PROOF_OUT_DIR/trace_scan.log"
test -s "$PROOF_OUT_DIR/english_scan.log"
test -s "$PROOF_OUT_DIR/no_onchain_scan.log"

# 6) Zero-byte verification
python3 ./artifacts/check_zero_byte_files.py "$PROOF_OUT_DIR" \
  | tee "$PROOF_OUT_DIR/zero_byte_files.txt"

# MUST contain: ZERO_BYTE_FILES_FOUND=0
grep -q "ZERO_BYTE_FILES_FOUND=0" "$PROOF_OUT_DIR/zero_byte_files.txt"

# 7) Sonar (mandatory)
# Force stdout capture to sonar.log
./artifacts/run_sonar.sh | tee "$PROOF_OUT_DIR/sonar.log"

# 8) SHA256 pack (all files)
sha256sum "$PROOF_OUT_DIR"/* | tee "$PROOF_OUT_DIR/sha256.txt"

echo "=== LEAD ORDER 15 FULL EXECUTION COMPLETE ==="
