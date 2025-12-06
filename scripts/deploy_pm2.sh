#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
BRANCH=${BRANCH:-feat/full-monorepo-sync}
REMOTE=${REMOTE:-origin}
DEPLOY_ENV_FILE=${DEPLOY_ENV_FILE:-"$ROOT_DIR/.deploy.env"}
RUN_TESTS=${RUN_TESTS:-false}
LOG_PREFIX=${LOG_PREFIX:-"[deploy]"}

log() {
  printf '%s %s %s\n' "$(date '+%Y-%m-%dT%H:%M:%S%z')" "$LOG_PREFIX" "$1"
}

die() {
  log "ERROR: $1"
  exit 1
}

if [[ -f "$DEPLOY_ENV_FILE" ]]; then
  log "Loading environment from $DEPLOY_ENV_FILE"
  # shellcheck source=/dev/null
  set -a
  source "$DEPLOY_ENV_FILE"
  set +a
else
  log "No $DEPLOY_ENV_FILE file found. Continuing with current environment."
fi

REQUIRED_VARS=(
  MONGO_URI
  JWT_SECRET
  ADMIN_API_KEY
  DATABASE_URL
  SOLANA_RPC_URL
  NEXT_PUBLIC_SOLANA_RPC_URL
)

MISSING=()
for var in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    MISSING+=("$var")
  fi
done

if (( ${#MISSING[@]} )); then
  die "Missing required environment variables: ${MISSING[*]}"
fi

cd "$ROOT_DIR"

if [[ ! -d .git ]]; then
  die "This script must be executed inside the project repository."
fi

log "Fetching $REMOTE/$BRANCH"
git fetch "$REMOTE" "$BRANCH"
log "Checking out $BRANCH"
git checkout "$BRANCH"
log "Pulling latest changes"
git pull --ff-only "$REMOTE" "$BRANCH"

log "Installing dependencies"
npm ci --prefix mf-back
npm ci --prefix web
npm ci --prefix journey-simulator

log "Building journey-simulator frontend"
npm run build --prefix journey-simulator

log "Building Next.js application"
npm run build --prefix web
log "Applying Prisma migrations"
npm run migrate:deploy --prefix web

if [[ "${RUN_TESTS,,}" == "true" ]]; then
  log "Running test suites"
  npm test --prefix journey-simulator
  npm test --prefix web
  npm test --prefix mf-back
fi

if ! command -v pm2 >/dev/null 2>&1; then
  log "pm2 not found. Installing globally"
  npm install -g pm2
fi

log "Reloading PM2 ecosystem"
pm2 startOrReload "$ROOT_DIR/ecosystem.config.cjs" --env production
pm2 save

log "Deployment finished successfully"
