#!/bin/bash

# Couleurs pour la lisibilité
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "\n${YELLOW}=== 🚀 DÉBUT DE L'AUDIT DE PRODUCTION ===${NC}"

# 1. VÉRIFICATION DES CONTENEURS ACTIFS
echo -e "\n${YELLOW}[1] Vérification des Services Actifs...${NC}"
SERVICES=("journey-mfai-api-1" "journey-mfai-journey-web-1" "journey-mfai-mongo-1")
ALL_UP=true

for SERVICE in "${SERVICES[@]}"; do
    if docker ps --format '{{.Names}}' | grep -q "$SERVICE"; then
        echo -e "  ✅ $SERVICE est ${GREEN}EN LIGNE${NC}"
    else
        echo -e "  ❌ $SERVICE est ${RED}HORS LIGNE${NC}"
        ALL_UP=false
    fi
done

# 2. VÉRIFICATION DE LA SUPPRESSION DE POSTGRES
echo -e "\n${YELLOW}[2] Vérification du Nettoyage (Postgres)...${NC}"
if docker ps --format '{{.Names}}' | grep -q "postgres"; then
    echo -e "  ❌ ALERTE : Postgres tourne toujours ! (Échec du nettoyage)"
else
    echo -e "  ✅ Postgres est bien ${GREEN}ARRÊTÉ${NC} (Ressources libérées)"
fi

# 3. AUDIT DE SÉCURITÉ (PORTS)
echo -e "\n${YELLOW}[3] Audit de Sécurité (Ports)...${NC}"
OPEN_PORTS=$(docker ps --format '{{.Ports}}' | grep "0.0.0.0")
if [ -z "$OPEN_PORTS" ]; then
    echo -e "  ✅ Aucun port exposé sur 0.0.0.0 (Internet). Tout est sur 127.0.0.1."
else
    echo -e "  ⚠️  ATTENTION : Des ports semblent exposés :"
    echo "$OPEN_PORTS"
fi

# 4. TEST DE RÉPONSE API (PING INTERNE)
echo -e "\n${YELLOW}[4] Test de réponse API (Local)...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3002)
if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "404" ] || [ "$HTTP_CODE" == "302" ]; then
    echo -e "  ✅ L'API répond (Code: $HTTP_CODE)"
else
    echo -e "  ❌ L'API ne répond pas correctement (Code: $HTTP_CODE)"
fi

# 5. TEST DU FRONTEND (PING INTERNE)
echo -e "\n${YELLOW}[5] Test du Frontend (Local)...${NC}"
HTTP_CODE_WEB=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3003)
if [ "$HTTP_CODE_WEB" == "200" ]; then
    echo -e "  ✅ Le Frontend est servi (Code: 200)"
else
    echo -e "  ❌ Le Frontend ne répond pas (Code: $HTTP_CODE_WEB)"
fi

# 6. VÉRIFICATION DES FICHIERS
echo -e "\n${YELLOW}[6] Vérification des Fichiers...${NC}"
if [ -f ".env" ]; then
    echo -e "  ✅ Fichier .env présent"
else
    echo -e "  ❌ Fichier .env MANQUANT !"
fi

if [ -d "_archive/web_deprecated" ]; then
    echo -e "  ✅ Code mort archivé dans _archive/"
else
    echo -e "  ⚠️  Dossier d'archive introuvable (Peut-être déjà supprimé ?)"
fi

echo -e "\n${YELLOW}=== FIN DE L'AUDIT ===${NC}"
