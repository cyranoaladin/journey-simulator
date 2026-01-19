#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"
mkdir -p artifacts/proof

LOG="artifacts/proof/phase5_full_gate.log"
exec > >(tee "$LOG") 2>&1

echo "ROOT=$ROOT"
echo "PWD=$(pwd)"
test -f "$ROOT/AUDIT.md" || { echo "FAIL: AUDIT.md not found at repo root"; exit 1; }

export LLM_MODEL_NAME="gpt-4.1-mini-2025-04-14"
export MFAI_OPENAI_MODEL="gpt-4.1-mini-2025-04-14"
export SKIP_OPENAI="false"

echo "=== PHASE 5 GATE EXECUTION (STRICT) ==="

echo "--- 5.1 RAG CONTRACTS ---"
(cd mf-back && npm test tests/unit/phase5_rag_contract.test.js) | tee artifacts/proof/phase5_rag_contract.log

echo "--- 5.2 LLM REAL ---"
(cd mf-back && node scripts/phase5_llm_real.js) | tee artifacts/proof/phase5_llm_real.log

echo "--- 5.3 OBSERVABILITY ---"
(cd mf-back && node scripts/phase5_observability_check.js) | tee artifacts/proof/phase5_observability.log

echo "--- 5.4 AGENT REAL SWEEP (MUST BE 45/45 PASS) ---"
(cd mf-back && node scripts/phase5_agent_sweep_full.js) | tee artifacts/proof/phase5_sweep.log

echo "--- ZERO SECRETS ---"
./artifacts/scan-token-leaks.sh | tee artifacts/proof/phase5_token_scan.log

echo "--- TRACE ARTIFACTS ---"
./artifacts/scan-trace-artifacts.sh | tee artifacts/proof/phase5_trace_scan.log

echo "--- ENGLISH ONLY ---"
./artifacts/scan-english-only.sh | tee artifacts/proof/phase5_english_scan.log

echo "EXIT_CODE=0"
echo "PHASE 5 EXECUTION COMPLETE (STRICT)"
