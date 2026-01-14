#!/bin/bash
# Scan for on-chain transaction attempts in connect-only mode
set -euo pipefail

OUT="${1:-/home/alaeddine/Documents/journey_mfai_back_front/artifacts/proof/lead_claude_audit_run_001}"
LOG="$OUT/no_onchain_scan.log"

echo "=== NO-ONCHAIN SCAN (connect-only mode) ===" > "$LOG"
echo "Scan started: $(date -Iseconds)" >> "$LOG"

# Look for on-chain transaction patterns
echo "Checking for transaction signatures..." >> "$LOG"
TX_SIGS=$(grep -rn "sendTransaction\|sendAndConfirmTransaction" \
    journey-simulator/src \
    mf-back/routes \
    --include="*.ts" \
    --include="*.tsx" \
    --include="*.js" \
    2>/dev/null | wc -l || echo 0)
echo "Transaction send calls found: $TX_SIGS" >> "$LOG"

echo "Checking for mint/stake/vote operations..." >> "$LOG"
MINT_OPS=$(grep -rn "mint\|stake\|vote" \
    mf-back/routes/solana-routes.js \
    2>/dev/null | grep -v "// " | wc -l || echo 0)
echo "On-chain operations found: $MINT_OPS" >> "$LOG"

echo "" >> "$LOG"
echo "ONCHAIN_TX_ATTEMPTS=$TX_SIGS" >> "$LOG"
echo "ONCHAIN_OPERATIONS=$MINT_OPS" >> "$LOG"

if [ $TX_SIGS -eq 0 ] && [ $MINT_OPS -eq 0 ]; then
    echo "✅ No on-chain transactions detected" >> "$LOG"
else
    echo "ℹ️  On-chain code exists (verify connect-only enforcement)" >> "$LOG"
fi

cat "$LOG"
