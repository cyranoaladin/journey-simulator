#!/usr/bin/env bash
set -euo pipefail

echo "=== Phase 3 Preflight Check ==="

# Backend
if lsof -i :3002 >/dev/null 2>&1; then echo "Backend (3002): ✅ UP"; else echo "Backend (3002): ❌ DOWN"; exit 1; fi

# Frontend preview (MANDATORY for E2E)
if lsof -i :4173 >/dev/null 2>&1; then echo "Preview (4173): ✅ UP"; else echo "Preview (4173): ❌ DOWN"; exit 1; fi

# No trace on in release gates
sed -n '/<!-- BEGIN_RELEASE_GATES -->/,/<!-- END_RELEASE_GATES -->/p' artifacts/commands.md \
  | rg -n -S "(--trace\s+on|trace:\s*'on')" \
  && { echo "❌ BLOCK: trace ON found in RELEASE GATES"; exit 1; } \
  || echo "Release gates trace policy: ✅ OK (--trace off)"

echo "Preflight: ✅ PASS"
