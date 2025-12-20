#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/tmp/prod-local"

PORT_BACKEND="${PORT_BACKEND:-3002}"
PORT_WEB="${PORT_WEB:-3001}"
PORT_SIM="${PORT_SIM:-3003}"

MONGO_URI="${MONGO_URI:-mongodb://127.0.0.1:27017/journey}"
DATABASE_URL="${DATABASE_URL:-postgresql://prisma:prisma@127.0.0.1:5435/prisma?schema=public}"
REDIS_URL="${REDIS_URL:-redis://127.0.0.1:6379}"

JWT_SECRET="${JWT_SECRET:-dev-local-secret}"
ADMIN_API_KEY="${ADMIN_API_KEY:-admin-secret-key}"
SIMULATOR_BASE_URL="${SIMULATOR_BASE_URL:-http://127.0.0.1:${PORT_SIM}/}"
ORIGINS="${ORIGINS:-http://127.0.0.1:${PORT_SIM},http://localhost:${PORT_SIM},http://127.0.0.1:5173,http://localhost:5173}"

SKIP_BUILD=false
SKIP_INSTALL=false
RESET=false

usage() {
  cat <<'EOF'
Usage: scripts/prod-local-up.sh [--skip-install] [--skip-build] [--reset]

Démarre l'environnement "prod local" :
- DB: Mongo (docker compose), Postgres (docker compose), Redis (utilise redis local si déjà présent)
- Services: mf-back (3002), web Next API (3001), mint worker, journey-simulator preview (3003)

Options:
  --skip-install  Ne fait pas npm install
  --skip-build    Ne rebuilde pas (journey-simulator + web)
  --reset         Supprime les containers DB et leurs volumes (DESTRUCTIF)
EOF
}

for arg in "$@"; do
  case "$arg" in
    --skip-install) SKIP_INSTALL=true ;;
    --skip-build) SKIP_BUILD=true ;;
    --reset) RESET=true ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Argument inconnu: $arg" >&2; usage; exit 1 ;;
  esac
done

mkdir -p "$LOG_DIR"

echo "[prod-local] root: $ROOT_DIR"
echo "[prod-local] logs: $LOG_DIR"

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo "Commande manquante: $1" >&2; exit 1; }
}

need_cmd docker
need_cmd npm
need_cmd curl

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon non disponible. Lance Docker puis réessaie." >&2
  exit 1
fi

if [[ "$RESET" == "true" ]]; then
  echo "[prod-local] reset demandé: arrêt DB + suppression volumes"
  docker compose -f "$ROOT_DIR/docker-compose.yml" down -v --remove-orphans || true
fi

echo "[prod-local] start DB (mongo + postgres)"
docker compose -f "$ROOT_DIR/docker-compose.yml" up -d mongo postgres

echo "[prod-local] redis"
if ss -ltnp 2>/dev/null | grep -qE "127\\.0\\.0\\.1:6379|\\[::1\\]:6379"; then
  echo " - redis déjà présent sur 127.0.0.1:6379 (OK)"
else
  # On tente un conteneur redis sur 6379 si le port n'est pas occupé
  if ss -ltnp 2>/dev/null | grep -qE ":6379"; then
    echo " - port 6379 occupé (autre process). On continue sans démarrer redis container." >&2
  else
    docker rm -f mfai-redis >/dev/null 2>&1 || true
    docker run -d --name mfai-redis -p 6379:6379 --restart unless-stopped redis:7-alpine >/dev/null
    echo " - redis container démarré (mfai-redis)"
  fi
fi

if [[ "$SKIP_INSTALL" == "false" ]]; then
  echo "[prod-local] npm install (monorepo)"
  (cd "$ROOT_DIR" && npm install)
fi

