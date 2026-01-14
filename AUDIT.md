# Global Audit & Production Readiness Spec — journey.mfai.app
**Internal Engineering Audit Spec (single source of truth)**  
**Target Role:** antigravity (Senior Lead QA + Release/Hardening Auditor + AI Orchestration Supervisor)  
**Timezone:** Africa/Tunis  
**Scope:** End-to-end production readiness (functional + technical + security + ops + CI/CD)  
**Verdict:** `VERDICT=PASS_READY_FOR_PROD` OR `VERDICT=FAIL_BLOCKING` (no third state)

---

## Document Control
- **Doc Owner:** Engineering Lead
- **Last Updated:** YYYY-MM-DD
- **Change Log**
  - YYYY-MM-DD: <summary>

---

# 0) Mission, Non-Negotiables, Definitions

## 0.1 Mission (Production-Operable, Not Demo-Pretty)
Deliver an **audit-grade** proof that the system is:
- **Functional** (journey workflows, phases, progress, resources)
- **Reliable** (no crashes, deterministic gates, controlled timeouts)
- **Secure** (no secrets, safe modes, on-chain restrictions enforced)
- **Operable** (observability, rollback, SLOs, CI/CD reproducibility)
- **Truthful** (no fake coverage, no skipped tests, no silent bypass)

> This spec governs every audit phase. Nothing is “done” without artifacts.

## 0.2 Verdict Contract (Mandatory)
- `VERDICT=PASS_READY_FOR_PROD` **OR**
- `VERDICT=FAIL_BLOCKING`

If FAIL, must include:
1) Blocking list (root cause + impact)
2) Minimal surgical fixes (with diffs)
3) Post-fix rerun proof (commands + artifacts)
4) Residual risk list + prioritized remediation plan

## 0.3 Alpha Directives (Hard Rules)
### A) Repo-Driven (Zero invention)
- Never assume a route/script/env exists.
- Inventory first, then execute.
- Any placeholder must be replaced by discovered truth or marked `DISCOVERY_REQUIRED` with an explicit discovery command.

### B) Zero Secrets (Ever)
- No secrets in commits, logs, screenshots, traces, artifacts.
- Systematic sanitization: `KEY=***`, `URI=***`, tokens, wallet keys, cookies, auth headers.

### C) Reproducible Proofs
Every proof must provide:
- exact command
- expected PASS/FAIL condition
- artifact path
- checksum (sha256)

### D) No Contournement
- No “it passed on my machine” without artifacts.
- No screenshots as primary proof for coverage.
- E2E proof must include JSON + route tracking emitted by test code.

### E) Separation DEMO vs REAL (Hard)
- DEMO cannot write to REAL DB.
- REAL cannot rely on localStorage demo.
- Must be proven by tests + sanitized dumps.

---

## 0.4 Glossary (Required Vocabulary)
- **Route:** Frontend URL path (e.g. `/journeys/:id/phase/:n`)
- **Phase:** Business state in a Journey (Phase 0..N)
- **Step:** Atomic sub-state inside a Phase (must be explicit)
- **Persona:** User role/segment with allowed actions (RBAC)
- **Connect-only:** Wallet connect permitted; **NO** mint/airdrop/stake/vote tx
- **Artifact Pack:** Deterministic set of logs/reports produced by proof scripts

---

# 1) Environments & Execution Profiles (A/B/C + Prod Preview)

## PROFILE_A — Local Dev (Safe)
- Fast iteration; allowed dev server
- DB local (Mongo) + optional Redis if used
- Allows mocks only if explicitly declared & tested

## PROFILE_B — Prod-like (Preview)
- Must emulate production runtime:
  - `npm run build && npm run preview` for frontend (no HMR)
  - backend started in prod mode
  - clean storage/session
- Purpose: eliminate dev/HMR artifacts and validate real bundles.

## PROFILE_C — Chain Mode (Devnet/Testnet)
- Same as B + web3 enabled
- Idempotence + rate-limit handling required
- Tx hash logging required (sanitized)

## Global rule
All audit phases must declare:
- chosen profile
- env snapshot (sanitized)
- ports and health endpoints

---

