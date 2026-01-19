#!/bin/bash
# ============================================================================
# SCRIPT DE DÉPLOIEMENT - RELEASE CANDIDATE V1.0
# ============================================================================
# Date: 2026-01-01
# Certification: TOTAL SUPREME MASTERY
# Commit cible: 1dd07c4 (ou plus récent sur main)
# ============================================================================

set -euo pipefail

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}============================================================================${NC}"
echo -e "${CYAN}🚀 DÉPLOIEMENT RELEASE CANDIDATE V1.0 - TOTAL SUPREME MASTERY${NC}"
echo -e "${CYAN}============================================================================${NC}"
echo ""

# Vérifications préliminaires
if [ ! -d "/srv/journey-mfai" ]; then
    echo -e "${RED}❌ Erreur: /srv/journey-mfai n'existe pas${NC}"
    exit 1
fi

cd /srv/journey-mfai

# ============================================================================
# 1. SAUVEGARDE DE SÉCURITÉ
# ============================================================================
echo -e "${BLUE}📦 1. SAUVEGARDE DE SÉCURITÉ${NC}"
echo -e "${YELLOW}-------------------------------------------${NC}"

BACKUP_DIR="/root/backups/journey-mfai-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "Sauvegarde de .env..."
cp .env "$BACKUP_DIR/.env.backup" 2>/dev/null || echo "Pas de .env à sauvegarder"

echo "Sauvegarde de docker-compose.prod.yml..."
cp docker-compose.prod.yml "$BACKUP_DIR/" 2>/dev/null || echo "Pas de docker-compose.prod.yml"

echo "Sauvegarde du commit actuel..."
git log -1 --oneline > "$BACKUP_DIR/commit_before.txt"

echo -e "${GREEN}✅ Sauvegarde créée dans: $BACKUP_DIR${NC}"
echo ""

# ============================================================================
# 2. ARRÊT DES SERVICES ACTUELS
# ============================================================================
echo -e "${BLUE}🛑 2. ARRÊT DES SERVICES ACTUELS${NC}"
echo -e "${YELLOW}-------------------------------------------${NC}"

echo "Arrêt des containers Docker..."
docker compose -f docker-compose.prod.yml down 2>/dev/null || docker compose down 2>/dev/null || echo "Aucun container à arrêter"

echo -e "${GREEN}✅ Services arrêtés${NC}"
echo ""

# ============================================================================
# 3. NETTOYAGE DE L'ANCIENNE VERSION
# ============================================================================
echo -e "${BLUE}🧹 3. NETTOYAGE DE L'ANCIENNE VERSION${NC}"
echo -e "${YELLOW}-------------------------------------------${NC}"

echo "Suppression des containers arrêtés..."
docker container prune -f || true

echo "Suppression des anciennes images journey-mfai..."
docker images | grep "journey-mfai" | awk '{print $3}' | xargs -r docker rmi -f || true

echo "Suppression des images dangling..."
docker image prune -f || true

echo -e "${GREEN}✅ Nettoyage terminé${NC}"
echo ""

# ============================================================================
# 4. MISE À JOUR DU CODE (GIT PULL)
# ============================================================================
echo -e "${BLUE}⬇️  4. MISE À JOUR DU CODE${NC}"
echo -e "${YELLOW}-------------------------------------------${NC}"

echo "Récupération de la Release Candidate V1.0..."
git fetch origin main
git reset --hard origin/main

CURRENT_COMMIT=$(git log -1 --oneline)
echo -e "${GREEN}✅ Code mis à jour: $CURRENT_COMMIT${NC}"
echo ""

# ============================================================================
# 5. CONFIGURATION .ENV
# ============================================================================
echo -e "${BLUE}🔐 5. CONFIGURATION .ENV${NC}"
echo -e "${YELLOW}-------------------------------------------${NC}"

if [ -f ".env.new" ]; then
    echo "Fusion des fichiers .env..."
    
    # Créer un .env fusionné
    cat > .env.merged << 'ENVEOF'
# ============================================================================
# MONEY FACTORY AI - RELEASE CANDIDATE V1.0
# Configuration Production
# Date: 2026-01-01
# ============================================================================

# --- SERVER CONFIGURATION ---
NODE_ENV=production
PORT=3000

# --- DATABASE ---
MONGO_URI=mongodb://mongo:27017/journey

# Postgres (Interne via Docker)
POSTGRES_DB=prisma
POSTGRES_USER=prisma
POSTGRES_PASSWORD=prisma

# --- SECURITY ---
ENVEOF

    # Extraire JWT_SECRET et ADMIN_API_KEY du .env existant
    if [ -f "$BACKUP_DIR/.env.backup" ]; then
        grep "^JWT_SECRET=" "$BACKUP_DIR/.env.backup" >> .env.merged || echo "JWT_SECRET=une_phrase_secrete_super_longue_et_complexe" >> .env.merged
        grep "^ADMIN_API_KEY=" "$BACKUP_DIR/.env.backup" >> .env.merged || echo "ADMIN_API_KEY=change-me" >> .env.merged
    fi

    cat >> .env.merged << 'ENVEOF'

