#!/usr/bin/env bash
# Audit de l'historique git pour détecter des secrets exposés
# Usage: bash scripts/security/audit-git-history.sh

echo "🔍 Scanning git history for exposed secrets..."

# Patterns à détecter
PATTERNS=(
  'sk-[a-zA-Z0-9_-]{20,}'
  'password123'
  'PRIVATE_KEY.*=.*[0-9,\[\]]'
  'MoneyFactory_2025'
  'une_phrase_secrete'
)

FOUND_ANY=0
for pattern in "${PATTERNS[@]}"; do
  FOUND=$(git log --all -p --no-merges 2>/dev/null | grep -E "$pattern" | head -3)
  if [ -n "$FOUND" ]; then
    echo "⚠️  Pattern trouvé dans l'historique: $pattern"
    FOUND_ANY=1
  fi
done

if [ $FOUND_ANY -eq 0 ]; then
  echo "✅ Aucun secret exposé détecté dans l'historique"
else
  echo ""
  echo "📋 Commandes de nettoyage (à exécuter avec précaution) :"
  echo "   pip install git-filter-repo"
  echo "   git filter-repo --path .env --invert-paths"
  echo "   git filter-repo --path web/minter.json --invert-paths"
  echo ""
  echo "⚠️  Après nettoyage : force push + notifier tous les collaborateurs de re-cloner"
fi
