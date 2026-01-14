#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"
mkdir -p artifacts/proof

LOG="artifacts/proof/phase6_full_gate.log"
exec > >(tee "$LOG") 2>&1

echo "ROOT=$ROOT"
echo "PWD=$(pwd)"
test -f "$ROOT/AUDIT.md" || { echo "FAIL: AUDIT.md not found at repo root"; exit 1; }

echo "=== PHASE 6 GATE EXECUTION (STRICT) ==="

# B1. LLM Failure Injection (403, Model Not Found, Network Error)
echo "--- 6.1 LLM FAILURE CHAOS ---"
(cd mf-back && npm test tests/unit/phase6_llm_failure.test.js) | tee artifacts/proof/phase6_b1_llm_failure.log

# B2. RAG Failure Injection (Missing Index, TopK Clamp, No Remote)
echo "--- 6.2 RAG FAILURE CHAOS ---"
(cd mf-back && npm test tests/unit/phase6_rag_failure.test.js) | tee artifacts/proof/phase6_b2_rag_failure.log

# B3. Rate Limit Simulation (429 Backoff/Retry)
echo "--- 6.3 RATE LIMIT CHAOS ---"
(cd mf-back && npm test tests/unit/phase6_rate_limit.test.js) | tee artifacts/proof/phase6_b3_rate_limit.log

# B4. Timeout/Abort Logic
echo "--- 6.4 TIMEOUT CHAOS ---"
(cd mf-back && npm test tests/unit/phase6_timeout.test.js) | tee artifacts/proof/phase6_b4_timeout.log

# Scans
echo "--- ZERO SECRETS ---"
./artifacts/scan-token-leaks.sh | tee artifacts/proof/phase6_token_scan.log

echo "--- TRACE ARTIFACTS ---"
./artifacts/scan-trace-artifacts.sh | tee artifacts/proof/phase6_trace_scan.log

echo "--- ENGLISH ONLY ---"
./artifacts/scan-english-only.sh | tee artifacts/proof/phase6_english_scan.log

echo "EXIT_CODE=0"
echo "PHASE 6 EXECUTION COMPLETE (STRICT)"
