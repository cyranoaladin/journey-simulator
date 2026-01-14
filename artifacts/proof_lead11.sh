#!/bin/bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"
OUT="artifacts/proof/lead11"
mkdir -p "$OUT"

# 0) Mandatory: AUDIT.md pre-read proof
sed -n '1,260p' AUDIT.md | tee "$OUT/audit_read_proof.log" >/dev/null
test -s "$OUT/audit_read_proof.log" || { echo "FAIL_BLOCKING: audit_read_proof empty"; exit 1; }

# 1) Hard rule: forbid .only
rg -n "\.only\(" . | tee "$OUT/rg_only_hits.txt" || true
test ! -s "$OUT/rg_only_hits.txt" || { echo "FAIL_BLOCKING: .only detected"; exit 1; }

# 2) Build must be green
( cd mf-back && npm ci ) | tee "$OUT/build_backend.log" >/dev/null
( cd journey-simulator && npm ci && npm run build ) | tee "$OUT/build_frontend.log" >/dev/null

# 3) Unit tests must be green (no skipped) -> FIX HANG via --forceExit and vitest run
( cd mf-back && npm test -- --runInBand --forceExit ) | tee "$OUT/unit_backend.log" >/dev/null
( cd journey-simulator && npm test ) | tee "$OUT/unit_frontend.log" >/dev/null

# 4) ENGLISH-ONLY UI scan (SOURCE)
rg -n --hidden -g '*.{ts,tsx,js,jsx,html,css}' --glob '!**/node_modules/**' --glob '!**/dist/**' --glob '!**/build/**' --glob '!**/*.test.*' --glob '!**/__tests__/**' --glob '!**/99-english-compliance/**' '(?i)\b(bienvenue|connexion|déconnexion|tableau de bord|profil|paramètres|suivant|précédent|retour|accueil|parcours|ressources|certification|gouvernance|mise en staking|jeton|portefeuille)\b|[àâäçéèêëîïôöùûüÿœæ]' journey-simulator mf-back > "$OUT/ui_french_source_hits.txt" || true
test ! -s "$OUT/ui_french_source_hits.txt" || { echo "FAIL_BLOCKING: French strings still in source"; exit 1; }

# 5) Start real-prod-like local stack
export MFAI_ONCHAIN_MODE="connect-only"
export MFAI_SIMULATION_ONLY="true"

# Preflight checks (ports) - BLOCKING
nc -z localhost 3000 && echo "Frontend OK" | tee "$OUT/preflight.log" || { echo "FAIL_BLOCKING: Frontend port 3000 closed"; exit 1; }
nc -z localhost 3002 && echo "Backend OK" | tee -a "$OUT/preflight.log" || { echo "FAIL_BLOCKING: Backend port 3002 closed"; exit 1; }

# 6) Playwright config proof
( cd journey-simulator && npx playwright --version ) | tee "$OUT/playwright_version.txt" >/dev/null
( cd journey-simulator && cat playwright.config.ts ) | tee "$OUT/print_config.txt" >/dev/null
test -s "$OUT/print_config.txt" || { echo "FAIL_BLOCKING: print_config empty"; exit 1; }

# 7) Discovery count
( cd journey-simulator && npx playwright test --list ) | tee "$OUT/list_tests.txt" >/dev/null
python3 - <<'PY'
import pathlib, re
p=pathlib.Path("artifacts/proof/lead11/list_tests.txt")
txt=p.read_text(encoding="utf-8", errors="ignore").splitlines()
count=sum(1 for l in txt if "›" in l)
pathlib.Path("artifacts/proof/lead11/discovery_count.txt").write_text(f"discovered={count}\n", encoding="utf-8")
if count<=0: raise SystemExit("FAIL_BLOCKING: discovered=0")
PY

# 9) Run CONNECT-ONLY spec
SPEC="tests/e2e/0X-web3-simulation-only/connect-only.spec.ts"
test -f "journey-simulator/$SPEC" || { echo "FAIL_BLOCKING: missing connect-only spec"; exit 1; }

( cd journey-simulator && \
  npx playwright test "$SPEC" \
    --project=chromium \
    --forbid-only \
    --workers=1 \
    --trace off \
    --reporter=json \
) > "$OUT/playwright_report_connect_only.json" 2> "$OUT/run_connect_only_console.log" || true
test -s "$OUT/playwright_report_connect_only.json" || { echo "FAIL_BLOCKING: connect-only JSON empty"; exit 1; }

# 10) FULL SUITE RUN (ALL PROJECTS)
( cd journey-simulator && \
  npx playwright test \
    --forbid-only \
    --workers=1 \
    --trace off \
    --reporter=json \
) > "$OUT/playwright_report_full.json" 2> "$OUT/run_full_console.log" || true
test -s "$OUT/playwright_report_full.json" || { echo "FAIL_BLOCKING: full JSON empty"; exit 1; }

