#!/bin/bash
# ============================================================================
# SCRIPT D'AUDIT SERVEUR MONEY FACTORY - RELEASE CANDIDATE V1.0
# ============================================================================
# Date: 2026-01-01
# Objectif: Auditer l'infrastructure serveur avant déploiement propre
# Serveur: moneyfactory-core (88.99.254.59)
# ============================================================================

set -e

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}============================================================================${NC}"
echo -e "${CYAN}🔍 AUDIT SERVEUR MONEY FACTORY - INFRASTRUCTURE ANALYSIS${NC}"
echo -e "${CYAN}============================================================================${NC}"
echo ""

# ============================================================================
# 1. INFORMATIONS SYSTÈME
# ============================================================================
echo -e "${BLUE}📊 1. INFORMATIONS SYSTÈME${NC}"
echo -e "${YELLOW}-------------------------------------------${NC}"
echo "Hostname: $(hostname)"
echo "OS: $(lsb_release -d | cut -f2)"
echo "Kernel: $(uname -r)"
echo "Uptime: $(uptime -p)"
echo "IP Public: $(hostname -I | awk '{print $1}')"
echo "Date: $(date)"
echo ""

# ============================================================================
# 2. RESSOURCES SYSTÈME
# ============================================================================
echo -e "${BLUE}💾 2. RESSOURCES SYSTÈME${NC}"
echo -e "${YELLOW}-------------------------------------------${NC}"
echo "CPU:"
lscpu | grep -E "Model name|CPU\(s\):|Thread"
echo ""
echo "Mémoire:"
free -h
echo ""
echo "Disque:"
df -h | grep -E "Filesystem|/$|/var|/srv"
echo ""

# ============================================================================
# 3. SERVICES ACTIFS (Docker, Nginx, MongoDB, etc.)
# ============================================================================
echo -e "${BLUE}🐳 3. SERVICES DOCKER${NC}"
echo -e "${YELLOW}-------------------------------------------${NC}"
if command -v docker &> /dev/null; then
    echo "Docker version: $(docker --version)"
    echo ""
    echo "Containers actifs:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" || echo "Aucun container actif"
    echo ""
    echo "Tous les containers:"
    docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Image}}" || echo "Aucun container"
    echo ""
    echo "Images Docker:"
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" || echo "Aucune image"
else
    echo "Docker non installé"
fi
echo ""

# ============================================================================
# 4. NGINX CONFIGURATION
# ============================================================================
echo -e "${BLUE}🌐 4. NGINX CONFIGURATION${NC}"
echo -e "${YELLOW}-------------------------------------------${NC}"
if command -v nginx &> /dev/null; then
    echo "Nginx version: $(nginx -v 2>&1)"
    echo ""
    echo "Sites disponibles:"
    ls -la /etc/nginx/sites-available/ 2>/dev/null || echo "Dossier non trouvé"
    echo ""
    echo "Sites activés:"
    ls -la /etc/nginx/sites-enabled/ 2>/dev/null || echo "Dossier non trouvé"
    echo ""
    echo "Domaines configurés:"
    grep -r "server_name" /etc/nginx/sites-enabled/ 2>/dev/null | grep -v "#" | awk '{print $3}' | sort -u || echo "Aucun domaine trouvé"
else
    echo "Nginx non installé"
fi
echo ""

