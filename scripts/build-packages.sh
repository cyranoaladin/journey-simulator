#!/bin/bash
# Build script for MFAI workspace packages
# Usage: ./scripts/build-packages.sh

set -e

echo "🏗️  Building MFAI workspace packages..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PACKAGES=(
  "packages/types"
  "packages/utils"
  "packages/config"
  "packages/solana-tools"
  "packages/ui"
)

for pkg in "${PACKAGES[@]}"; do
  if [ -d "$pkg" ]; then
    echo -e "${YELLOW}Building $pkg...${NC}"
    cd "$pkg"
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
      echo "  📦 Installing dependencies..."
      npm install 2>/dev/null || true
    fi
    
    # Build the package
    if npm run build 2>/dev/null; then
      echo -e "  ${GREEN}✅ $pkg built successfully${NC}"
    else
      echo -e "  ${RED}❌ $pkg build failed${NC}"
      exit 1
    fi
    
    cd - > /dev/null
  else
    echo -e "${YELLOW}⚠️  $pkg not found, skipping${NC}"
  fi
done

echo -e "${GREEN}✅ All packages built successfully!${NC}"
