#!/bin/bash

# Script de vérification de production pour Journey MFAI
# À exécuter sur le serveur : bash verify-production.sh

set -e

echo "=========================================="
echo "🔍 VÉRIFICATION PRODUCTION JOURNEY MFAI"
echo "=========================================="
echo ""

# Couleurs pour les résultats
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
PASSED=0
FAILED=0
WARNINGS=0

# Fonction de test
test_check() {
    local name="$1"
    local command="$2"
    local expected="$3"
    
    echo -n "Testing: $name... "
    
    if result=$(eval "$command" 2>&1); then
        if [[ -z "$expected" ]] || echo "$result" | grep -q "$expected"; then
            echo -e "${GREEN}✓ PASS${NC}"
            ((PASSED++))
            return 0
        else
            echo -e "${RED}✗ FAIL${NC}"
            echo "  Expected: $expected"
            echo "  Got: $result"
            ((FAILED++))
            return 1
        fi
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "  Error: $result"
        ((FAILED++))
        return 1
    fi
}

test_warning() {
    local name="$1"
    local message="$2"
    
    echo -e "${YELLOW}⚠ WARNING${NC}: $name"
    echo "  $message"
    ((WARNINGS++))
}

echo "1️⃣  VÉRIFICATION ENVIRONNEMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Vérifier que Docker est en cours d'exécution
test_check "Docker daemon running" "docker ps > /dev/null 2>&1" ""

# Vérifier les conteneurs
test_check "Container mfai-api running" "docker ps | grep mfai-api" "Up"
test_check "Container mfai-web running" "docker ps | grep mfai-web" "Up"
test_check "Container mfai-mongo running" "docker ps | grep mfai-mongo" "Up"

echo ""
echo "2️⃣  VÉRIFICATION VARIABLES D'ENVIRONNEMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Vérifier le fichier .env
if [ -f "/srv/journey-mfai/.env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    ((PASSED++))
    
    # Vérifier les variables critiques
    if grep -q "OPENAI_API_KEY=sk-" /srv/journey-mfai/.env; then
        echo -e "${GREEN}✓${NC} OPENAI_API_KEY is set"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} OPENAI_API_KEY is missing or invalid"
        ((FAILED++))
    fi
    
    if grep -q "RAG_SEARCH_URL=" /srv/journey-mfai/.env; then
        echo -e "${GREEN}✓${NC} RAG_SEARCH_URL is set"
        ((PASSED++))
    else
        test_warning "RAG_SEARCH_URL" "Not set - RAG features may not work"
    fi
    
    if grep -q "MONGO_URI=" /srv/journey-mfai/.env; then
        echo -e "${GREEN}✓${NC} MONGO_URI is set"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} MONGO_URI is missing"
        ((FAILED++))
    fi
else
    echo -e "${RED}✗${NC} .env file not found"
    ((FAILED++))
fi

echo ""
echo "3️⃣  VÉRIFICATION BACKEND API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Vérifier que le backend répond
API_URL="http://127.0.0.1:3002"

test_check "Backend health check" "curl -s -o /dev/null -w '%{http_code}' $API_URL" "200"

# Vérifier les routes critiques
test_check "Journey routes exist" "docker exec mfai-api ls /usr/src/app/routes/journey-routes.js" "journey-routes.js"
test_check "Agent routes exist" "docker exec mfai-api ls /usr/src/app/routes/agent-routes.js" "agent-routes.js"

# Vérifier le modèle OpenAI configuré
echo -n "Checking OpenAI model configuration... "
MODEL=$(docker exec mfai-api grep "DEFAULT_LLM_MODEL" /usr/src/app/utils/openaiClient.js | grep -o "gpt-[^\"]*")
if [[ "$MODEL" == "gpt-4o" ]]; then
    echo -e "${GREEN}✓ PASS${NC} (using $MODEL)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC} (using $MODEL instead of gpt-4o)"
    ((WARNINGS++))
fi

echo ""
echo "4️⃣  VÉRIFICATION FRONTEND"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Vérifier que le frontend répond
FRONTEND_URL="http://127.0.0.1:3003"

test_check "Frontend accessible" "curl -s -o /dev/null -w '%{http_code}' $FRONTEND_URL" "200"

# Vérifier que les fichiers build existent
test_check "Frontend build exists" "docker exec mfai-web ls /usr/share/nginx/html/index.html" "index.html"

