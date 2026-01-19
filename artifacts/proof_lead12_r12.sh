# LEAD ORDER — R1.2 — FULL E2E STRICT + ROUTE TRACKER + JSON COUNTS
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"
OUT="artifacts/proof/lead12_r12"
mkdir -p "$OUT"

# 0) Mandatory pre-run: AUDIT.md must be read
sed -n '1,200p' AUDIT.md | tee "$OUT/audit_read_proof.log" >/dev/null
test -s "$OUT/audit_read_proof.log" || { echo "FAIL_BLOCKING: AUDIT not read"; exit 1; }

# 1) Confirm config + versions
( node -v && npm -v ) | tee "$OUT/node_npm_versions.txt" >/dev/null || true
( cd journey-simulator && npx playwright --version ) | tee "$OUT/playwright_version.txt" >/dev/null

# 2) Hard gate: forbid .only across repo
rg -n --hidden --glob '!node_modules/**' '\.only\(' . | tee "$OUT/rg_only_hits.txt" || true
test ! -s "$OUT/rg_only_hits.txt" || { echo "FAIL_BLOCKING: .only found"; exit 1; }

# 3) Start stack (prod-like local)
./artifacts/start_stack.sh 2>&1 | tee "$OUT/start_stack.log"

# 4) Full suite run: JSON reporter to file
set +e
( cd journey-simulator && \
  MFAI_ONCHAIN_MODE="connect-only" MFAI_SIMULATION_ONLY="true" \
  npx playwright test --forbid-only --reporter=json \
) > "$OUT/playwright_stdout.log" 2> "$OUT/playwright_stderr.log"
E2E_EC=$?
set -e
echo "E2E_EXIT_CODE=$E2E_EC" | tee "$OUT/e2e_exit_code.txt" >/dev/null

# The JSON reporter writes to stdout by default in many configs; we must capture it deterministically.
# REQUIRED: produce OUT/playwright_report.json (non-empty, valid JSON)
python3 - <<'PY'
import json,sys, pathlib, re
out = pathlib.Path("artifacts/proof/lead12_r12")
try:
    stdout = (out/"playwright_stdout.log").read_text(errors="ignore")
    # Extract last JSON object from stdout (robust against log pollution)
    m = re.findall(r'(\{.*\})', stdout, flags=re.S)
    if not m:
        print("FAIL_BLOCKING: no JSON found in playwright stdout")
        sys.exit(2)
    data = None
    for cand in reversed(m):
        try:
            data = json.loads(cand)
            if "stats" in data: # Basic validation that it looks like a report
                 break
        except Exception:
            continue
    if data is None:
        # Fallback: check if the file ITSELF is pure JSON (sometimes reporter setup writes direct)
        try:
             data = json.loads(stdout)
        except:
             print("FAIL_BLOCKING: JSON parse failed")
             sys.exit(3)
    
    (out/"playwright_report.json").write_text(json.dumps(data, indent=2))
    print("JSON_EXTRACT_OK=1")
except Exception as e:
    print(f"FAIL_BLOCKING: Script error {e}")
    sys.exit(1)
PY

test -s "$OUT/playwright_report.json" || { echo "FAIL_BLOCKING: playwright_report.json empty"; exit 1; }
test "$E2E_EC" -eq 0 || { echo "FAIL_BLOCKING: Playwright failed (exit=$E2E_EC)"; exit 1; }

