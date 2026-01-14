#!/bin/bash
# Check for zero-byte files in artifacts
set -euo pipefail

OUT="${1:-/home/alaeddine/Documents/journey_mfai_back_front/artifacts/proof/lead_claude_audit_run_001}"
LOG="$OUT/zero_byte_files.txt"

echo "=== ZERO-BYTE FILES CHECK ===" > "$LOG"
echo "Scan started: $(date -Iseconds)" >> "$LOG"

ZERO_BYTE=$(find "$OUT" -type f -size 0 2>/dev/null | wc -l || echo 0)

echo "Zero-byte files found: $ZERO_BYTE" >> "$LOG"
echo "" >> "$LOG"
echo "ZERO_BYTE_FILES_FOUND=$ZERO_BYTE" >> "$LOG"

if [ $ZERO_BYTE -eq 0 ]; then
    echo "✅ No zero-byte files found" >> "$LOG"
else
    echo "⚠️  WARNING: Zero-byte files detected" >> "$LOG"
    find "$OUT" -type f -size 0 >> "$LOG"
fi

cat "$LOG"
