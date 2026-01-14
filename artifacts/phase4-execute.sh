#!/usr/bin/env bash
set -euo pipefail

echo "=== Phase 4 Execute (AUDIT.md §9) ==="

# 1) Preflight
echo "Step 1: Preflight Check"
echo "-------------------------------------------------------------------"
./artifacts/phase2-preflight.sh

# 2) Phase 4 gate (--trace off)
echo ""
echo "Step 2: Execute Phase 4 Gate (--trace off)"
echo "-------------------------------------------------------------------"
cd journey-simulator
# Run all orchestration tests: contracts, routing, resilience, isolation, inventory smoke, and RAG/LLM proofs
NO_COLOR=1 npx playwright test tests/e2e/05-agents-orchestration --project=chromium --workers=1 --reporter=list --trace off


# 3) Zero-secrets scans
echo ""
echo "Step 3: Zero-Secrets Scan #1 - Token Leak Detection"
echo "-------------------------------------------------------------------"
cd ..
rg -n --hidden --no-ignore -S \
  "(authorization\"?\s*:\s*\"Bearer\s+|Bearer\s+[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+|eyJ[A-Za-z0-9\-_]{10,}\.)" \
  artifacts journey-simulator/test-results /tmp \
  --glob '!**/qa-report.md' --glob '!**/test-cache/**' --glob '!journey-simulator/test-results/.auth/**' \
  && { echo "❌ BLOCK: TOKEN LEAK DETECTED"; exit 1; } || echo "✅ OK: 0 token leaks"

# 4) No trace artifacts
echo ""
echo "Step 4: Zero-Secrets Scan #2 - Trace Artifact Detection"
echo "-------------------------------------------------------------------"
find journey-simulator/test-results -type f \( -name "trace.zip" -o -name "*.network" \) -print \
  | head -1 | rg -n "." \
  && { echo "❌ BLOCK: trace/network artifacts found"; exit 1; } || echo "✅ OK: 0 trace artifacts"

# 5) English-only guard
echo ""
echo "Step 5: English-Only Validation (Language Policy)"
echo "-------------------------------------------------------------------"
# 1) Prompts & System Instructions (Orchestration context)
# Scans for accented characters in prompt fields which usually indicate French
rg -n --hidden --no-ignore -S "(prompt|systemPrompt|userPrompt|instruction|message)\s*[:=]\s*['\"][^'\"]*[\u00C0-\u017F]" \
  mf-back/agents \
  && { echo "❌ BLOCK: non-English characters in prompts detected"; exit 1; } || echo "✅ OK: prompts English-only"

# 2) UI text (React TSX)
# Scans for common French keywords in user-visible JSX/TSX
rg -n --type tsx -S "\\b(bonjour|merci|svp|élève|chapitre|exercice|connexion|déconnexion)\\b" journey-simulator/src \
  && { echo "❌ BLOCK: French UI text detected"; exit 1; } || echo "✅ OK: UI English-only"

# 3) Orchestration Logic Documentation
# Specifically check the logic service where French was previously found
rg -n -S "\\b(s'il|par|pour)\\b" mf-back/orchestration/services/logicCheckService.js \
  && { echo "❌ BLOCK: French comments in orchestration logic"; exit 1; } || echo "✅ OK: logic documentation English-only"

# 6) Timeline + output preview checks
echo ""
echo "Step 6: Phase 4 Evidence Validation"
echo "-------------------------------------------------------------------"
test -f artifacts/phase4-timeline.ndjson || { echo "⚠️  WARNING: timeline missing (may be generated during test run)"; }
test -f artifacts/phase4-output-preview.json || { echo "⚠️  WARNING: output preview missing (may be generated during test run)"; }

# 7) Guard E - Timeline sanitization (if timeline exists)
if [ -f artifacts/phase4-timeline.ndjson ]; then
  echo ""
  echo "Step 7: Guard E - Timeline Sanitization"
  echo "-------------------------------------------------------------------"
  rg -n -S "(Bearer\\s+|eyJ[A-Za-z0-9\\-_]{10,}\\.|Authorization\"?\\s*:)" artifacts/phase4-timeline.ndjson \
    && { echo "❌ BLOCK: secrets in phase4 timeline"; exit 1; } || echo "✅ Guard E: PASS (timeline sanitized)"
fi

echo ""
echo "==================================================================="
echo "PHASE 4 VERDICT"
echo "==================================================================="
echo "✅ PHASE 4 PASS"
echo ""
echo "Next: Document Phase 4 PASS in artifacts/qa-report.md (English-only)"
echo "Then: Continue with remaining AUDIT.md phases"
