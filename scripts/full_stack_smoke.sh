#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
SMOKE_BEARER="${SMOKE_BEARER:-demo-token}"
SMOKE_PERSONA="${SMOKE_PERSONA:-cognitive-activation-hub}"

cleanup() {
  docker compose down >/dev/null 2>&1 || true
}
trap cleanup EXIT

wait_for() {
  local url="$1"
  local label="$2"
  local attempts="${3:-30}"
  local delay="${4:-2}"

  for ((i=1; i<=attempts; i++)); do
    if curl -fsS "$url" >/dev/null; then
      printf '✔ %s (%s)\n' "$label" "$url"
      return 0
    fi
    printf '… waiting for %s (%d/%d)\n' "$label" "$i" "$attempts"
    sleep "$delay"
  done

  printf '✖ Timed out waiting for %s (%s)\n' "$label" "$url" >&2
  return 1
}

printf 'Starting docker compose stack…\n'
docker compose up -d

wait_for "http://127.0.0.1:3002/healthz" "API health"
wait_for "http://127.0.0.1:3002/readyz" "API readiness"
wait_for "http://127.0.0.1:3003" "Frontend shell" 40 3

printf 'Running API smoke probes…\n'
curl -fsS http://127.0.0.1:3002/auth/verify | tee /tmp/smoke_auth_verify.json >/dev/null
curl -fsS http://127.0.0.1:3002/journey/all-journey >/dev/null
demo_payload=$(printf '{"personaId":"%s"}' "$SMOKE_PERSONA")
curl -fsS -X POST http://127.0.0.1:3002/journey/load-demo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SMOKE_BEARER}" \
  -d "$demo_payload" >/dev/null

printf 'Running frontend smoke probe…\n'
curl -fsS http://127.0.0.1:3003 >/dev/null

printf '\nFull-stack smoke completed successfully. Logs saved in docker compose output.\n'
