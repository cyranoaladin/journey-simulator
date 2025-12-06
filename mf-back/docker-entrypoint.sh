#!/usr/bin/env sh
set -eu

COLOR_INFO="\033[1;34m"
COLOR_RESET="\033[0m"

install_deps() {
  if [ "${NODE_ENV:-development}" = "production" ]; then
    echo "${COLOR_INFO}Installing production dependencies...${COLOR_RESET}"
    npm ci --omit=dev --no-audit --no-fund
  else
    echo "${COLOR_INFO}Installing development dependencies...${COLOR_RESET}"
    npm ci --no-audit --no-fund
  fi
}

if [ "${SKIP_NPM_INSTALL:-false}" != "true" ]; then
  install_deps
else
  echo "${COLOR_INFO}Skipping dependency installation (SKIP_NPM_INSTALL=true).${COLOR_RESET}"
fi

exec "$@"
