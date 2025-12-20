#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

HARD_RESET=false

usage() {
  cat <<'EOF'
Usage: scripts/local-clean.sh [--hard]

Stops local stack, kills known ports, and clears common build caches.

Options:
  --hard   Also removes node_modules and Playwright browsers (slow; destructive)
EOF
}

for arg in "$@"; do
  case "$arg" in
    --hard) HARD_RESET=true ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown arg: $arg" >&2; usage; exit 1 ;;
  esac
done

echo "[clean] stopping prod-local processes + docker services"
bash "$ROOT_DIR/scripts/prod-local-down.sh" --reset || true
docker compose -f "$ROOT_DIR/docker-compose.yml" down -v --remove-orphans || true
docker rm -f mfai-redis >/dev/null 2>&1 || true

kill_port() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -ti "tcp:${port}" | xargs -r kill -9 >/dev/null 2>&1 || true
  fi
}

echo "[clean] killing known ports (best effort)"
for p in 3001 3002 3003 5173 6379 5435 27017; do
  kill_port "$p"
done

echo "[clean] clearing build output"
rm -rf "$ROOT_DIR/tmp/prod-local" || true
rm -rf "$ROOT_DIR/journey-simulator/dist" "$ROOT_DIR/web/.next" || true
rm -rf "$ROOT_DIR/journey-simulator/node_modules/.vite" "$ROOT_DIR/web/node_modules/.cache" || true

if [[ "$HARD_RESET" == "true" ]]; then
  echo "[clean] HARD reset: removing node_modules + Playwright browsers"
  rm -rf "$ROOT_DIR/mf-back/node_modules" "$ROOT_DIR/journey-simulator/node_modules" "$ROOT_DIR/web/node_modules" || true
  rm -rf "$HOME/.cache/ms-playwright" || true
fi

echo "✅ local-clean complete"


