#!/bin/bash
# Process route tracker output
set -euo pipefail

OUT="${1:-artifacts/proof/lead_claude_audit_run_001}"
RAW="$OUT/routes_visited_raw.txt"

if [ ! -f "$RAW" ]; then
    echo "ERROR: $RAW not found"
    exit 1
fi

# Dedupe and sort
grep "^ROUTE_VISIT: " "$RAW" | sort -u > "$OUT/routes_visited.txt"

# Stats
TOTAL_EVENTS=$(grep -c "^ROUTE_VISIT: " "$RAW" || echo 0)
UNIQUE_ROUTES=$(wc -l < "$OUT/routes_visited.txt")

cat > "$OUT/routes_visited_stats.txt" << STATS
ROUTE_VISIT_EVENTS=$TOTAL_EVENTS
UNIQUE_ROUTES=$UNIQUE_ROUTES
STATS

echo "Routes processed: $UNIQUE_ROUTES unique from $TOTAL_EVENTS events"