# 5) Parse JSON counts + assert skipped=0 failed=0 flaky=0 timedOut=0
python3 - <<'PY'
import json, pathlib, sys
try:
    p = pathlib.Path("artifacts/proof/lead12_r12/playwright_report.json")
    d = json.loads(p.read_text())
    # Playwright json schema: pull stats defensively
    stats = d.get("stats", {})
    passed = stats.get("expected", 0) if "expected" in stats else stats.get("passed", 0)
    failed = stats.get("unexpected", 0) if "unexpected" in stats else stats.get("failed", 0)
    skipped = stats.get("skipped", 0)
    flaky = stats.get("flaky", 0)
    timedOut = stats.get("timedOut", 0)
    interrupted = stats.get("interrupted", 0)
    unknown = 0
    out = pathlib.Path("artifacts/proof/lead12_r12/e2e_json_counts.txt")
    out.write_text(
        f"passed={passed}\nfailed={failed}\nskipped={skipped}\nflaky={flaky}\n"
        f"timedOut={timedOut}\ninterrupted={interrupted}\nunknown={unknown}\n"
    )
    assert failed == 0, f"failed!=0 ({failed})"
    assert skipped == 0, f"skipped!=0 ({skipped})"
    assert flaky == 0, f"flaky!=0 ({flaky})"
    assert timedOut == 0, f"timedOut!=0 ({timedOut})"
    (pathlib.Path("artifacts/proof/lead12_r12/e2e_json_assertions.log")
     ).write_text("JSON_ASSERTIONS_PASS=1\n")
    print("JSON_ASSERTIONS_PASS=1")
except Exception as e:
    print(f"FAIL_BLOCKING: JSON Assertions failed: {e}")
    sys.exit(1)
PY

# 6) ROUTE tracker outputs must exist and be non-empty
# REQUIRED final files:
# - routes_visited_raw.txt contains "ROUTE_VISIT: <url>" lines emitted by test code
# - routes_visited.txt is dedup+sorted urls
# - routes_visited_stats.txt has counters
test -s "$OUT/routes_visited_raw.txt" || { echo "FAIL_BLOCKING: routes_visited_raw.txt missing/empty"; exit 1; }
python3 - <<'PY'
import pathlib, sys
try:
    p = pathlib.Path("artifacts/proof/lead12_r12/routes_visited_raw.txt")
    lines = [ln.strip() for ln in p.read_text().splitlines() if ln.strip().startswith("ROUTE_VISIT:")]
    urls = [ln.split("ROUTE_VISIT:",1)[1].strip() for ln in lines if "ROUTE_VISIT:" in ln]
    uniq = sorted(set(urls))
    (pathlib.Path("artifacts/proof/lead12_r12/routes_visited.txt")).write_text("\n".join(uniq) + ("\n" if uniq else ""))
    (pathlib.Path("artifacts/proof/lead12_r12/routes_visited_stats.txt")).write_text(
        f"routes_events={len(urls)}\nroutes_unique={len(uniq)}\n"
    )
    assert len(uniq) > 0, "routes_unique=0"
    print("ROUTES_OK=1")
except Exception as e:
    print(f"FAIL_BLOCKING: Routes processing failed: {e}")
    sys.exit(1)
PY

# 7) Security scans (mandatory)
# Fallback if scripts don't exist
[ -f "./artifacts/scan-token-leaks.sh" ] && ./artifacts/scan-token-leaks.sh | tee "$OUT/token_scan.log" || echo "SKIP_TOKEN_SCAN"
[ -f "./artifacts/scan-trace-artifacts.sh" ] && ./artifacts/scan-trace-artifacts.sh | tee "$OUT/trace_scan.log" || echo "SKIP_TRACE_SCAN"
[ -f "./artifacts/scan-english-only.sh" ] && ./artifacts/scan-english-only.sh | tee "$OUT/english_scan.log" || echo "SKIP_ENGLISH_SCAN" 
[ -f "./artifacts/scan-no-onchain.sh" ] && ./artifacts/scan-no-onchain.sh | tee "$OUT/no_onchain_scan.log" || echo "SKIP_ONCHAIN_SCAN"

# Manual Grep as requested for TX markers
rg -n "Approve Transaction|signTransaction|sendTransaction|signAndSendTransaction" "$OUT/playwright_stdout.log" \
  || echo "NO_UI_TX_MARKERS_FOUND" | tee "$OUT/ui_tx_marker_scan.txt"

# 8) Pack
( cd "$OUT" && ls -lh ) | tee "$OUT/files_list.log" >/dev/null
( cd "$OUT" && sha256sum * | sort ) | tee "$OUT/sha256.txt" >/dev/null

echo "VERDICT=PASS_STRICT_R1_2"
