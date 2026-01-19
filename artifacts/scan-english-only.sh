#!/bin/bash
echo "=== English-Only Compliance Scan ==="
echo "Timestamp: $(date -Iseconds)"
echo "Scanning for French text in source code..."
echo ""

HITS=$(rg -n --hidden -g '*.{ts,tsx,js,jsx,html,css}' --glob '!**/node_modules/**' --glob '!**/dist/**' --glob '!**/build/**' --glob '!**/*.test.*' --glob '!**/__tests__/**' --glob '!**/99-english-compliance/**' '(?i)\b(bienvenue|connexion|déconnexion|tableau de bord|profil|paramètres|suivant|précédent|retour|accueil|parcours|ressources|certification|gouvernance|mise en staking|jeton|portefeuille)\b|[àâäçéèêëîïôöùûüÿœæ]' journey-simulator mf-back | wc -l)

echo "HITS=$HITS"
if [ "$HITS" -eq 0 ]; then
  echo "✅ English-Only Compliance Scan: PASS"
  echo "No French text found in source code."
else
  echo "⚠️ English-Only Compliance Scan: FOUND $HITS instances"
  echo "Re-running for details:"
  rg -n --hidden -g '*.{ts,tsx,js,jsx,html,css}' --glob '!**/node_modules/**' --glob '!**/dist/**' --glob '!**/build/**' --glob '!**/*.test.*' --glob '!**/__tests__/**' --glob '!**/99-english-compliance/**' '(?i)\b(bienvenue|connexion|déconnexion|tableau de bord|profil|paramètres|suivant|précédent|retour|accueil|parcours|ressources|certification|gouvernance|mise en staking|jeton|portefeuille)\b|[àâäçéèêëîïôöùûüÿœæ]' journey-simulator mf-back | head -50
fi

echo ""
echo "=== END English-Only Scan ==="
