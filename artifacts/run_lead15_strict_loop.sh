#!/bin/bash
set -e

# R1.3 Strict Loop Execution (Attempts 8c & 9)
# Requires: Unified Fixtures + Anti-Contournement

echo "🛠️  Building Frontend for PROD_PREVIEW mode..."
cd journey-simulator
npm run build
cd ..

run_attempt() {
    ATTEMPT=$1
    echo "---------------------------------------------------"
    echo "🚀 Launching Attempt $ATTEMPT (Retries=0, Unified Fixture)"
    echo "---------------------------------------------------"
    
    # Run Playwright (Expect artifacts/run_lead15_full.sh to handle execution)
    ./artifacts/run_lead15_full.sh
    EXIT_CODE=$?
    
    echo "Moving artifacts for Attempt $ATTEMPT..."
    mv artifacts/proof/lead15_full/playwright_report_full.json artifacts/proof/lead15_full/playwright_report_full_attempt${ATTEMPT}.json
    cp artifacts/proof/lead15_full/e2e_json_counts_full.txt artifacts/proof/lead15_full/e2e_json_counts_attempt${ATTEMPT}.txt
    cp artifacts/proof/lead15_full/routes_visited_full.txt artifacts/proof/lead15_full/routes_visited_attempt${ATTEMPT}.txt
    cp artifacts/proof/lead15_full/routes_visited_stats_full.txt artifacts/proof/lead15_full/routes_visited_stats_attempt${ATTEMPT}.txt
    cp artifacts/proof/lead15_full/e2e_console_full.log artifacts/proof/lead15_full/e2e_console_attempt${ATTEMPT}.log
    
    # Check counts file for unexpected > 0
    UNEXPECTED=$(grep '"unexpected":' artifacts/proof/lead15_full/e2e_json_counts_attempt${ATTEMPT}.txt | awk -F': ' '{print $2}' | tr -d ',')
    
    if [ "$UNEXPECTED" != "0" ]; then
        echo "❌ Attempt $ATTEMPT FAILED with $UNEXPECTED unexpected failures."
        exit 1
    fi
    
    echo "✅ Attempt $ATTEMPT PASSED Cleanly (Unexpected: 0)."
}

# Execute Attempt 8c
run_attempt 8c

# Execute Attempt 9
run_attempt 9

echo "🎉 DOUBLE STREAK SUCCESS! Attempts 8c & 9 passed."
