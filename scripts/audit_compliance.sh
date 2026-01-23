#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}      AUDIT DE CONFORMITÉ MONEYFACTORY AI (MFAI)    ${NC}"
echo -e "${BLUE}====================================================${NC}"

# --- 1. AUDIT LINGUISTIQUE (ZERO FRENCH) ---
echo -e "\n${YELLOW}[1] SCAN LINGUISTIQUE (Recherche de français résiduel)...${NC}"

# Mots clés à chercher (liste non exhaustive mais représentative)
FRENCH_WORDS="Bonjour|Bienvenue|Étape|Suivant|Erreur|Chargement|Utilisateur|Mot de passe|Connexion|Inscription|Valider|Annuler"

# A. Scan du Frontend (Ce que voit l'utilisateur)
echo -e "  > Analyse du Frontend (journey-simulator/src)..."
FRENCH_FRONT=$(grep -rE "$FRENCH_WORDS" journey-simulator/src --include=*.{tsx,ts,js,jsx} | grep -v "node_modules")

if [ -z "$FRENCH_FRONT" ]; then
    echo -e "    ✅ Frontend: Aucun mot français critique détecté."
else
    echo -e "    ⚠️  Frontend: Des mots français ont été trouvés :"
    echo "$FRENCH_FRONT" | head -n 5
    echo "    (et d'autres...)"
fi

# B. Scan des Agents et Templates (Ce que dit l'IA)
echo -e "  > Analyse du Backend (Agents & Templates)..."
FRENCH_BACK=$(grep -rE "$FRENCH_WORDS" mf-back/agents mf-back/data --include=*.{js,json} | grep -v "node_modules")

if [ -z "$FRENCH_BACK" ]; then
    echo -e "    ✅ Backend: Aucun mot français critique détecté."
else
    echo -e "    ⚠️  Backend: Des mots français ont été trouvés :"
    echo "$FRENCH_BACK" | head -n 5
fi


# --- 2. AUDIT AUTHENTIFICATION (DB & LOGIN) ---
echo -e "\n${YELLOW}[2] TEST D'AUTHENTIFICATION (Simulation User)...${NC}"

# URL de l'API (Interne Docker)
API_URL="http://127.0.0.1:3002"
TEST_EMAIL="investor_demo_$(date +%s)@mfai.app"
TEST_PASS="DemoPass123!"

echo -e "  > Tentative d'inscription (Register) pour $TEST_EMAIL..."
REGISTER_RES=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASS\", \"name\": \"Demo Investor\"}")

if echo "$REGISTER_RES" | grep -q "token"; then
    echo -e "    ✅ Inscription RÉUSSIE (Token reçu)."
else
    echo -e "    ❌ ÉCHEC Inscription. Réponse : $REGISTER_RES"
fi

echo -e "  > Tentative de connexion (Login)..."
LOGIN_RES=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASS\"}")

if echo "$LOGIN_RES" | grep -q "token"; then
    echo -e "    ✅ Connexion RÉUSSIE (Base de données opérationnelle)."
else
    echo -e "    ❌ ÉCHEC Connexion. Réponse : $LOGIN_RES"
fi


# --- 3. AUDIT LOGIQUE MÉTIER (WORKFLOWS) ---
echo -e "\n${YELLOW}[3] VÉRIFICATION DE LA COHÉRENCE DES PARCOURS...${NC}"

# Vérifier l'existence et la validité JSON des templates critiques
TEMPLATES=("demo_day_track.json" "pitch_track.json" "dao_track.json")
TEMPLATE_DIR="mf-back/data/parcours_templates"

for TPL in "${TEMPLATES[@]}"; do
    FILE="$TEMPLATE_DIR/$TPL"
    if [ -f "$FILE" ]; then
        # Vérification syntaxe JSON via node (simple check)
        if node -e "try { JSON.parse(require('fs').readFileSync('$FILE')); console.log('OK'); } catch (e) { process.exit(1); }" > /dev/null 2>&1; then
            echo -e "    ✅ $TPL : JSON Valide & Présent."
            
            # Vérification basique de la structure (track + phases)
            HAS_PHASES=$(grep -c "\"phases\"" "$FILE")
            if [ "$HAS_PHASES" -gt 0 ]; then
                 echo -e "       -> Structure logique (Phases) détectée."
            else
                 echo -e "       ❌ Structure suspecte (Pas de phases trouvées)."
            fi
        else
            echo -e "    ❌ $TPL : JSON INVALIDE (Erreur de syntaxe) !"
        fi
    else
        echo -e "    ❌ $TPL : FICHIER MANQUANT !"
    fi
done

echo -e "\n${BLUE}====================================================${NC}"
echo -e "${BLUE}               FIN DE L'AUDIT                       ${NC}"
echo -e "${BLUE}====================================================${NC}"
