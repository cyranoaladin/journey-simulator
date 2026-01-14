#!/bin/bash
# Phase 2 Complete Execution Script - AUDIT.md Compliance
# Zero tolerance: no shortcuts, proof-driven validation

set -e

echo "==================================================================="
echo "PHASE 2 — UX/UI Desktop Validation (AUDIT.md)"
echo "==================================================================="
echo ""

# Step 1: Preflight Check
echo "Step 1: Preflight Check"
echo "-------------------------------------------------------------------"
./artifacts/phase2-preflight.sh
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ PREFLIGHT FAILED - Cannot proceed with Phase 2 gate"
    echo "Start frontend preview: cd journey-simulator && npm run build && npm run preview -- --host 127.0.0.1 --port 4173"
    exit 1
fi
echo ""

# Step 2: Execute Phase 2 Gate (--trace off MANDATORY)
echo "Step 2: Execute Phase 2 Gate (--trace off)"
echo "-------------------------------------------------------------------"
cd journey-simulator
npx playwright test \
  tests/e2e/02-visual-regression \
  tests/e2e/04-dashboard-intel \
  --workers=1 --trace off

GATE_EXIT=$?
cd ..

echo ""
echo "Gate exit code: $GATE_EXIT"
echo ""

# Step 3: Zero-Secrets Enforcement (Token Leak Scan)
echo "Step 3: Zero-Secrets Scan #1 - Token Leak Detection"
echo "-------------------------------------------------------------------"
rg -n --hidden --no-ignore -S \
  "(authorization\"?\s*:\s*\"Bearer\s+|Bearer\s+[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+|eyJ[A-Za-z0-9\-_]{10,}\.)" \
  artifacts journey-simulator/test-results /tmp \
  --glob '!**/qa-report.md' --glob '!**/test-cache/**' --glob '!journey-simulator/test-results/.auth/**' 2>/dev/null \
  && { echo "❌ BLOCK: TOKEN LEAK DETECTED"; TOKEN_LEAK=1; } || { echo "✅ OK: 0 token leaks"; TOKEN_LEAK=0; }

echo ""

# Step 4: Zero-Secrets Enforcement (Trace Artifact Scan)
echo "Step 4: Zero-Secrets Scan #2 - Trace Artifact Detection"
echo "-------------------------------------------------------------------"
TRACE_COUNT=$(find journey-simulator/test-results -type f \( -name "trace.zip" -o -name "*.network" \) 2>/dev/null | wc -l)
if [ $TRACE_COUNT -gt 0 ]; then
    echo "❌ BLOCK: $TRACE_COUNT trace artifacts found (--trace off violation)"
    find journey-simulator/test-results -type f \( -name "trace.zip" -o -name "*.network" \) 2>/dev/null | head -10
    TRACE_LEAK=1
else
    echo "✅ OK: 0 trace artifacts"
    TRACE_LEAK=0
fi

echo ""

# Step 5: English-Only UI Validation
echo "Step 5: English-Only UI Validation (Language Policy)"
echo "-------------------------------------------------------------------"
rg -n --hidden --no-ignore -S "(Bienvenue|Connexion|Mot de passe|Déconnexion|Tableau de bord|Chargement|Erreur)" \
  journey-simulator/test-results 2>/dev/null \
  && { echo "❌ BLOCK: French UI strings detected in artifacts"; FRENCH_LEAK=1; } || { echo "✅ OK: English-only artifacts"; FRENCH_LEAK=0; }

echo ""
echo "==================================================================="
echo "PHASE 2 VERDICT"
echo "==================================================================="

if [ $GATE_EXIT -eq 0 ] && [ $TOKEN_LEAK -eq 0 ] && [ $TRACE_LEAK -eq 0 ] && [ $FRENCH_LEAK -eq 0 ]; then
    echo "✅ PHASE 2 PASS"
    echo ""
    echo "Next: Document Phase 2 PASS in artifacts/qa-report.md (English-only)"
    echo "Then: Start Phase 3 implementation (User Workflows & Personas)"
    exit 0
else
    echo "❌ PHASE 2 FAIL"
    echo ""
    if [ $GATE_EXIT -ne 0 ]; then
        echo "  - Gate: FAILED (review test output above)"
    fi
    if [ $TOKEN_LEAK -eq 1 ]; then
        echo "  - Token Leak: DETECTED (sanitize artifacts)"
    fi
    if [ $TRACE_LEAK -eq 1 ]; then
        echo "  - Trace Artifacts: PRESENT (--trace off violation)"
    fi
    if [ $FRENCH_LEAK -eq 1 ]; then
        echo "  - French UI Strings: DETECTED (English-only policy violation)"
    fi
    echo ""
    echo "Apply surgical fixes, then re-run this script"
    exit 1
fi
