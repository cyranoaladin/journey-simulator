#!/usr/bin/env bash
set -euo pipefail

echo "=== Phase 3 Execute (AUDIT.md §8) ==="

./artifacts/phase3-preflight.sh

echo "1) Phase 3 E2E gate (--trace off)"
cd journey-simulator
NO_COLOR=1 npx playwright test tests/e2e/03-user-workflows --workers=1 --trace off

echo "2) Zero-secrets scan (JWT/Bearer must be 0 hits)"
cd ..
rg -n --hidden --no-ignore -S \
  "(authorization\"?\s*:\s*\"Bearer\s+|Bearer\s+[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+|eyJ[A-Za-z0-9\-_]{10,}\.)" \
  artifacts journey-simulator/test-results /tmp \
  --glob '!**/qa-report.md' --glob '!**/test-cache/**' --glob '!journey-simulator/test-results/.auth/**' \
  && { echo "❌ BLOCK: TOKEN LEAK DETECTED"; exit 1; } || echo "✅ OK: 0 token leaks"

echo "3) No trace/network artifacts"
find journey-simulator/test-results -type f \( -name "trace.zip" -o -name "*.network" \) -print \
  | head -1 | rg -n "." \
  && { echo "❌ BLOCK: trace/network artifacts found"; exit 1; } || echo "✅ OK: 0 trace artifacts"

echo "4) English-only guard (tests/prompts must be English)"
# Check for actual French words, not English words like "Phase"
rg -n --hidden -S "(Bonjour|Merci|Connexion|Inscription|Déconnexion|Chargement|Erreur|Bienvenue|Utilisateur|Paramètres)" journey-simulator/tests/e2e \
  && { echo "❌ BLOCK: French strings found in E2E tests"; exit 1; } || echo "✅ OK: English-only tests"

echo "Phase 3: ✅ PASS (if you also updated qa-report.md with evidence)"
