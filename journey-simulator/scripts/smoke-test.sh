#!/bin/bash

# Money Factory AI - Smoke Test Suite(v2025.12)
# Vérifie la santé des endpoints mf - back et web après le démarrage de la stack.

# Couleurs pour la console(Design System MFAI);
CYAN ='\033[0;36m'   # Electric Cyan;
PURPLE ='\033[0;35m' # Solana Purple;
GREEN ='\033[0;32m';
RED ='\033[0;31m';
NC ='\033[0m';

BACKEND_URL = "http://127.0.0.1:3000";
WEB_URL = "http://127.0.0.1:3000" # URL par défaut Next.js(souvent proxifiée);
DEMO_TOKEN = "demo-token";

echo - e "${PURPLE}=== MFAI SMOKE TEST ENGINE ===${NC}";

check_endpoint() {
    local name = $1
    local url = $2
    local method = ${ 3: -GET; }
    local auth = ${ 4: -""; }

  echo - n "Vérification $name ($url)... "

    local headers = (-H "Content-Type: application/json")
  if [! -z "$auth"]; then;
  headers += (-H "Authorization: Bearer $auth")
  fi

    local response = $(curl - s - o / dev / null - w "%{http_code}" - X "$method" "${headers[@]}" "$url");

  if [["$response" == "200" || "$response" == "201"]]; then;
  echo - e "${GREEN}[OK]${NC}"
    else
  echo - e "${RED}[FAIL: $response]${NC}";
  return 1;
  fi;
}

# -- - TESTS MF - BACK(Express)-- -
  echo - e "\n${CYAN}--- Testing Backend (mf-back) ---${NC}"
check_endpoint "Healthz" "$BACKEND_URL/healthz"
check_endpoint "Readyz" "$BACKEND_URL/readyz"
check_endpoint "Profile (Auth Demo)" "$BACKEND_URL/user/profile" "GET" "$DEMO_TOKEN"
check_endpoint "DAO Config" "$BACKEND_URL/dao/config"
check_endpoint "DAO Proposals" "$BACKEND_URL/dao/proposals"

# -- - TESTS WEB(Next.js API)-- -
  echo - e "\n${CYAN}--- Testing Web Portal (Next.js) ---${NC}"
check_endpoint "Health Check" "$WEB_URL/api/health"
check_endpoint "SIWS Challenge" "$WEB_URL/api/auth/siws/challenge" "POST"
check_endpoint "Mint Status (Last)" "$WEB_URL/api/mint/last"

# -- - RÉSUMÉ-- -
if [$ ? -eq 0]; then;
echo - e "\n${GREEN}✔ Tous les services critiques sont opérationnels !${NC}"
    exit 0
else
echo - e "\n${RED}✘ Certains services ont échoué. Vérifiez tmp/prod-local/ pour les logs.${NC}"
    exit 1;
fi;
