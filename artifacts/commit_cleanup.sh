#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

# STEP 0 — INVENTORY & SAFETY CHECKS
mkdir -p artifacts/proof/lead_commit
echo "Snapshotting Git State..."
git status --porcelain=v1 | tee artifacts/proof/lead_commit/git_status_before.txt
git diff --stat | tee artifacts/proof/lead_commit/git_diffstat_before.txt

# Save these to /tmp for reporting later since we will delete artifacts/proof
cp artifacts/proof/lead_commit/git_status_before.txt /tmp/git_status_before.txt
cp artifacts/proof/lead_commit/git_diffstat_before.txt /tmp/git_diffstat_before.txt

echo "Running Pre-Cleanup Security Scans..."
./artifacts/scan-token-leaks.sh | tee /tmp/token_scan_pre.txt
./artifacts/scan-trace-artifacts.sh | tee /tmp/trace_scan_pre.txt
./artifacts/scan-english-only.sh | tee /tmp/english_scan_pre.txt

# STEP 1 — CLEANUP (REMOVE USELESS FILES) + .gitignore HARDENING
echo "Cleaning up artifacts..."
rm -rf \
  artifacts/proof \
  journey-simulator/test-results \
  journey-simulator/playwright-report \
  journey-simulator/blob-report \
  **/playwright/.cache \
  **/.nyc_output \
  **/coverage \
  **/dist \
  **/build \
  **/.turbo \
  **/.cache \
  **/*.log \
  **/*.trace \
  **/*.zip \
  **/*.tar \
  **/*.gz \
  **/*.pid \
  **/.DS_Store \
  **/Thumbs.db \
  2>/dev/null || true

# 2) Ensure secrets are never tracked
rm -f **/.env **/.env.* 2>/dev/null || true

# 3) Harden .gitignore
echo "Hardening .gitignore..."
cat >> .gitignore <<'EOF'

# --- MFAI hygiene ---
.env
.env.*
*.log
*.pid
*.trace
*.zip
*.tar
*.gz
.DS_Store
Thumbs.db

# Node / build
node_modules/
dist/
build/
coverage/
.nyc_output/
.cache/
.turbo/

# Playwright
playwright-report/
test-results/
blob-report/
**/test-results/
**/playwright-report/
EOF

# Verify no secrets tracked
git ls-files | rg -n '(^|/)\.env(\.|$)' && { echo "FAIL: .env tracked"; exit 1; } || echo "Secrets check OK"

# STEP 2 — REPRODUCIBILITY CHECK (FRESH-CLONE SIMULATION)
echo "Running Reproducibility Check..."
./artifacts/testnetv0_preflight.sh > /tmp/testnetv0_preflight_lead.log 2>&1

export MFAI_ONCHAIN_MODE="connect-only"
export MFAI_SIMULATION_ONLY="true"

echo "Running Backend Tests..."
(cd mf-back && npm test) > /tmp/backend_tests_lead.log 2>&1

echo "Running E2E Connect-Only..."
(cd journey-simulator && npx playwright test tests/e2e/0X-web3-simulation-only --workers=1 --trace off) > /tmp/testnetv0_e2e_lead.log 2>&1

# UI TX markers must remain absent
echo "Scanning for UI TX Markers..."
rg -n "Approve Transaction|signTransaction|sendTransaction|signAndSendTransaction" /tmp/testnetv0_e2e_lead.log \
  && { echo "FAIL_BLOCKING: UI_TX_MARKERS_FOUND"; exit 1; } \
  || echo "NO_UI_TX_MARKERS_FOUND" | tee /tmp/ui_tx_marker_scan_lead.txt

echo "Running Final Scans..."
./artifacts/scan-no-onchain.sh > /tmp/no_onchain_scan_lead.log 2>&1
./artifacts/scan-token-leaks.sh > /tmp/token_scan_post.log 2>&1
./artifacts/scan-trace-artifacts.sh > /tmp/trace_scan_post.log 2>&1
./artifacts/scan-english-only.sh > /tmp/english_scan_post.log 2>&1

echo "PRE-COMMIT PRECLIGHT COMPLETE"
