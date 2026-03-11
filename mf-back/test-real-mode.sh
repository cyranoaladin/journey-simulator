#!/bin/bash
# Real Mode Implementation Test Script

echo "========================================="
echo "MFAI Real Mode Implementation Test"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

check() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $1"
  else
    echo -e "${RED}✗${NC} $1"
    exit 1
  fi
}

echo "1. TypeScript Compilation..."
npm run build > /dev/null 2>&1
check "TypeScript build successful"

echo ""
echo "2. Checking Real Mode Files..."
[ -f "src/services/JourneyService.ts" ]
check "JourneyService.ts exists"

[ -f "src/controllers/journey.controller.ts" ]
check "journey.controller.ts exists"

[ -f "src/routes/journey.routes.ts" ]
check "journey.routes.ts exists"

[ -f "src/orchestration/workflowMap.js" ]
check "workflowMap.js exists"

echo ""
echo "3. Validating Persona Mapping..."
PERSONAS=("cognitive-activation-hub" "capital-foundry" "system-architect" "experience-studio" "impact-engine" "resilience-master")
for persona in "${PERSONAS[@]}"; do
  grep -q "$persona" src/orchestration/workflowMap.js
  check "Persona $persona mapped"
done

echo ""
echo "4. Checking Agent Intents..."
INTENTS=("security_audit" "product_spec" "tokenomics" "governance_dao" "ux_writing" "curriculum" "api_contract")
for intent in "${INTENTS[@]}"; do
  grep -q "$intent" src/agents/registry.js
  check "Intent '$intent' registered"
done

echo ""
echo "========================================="
echo -e "${GREEN}✓ All Real Mode tests passed!${NC}"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Start backend: npm run dev"
echo "  2. Test endpoints with authenticated requests"
echo "  3. Validate Zyno orchestration"
