#!/usr/bin/env bash
set -euo pipefail

# S0 smoke (prod-safe, read-only).
#
# S0 Health Contract (AS-IS):
# - Public mandatory: GET /  and GET /api/health
# - Local mandatory (mf-back): GET http://127.0.0.1:3002/healthz, /readyz, /api/health
# - No other public health endpoints are assumed in S0.
# - Optional local checks: UI (3003) and web (3001) if present.
#
# Commands used: curl, docker ps/inspect, nginx -t (optional), ss.

S0_DOMAIN="${S0_DOMAIN:-journey.mfai.app}"
S0_SCHEME="${S0_SCHEME:-https}"
PUBLIC_BASE="${S0_SCHEME}://${S0_DOMAIN}"

API_LOCAL="http://127.0.0.1:3002"
UI_LOCAL="http://127.0.0.1:3003"
WEB_LOCAL="http://127.0.0.1:3001"

SUGGESTED_LOG_FILE="/var/log/mfai/s0_smoke_$(date -u +%Y%m%dT%H%M%SZ).log"

fail_reasons=()
warn_reasons=()

have() { command -v "$1" >/dev/null 2>&1; }
ok() { printf '✅ %s\n' "$*"; }
warn() { printf '⚠️  %s\n' "$*"; warn_reasons+=("$*"); }
fail() { printf '❌ %s\n' "$*"; fail_reasons+=("$*"); }

code() { curl -sS -o /dev/null -w "%{http_code}" "$1" || printf "000"; }

listening() {
  local port="$1"
  ss -lnt 2>/dev/null | awk '{print $4}' | grep -Eq "(^|:)${port}$"
}

check_any() {
  local label="$1" url="$2"
  local c; c="$(code "$url")"
  [[ "$c" == "000" ]] && fail "$label $url (network failure)" && return 1
  [[ "$c" =~ ^2|^3 ]] && ok "$label $url ($c)" && return 0
  fail "$label $url (HTTP $c)"; return 1
}

check_200() {
  local label="$1" url="$2"
  local c; c="$(code "$url")"
  [[ "$c" == "000" ]] && fail "$label $url (network failure)" && return 1
  [[ "$c" == "200" ]] && ok "$label $url (200)" && return 0
  fail "$label $url (HTTP $c)"; return 1
}

check_200_warn() {
  local label="$1" url="$2"
  local c; c="$(code "$url")"
  [[ "$c" == "000" ]] && warn "$label $url (network failure; optional)" && return 0
  [[ "$c" == "200" ]] && ok "$label $url (200)" && return 0
  warn "$label $url (HTTP $c; optional)"; return 0
}

section() { echo ""; echo "### $*"; }

main() {
  echo "S0 Smoke (prod-safe) — ${PUBLIC_BASE}"
  echo "Suggested log file (not created): ${SUGGESTED_LOG_FILE}"

  section "Prereqs (commands)"
  have curl && ok "curl present" || fail "curl missing"
  have ss && ok "ss present" || fail "ss missing"
  have docker && ok "docker present" || fail "docker missing"

  section "Docker snapshot (read-only)"
  if have docker; then
    if docker ps >/dev/null 2>&1; then
      ok "docker ps OK"
      docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'
    else
      warn "docker ps failed (permission/daemon). Run as a user allowed to call docker."
    fi
  fi

  section "Nginx config test (optional)"
  if have nginx; then
    nginx -t >/dev/null 2>&1 && ok "nginx -t OK" || warn "nginx -t failed (optional)"
  else
    warn "nginx not found (optional)"
  fi

  section "Ports (read-only)"
  if have ss; then
    listening 3002 && ok "port 3002 listening" || fail "port 3002 NOT listening"
    listening 3003 && ok "port 3003 listening (optional UI checks enabled)" || warn "port 3003 not listening (optional)"
    listening 3001 && warn "port 3001 listening (optional web checks enabled)" || ok "port 3001 not listening (optional web not present)"
  fi

  section "Local API (mandatory) — mf-back 127.0.0.1:3002"
  check_200 "mf-back" "${API_LOCAL}/healthz"
  check_200 "mf-back" "${API_LOCAL}/readyz"
  check_200 "mf-back" "${API_LOCAL}/api/health"

  section "Public (mandatory)"
  check_any "public UI" "${PUBLIC_BASE}/"
  check_200 "public API" "${PUBLIC_BASE}/api/health"

  section "Optional local checks"
  if have ss && listening 3003; then check_200_warn "UI local" "${UI_LOCAL}/"; fi
  if have ss && listening 3001; then
    check_200_warn "web local" "${WEB_LOCAL}/api/health"
    check_200_warn "web local" "${WEB_LOCAL}/api/healthz"
  fi

  section "Summary"
  if ((${#warn_reasons[@]} > 0)); then
    echo "WARNINGS:"; for r in "${warn_reasons[@]}"; do echo " - $r"; done
  fi
  if ((${#fail_reasons[@]} > 0)); then
    echo "FAILURES:"; for r in "${fail_reasons[@]}"; do echo " - $r"; done
    echo ""; echo "RESULT: FAIL"; exit 1
  fi
  echo ""; echo "RESULT: PASS"
}

main "$@"
