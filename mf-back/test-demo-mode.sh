#!/bin/bash

# Test Script for Priorities 1-3
# Run this after starting the backend server

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                              ║"
echo "║                   🧪 TESTING PRIORITIES 1-3                                  ║"
echo "║                                                                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
API_PORT="${API_PORT:-3005}"
API_BASE_URL="${API_BASE_URL:-http://127.0.0.1:${API_PORT}}"
AUTH_TOKEN="${AUTH_TOKEN:-test_token}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Function to run test
run_test() {
    local test_name="$1"
    local endpoint="$2"
    local method="$3"
    local data="$4"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Test #${TESTS_TOTAL}: ${test_name}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "${API_BASE_URL}${endpoint}" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${AUTH_TOKEN}" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X GET "${API_BASE_URL}${endpoint}" \
            -H "Authorization: Bearer ${AUTH_TOKEN}")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    echo "HTTP Status: $http_code"
    echo "Response:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAIL${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    echo ""
}

# Check if server is running
echo "Checking if backend server is running..."
if ! curl -s "${API_BASE_URL}/health" > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend server is not running at ${API_BASE_URL}${NC}"
    echo "Please start the server with: cd mf-back && npm start"
    exit 1
fi
echo -e "${GREEN}✅ Backend server is running${NC}"
echo ""

# ============================================================================
# PRIORITY 2: DEMO MODE TESTS
# ============================================================================

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                    PRIORITY 2: DEMO MODE TESTS                               ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

run_test "Load Demo: Cognitive Activation Hub" \
    "/journey/load-demo" \
    "POST" \
    '{"personaId": "cognitive-activation-hub"}'

run_test "Load Demo: Capital Foundry" \
    "/journey/load-demo" \
    "POST" \
    '{"personaId": "capital-foundry"}'

run_test "Load Demo: System Architect" \
    "/journey/load-demo" \
    "POST" \
    '{"personaId": "system-architect"}'

run_test "Load Demo: Experience Studio" \
    "/journey/load-demo" \
    "POST" \
    '{"personaId": "experience-studio"}'

run_test "Load Demo: Impact Engine" \
    "/journey/load-demo" \
    "POST" \
    '{"personaId": "impact-engine"}'

run_test "Load Demo: Resilience Master" \
    "/journey/load-demo" \
    "POST" \
    '{"personaId": "resilience-master"}'

run_test "Load Demo: Invalid Persona (should fail)" \
    "/journey/load-demo" \
    "POST" \
    '{"personaId": "invalid-persona"}'

run_test "Load Demo: Missing personaId (should fail)" \
    "/journey/load-demo" \
    "POST" \
    '{}'

# ============================================================================
# SUMMARY
# ============================================================================

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                              TEST SUMMARY                                    ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Total Tests: ${TESTS_TOTAL}"
echo -e "${GREEN}Passed: ${TESTS_PASSED}${NC}"
echo -e "${RED}Failed: ${TESTS_FAILED}${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                                              ║${NC}"
    echo -e "${GREEN}║                    ✅ ALL TESTS PASSED! 🎉                                   ║${NC}"
    echo -e "${GREEN}║                                                                              ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                                              ║${NC}"
    echo -e "${RED}║                    ❌ SOME TESTS FAILED                                      ║${NC}"
    echo -e "${RED}║                                                                              ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