# 2) System Map & Contracts (Must match README + Repo Reality)

## 2.1 System Overview (to be validated)
Frontend (`journey-simulator`), Backend (`mf-back`), MongoDB, optional Redis, RAG service, LLM provider, Solana RPC.

**Proof Required:**
- `artifacts/system_map.md` listing:
  - all services
  - ports
  - base URLs
  - health endpoints
  - required env vars per service

## 2.2 API Contract Checklist (No “best effort”)
For each used endpoint:
- Request schema
- Response schema
- Error schema (status codes)
- Auth requirements
- Rate limits / timeouts
- Idempotence keys (if mutation)

**Artifacts:**
- `artifacts/contracts/api_contracts.md`
- `artifacts/contracts/api_samples_sanitized.json`

## 2.3 Data Contract Checklist (Mongo / Redis)
- Core collections + indexes
- Retention/TTL rules
- Migration strategy (if applicable)
- Seed strategy for E2E (deterministic fixtures)

**Artifacts:**
- `artifacts/contracts/data_model.md`
- `artifacts/contracts/indexes_dump_sanitized.txt`

## 2.4 Agent Contract Checklist (Zyno + Agents)
For each agent:
- Name, purpose
- Input schema (validated)
- Output schema (validated)
- Side effects (DB writes, RAG calls, on-chain intent)
- Determinism policy (minimum)
- Timeout policy
- Retry policy (explicit)

**Artifacts:**
- `artifacts/contracts/agents_contracts.md`
- `artifacts/contracts/agents_samples_sanitized.json`

## 2.5 RAG Contract Checklist
- Required fields: `content` (or equivalent), metadata fields, source labeling
- Remote vs fallback tagging
- topK clamp
- Observability counters: remote_used, fallback_used, latency buckets

**Artifacts:**
- `artifacts/contracts/rag_contract.md`

---

# 3) Navigation & Journey State Machine (Critical Prod Spec)

> This section is the #1 missing piece in most repos: it synchronizes UI routes, business phases, and backend truth.

## 3.1 Route Map Inventory (Repo truth)
Generate:
- `artifacts/routes/routes_inventory.txt`
- `artifacts/routes/routes_requires_auth.txt`
- `artifacts/routes/routes_requires_wallet.txt`

**Must list:**
- public routes
- authenticated routes
- wallet-required routes
- admin routes (if any)
- deprecated routes (must 404 or redirect cleanly)

## 3.2 Persona Matrix (RBAC + UI gating + API gating)
Define personas (real ones from repo):
- allowed routes
- allowed actions
- forbidden actions with expected failure mode:
  - UI: disabled/hidden with message
  - API: 401/403 with structured error

Artifacts:
- `artifacts/security/persona_matrix.md`

## 3.3 Journey Phase Machine (Authoritative)
Define a **formal state machine**:
- phases P0..Pn
- for each phase:
  - **entry conditions**
  - **steps S1..Sk**
  - **exit conditions**
  - **allowed transitions**
  - **side effects** (resource unlock, agent triggers, on-chain intents)
  - **rollback/repair path** if step fails

Artifacts:
- `artifacts/business/journey_state_machine.md`
- `artifacts/business/phase_steps_table.md`

## 3.4 Dynamic Progress & UI Synchronization (Must be proven)
Rules:
- Backend is the source of truth for:
  - current phase
  - progress %
  - unlocked resources
  - completion markers
- UI must never “advance” without backend confirmation.
- On reload/login: UI must reconstruct exactly from persisted state.

Proof must include:
- sanitized progress snapshot before/after phase step
- reload test verifying equality

Artifacts:
- `artifacts/business/progress_snapshots_sanitized.json`
- `artifacts/business/progress_reload_diff.txt`

---

# 4) Quality Gates (Global + Phase Gates)

## 4.1 Global Gates (Must PASS)
- Lint/Typecheck: PASS
- Unit tests: PASS
- Integration/contract tests: PASS
- E2E: PASS with **skipped=0**
- No secrets scan: PASS
- English-only scan: PASS (policy-defined)
- No-onchain scan: PASS in connect-only
- Zero-byte artifacts: 0
- Deterministic proof pack: sha256 for all mandatory files

