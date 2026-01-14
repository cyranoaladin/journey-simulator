#!/bin/bash
# Scan for trace artifacts that might contain sensitive data
set -euo pipefail

OUT="${1:-/home/alaeddine/Documents/journey_mfai_back_front/artifacts/proof/lead_claude_audit_run_001}"
LOG="$OUT/trace_scan.log"

echo "=== TRACE ARTIFACTS SCAN ===" > "$LOG"
echo "Scan started: $(date -Iseconds)" >> "$LOG"

# Check for trace files
TRACE_FILES=$(find . -name "*trace*.zip" -o -name "*trace*.json" 2>/dev/null | wc -l || echo 0)
echo "Trace files found: $TRACE_FILES" >> "$LOG"

# Check for debug/snapshot files
DEBUG_FILES=$(find . -name "*.har" -o -name "*debug*.log" 2>/dev/null | grep -v node_modules | wc -l || echo 0)
echo "Debug files found: $DEBUG_FILES" >> "$LOG"

echo "" >> "$LOG"
echo "TRACE_FILES=$TRACE_FILES" >> "$LOG"
echo "DEBUG_FILES=$DEBUG_FILES" >> "$LOG"

echo "✅ Trace artifact scan complete" >> "$LOG"

cat "$LOG"