if [[ "$SKIP_BUILD" == "false" ]]; then
  echo "[prod-local] build (journey-simulator + web)"
  export VITE_API_BASE_URL="http://127.0.0.1:${PORT_BACKEND}"
  export VITE_SOLANA_API_BASE_URL="http://127.0.0.1:${PORT_WEB}"
  (cd "$ROOT_DIR" && npm run build:all)
fi

echo "[prod-local] prisma (web) generate + migrate deploy"
(cd "$ROOT_DIR/web" && DATABASE_URL="$DATABASE_URL" npx --yes prisma generate >/dev/null)
(cd "$ROOT_DIR/web" && DATABASE_URL="$DATABASE_URL" npx --yes prisma migrate deploy)

start_bg() {
  local name="$1"
  local cmd="$2"
  local log="$LOG_DIR/$name.log"
  local pidfile="$LOG_DIR/$name.pid"

  if [[ -f "$pidfile" ]]; then
    local oldpid
    oldpid="$(cat "$pidfile" 2>/dev/null || true)"
    if [[ -n "$oldpid" ]] && kill -0 "$oldpid" >/dev/null 2>&1; then
      echo "[prod-local] $name déjà en cours (pid $oldpid)"
      return 0
    fi
    rm -f "$pidfile"
  fi

  echo "[prod-local] start $name"
  nohup bash -lc "$cmd" >"$log" 2>&1 &
  echo $! >"$pidfile"
  sleep 0.2
}

start_bg "mf-back" "cd '$ROOT_DIR' && NODE_ENV=production PORT='${PORT_BACKEND}' MONGO_URI='${MONGO_URI}' JWT_SECRET='${JWT_SECRET}' ADMIN_API_KEY='${ADMIN_API_KEY}' npm start --prefix mf-back"
start_bg "web" "cd '$ROOT_DIR' && NODE_ENV=production PORT='${PORT_WEB}' DATABASE_URL='${DATABASE_URL}' REDIS_URL='${REDIS_URL}' ADMIN_API_KEY='${ADMIN_API_KEY}' SIMULATOR_BASE_URL='${SIMULATOR_BASE_URL}' ORIGINS='${ORIGINS}' npm start --prefix web"
start_bg "worker-mint" "cd '$ROOT_DIR' && NODE_ENV=production DATABASE_URL='${DATABASE_URL}' REDIS_URL='${REDIS_URL}' npm run worker:mint --prefix web"
start_bg "simulator" "cd '$ROOT_DIR' && NODE_ENV=production npm run preview --prefix journey-simulator -- --host 0.0.0.0 --port '${PORT_SIM}'"

echo "[prod-local] smoke-check"

wait_http() {
  local url="$1"
  local label="$2"
  local attempts="${3:-30}"
  local delay="${4:-1}"
  local code=""
  for ((i=1; i<=attempts; i++)); do
    code="$(curl -s -o /dev/null -w "%{http_code}" "$url" || true)"
    if [[ "$code" != "000" ]] && [[ "$code" != "502" ]] && [[ "$code" != "503" ]]; then
      printf ' - %s: %s\n' "$label" "$code"
      return 0
    fi
    sleep "$delay"
  done
  printf ' - %s: %s (timed out)\n' "$label" "$code"
  return 1
}

wait_http "http://127.0.0.1:${PORT_BACKEND}/healthz" "mf-back /healthz"
wait_http "http://127.0.0.1:${PORT_BACKEND}/readyz" "mf-back /readyz"
wait_http "http://127.0.0.1:${PORT_WEB}/api/health" "web /api/health"
wait_http "http://127.0.0.1:${PORT_SIM}/" "simulator /" 60 1 || true

echo ""
echo "✅ PROD LOCAL UP"
echo "- Simulator:  http://127.0.0.1:${PORT_SIM}/"
echo "- Web API:    http://127.0.0.1:${PORT_WEB}/api/health"
echo "- Backend:    http://127.0.0.1:${PORT_BACKEND}/"
echo "- Logs/PIDs:  $LOG_DIR"