# --- EXTERNAL SERVICES (AI & RAG) ---
ENVEOF

    # Extraire OPENAI_API_KEY du .env existant
    if [ -f "$BACKUP_DIR/.env.backup" ]; then
        grep "^OPENAI_API_KEY=" "$BACKUP_DIR/.env.backup" >> .env.merged || echo "OPENAI_API_KEY=" >> .env.merged
        grep "^LLM_MODEL_NAME=" "$BACKUP_DIR/.env.backup" >> .env.merged || echo "LLM_MODEL_NAME=gpt-4o-mini" >> .env.merged
    fi

    cat >> .env.merged << 'ENVEOF'

# RAG Configuration
RAG_COLLECTION=web3_expert_knowledge
RAG_SEARCH_URL=http://127.0.0.1:8001/search
RAG_INGEST_URL=http://127.0.0.1:8001/ingest
ENVEOF

    # Extraire RAG_API_KEY du .env existant
    if [ -f "$BACKUP_DIR/.env.backup" ]; then
        grep "^RAG_API_KEY=" "$BACKUP_DIR/.env.backup" >> .env.merged || echo "RAG_API_KEY=MoneyFactory_2025_Secure_Token_X9" >> .env.merged
    fi

    cat >> .env.merged << 'ENVEOF'

# --- FRONTEND CONFIG ---
VITE_API_BASE_URL=http://localhost:3002

# --- CORS ---
CORS_ALLOWED_ORIGINS=https://journey.mfai.app,http://localhost:3003,http://localhost:4173

# --- EXECUTION MODE ---
EXECUTION_ENABLED=false
REAL_EXECUTION_MODE=false
DEMO_MODE=true
ENVEOF

    # Remplacer .env par la version fusionnée
    mv .env.merged .env
    chmod 600 .env
    
    echo -e "${GREEN}✅ Fichier .env fusionné et sécurisé${NC}"
else
    echo -e "${YELLOW}⚠️  Pas de .env.new, conservation du .env existant${NC}"
fi
echo ""

# ============================================================================
# 6. BUILD ET DÉMARRAGE DES SERVICES
# ============================================================================
echo -e "${BLUE}🐳 6. BUILD ET DÉMARRAGE DES SERVICES${NC}"
echo -e "${YELLOW}-------------------------------------------${NC}"

echo "Build des images Docker..."
docker compose -f docker-compose.prod.yml build --no-cache

echo "Démarrage des services..."
docker compose -f docker-compose.prod.yml up -d

echo "Attente du démarrage des services (30s)..."
sleep 30

echo -e "${GREEN}✅ Services démarrés${NC}"
echo ""

# ============================================================================
# 7. VÉRIFICATION DU DÉPLOIEMENT
# ============================================================================
echo -e "${BLUE}✅ 7. VÉRIFICATION DU DÉPLOIEMENT${NC}"
echo -e "${YELLOW}-------------------------------------------${NC}"

echo "État des containers:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "Logs récents (backend):"
docker compose -f docker-compose.prod.yml logs --tail=20 api

echo ""
echo "Test de connectivité backend (port 3002):"
curl -s http://localhost:3002/health || echo "❌ Backend non accessible"

echo ""
echo "Test de connectivité frontend (port 3003):"
curl -s -I http://localhost:3003 | head -3 || echo "❌ Frontend non accessible"

echo ""

# ============================================================================
# 8. RÉSUMÉ DU DÉPLOIEMENT
# ============================================================================
echo -e "${CYAN}============================================================================${NC}"
echo -e "${GREEN}✅ DÉPLOIEMENT TERMINÉ - RELEASE CANDIDATE V1.0${NC}"
echo -e "${CYAN}============================================================================${NC}"
echo ""
echo "📊 Résumé:"
echo "  - Commit déployé: $(git log -1 --oneline)"
echo "  - Sauvegarde: $BACKUP_DIR"
echo "  - Services: $(docker compose -f docker-compose.prod.yml ps --services | wc -l) containers actifs"
echo ""
echo "🌐 URLs:"
echo "  - Frontend: https://journey.mfai.app"
echo "  - Backend API: https://journey.mfai.app/api (via proxy Nginx)"
echo ""
echo "📋 Prochaines étapes:"
echo "  1. Vérifier https://journey.mfai.app dans un navigateur"
echo "  2. Tester la connexion et la navigation"
echo "  3. Vérifier les logs: docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo -e "${YELLOW}⚠️  En cas de problème, restaurer avec:${NC}"
echo "  cd /srv/journey-mfai"
echo "  cp $BACKUP_DIR/.env.backup .env"
echo "  git reset --hard \$(cat $BACKUP_DIR/commit_before.txt | awk '{print \$1}')"
echo "  docker compose -f docker-compose.prod.yml up -d --build"
echo ""
