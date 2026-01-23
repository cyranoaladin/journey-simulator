#!/bin/bash
set -e

# ============================================================================
# Journey MFAI - Production Deployment Script
# Repository: https://github.com/cyranoaladin/journey-simulator (PUBLIC)
# Target: Ubuntu 22.04 with existing RAG on ports 8001/18501
# ============================================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_DIR="/srv/journey-mfai"
GITHUB_REPO="https://github.com/cyranoaladin/journey-simulator.git"
GITHUB_BRANCH="main"

# Ports (avoiding RAG: 8001, 18501, 8000, 11434)
API_PORT=3002
WEB_PORT=3003
MONGO_PORT=27017
POSTGRES_PORT=5433

# RAG Configuration (hardcoded)
RAG_SEARCH_URL="http://127.0.0.1:8001/rag/query"
RAG_API_KEY="MoneyFactory_2025_Secure_Token_X9"
RAG_DOMAIN="mfai_web3"

# Domain (can be customized)
DOMAIN="${1:-journey.mfai.app}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Journey MFAI - Production Deployment Script          ║${NC}"
echo -e "${BLUE}║     Domain: ${DOMAIN}${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# Cleanup function for rollback
# ============================================================================
cleanup() {
    echo -e "${RED}✗ Deployment failed. Rolling back...${NC}"
    if [ -d "$PROJECT_DIR" ]; then
        cd "$PROJECT_DIR"
        docker compose -f docker-compose.prod.yml down 2>/dev/null || true
    fi
    exit 1
}

trap cleanup ERR

# ============================================================================
# Step 1: Prerequisites Check
# ============================================================================
echo -e "${YELLOW}[1/7] Checking prerequisites...${NC}"

if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}✗ This script must be run as root or with sudo${NC}"
   exit 1
fi

for cmd in docker git nginx certbot; do
    if ! command -v $cmd &> /dev/null; then
        echo -e "${RED}✗ $cmd is not installed${NC}"
        exit 1
    fi
done

if ! docker compose version &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites are installed${NC}"
echo ""

# ============================================================================
# Step 2: Clone or Update Repository
# ============================================================================
echo -e "${YELLOW}[2/7] Cloning/updating repository...${NC}"

if [ -d "$PROJECT_DIR" ]; then
    echo -e "${BLUE}Project directory exists. Updating...${NC}"
    cd "$PROJECT_DIR"
    git fetch origin
    git reset --hard origin/$GITHUB_BRANCH
    git pull origin $GITHUB_BRANCH
else
    git clone -b $GITHUB_BRANCH $GITHUB_REPO "$PROJECT_DIR"
    cd "$PROJECT_DIR"
fi

echo -e "${GREEN}✓ Repository ready${NC}"
echo ""

# ============================================================================
# Step 3: Configure Environment Variables
# ============================================================================
echo -e "${YELLOW}[3/7] Configuring environment variables...${NC}"

ENV_FILE="$PROJECT_DIR/.env"

# Check if .env exists
if [ -f "$ENV_FILE" ]; then
    echo -e "${BLUE}.env file exists. Checking for missing variables...${NC}"
    source "$ENV_FILE"
else
    echo -e "${BLUE}Creating .env file from template...${NC}"
    if [ -f "$PROJECT_DIR/.env.example" ]; then
        cp "$PROJECT_DIR/.env.example" "$ENV_FILE"
    else
        touch "$ENV_FILE"
    fi
fi

# Prompt for OpenAI API Key if not set
if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${BLUE}Enter your OpenAI API Key:${NC}"
    read -s OPENAI_API_KEY
    echo ""
fi

# Prompt for Admin API Key if not set
if [ -z "$ADMIN_API_KEY" ]; then
    echo -e "${BLUE}Enter Admin API Key (or press Enter to generate):${NC}"
    read -s ADMIN_API_KEY
    if [ -z "$ADMIN_API_KEY" ]; then
        ADMIN_API_KEY=$(openssl rand -hex 32)
        echo -e "${GREEN}✓ Generated secure admin key${NC}"
    fi
    echo ""
fi

# Generate JWT Secret if not set
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -hex 32)
fi

# Write complete .env file
cat > "$ENV_FILE" <<EOF
# Backend Configuration
NODE_ENV=production
PORT=${API_PORT}
MONGO_URI=mongodb://mfai-mongo:27017/journey
ADMIN_API_KEY=${ADMIN_API_KEY}
JWT_SECRET=${JWT_SECRET}

# Frontend Configuration
VITE_API_BASE_URL=https://${DOMAIN}/api
VITE_RESOURCE_LIBRARY_BASE_URL=/documents

# OpenAI Configuration
OPENAI_API_KEY=${OPENAI_API_KEY}

# RAG Configuration (Local RAG on same server)
RAG_SEARCH_URL=${RAG_SEARCH_URL}
RAG_API_KEY=${RAG_API_KEY}
RAG_DOMAIN=${RAG_DOMAIN}
EOF

chmod 600 "$ENV_FILE"

echo -e "${GREEN}✓ Environment configured${NC}"
echo ""

# ============================================================================
# Step 4: Create Production Docker Compose
# ============================================================================
echo -e "${YELLOW}[4/7] Creating Docker Compose configuration...${NC}"

