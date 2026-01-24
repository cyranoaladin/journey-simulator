#!/bin/bash

# COULEURS
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 MFAI PRODUCTION LAUNCHER (TypeScript Edition)${NC}"
echo "============================="

# 1. CLEANUP
echo "🧹 Nettoyage des ports..."
fuser -k 3001/tcp > /dev/null 2>&1
fuser -k 4173/tcp > /dev/null 2>&1
sleep 1

# 2. BACKEND START
echo "🔌 Démarrage du Backend (Port 3001)..."

# Vérification du fichier TypeScript
if [ -f "mf-back/src/server.ts" ]; then
    # Mode Prod
    export NODE_ENV=production
    export PORT=3001
    
    # Lancement via TS-NODE en background
    # On utilise npx pour être sûr d'avoir le binaire
    cd mf-back
    nohup npx ts-node src/server.ts > ../backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    echo "   PID Backend: $BACKEND_PID"
else
    echo -e "${RED}❌ ERREUR: mf-back/src/server.ts introuvable!${NC}"
    echo "Vérifiez l'arborescence :"
    ls -R mf-back
    exit 1
fi

# 3. HEALTH CHECK
echo "⏳ Attente du démarrage Backend..."
attempt=0
while [ $attempt -lt 15 ]; do
    if curl -s http://localhost:3001/api/health > /dev/null; then
        echo -e "${GREEN}✅ Backend en ligne !${NC}"
        break
    fi
    sleep 1
    attempt=$((attempt+1))
done

if [ $attempt -eq 15 ]; then
    echo -e "${RED}❌ Le Backend ne répond pas. Voir backend.log pour l'erreur.${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# 4. FRONTEND START
echo "🎨 Démarrage du Frontend (Port 4173)..."
cd journey-simulator
if [ -d "dist" ]; then
    # Lancement Preview en background
    npm run preview -- --port 4173 --host > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "   PID Frontend: $FRONTEND_PID"
else
    echo -e "${RED}❌ ERREUR: Dossier dist/ introuvable. Lancez 'npm run build' d'abord.${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# 5. SUCCESS MESSAGE
cd ..
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  🚀 MFAI SYSTEM READY                                      ║${NC}"
echo -e "${GREEN}║  Frontend:  http://localhost:4173                          ║${NC}"
echo -e "${GREEN}║  Backend:   http://localhost:3001                          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo "📝 Logs disponibles dans backend.log et frontend.log"
echo "🛑 Appuyez sur [CTRL+C] pour tout arrêter proprement."

# 6. TRAP (Gestion Arrêt)
cleanup() {
    echo ""
    echo "🛑 Arrêt des services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Terminé."
    exit
}

trap cleanup SIGINT SIGTERM

# Garder le script actif
wait
