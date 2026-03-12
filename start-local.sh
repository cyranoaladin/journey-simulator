#!/bin/bash

# Start MFAI Stack in Local Development Mode
# Usage: ./start-local.sh

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║           MFAI STACK - LOCAL DEVELOPMENT                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Arrêt des services...${NC}"
    docker-compose stop postgres redis 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker n'est pas démarré${NC}"
    exit 1
fi

# Start infrastructure services (Postgres + Redis)
echo -e "${YELLOW}🐳 Démarrage de l'infrastructure (Postgres + Redis)...${NC}"
docker-compose up -d postgres redis

# Wait for Postgres to be ready
echo -e "${YELLOW}⏳ Attente de PostgreSQL...${NC}"
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U mfai -d mfai_db > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL prêt${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Timeout en attendant PostgreSQL${NC}"
        exit 1
    fi
done

# Setup backend environment
echo -e "${YELLOW}⚙️ Configuration du backend...${NC}"
cd mf-back

# Create .env if not exists
if [ ! -f .env ]; then
    cat > .env << EOF
NODE_ENV=development
PORT=3002
DATABASE_URL=postgresql://mfai:mfai_secure_2024@localhost:5433/mfai_db?schema=public
REDIS_URL=redis://localhost:6379
JWT_SECRET=local_dev_secret_key_change_in_production
EOF
    echo -e "${GREEN}✅ Fichier .env créé${NC}"
fi

# Run Prisma migrations
echo -e "${YELLOW}🗄️ Migrations Prisma...${NC}"
npx prisma migrate dev --name init --create-only 2>/dev/null || true
npx prisma db push --accept-data-loss 2>/dev/null || true
npx prisma generate

# Start backend in background
echo -e "${YELLOW}🚀 Démarrage du backend (port 3002)...${NC}"
npm run dev &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend démarré (PID: $BACKEND_PID)${NC}"

cd ..

# Wait for backend
echo -e "${YELLOW}⏳ Attente du backend...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:3002/health > /dev/null 2>&1 || curl -s http://localhost:3002/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend prêt${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}⚠️ Backend pas encore prêt, on continue...${NC}"
    fi
done

# Setup frontend
echo -e "${YELLOW}⚙️ Configuration du frontend...${NC}"
cd journey-simulator

# Ensure .env.local exists
if [ ! -f .env.local ]; then
    echo "VITE_API_BASE_URL=http://localhost:3002" > .env.local
fi

# Start frontend
echo -e "${YELLOW}🚀 Démarrage du frontend (port 5173)...${NC}"
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend démarré (PID: $FRONTEND_PID)${NC}"

cd ..

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    ✅ STACK DÉMARRÉ                        ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║  🌐 Frontend:  http://localhost:5173                       ║"
echo "║  🔌 Backend:   http://localhost:3002                       ║"
echo "║  🗄️  Postgres: localhost:5433                              ║"
echo "║  📦 Redis:     localhost:6379                              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${YELLOW}Appuyez sur Ctrl+C pour arrêter tous les services${NC}"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
