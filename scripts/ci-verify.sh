#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "node: $(node -v)"
echo "npm:  $(npm -v)"
echo "npx:  $(command -v npx || echo 'NOT_FOUND')"

echo ""
echo "== install =="
(cd mf-back && npm ci)
(cd journey-simulator && npm ci)
(cd web && npm ci)

echo ""
echo "== MCP selftest =="
node scripts/mcp-selftest.mjs

echo ""
echo "== lint/build/unit =="
npm run lint:all
npm run build:all
npm run test:all

echo ""
echo "== e2e (journey-simulator) =="
(cd journey-simulator && npx playwright install --with-deps chromium)
npm run test:e2e:simulator

echo ""
echo "✅ CI verify OK"
