#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

usage() {
  cat <<'EOF'
Usage: scripts/local-verify.sh

Runs the local "source of truth" verification:
- install (ci)
- lint + build
- unit tests
- playwright e2e (chromium + firefox)
EOF
}

for arg in "$@"; do
  case "$arg" in
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown arg: $arg" >&2; usage; exit 1 ;;
  esac
done

echo "node: $(node -v)"
echo "npm:  $(npm -v)"

echo ""
echo "== install (ci) =="
(cd mf-back && npm ci)
(cd journey-simulator && npm ci)
(cd web && npm ci)

echo ""
echo "== lint/build/unit =="
npm run lint:all
npm run build:all
npm run test:all

echo ""
echo "== e2e (journey-simulator) =="
(
  cd journey-simulator
  # Avoid sudo prompts. If deps are missing, user can run playwright install manually.
  npx playwright install chromium firefox || true
)

# Run both engines explicitly (stable coverage)
(cd journey-simulator && npx playwright test --project=chromium)
(cd journey-simulator && npx playwright test --project=firefox)

echo ""
echo "✅ local-verify OK"


