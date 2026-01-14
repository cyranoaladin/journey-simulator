#!/bin/bash
# Scan for non-English text in UI strings
set -euo pipefail

OUT="${1:-/home/alaeddine/Documents/journey_mfai_back_front/artifacts/proof/lead_claude_audit_run_001}"
LOG="$OUT/english_scan.log"

echo "=== ENGLISH-ONLY COMPLIANCE SCAN ===" > "$LOG"
echo "Scan started: $(date -Iseconds)" >> "$LOG"

# Common French words that shouldn't be in UI
FRENCH_PATTERNS=(
    "\"[^\"]*[àâäéèêëïîôùûüÿæœç][^\"]*\""
    "Bonjour"
    "Merci"
    "Bienvenue"
)

TOTAL_HITS=0
for pattern in "${FRENCH_PATTERNS[@]}"; do
    echo "Checking pattern: $pattern" >> "$LOG"
    HITS=$(grep -rn -E "$pattern" \
        journey-simulator/src \
        mf-back/routes \
        --include="*.ts" \
        --include="*.tsx" \
        --include="*.js" \
        --include="*.jsx" \
        2>/dev/null | wc -l || echo 0)
    echo "  Hits: $HITS" >> "$LOG"
    TOTAL_HITS=$((TOTAL_HITS + HITS))
done

echo "" >> "$LOG"
echo "NON_ENGLISH_STRINGS=$TOTAL_HITS" >> "$LOG"

if [ $TOTAL_HITS -eq 0 ]; then
    echo "✅ All UI strings are English" >> "$LOG"
else
    echo "⚠️  WARNING: Non-English strings found: $TOTAL_HITS" >> "$LOG"
fi

cat "$LOG"
