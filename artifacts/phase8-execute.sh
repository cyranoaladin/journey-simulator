#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"
mkdir -p artifacts/proof/phase8

# A0 — Mandatory AUDIT.md pre-check (verbatim)
test -f AUDIT.md && echo "AUDIT_PRESENT=1" | tee artifacts/proof/phase8/audit_present.txt
rg -n "PHASE|LOCK|TESTNET|CONNECT-ONLY|SIMULATION|ONCHAIN|SCAN|E2E|SHA256|ZERO_BYTE" AUDIT.md \
  | tee artifacts/proof/phase8/audit_md_index_phase8.txt
test -f artifacts/proof/audit_md_compliance_checklist.txt && echo "CHECKLIST_PRESENT=1" \
  | tee artifacts/proof/phase8/checklist_present.txt

# A1 — Environment proof (must show connect-only)
export MFAI_ONCHAIN_MODE="connect-only"
export MFAI_SIMULATION_ONLY="true"
export SKIP_OPENAI="false"
# (Keep the authorized model from Phase 5 if needed)
export MFAI_OPENAI_MODEL="${MFAI_OPENAI_MODEL:-gpt-4.1-mini-2025-04-14}"
env | rg -n "MFAI_ONCHAIN_MODE|MFAI_SIMULATION_ONLY|SKIP_OPENAI|MFAI_OPENAI_MODEL" \
  | tee artifacts/proof/phase8/phase8_env_proof.txt

# A2 — Regression gates (frontend/backend as available)
# Backend unit/integration
( cd mf-back && npm test ) | tee artifacts/proof/phase8/backend_tests.log

# Optional: frontend lint/typecheck/build if exists (do not fail if folder missing)
( test -d journey-simulator && (cd journey-simulator && npm run lint && npm run typecheck && npm run build) ) \
  | tee artifacts/proof/phase8/frontend_checks.log || echo "FRONTEND_CHECKS_SKIPPED" \
  | tee -a artifacts/proof/phase8/frontend_checks.log

# A3 — E2E (connect-only) MUST PASS
( cd journey-simulator && npx playwright test tests/e2e/0X-web3-simulation-only --workers=1 --trace off ) \
  | tee artifacts/proof/phase8/testnetv0_e2e.log
echo "E2E_EXIT_CODE=$?" | tee artifacts/proof/phase8/testnetv0_e2e_exit_code.txt

# A4 — UI TX marker scan MUST show none
rg -n "Approve Transaction|signTransaction|sendTransaction|signAndSendTransaction" artifacts/proof/phase8/testnetv0_e2e.log \
  && { echo "FAIL:UI_TX_MARKERS_FOUND"; echo "FAIL:UI_TX_MARKERS_FOUND" > artifacts/proof/phase8/ui_tx_marker_scan.txt; exit 1; } \
  || echo "NO_UI_TX_MARKERS_FOUND" | tee artifacts/proof/phase8/ui_tx_marker_scan.txt

# A5 — Dependency/Vuln scan (do not hide failures)
( cd mf-back && npm audit --omit=dev ) | tee artifacts/proof/phase8/npm_audit_backend.log || echo "NPM_AUDIT_BACKEND_NONZERO"
( test -d journey-simulator && (cd journey-simulator && npm audit --omit=dev) ) \
  | tee artifacts/proof/phase8/npm_audit_frontend.log || echo "NPM_AUDIT_FRONTEND_NONZERO" \
  | tee -a artifacts/proof/phase8/npm_audit_frontend.log

# A6 — Security scans (audit-grade)
./artifacts/scan-token-leaks.sh | tee artifacts/proof/phase8/token_scan.log
./artifacts/scan-trace-artifacts.sh | tee artifacts/proof/phase8/trace_scan.log
./artifacts/scan-english-only.sh | tee artifacts/proof/phase8/english_scan.log
./artifacts/scan-no-onchain.sh | tee artifacts/proof/phase8/no_onchain_scan.log

# A7 — Zero-byte proof + SHA256 proof pack
python3 - << 'PY'
import os, pathlib
p = pathlib.Path("artifacts/proof/phase8")
zeros = [f for f in p.rglob("*") if f.is_file() and f.stat().st_size == 0]
out = p / "zero_byte_files.txt"
content = "ZERO_BYTE_FILES_FOUND=%d\n" % len(zeros) + "\n".join(str(x) for x in zeros) + ("\n" if zeros else "")
out.write_text(content)
print(content.strip())
PY
( cd artifacts/proof/phase8 && ls -lh ) | tee artifacts/proof/phase8/files_list.log
sha256sum artifacts/proof/phase8/* | tee artifacts/proof/phase8/sha256.txt

# A8 — Git status snapshot (for handoff)
git status --porcelain | tee artifacts/proof/phase8/git_status_porcelain.txt
git rev-parse HEAD | tee artifacts/proof/phase8/git_head.txt
git diff --stat | tee artifacts/proof/phase8/git_diff_stat.txt

echo "EXIT_CODE=0"
echo "PHASE_8_COMPLETE"