# ============================================================================
# 5. DOMAINES ET SOUS-DOMAINES
# ============================================================================
echo -e "${BLUE}🌍 5. DOMAINES ET SOUS-DOMAINES${NC}"
echo -e "${YELLOW}-------------------------------------------${NC}"
echo "Recherche des domaines dans la configuration Nginx..."
if [ -d /etc/nginx/sites-enabled ]; then
    for site in /etc/nginx/sites-enabled/*; do
        if [ -f "$site" ]; then
            echo ""
            echo -e "${GREEN}📄 $(basename $site)${NC}"
            grep -E "server_name|listen|proxy_pass|root" "$site" | grep -v "#" | sed 's/^/  /'
        fi
    done
else
    echo "Dossier /etc/nginx/sites-enabled non trouvé"
fi
echo ""

# ============================================================================
# 6. STRUCTURE DES RÉPERTOIRES
# ============================================================================
echo -e "${BLUE}📁 6. STRUCTURE DES RÉPERTOIRES${NC}"
echo -e "${YELLOW}-------------------------------------------${NC}"
echo "Répertoire /var/www:"
ls -lah /var/www/ 2>/dev/null || echo "Dossier non trouvé"
echo ""
echo "Répertoire /srv:"
ls -lah /srv/ 2>/dev/null || echo "Dossier non trouvé"
echo ""
echo "Détails /var/www/mfai.app:"
if [ -d /var/www/mfai.app ]; then
    ls -lah /var/www/mfai.app/
    echo ""
    echo "Taille totale:"
    du -sh /var/www/mfai.app/
else
    echo "Dossier non trouvé"
fi
echo ""
echo "Détails /srv/journey-mfai:"
if [ -d /srv/journey-mfai ]; then
    ls -lah /srv/journey-mfai/
    echo ""
    echo "Taille totale:"
    du -sh /srv/journey-mfai/
else
    echo "Dossier non trouvé"
fi
echo ""

# ============================================================================
# 7. PROCESSUS NODEJS
# ============================================================================
echo -e "${BLUE}⚙️  7. PROCESSUS NODE.JS${NC}"
echo -e "${YELLOW}-------------------------------------------${NC}"
echo "Processus Node.js actifs:"
ps aux | grep -E "node|npm" | grep -v grep || echo "Aucun processus Node.js"
echo ""

# ============================================================================
# 8. PORTS UTILISÉS
# ============================================================================
echo -e "${BLUE}🔌 8. PORTS UTILISÉS${NC}"
echo -e "${YELLOW}-------------------------------------------${NC}"
echo "Ports en écoute:"
netstat -tlnp 2>/dev/null | grep LISTEN || ss -tlnp | grep LISTEN
echo ""

# ============================================================================
# 9. MONGODB
# ============================================================================
echo -e "${BLUE}🍃 9. MONGODB${NC}"
echo -e "${YELLOW}-------------------------------------------${NC}"
if command -v mongod &> /dev/null; then
    echo "MongoDB installé: $(mongod --version | head -1)"
    echo ""
    echo "Status MongoDB:"
    systemctl status mongod --no-pager -l || echo "Service non trouvé"
else
    echo "MongoDB non installé en natif (peut être dans Docker)"
    docker ps | grep mongo || echo "Pas de container MongoDB"
fi
echo ""

# ============================================================================
# 10. SCRIPTS DE DÉPLOIEMENT
# ============================================================================
echo -e "${BLUE}📜 10. SCRIPTS DE DÉPLOIEMENT${NC}"
echo -e "${YELLOW}-------------------------------------------${NC}"
echo "Scripts dans /root:"
ls -lah /root/*.sh 2>/dev/null || echo "Aucun script .sh trouvé"
echo ""
if [ -f /root/deploy_journey.sh ]; then
    echo "Contenu de deploy_journey.sh:"
    cat /root/deploy_journey.sh
    echo ""
fi
if [ -f /root/deploy_mfai.sh ]; then
    echo "Contenu de deploy_mfai.sh:"
    cat /root/deploy_mfai.sh
    echo ""
fi
echo ""

# ============================================================================
# 11. VARIABLES D'ENVIRONNEMENT
# ============================================================================
echo -e "${BLUE}🔐 11. FICHIERS .ENV${NC}"
echo -e "${YELLOW}-------------------------------------------${NC}"
echo "Recherche des fichiers .env:"
find /var/www /srv -name ".env*" -type f 2>/dev/null | while read envfile; do
    echo ""
    echo -e "${GREEN}📄 $envfile${NC}"
    echo "Taille: $(du -h "$envfile" | cut -f1)"
    echo "Dernière modification: $(stat -c %y "$envfile" | cut -d'.' -f1)"
done
echo ""

# ============================================================================
# 12. LOGS RÉCENTS
# ============================================================================
echo -e "${BLUE}📋 12. LOGS RÉCENTS${NC}"
echo -e "${YELLOW}-------------------------------------------${NC}"
echo "Logs Nginx (dernières 10 lignes):"
tail -10 /var/log/nginx/error.log 2>/dev/null || echo "Fichier non trouvé"
echo ""
echo "Logs système (dernières 10 lignes):"
journalctl -n 10 --no-pager 2>/dev/null || echo "Journalctl non disponible"
echo ""

# ============================================================================
# 13. CERTIFICATS SSL
# ============================================================================
echo -e "${BLUE}🔒 13. CERTIFICATS SSL${NC}"
echo -e "${YELLOW}-------------------------------------------${NC}"
echo "Certificats Let's Encrypt:"
if [ -d /etc/letsencrypt/live ]; then
    ls -la /etc/letsencrypt/live/
    echo ""
    for cert in /etc/letsencrypt/live/*/cert.pem; do
        if [ -f "$cert" ]; then
            domain=$(dirname "$cert" | xargs basename)
            echo -e "${GREEN}Domaine: $domain${NC}"
            openssl x509 -in "$cert" -noout -dates 2>/dev/null || echo "Impossible de lire le certificat"
            echo ""
        fi
    done