# 11) Parse JSON strictly
python3 - <<'PY' | tee "$OUT/e2e_json_assertions.log" >/dev/null
import json, pathlib, sys
def counts_from_report(path):
    txt = path.read_text(encoding="utf-8")
    if txt.strip().startswith("DEBUG") or txt.strip().startswith("🔐"):
         idx = txt.find("{")
         if idx != -1: txt = txt[idx:]
    try:
        data=json.loads(txt)
    except:
        lines = txt.splitlines()
        for i, l in enumerate(lines):
            if l.strip() == "{":
                try: 
                    data = json.loads("\n".join(lines[i:]))
                    break
                except: continue
        else:
            print(f"FAIL: Could not parse JSON from {path}")
            return {"unknown": 1, "passed": 0}
    counts={"passed":0,"failed":0,"skipped":0,"timedOut":0,"flaky":0,"interrupted":0,"unknown":0}
    def walk(node):
        if isinstance(node, dict):
            if "results" in node and isinstance(node["results"], list):
                for r in node["results"]:
                    st=r.get("status")
                    if st in counts: counts[st]+=1
                    else: counts["unknown"]+=1
            for v in node.values(): walk(v)
        elif isinstance(node, list):
            for x in node: walk(x)
    walk(data)
    return counts

out=pathlib.Path("artifacts/proof/lead11")
c1=counts_from_report(out/"playwright_report_connect_only.json")
(out/"e2e_json_counts_connect_only.txt").write_text("\n".join([f"{k}={v}" for k,v in c1.items()])+"\n", encoding="utf-8")
c2=counts_from_report(out/"playwright_report_full.json")
(out/"e2e_json_counts_full.txt").write_text("\n".join([f"{k}={v}" for k,v in c2.items()])+"\n", encoding="utf-8")

def assert_strict(name,c):
    if c["unknown"]!=0: print(f"FAIL_BLOCKING: {name} unknown={c['unknown']}"); sys.exit(1)
    for k in ("failed","skipped","timedOut","flaky","interrupted"):
        if c[k]!=0: print(f"FAIL_BLOCKING: {name} {k}={c[k]}"); sys.exit(1)
    if c["passed"]<=0: print(f"FAIL_BLOCKING: {name} passed=0"); sys.exit(1)

assert_strict("connect_only", c1)
assert_strict("full", c2)
print("JSON_ASSERTIONS_PASS=1")
PY

# 12) Route tracker post-process
if [ -f "journey-simulator/routes_visited_raw.txt" ]; then
    cat "journey-simulator/routes_visited_raw.txt" >> "$OUT/routes_visited_raw.txt"
fi
test -s "$OUT/routes_visited_raw.txt" || { echo "FAIL_BLOCKING: routes_visited_raw missing/empty"; exit 1; }

python3 - <<'PY'
import pathlib, re
base=pathlib.Path("artifacts/proof/lead11")
raw=(base/"routes_visited_raw.txt").read_text(encoding="utf-8", errors="ignore").splitlines()
urls=[]
for line in raw:
    m=re.search(r"^ROUTE_VISIT:\s*(.+)$", line.strip())
    if m: urls.append(m.group(1).strip())
uniq=sorted(set(urls))
(base/"routes_visited.txt").write_text("\n".join(uniq)+"\n", encoding="utf-8")
(base/"routes_visited_stats.txt").write_text(f"routes_events={len(urls)}\nroutes_unique={len(uniq)}\n", encoding="utf-8")
if len(uniq)==0: raise SystemExit("FAIL_BLOCKING: routes_unique=0")
PY

test -s "$OUT/routes_visited.txt" || { echo "FAIL_BLOCKING: routes_visited empty"; exit 1; }

# 13) Guide scope / Keyword Check (R2 Requirement)
echo "Checking guide content..."
GUIDE_DIR="journey-simulator/src/pages"
grep -i "NFT" "$GUIDE_DIR/GuidePage.tsx" > "$OUT/guide_nft_check.txt" || true
grep -i "Staking" "$GUIDE_DIR/GuidePage.tsx" > "$OUT/guide_staking_check.txt" || true
grep -i "DAO" "$GUIDE_DIR/GuidePage.tsx" > "$OUT/guide_dao_check.txt" || true
grep -i "Simulation" "$GUIDE_DIR/GuidePage.tsx" > "$OUT/guide_sim_check.txt" || true
grep -i "Connect-Only" "$GUIDE_DIR/GuidePage.tsx" >> "$OUT/guide_sim_check.txt" || true

if [ -s "$OUT/guide_nft_check.txt" ] && [ -s "$OUT/guide_staking_check.txt" ] && [ -s "$OUT/guide_dao_check.txt" ]; then
  echo "GUIDE_KEYWORDS_CHECK=PASS" | tee "$OUT/guide_keywords_check.txt"
else
  echo "FAIL_BLOCKING: Guide missing required keywords (NFT, Staking, DAO)"
  exit 1
fi

grep "h2" "$GUIDE_DIR/GuidePage.tsx" > "$OUT/guide_outline.txt"
test -s "$OUT/guide_outline.txt" || { echo "FAIL_BLOCKING: guide_outline empty"; exit 1; }

# 14) Proof pack integrity
( cd "$OUT" && ls -lh ) | tee "$OUT/files_list.log" >/dev/null
( cd "$OUT" && sha256sum * | sort ) | tee "$OUT/sha256.txt" >/dev/null

echo "VERDICT=PASS_STRICT_R1_1"
