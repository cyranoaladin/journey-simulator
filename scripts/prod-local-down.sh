#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/tmp/prod-local"

RESET=false

usage() {
  cat <<'EOF'
Usage: scripts/prod-local-down.sh [--reset]

Arrête l'environnement "prod local":
- kill des process (mf-back, web, worker-mint, simulator) via PID files
- docker compose down (mongo + postgres)

Options:
  --reset   Supprime aussi les volumes DB (DESTRUCTIF)
EOF
}

for arg in "$@"; do
  case "$arg" in
    --reset) RESET=true ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Argument inconnu: $arg" >&2; usage; exit 1 ;;
  esac
done

kill_pidfile() {
  local name="$1"
  local pidfile="$LOG_DIR/$name.pid"
  if [[ -f "$pidfile" ]]; then
    local pid
    pid="$(cat "$pidfile" 2>/dev/null || true)"
    if [[ -n "$pid" ]] && kill -0 "$pid" >/dev/null 2>&1; then
      echo "[prod-local] stop $name (pid $pid)"
      kill "$pid" >/dev/null 2>&1 || true
      sleep 0.5
      kill -9 "$pid" >/dev/null 2>&1 || true
    fi
    rm -f "$pidfile"
  fi
}

echo "[prod-local] stopping processes"
kill_pidfile "simulator"
kill_pidfile "worker-mint"
kill_pidfile "web"
kill_pidfile "mf-back"

echo "[prod-local] stopping docker compose (mongo + postgres)"
if [[ "$RESET" == "true" ]]; then
  docker compose -f "$ROOT_DIR/docker-compose.yml" down -v --remove-orphans || true
else
  docker compose -f "$ROOT_DIR/docker-compose.yml" down --remove-orphans || true
fi

echo "[prod-local] stopping redis container if present"
docker rm -f mfai-redis >/dev/null 2>&1 || true

echo "✅ PROD LOCAL DOWN"
