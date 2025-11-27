#!/bin/bash

# Test Script for DAO Backend (Priority 4)
# Run this after starting the backend server

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                              ║"
echo "║                   🧪 TESTING DAO BACKEND (PRIORITY 4)                        ║"
echo "║                                                                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"
AUTH_TOKEN="${AUTH_TOKEN:-test_token}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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
    local expected_status="${5:-200}" # Default to 200 if not specified
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}Test #${TESTS_TOTAL}: ${test_name}${NC}"
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
    
    echo "HTTP Status: $http_code (Expected: $expected_status)"
    echo "Response:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    
    # Check if status matches expected (allow 2xx range if expected is 200)
    if [ "$expected_status" = "200" ]; then
        if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
            echo -e "${GREEN}✅ PASS${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${RED}❌ FAIL${NC}"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    else
        if [ "$http_code" -eq "$expected_status" ]; then
            echo -e "${GREEN}✅ PASS${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${RED}❌ FAIL${NC}"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
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
# TEST 1: GET DAO CONFIGURATION
# ============================================================================

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                    TEST 1: GET DAO CONFIGURATION                             ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

run_test "Get DAO Configuration" \
    "/dao/config" \
    "GET" \
    ""

# ============================================================================
# TEST 2: GET PROPOSALS (EMPTY)
# ============================================================================

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                    TEST 2: GET PROPOSALS (EMPTY)                             ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

run_test "Get Proposals (should be empty initially)" \
    "/dao/proposals" \
    "GET" \
    ""

# ============================================================================
# TEST 3: CREATE PROPOSAL
# ============================================================================

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                    TEST 3: CREATE PROPOSAL                                   ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

run_test "Create Proposal: Increase Staking Rewards" \
    "/dao/proposals" \
    "POST" \
    '{
      "title": "Increase Staking Rewards to 12% APY",
      "description": "Proposal to increase staking rewards from 8% to 12% APY to incentivize long-term holders and improve network security.",
      "createdBy": "test_user_1"
    }'

# Save proposal ID for voting
PROPOSAL_ID=$(curl -s -X GET "${API_BASE_URL}/dao/proposals" | jq -r '.proposals[0].id' 2>/dev/null)
echo -e "${YELLOW}Saved Proposal ID: ${PROPOSAL_ID}${NC}"
echo ""

# ============================================================================
# TEST 4: CREATE ANOTHER PROPOSAL
# ============================================================================

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                    TEST 4: CREATE ANOTHER PROPOSAL                           ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

run_test "Create Proposal: Add New Feature" \
    "/dao/proposals" \
    "POST" \
    '{
      "title": "Implement Cross-Chain Bridge",
      "description": "Proposal to develop and deploy a cross-chain bridge to Ethereum mainnet for increased liquidity and interoperability.",
      "createdBy": "test_user_2"
    }'

# ============================================================================
# TEST 5: GET ALL PROPOSALS
# ============================================================================

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                    TEST 5: GET ALL PROPOSALS                                 ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

run_test "Get All Proposals (should have 2 now)" \
    "/dao/proposals" \
    "GET" \
    ""

# ============================================================================
# TEST 6: VOTE ON PROPOSAL (YES)
# ============================================================================

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                    TEST 6: VOTE YES (Community Pool)                         ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

if [ -n "$PROPOSAL_ID" ] && [ "$PROPOSAL_ID" != "null" ]; then
    run_test "Vote YES from Community Pool (weight: 3000)" \
        "/dao/proposals/${PROPOSAL_ID}/vote" \
        "POST" \
        '{
          "voterId": "voter_1",
          "support": true
        }'
else
    echo -e "${RED}❌ Skipping vote test - no proposal ID${NC}"
    echo ""
fi

# ============================================================================
# TEST 7: VOTE ON PROPOSAL (NO)
# ============================================================================

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                    TEST 7: VOTE NO (Team)                                    ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

if [ -n "$PROPOSAL_ID" ] && [ "$PROPOSAL_ID" != "null" ]; then
    run_test "Vote NO from Team (weight: 2000)" \
        "/dao/proposals/${PROPOSAL_ID}/vote" \
        "POST" \
        '{
          "voterId": "voter_2",
          "support": false
        }'
