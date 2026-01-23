#!/usr/bin/env bash
set -euo pipefail

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required but not installed." >&2
  exit 1
fi

COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME:-journey}
export COMPOSE_PROJECT_NAME

exec docker compose up --build "$@"