cat > "$PROJECT_DIR/docker-compose.prod.yml" <<EOF
version: "3.9"

services:
  mfai-api:
    container_name: mfai-api
    build:
      context: ./mf-back
      dockerfile: Dockerfile
    command: npm start
    environment:
      NODE_ENV: production
      PORT: ${API_PORT}
      MONGO_URI: mongodb://mfai-mongo:27017/journey
    env_file:
      - .env
    ports:
      - "${API_PORT}:${API_PORT}"
    depends_on:
      mfai-mongo:
        condition: service_healthy
    restart: always
    networks:
      - mfai-network

  mfai-mongo:
    container_name: mfai-mongo
    image: mongo:6
    restart: always
    ports:
      - "127.0.0.1:${MONGO_PORT}:27017"
    volumes:
      - mfai-mongo-data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    networks:
      - mfai-network

  mfai-postgres:
    container_name: mfai-postgres
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_DB: prisma
      POSTGRES_USER: prisma
      POSTGRES_PASSWORD: prisma
    ports:
      - "127.0.0.1:${POSTGRES_PORT}:5432"
    volumes:
      - mfai-postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "prisma"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    networks:
      - mfai-network

  mfai-web:
    container_name: mfai-web
    build:
      context: ./journey-simulator
      dockerfile: Dockerfile
    environment:
      VITE_API_BASE_URL: https://${DOMAIN}/api
      VITE_RESOURCE_LIBRARY_BASE_URL: /documents
    ports:
      - "127.0.0.1:${WEB_PORT}:80"
    depends_on:
      - mfai-api
    restart: always
    networks:
      - mfai-network

volumes:
  mfai-mongo-data:
  mfai-postgres-data:

networks:
  mfai-network:
    driver: bridge
EOF

echo -e "${GREEN}✓ Docker Compose configuration created${NC}"
echo ""

# ============================================================================
# Step 5: Build and Start Docker Containers
# ============================================================================
echo -e "${YELLOW}[5/7] Building and starting Docker containers...${NC}"

cd "$PROJECT_DIR"
docker compose -f docker-compose.prod.yml down 2>/dev/null || true
docker compose -f docker-compose.prod.yml up -d --build

echo -e "${BLUE}Waiting for services to start...${NC}"
sleep 15

# Verify containers are running
if docker ps | grep -q "mfai-api" && docker ps | grep -q "mfai-web"; then
    echo -e "${GREEN}✓ All containers are running${NC}"
else
    echo -e "${RED}✗ Some containers failed to start${NC}"
    docker compose -f docker-compose.prod.yml logs
    exit 1
fi

echo ""

# ============================================================================
# Step 6: Configure Nginx
# ============================================================================
echo -e "${YELLOW}[6/7] Configuring Nginx...${NC}"

NGINX_CONF="/etc/nginx/sites-available/journey.conf"

cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:${WEB_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:${API_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/${DOMAIN}.access.log;
    error_log /var/log/nginx/${DOMAIN}.error.log;
}
EOF

# Enable site
ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/journey.conf"

# Test and reload Nginx
if nginx -t; then
    systemctl reload nginx
    echo -e "${GREEN}✓ Nginx configured and reloaded${NC}"
else
    echo -e "${RED}✗ Nginx configuration error${NC}"
    exit 1
fi

echo ""

# ============================================================================
# Step 7: Configure SSL with Let's Encrypt
# ============================================================================
echo -e "${YELLOW}[7/7] Configuring SSL certificate...${NC}"

if [ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    echo -e "${BLUE}Installing SSL certificate for ${DOMAIN}...${NC}"
    certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN} --redirect || {
        echo -e "${YELLOW}⚠ SSL certificate installation failed. You can run it manually later:${NC}"
        echo -e "${YELLOW}  certbot --nginx -d ${DOMAIN}${NC}"
    }
else
    echo -e "${GREEN}✓ SSL certificate already exists${NC}"
fi

echo ""

# ============================================================================
# Deployment Summary
# ============================================================================
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           Deployment Completed Successfully!              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Application URL:${NC} https://${DOMAIN}"
echo -e "${BLUE}API Endpoint:${NC} https://${DOMAIN}/api"
echo ""
echo -e "${YELLOW}Important Information:${NC}"
echo -e "  • Admin API Key: ${ADMIN_API_KEY}"
echo -e "  • Project Directory: ${PROJECT_DIR}"
echo -e "  • Logs: docker compose -f ${PROJECT_DIR}/docker-compose.prod.yml logs -f"
echo ""
echo -e "${YELLOW}Container Status:${NC}"
docker ps --filter "name=mfai-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo -e "${YELLOW}RAG Integration:${NC}"
echo -e "  • RAG URL: ${RAG_SEARCH_URL}"
echo -e "  • RAG Domain: ${RAG_DOMAIN}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Visit https://${DOMAIN} to verify the deployment"
echo -e "  2. Test the API at https://${DOMAIN}/api/health"
echo -e "  3. Save the Admin API Key in a secure location"
echo ""
echo -e "${GREEN}✓ Deployment script completed!${NC}"