## 4.2 Sonar Quality Gates (Mandatory Audit Attempt)
- Must attempt Sonar scan:
  - if creds missing: produce `sonar.log` with `SONAR_SKIPPED_MISSING_CREDS=1`
  - if creds present: must pass configured Quality Gate

Artifacts:
- `artifacts/proof/<run>/sonar.log`
- `artifacts/security/sonar_requirements.md` (token/host variables, never committed)

---

# 5) E2E Audit Standard (Anti-Contournement)

## 5.1 Playwright Hard Rules
- `--forbid-only` must be enforced
- reporter must include JSON output: `playwright_report.json`
- JSON parsing must prove:
  - `skipped=0`
  - `unexpected=0` (for PASS)
  - `flaky=0` if policy is zero-retry; otherwise explicitly report retries.
- If retries>0 are allowed in non-blocking mode, the policy must define:
  - max retries
  - allowed flaky categories
  - mandatory “flake triage” ticket creation

## 5.2 Route Tracker (Integrated in test code)
Requirement:
- On every `framenavigated` emit:
  - `ROUTE_VISIT: <URL>`
- Deduplicate + sort + count.
- Produce:
  - `routes_visited.txt` (non-empty)
  - `routes_visited_stats.txt` (events/unique counts)
  - `routes_coverage.md` mapping routes -> tests that hit them

> Screenshots are not accepted as primary coverage proof.

## 5.3 Coverage of Navigation (Business Coverage, Not Just Pages)
Minimum required coverage:
- onboarding -> start journey -> phase transitions -> resource unlock -> completion
- auth login/logout + session restore
- error paths:
  - forbidden route access (RBAC)
  - backend error (5xx) graceful UI
  - RAG unavailable fallback path
  - connect-only blocks on-chain actions

Artifact:
- `artifacts/e2e/navigation_coverage_matrix.md`

## 5.4 Connect-only Mode Invariants (Strict)
In connect-only:
- wallet connect permitted
- any mint/stake/vote/airdrop action must be:
  - blocked (UI + API)
  - logged as “SIMULATED/BLOCKED”
  - confirmed by scan-no-onchain

---

# 6) Security & Compliance Audit (AppSec + Web3)

## 6.1 Secrets & Supply Chain
- secret scan (repo + artifacts)
- dependency audit (npm)
- SBOM generation (if feasible)
- lockfile integrity

Artifacts:
- `artifacts/security/deps_audit.txt`
- `artifacts/security/sbom.*` (optional)
- `artifacts/security/secrets_scan.log`

## 6.2 OWASP-style Controls (Minimal Required)
- Auth/session security
- CORS/CSP policy documented
- Input validation + centralized error handling
- Rate limiting on sensitive endpoints
- Logging policy (no PII/secrets)

Artifacts:
- `artifacts/security/appsec_checklist.md`

## 6.3 Web3 Specific
- signing domains / message formats
- replay resistance policy
- tx idempotence policy
- RPC rate-limit handling
- connect-only enforcement points (UI + API)

Artifacts:
- `artifacts/security/web3_controls.md`

---

# 7) Observability & Ops Readiness (Prod Must-Haves)

## 7.1 Logs / Metrics / Traces
- structured logs (service, requestId, userId hash, journeyId hash)
- counters:
  - agent_runs_total, agent_fail_total
  - rag_remote_used_total, rag_fallback_total
  - phase_transition_total, phase_transition_fail_total
  - ui_error_boundary_total
- alert rules for:
  - crash loops
  - elevated 5xx
  - RAG latency
  - LLM failures

Artifacts:
- `artifacts/ops/observability_spec.md`

## 7.2 Backup / Restore / Rollback
- Mongo backup strategy
- restore drill (validated)
- app rollback plan (previous docker tag / previous release artifact)

Artifacts:
- `artifacts/ops/backup_restore_plan.md`
- `artifacts/ops/rollback_plan.md`

## 7.3 SLO / SLA Targets (Minimal)
Define:
- API p95 latency target
- UI load budgets (Lighthouse if used)
- availability targets per service

