#!/bin/bash
# LEAD ORDER — R1.1 — NO HANG / AUDIT GRADE
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"
OUT="artifacts/proof/lead12"
mkdir -p "$OUT"

# 0) Mandatory pre-run
sed -n '1,200p' AUDIT.md | tee "$OUT/audit_read_proof.log" >/dev/null
test -s "$OUT/audit_read_proof.log" || { echo "FAIL_BLOCKING: AUDIT not read"; exit 1; }

# 1) Capture environment + versions
( node -v && npm -v ) | tee "$OUT/node_npm_versions.txt" >/dev/null || true
( cd journey-simulator && npx playwright --version ) | tee "$OUT/playwright_version.txt" >/dev/null

# 2) Run proof script under timeout + full trace of where it hangs
SCRIPT="./artifacts/proof_lead11.sh"
chmod +x "$SCRIPT"
test -f "$SCRIPT" || { echo "FAIL_BLOCKING: missing $SCRIPT"; exit 1; }

# Run with hard timeout
set +e
timeout -k 10 1200 bash -x "$SCRIPT" >"$OUT/proof_run_stdout.log" 2>"$OUT/proof_run_stderr.log"
EC=$?
set -e
echo "PROOF_SCRIPT_EXIT_CODE=$EC" | tee "$OUT/proof_exit_code.txt" >/dev/null

# 3) If it timed out, extract last executed lines
tail -n 120 "$OUT/proof_run_stderr.log" | tee "$OUT/proof_stderr_tail.txt" >/dev/null
tail -n 120 "$OUT/proof_run_stdout.log" | tee "$OUT/proof_stdout_tail.txt" >/dev/null

# 4) Hard fail if timeout/hang occurred
if [ "$EC" -ne 0 ]; then
  echo "FAIL_BLOCKING: proof script did not complete (exit=$EC). Fix the hang and rerun." | tee "$OUT/verdict.txt"
  exit 1
fi

# 5) Confirm required outputs exist
REQ=(
  "playwright_report_full.json"
  "e2e_json_counts_full.txt"
  "e2e_json_assertions.log"
  "routes_visited_raw.txt"
  "routes_visited.txt"
  "routes_visited_stats.txt"
  "ui_french_source_hits.txt"
  "guide_outline.txt"
)
# Note: proof_lead11.sh writes to artifacts/proof/lead11, but this script checks lead12? 
# The script above says "Confirm required outputs exist (adapt paths if your script writes to a different dir, but final copies MUST be here)"
# My proof_lead11.sh writes to artifacts/proof/lead11. I should copy them to lead12 or check them in lead11.
# The user prompted "OUT=artifacts/proof/lead12"... "Confirm required outputs exist ... $OUT/$f".
# So I must copy them.

INNER_OUT="artifacts/proof/lead11"
for f in "${REQ[@]}"; do
  cp "$INNER_OUT/$f" "$OUT/$f" || true
  test -s "$OUT/$f" || { echo "FAIL_BLOCKING: missing/empty $OUT/$f"; exit 1; }
done

# Copy UI runtime sample if exists
if [ -f "artifacts/proof/lead12/ui_runtime_text_sample.txt" ]; then
    # already there if test wrote it there, but test wrote it to artifacts/proof/lead12/ui_runtime_text_sample.txt ideally.
    # Actually my new test writes to artifacts/proof/lead12/ui_runtime_text_sample.txt.
    :
fi

# 6) Integrity pack
( cd "$OUT" && ls -lh ) | tee "$OUT/files_list.log" >/dev/null
( cd "$OUT" && sha256sum * | sort ) | tee "$OUT/sha256.txt" >/dev/null

echo "VERDICT=PASS_STRICT_R1_1"
