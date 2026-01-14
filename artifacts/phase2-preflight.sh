#!/bin/bash
# Phase 2 Preflight Check - AUDIT.md Compliance
# Validates servers are running before Phase 2 gate execution

set -e

echo "=== Phase 2 Preflight Check ==="
echo ""

# Backend health check (port 3002)
echo -n "Backend (port 3002): "
if curl -fsS http://127.0.0.1:3002/health >/dev/null 2>&1; then
    echo "✅ UP"
    BACKEND_UP=1
else
    echo "❌ DOWN"
    BACKEND_UP=0
fi

# Frontend preview health check (port 4173)
echo -n "Frontend Preview (port 4173): "
if curl -fsS http://127.0.0.1:4173/ >/dev/null 2>&1; then
    echo "✅ UP"
    PREVIEW_UP=1
else
    echo "❌ DOWN"
    PREVIEW_UP=0
fi

echo ""

# Final verdict
if [ $BACKEND_UP -eq 1 ] && [ $PREVIEW_UP -eq 1 ]; then
    echo "✅ PREFLIGHT PASS - Ready for Phase 2 gate execution"
    exit 0
else
    echo "❌ PREFLIGHT FAIL - Start servers before running Phase 2 gate"
    echo ""
    echo "Start servers:"
    echo "  Terminal 1: cd mf-back && npm start"
    echo "  Terminal 2: cd journey-simulator && npm run build && npm run preview -- --host 127.0.0.1 --port 4173"
    exit 1
fi