else
    echo "Dossier Let's Encrypt non trouvé"
fi
echo ""

# ============================================================================
# 14. GIT REPOSITORIES
# ============================================================================
echo -e "${BLUE}📦 14. REPOSITORIES GIT${NC}"
echo -e "${YELLOW}-------------------------------------------${NC}"
echo "Recherche des dépôts Git:"
find /var/www /srv -name ".git" -type d 2>/dev/null | while read gitdir; do
    repodir=$(dirname "$gitdir")
    echo ""
    echo -e "${GREEN}📂 $repodir${NC}"
    cd "$repodir"
    echo "Branch: $(git branch --show-current 2>/dev/null || echo 'N/A')"
    echo "Remote: $(git remote get-url origin 2>/dev/null || echo 'N/A')"
    echo "Last commit: $(git log -1 --oneline 2>/dev/null || echo 'N/A')"
    echo "Status: $(git status --short 2>/dev/null | wc -l) fichiers modifiés"
done
echo ""

# ============================================================================
# 15. CRON JOBS
# ============================================================================
echo -e "${BLUE}⏰ 15. CRON JOBS${NC}"
echo -e "${YELLOW}-------------------------------------------${NC}"
echo "Cron jobs root:"
crontab -l 2>/dev/null || echo "Aucun cron job"
echo ""

# ============================================================================
# 16. RÉSUMÉ JOURNEY.MFAI.APP
# ============================================================================
echo -e "${BLUE}🎯 16. RÉSUMÉ JOURNEY.MFAI.APP${NC}"
echo -e "${YELLOW}-------------------------------------------${NC}"
echo "Test de connectivité:"
curl -I https://journey.mfai.app 2>/dev/null | head -5 || echo "Site non accessible"
echo ""
if [ -d /srv/journey-mfai ]; then
    echo "Contenu du répertoire journey-mfai:"
    ls -lah /srv/journey-mfai/
    echo ""
    if [ -f /srv/journey-mfai/docker-compose.yml ]; then
        echo "Docker Compose configuration:"
        cat /srv/journey-mfai/docker-compose.yml
    fi
fi
echo ""

# ============================================================================
# 17. RECOMMANDATIONS DE NETTOYAGE
# ============================================================================
echo -e "${BLUE}🧹 17. RECOMMANDATIONS DE NETTOYAGE${NC}"
echo -e "${YELLOW}-------------------------------------------${NC}"
echo "Containers Docker arrêtés:"
docker ps -a --filter "status=exited" --format "{{.Names}}" 2>/dev/null || echo "Aucun"
echo ""
echo "Images Docker non utilisées:"
docker images -f "dangling=true" -q 2>/dev/null | wc -l || echo "0"
echo ""
echo "Fichiers logs volumineux (>100MB):"
find /var/log -type f -size +100M 2>/dev/null || echo "Aucun"
echo ""

# ============================================================================
# FIN DU RAPPORT
# ============================================================================
echo -e "${CYAN}============================================================================${NC}"
echo -e "${GREEN}✅ AUDIT TERMINÉ${NC}"
echo -e "${CYAN}============================================================================${NC}"
echo ""
echo "Rapport généré le: $(date)"
echo "Pour sauvegarder ce rapport: ./audit_server.sh > audit_report_$(date +%Y%m%d_%H%M%S).txt"
echo ""
