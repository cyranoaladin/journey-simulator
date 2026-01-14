#!/bin/bash
# Scan for token leaks in code and artifacts
set -euo pipefail

OUT="${1:-artifacts/proof/lead_claude_audit_run_001}"
LOG="$OUT/token_scan.log"

echo "=== TOKEN LEAK SCAN ===" > "$LOG"
echo "Scan started: $(date -Iseconds)" >> "$LOG"

# Patterns to search for
PATTERNS=(
    "Bearer [A-Za-z0-9_-]{20,}"
    "sk-[A-Za-z0-9]{20,}"
    "ghp_[A-Za-z0-9]{36}"
    "AKIA[0-9A-Z]{16}"
    "[0-9a-f]{40}"
    "mongodb://[^@]+:[^@]+@"
    "postgres://[^@]+:[^@]+@"
)

TOTAL_HITS=0
for pattern in "${PATTERNS[@]}"; do
    echo "Checking pattern: $pattern" >> "$LOG"
    HITS=$(grep -rn -E "$pattern" \
        --exclude-dir=node_modules \
        --exclude-dir=.git \
        --exclude-dir=dist \
        --exclude-dir=build \
        --exclude="*.log" \
        --exclude="*.json" \
        . 2>/dev/null | wc -l || echo 0)
    echo "  Hits: $HITS" >> "$LOG"
    TOTAL_HITS=$((TOTAL_HITS + HITS))
done

echo "" >> "$LOG"
echo "TOTAL_POTENTIAL_LEAKS=$TOTAL_HITS" >> "$LOG"

if [ $TOTAL_HITS -eq 0 ]; then
    echo "✅ No token leaks detected" >> "$LOG"
else
    echo "⚠️  WARNING: Potential token leaks found: $TOTAL_HITS" >> "$LOG"
fi

cat "$LOG"