echo ""
echo "5️⃣  VÉRIFICATION NGINX"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Vérifier la configuration Nginx
if [ -f "/etc/nginx/sites-available/journey.conf" ]; then
    echo -e "${GREEN}✓${NC} Nginx config exists"
    ((PASSED++))
    
    # Vérifier le domaine
    if grep -q "server_name journey.mfai.app" /etc/nginx/sites-available/journey.conf; then
        echo -e "${GREEN}✓${NC} Domain configured correctly"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} Domain not configured"
        ((FAILED++))
    fi
    
    # Vérifier SSL
    if grep -q "ssl_certificate" /etc/nginx/sites-available/journey.conf; then
        echo -e "${GREEN}✓${NC} SSL configured"
        ((PASSED++))
    else
        test_warning "SSL" "SSL not configured"
    fi
    
    # Vérifier le proxy API
    if grep -q "location /api/" /etc/nginx/sites-available/journey.conf; then
        echo -e "${GREEN}✓${NC} API proxy configured"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} API proxy not configured"
        ((FAILED++))
    fi
else
    echo -e "${RED}✗${NC} Nginx config not found"
    ((FAILED++))
fi

# Test Nginx
test_check "Nginx running" "systemctl is-active nginx" "active"

echo ""
echo "6️⃣  VÉRIFICATION BASE DE DONNÉES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Vérifier MongoDB
test_check "MongoDB accessible" "docker exec mfai-mongo mongosh --eval 'db.runCommand({ ping: 1 })' --quiet" "ok"

# Vérifier les collections
echo -n "Checking MongoDB collections... "
COLLECTIONS=$(docker exec mfai-mongo mongosh journey --eval 'db.getCollectionNames()' --quiet 2>/dev/null || echo "")
if [[ -n "$COLLECTIONS" ]]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
else
    test_warning "MongoDB collections" "No collections found - database may be empty"
fi

echo ""
echo "7️⃣  TEST API ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test endpoint public
echo -n "Testing public endpoint... "
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' https://journey.mfai.app 2>/dev/null || echo "000")
if [[ "$HTTP_CODE" == "200" ]]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $HTTP_CODE)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (HTTP $HTTP_CODE)"
    ((FAILED++))
fi

# Test API health (si existe)
echo -n "Testing API health endpoint... "
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' https://journey.mfai.app/api 2>/dev/null || echo "000")
if [[ "$HTTP_CODE" == "200" ]] || [[ "$HTTP_CODE" == "404" ]]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $HTTP_CODE)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC} (HTTP $HTTP_CODE)"
    ((WARNINGS++))
fi

echo ""
echo "8️⃣  VÉRIFICATION LOGS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Vérifier les erreurs récentes dans les logs
echo -n "Checking for recent errors in backend logs... "
ERROR_COUNT=$(docker logs mfai-api --tail 100 2>&1 | grep -i "error" | grep -v "model_not_found" | wc -l)
if [[ $ERROR_COUNT -eq 0 ]]; then
    echo -e "${GREEN}✓ PASS${NC} (no errors)"
    ((PASSED++))
elif [[ $ERROR_COUNT -lt 5 ]]; then
    echo -e "${YELLOW}⚠ WARNING${NC} ($ERROR_COUNT errors found)"
    ((WARNINGS++))
else
    echo -e "${RED}✗ FAIL${NC} ($ERROR_COUNT errors found)"
    ((FAILED++))
fi

echo ""
echo "=========================================="
echo "📊 RÉSUMÉ"
echo "=========================================="
echo -e "${GREEN}✓ Passed:${NC} $PASSED"
echo -e "${YELLOW}⚠ Warnings:${NC} $WARNINGS"
echo -e "${RED}✗ Failed:${NC} $FAILED"
echo ""

if [[ $FAILED -eq 0 ]]; then
    echo -e "${GREEN}🎉 TOUS LES TESTS CRITIQUES SONT PASSÉS !${NC}"
    echo ""
    echo "Le MVP est prêt pour la démo aux investisseurs."
    exit 0
elif [[ $FAILED -lt 3 ]]; then
    echo -e "${YELLOW}⚠️  QUELQUES PROBLÈMES DÉTECTÉS${NC}"
    echo ""
    echo "Le MVP peut fonctionner mais nécessite des corrections mineures."
    exit 1
else
    echo -e "${RED}❌ PROBLÈMES CRITIQUES DÉTECTÉS${NC}"
    echo ""
    echo "Le MVP nécessite des corrections avant la démo."
    exit 2
fi