else
    echo -e "${RED}❌ Skipping vote test - no proposal ID${NC}"
    echo ""
fi

# ============================================================================
# TEST 8: VOTE AGAIN (CHANGE VOTE)
# ============================================================================

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                    TEST 8: CHANGE VOTE (Team → YES)                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

if [ -n "$PROPOSAL_ID" ] && [ "$PROPOSAL_ID" != "null" ]; then
    run_test "Change vote from NO to YES (Team)" \
        "/dao/proposals/${PROPOSAL_ID}/vote" \
        "POST" \
        '{
          "voterId": "voter_2",
          "support": true
        }'
else
    echo -e "${RED}❌ Skipping vote test - no proposal ID${NC}"
    echo ""
fi

# ============================================================================
# TEST 9: CHECK QUORUM
# ============================================================================

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                    TEST 9: CHECK QUORUM STATUS                               ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

if [ -n "$PROPOSAL_ID" ] && [ "$PROPOSAL_ID" != "null" ]; then
    echo "Checking if quorum is met..."
    response=$(curl -s "${API_BASE_URL}/dao/proposals")
    quorum_met=$(echo "$response" | jq -r ".proposals[] | select(.id==\"${PROPOSAL_ID}\") | .quorumMet" 2>/dev/null)
    yes_votes=$(echo "$response" | jq -r ".proposals[] | select(.id==\"${PROPOSAL_ID}\") | .votes.yes" 2>/dev/null)
    no_votes=$(echo "$response" | jq -r ".proposals[] | select(.id==\"${PROPOSAL_ID}\") | .votes.no" 2>/dev/null)
    
    echo "Proposal ID: $PROPOSAL_ID"
    echo "Yes votes: $yes_votes"
    echo "No votes: $no_votes"
    echo "Quorum met: $quorum_met"
    echo ""
    
    if [ "$quorum_met" = "true" ]; then
        echo -e "${GREEN}✅ Quorum is MET (need 30% = 3000 votes, have $(($yes_votes + $no_votes)))${NC}"
    else
        echo -e "${YELLOW}⚠️  Quorum NOT met yet (need 30% = 3000 votes, have $(($yes_votes + $no_votes)))${NC}"
    fi
    echo ""
fi

# ============================================================================
# TEST 10: CLOSE PROPOSAL
# ============================================================================

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                    TEST 10: CLOSE PROPOSAL                                   ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

if [ -n "$PROPOSAL_ID" ] && [ "$PROPOSAL_ID" != "null" ]; then
    run_test "Close Proposal and Determine Outcome" \
        "/dao/proposals/${PROPOSAL_ID}/close" \
        "POST" \
        ""
else
    echo -e "${RED}❌ Skipping close test - no proposal ID${NC}"
    echo ""
fi

# ============================================================================
# TEST 11: GET CLOSED PROPOSALS
# ============================================================================

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                    TEST 11: GET CLOSED PROPOSALS                             ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

run_test "Get Closed Proposals" \
    "/dao/proposals?status=closed" \
    "GET" \
    ""

# ============================================================================
# TEST 12: ERROR CASES
# ============================================================================

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                    TEST 12: ERROR CASES                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

run_test "Create Proposal without title (should fail)" \
    "/dao/proposals" \
    "POST" \
    '{
      "description": "This should fail"
    }' \
    "400"

run_test "Vote with invalid voter ID (should fail)" \
    "/dao/proposals/${PROPOSAL_ID}/vote" \
    "POST" \
    '{
      "voterId": "invalid_voter",
      "support": true
    }' \
    "400"

run_test "Vote on non-existent proposal (should fail)" \
    "/dao/proposals/invalid_id/vote" \
    "POST" \
    '{
      "voterId": "voter_1",
      "support": true
    }' \
    "404"

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
    echo -e "${GREEN}║                    ✅ ALL DAO TESTS PASSED! 🎉                               ║${NC}"
    echo -e "${GREEN}║                                                                              ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                                              ║${NC}"
    echo -e "${RED}║                    ❌ SOME DAO TESTS FAILED                                  ║${NC}"
    echo -e "${RED}║                                                                              ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