Artifacts:
- `artifacts/ops/slo.md`

---

# 8) CI/CD & Release Engineering (GitHub)

## 8.1 Pipeline (Must be explicit)
Define required jobs:
- install + cache
- lint + typecheck
- unit + integration
- e2e (multi-browser)
- scans (token/trace/english/no-onchain)
- sonar (if creds)
- artifact upload (proof pack)
- release gate evaluation (verdict)

Artifacts:
- `artifacts/ci/pipeline_spec.md`

## 8.2 Versioning & Release
- semantic version policy
- changelog policy
- tag + release notes policy
- deployment policy (preview -> prod)

Artifacts:
- `artifacts/ci/release_policy.md`

---

# 9) Audit Phases (0 → 8) + NEW Phase 9/10

> Keep your existing phases, but tighten them with the new contracts above.

## PHASE 0 — Discovery & Baseline
Outputs:
- system map
- routes inventory
- persona matrix
- phase machine draft
- test inventory

## PHASE 1 — Runner & Compliance Gates (R1/R2/R3)
Hard gates:
- R1 English-only
- R2 Guide completeness
- R3 route-tracker truthfulness

## PHASE 2 — UX/UI Desktop (Layout invariants + dashboards)
Must validate:
- no overlap, stable loading states, dynamic blocks render

## PHASE 3 — User Workflows (end-to-end journey)
Must validate:
- transitions + resource unlock + completion + reload restore

## PHASE 4 — Agents & Orchestration
Must validate:
- routing correctness, schemas, persistence, no silent failures

## PHASE 5 — RAG + LLM
Must validate:
- remote usage proof, fallback tagging, determinism minimal, observability

## PHASE 6 — On-chain (Real or strict mock)
Must validate:
- connect-only block OR testnet tx proof, idempotence

## PHASE 7 — Persistence & Multi-user
Must validate:
- 2 users, separation demo/real, crash recover checkpoints

## PHASE 8 — Security & Hardening Regression
Must validate:
- non-root, read-only rootfs if enabled, no crash loop, write policies

## PHASE 9 — Ops Readiness (NEW)
Must validate:
- observability, alerts, backup/restore drill

## PHASE 10 — Release Gate & Handoff (NEW)
Must validate:
- CI pipeline green
- proof pack produced
- final verdict generated + rollback plan

---

# 10) Artifact Policy (Strict, Anti-Noise)

## 10.1 What must be committed vs generated
**Committed (source-of-truth):**
- proof scripts in `artifacts/*.sh` + helper parsers
- scan scripts
- this `AUDIT.md`
- CI workflow definitions
- minimal docs under `docs/` or `artifacts/templates/`

**Generated (must NOT be committed, must be uploaded as CI artifacts):**
- `artifacts/proof/**`
- JSON reports, traces, screenshots
- logs, dumps
- any `qa-report.md`, `task.md`, `walkthrough.md` produced by runs (unless you explicitly decide otherwise later)

## 10.2 Forbidden junk (must be gitignored)
- node_modules, dist, build caches
- Playwright blobs except in artifacts pack
- debug html pages
- logs, tmp, screenshots outside proof pack
- OS/editor files

---

# 11) Mandatory Proof Pack (Per Run)
Must produce under: `artifacts/proof/<run_id>/`

Required files:
- audit_read_proof.log (non-empty)
- playwright_report.json (json reporter output)
- e2e_json_counts.txt (parsed counts; must prove skipped=0)
- routes_visited.txt (non-empty)
- routes_visited_stats.txt
- token_scan.log (non-empty)
- trace_scan.log (non-empty)
- english_scan.log (non-empty)
- no_onchain_scan.log (non-empty)
- zero_byte_files.txt (ZERO_BYTE_FILES_FOUND=0)
- sha256.txt (checksums for all above)
- sonar.log (pass or missing-creds proof)

---

# 12) Final Reporting
- `final_verdict.md` must state:
  - profile used
  - gates results
  - PASS/FAIL
  - links to artifacts pack
  - residual risks (if any)
  - next steps

---

# END
This document is the only audit spec.
No phase may be executed without compliance, proofs, and artifacts.

