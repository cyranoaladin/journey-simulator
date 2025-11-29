#!/bin/bash
set -e

# ============================================================================
# Journey MFAI - Production Deployment Script
# ============================================================================
# This script deploys the Journey MFAI application on a production server
# alongside an existing RAG Local installation without conflicts.
# ============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/srv/journey-mfai"
DOMAIN="journey.mfai.app"
GITHUB_REPO="https://github.com/cyranoaladin/journey-simulator.git"
GITHUB_BRANCH="main"

# Ports (avoiding RAG ports: 8001, 18501, 8000, 11434)
API_PORT=3002
WEB_PORT=3003
MONGO_PORT=27017
POSTGRES_PORT=5433

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Journey MFAI - Production Deployment Script          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# Step 1: Prerequisites Check
# ============================================================================
echo -e "${YELLOW}[1/8] Checking prerequisites...${NC}"

# Check if running as root or with sudo
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}✗ This script must be run as root or with sudo${NC}"
   exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    exit 1
fi

# Check Docker Compose
if ! docker compose version &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    exit 1
fi

# Check Nginx
if ! command -v nginx &> /dev/null; then
    echo -e "${RED}✗ Nginx is not installed${NC}"
    exit 1
fi

# Check Certbot
if ! command -v certbot &> /dev/null; then
    echo -e "${RED}✗ Certbot is not installed${NC}"
    exit 1
fi

# Check Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}✗ Git is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites are installed${NC}"
echo ""

# ============================================================================
# Step 2: Collect Sensitive Information
# ============================================================================
echo -e "${YELLOW}[2/8] Collecting configuration...${NC}"

# Prompt for GitHub credentials
echo -e "${BLUE}Enter your GitHub Personal Access Token (PAT):${NC}"
read -s GITHUB_TOKEN
echo ""

# Prompt for OpenAI API Key
echo -e "${BLUE}Enter your OpenAI API Key (sk-proj-...):${NC}"
read -s OPENAI_API_KEY
echo ""

# Generate or prompt for Admin API Key
echo -e "${BLUE}Enter Admin API Key (or press Enter to generate a secure one):${NC}"
read -s ADMIN_API_KEY
if [ -z "$ADMIN_API_KEY" ]; then
    ADMIN_API_KEY=$(openssl rand -hex 32)
    echo -e "${GREEN}✓ Generated secure admin key${NC}"
fi
echo ""

# RAG Token (already known)
RAG_TOKEN="MoneyFactory_2025_Secure_Token_X9"

echo -e "${GREEN}✓ Configuration collected${NC}"
echo ""

# ============================================================================
# Step 3: Clone Repository
# ============================================================================
echo -e "${YELLOW}[3/8] Cloning repository...${NC}"

# Remove existing directory if it exists
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}⚠ Project directory exists. Backing up...${NC}"
    mv "$PROJECT_DIR" "${PROJECT_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Clone with authentication
git clone -b $GITHUB_BRANCH https://${GITHUB_TOKEN}@github.com/cyranoaladin/journey-simulator.git "$PROJECT_DIR"

cd "$PROJECT_DIR"

echo -e "${GREEN}✓ Repository cloned successfully${NC}"
echo ""

# ============================================================================
# Step 4: Configure Environment Variables
# ============================================================================
echo -e "${YELLOW}[4/8] Configuring environment variables...${NC}"

cat > "$PROJECT_DIR/.deploy.env" <<EOF
# Backend Configuration
NODE_ENV=production
PORT=${API_PORT}
MONGO_URI=mongodb://mfai-mongo:27017/journey
ADMIN_API_KEY=${ADMIN_API_KEY}

# Frontend Configuration
VITE_API_BASE_URL=https://${DOMAIN}/api
VITE_RESOURCE_LIBRARY_BASE_URL=/documents

# OpenAI Configuration
OPENAI_API_KEY=${OPENAI_API_KEY}

# RAG Configuration
RAG_API_URL=https://rag-api.nexusreussite.academy
RAG_TOKEN=${RAG_TOKEN}

# Security
JWT_SECRET=$(openssl rand -hex 32)
EOF

chmod 600 "$PROJECT_DIR/.deploy.env"

echo -e "${GREEN}✓ Environment configured${NC}"
echo ""

# ============================================================================
# Step 5: Update Docker Compose for Production
# ============================================================================
echo -e "${YELLOW}[5/8] Preparing Docker configuration...${NC}"

# Ensure docker-compose.deploy.yml uses correct ports
sed -i "s/\"5435:5432\"/\"${POSTGRES_PORT}:5432\"/g" "$PROJECT_DIR/docker-compose.deploy.yml"

echo -e "${GREEN}✓ Docker configuration ready${NC}"
echo ""

# ============================================================================
# Step 6: Build and Start Docker Containers
# ============================================================================
echo -e "${YELLOW}[6/8] Building and starting Docker containers...${NC}"

cd "$PROJECT_DIR"
docker compose -f docker-compose.deploy.yml down 2>/dev/null || true
docker compose -f docker-compose.deploy.yml up -d --build

# Wait for services to be healthy
echo -e "${BLUE}Waiting for services to start...${NC}"
sleep 10

# Check if containers are running
if docker ps | grep -q "mfai-api" && docker ps | grep -q "mfai-web"; then
    echo -e "${GREEN}✓ All containers are running${NC}"
else
    echo -e "${RED}✗ Some containers failed to start. Check logs with:${NC}"
    echo -e "${RED}  docker compose -f $PROJECT_DIR/docker-compose.deploy.yml logs${NC}"
    exit 1
fi

echo ""

# ============================================================================
# Step 7: Configure Nginx
# ============================================================================
echo -e "${YELLOW}[7/8] Configuring Nginx...${NC}"

cat > "/etc/nginx/sites-available/${DOMAIN}" <<EOF
server {
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
ln -sf "/etc/nginx/sites-available/${DOMAIN}" "/etc/nginx/sites-enabled/${DOMAIN}"

# Test Nginx configuration
if nginx -t; then
    systemctl reload nginx
    echo -e "${GREEN}✓ Nginx configured and reloaded${NC}"
else
    echo -e "${RED}✗ Nginx configuration error${NC}"
    exit 1
fi

echo ""

# ============================================================================
# Step 8: Configure SSL with Let's Encrypt
# ============================================================================
echo -e "${YELLOW}[8/8] Configuring SSL certificate...${NC}"

# Check if certificate already exists
if [ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN} --redirect
    echo -e "${GREEN}✓ SSL certificate installed${NC}"
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
echo -e "  • Logs: docker compose -f ${PROJECT_DIR}/docker-compose.deploy.yml logs -f"
echo ""
echo -e "${YELLOW}Container Status:${NC}"
docker ps --filter "name=mfai-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Visit https://${DOMAIN} to verify the deployment"
echo -e "  2. Test the API at https://${DOMAIN}/api/health"
echo -e "  3. Save the Admin API Key in a secure location"
echo ""
echo -e "${GREEN}✓ Deployment script completed!${NC}"
