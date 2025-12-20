#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

usage() {
  cat <<'EOF'
Usage: scripts/local-restart-prod.sh [--hard] [--reset-db]

One-command clean restart of the local prod-like stack:
- stop everything
- kill ports
- clear build caches
- start DB + backend + web + simulator preview

Options:
  --hard      also removes node_modules + Playwright browser cache (slow)
  --reset-db  drops docker volumes for DBs (destructive)
EOF
}

HARD=false
RESET_DB=false

for arg in "$@"; do
  case "$arg" in
    --hard) HARD=true ;;
    --reset-db) RESET_DB=true ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown arg: $arg" >&2; usage; exit 1 ;;
  esac
done

if [[ "$HARD" == "true" ]]; then
  bash "$ROOT_DIR/scripts/local-clean.sh" --hard
else
  bash "$ROOT_DIR/scripts/local-clean.sh"
fi

if [[ "$RESET_DB" == "true" ]]; then
  bash "$ROOT_DIR/scripts/prod-local-up.sh" --reset
else
  bash "$ROOT_DIR/scripts/prod-local-up.sh"
fi


