#!/usr/bin/env bash
set -euo pipefail

# Mode B: Docker Compose Deployment

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
BRANCH=${BRANCH:-feat/full-monorepo-sync}
REMOTE=${REMOTE:-origin}
DEPLOY_ENV_FILE=${DEPLOY_ENV_FILE:-"$ROOT_DIR/.deploy.env"}
LOG_PREFIX=${LOG_PREFIX:-"[deploy-docker]"}

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

cd "$ROOT_DIR"

log "Fetching $REMOTE/$BRANCH"
git fetch "$REMOTE" "$BRANCH"
log "Checking out $BRANCH"
git checkout "$BRANCH"
log "Pulling latest changes"
git pull --ff-only "$REMOTE" "$BRANCH"

if ! command -v docker-compose >/dev/null 2>&1; then
  if ! command -v docker >/dev/null 2>&1; then
      die "docker not found."
  fi
  # Assume docker compose plugin
  DOCKER_COMPOSE="docker compose"
else
  DOCKER_COMPOSE="docker-compose"
fi

log "Building and starting services with Docker Compose"
$DOCKER_COMPOSE -f docker-compose.yml -f docker-compose.prod.yml up -d --build --remove-orphans

log "Pruning unused images"
docker image prune -f

log "Deployment finished successfully (Docker Mode)"
