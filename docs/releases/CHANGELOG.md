# Changelog Technique

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère à [Semantic Versioning](https://semver.org/lang/fr/).

---

## [1.0.0] - 2025-12-26

### 🎯 Release Officielle v1.0.0

**Status** : Production-Ready (DRY_RUN mode)

### Ajouté

#### Orchestration & Agents

- Orchestrateur Zyno complet (`zynoVerticalSlice.js`)
- 16 agents production-ready (SecurityAudit, ProductSpec, GovernanceDAO, Compliance, RAGOps, DataIntegrity, Evaluation, JourneyDesign, Observability, Tokenomics, Growth, Marketplace, Analytics, Performance, DevOps, UXWriting)
- Intent router déterministe (`intentRouter.js`)
- WorkflowMap multi-phases (`workflowMap.js`)
- Feature flags par agent (activation progressive)
- Sanitisation réponses agents (Zod validation)

#### RAG & LLM

- RAG client avec fallback local (`ragClient.js`)
- RAG policy (citations filtrées, max 3, quotes ≤160 chars)
- LLM client avec mock par défaut (`llmClient.js`)
- LLM cache in-memory (TTL + FIFO, déduplication inter-agents)
- Cost model & budgets (`costModel.js`)
- Circuit breaker LLM/RAG/exec (`circuitBreaker.js`)
- Retry logic (1 retry transient)

#### Multi-Tenant & Quotas

- Tenant quota registry (`tenantQuotaRegistry.js`)
- Quotas par tenant (runs, LLM calls, cost)
- WARN à 80%, BLOCK à 100%
- Load shedding si quota dépassé
- Partition stores par tenantId (isolation complète)

#### Observabilité

- Metrics store (`metricsStore.js`) : agrégation fenêtre glissante (100 runs)
- SLO registry (`sloRegistry.js`) : définitions SLO logiques
- Alerting engine (`alertingEngine.js`) : évaluation métriques vs SLO
- Telemetry adapter (`telemetryAdapter.js`) : émission événements structurés
- SLO exporter (`sloExporter.js`) : snapshot JSON métriques/SLO

#### Sécurité & Guards

- Production guards (`productionGuards.js`) : blocage REAL si conditions non satisfaites
- Kill switch (`killSwitch.js`) : manual (env) + auto (seuils)
- Secrets policy (`secretsPolicy.js`) : blocage PROD si secrets manquants
- Web3 guards (`web3Guards.js`) : validation proof/anchor/mint
- Web3 pipeline simulée (`web3Pipeline.js`) : state machine proof → anchor → mint (DRY_RUN)

#### Dégradation & Résilience

- Degradation policy (`degradationPolicy.js`) : ordre déterministe (quota → cost → slo → circuit → kill_switch)
- Concurrency manager (`concurrencyManager.js`) : FIFO per tenant, load shedding
- Timeout guards : agents marqués TIMEOUT si > `constraints.timeoutMs`
- Never-throw invariant : toutes les requêtes retournent des réponses structurées

#### Stores & Persistence

- Idempotency store (`idempotencyStore.js`) : replay safety, TTL + FIFO
- Audit trail store (`auditTrailStore.js`) : historique limité (100 entrées)
- Memory store (`memoryStore.js`) : cache récent, TTL + FIFO
- Artifact store (`artifactStore.js`) : accumulation cross-phase
- LLM cache (`llmCache.js`) : cache réponses LLM, TTL + FIFO

#### Execution & Tools

- Tools registry (`toolsRegistry.js`) : registry déclaratif
- Action tool mapper (`actionToolMapper.js`) : mapping déterministe action → tool
- Execution engine (`executionEngine.js`) : plan simulé crédible
- Execution gate (`executionGate.js`) : shadow/DRY_RUN, REAL bloqué par défaut

#### Presets & Workflows

- Presets métiers (`presets/*.json`) : audit-dao, product-onboarding, investor-diligence, web3-mint-pipeline
- DEMO_MODE : outputs stables (force mock + RAG local)
- Shadow REAL mode : comparaison DRY_RUN vs REAL simulé

#### Release & Ops

- Preflight script (`scripts/release/preflight.js`) : vérifications bloquantes
- Smoke script (`scripts/release/smoke.js`) : sanity checks orchestrateur
- Smoke-E2E script (`scripts/release/smoke-e2e.js`) : tests E2E complets
- Rollback script (`scripts/release/rollback.js`) : retour état sûr
- Go-live script (`scripts/release/go-live.js`) : pipeline complète (preflight + smoke + golden + SLO snapshot)

#### Tests

- Tests unitaires agents (`__tests__/agents/`)
- Tests intégration vertical slice (`__tests__/verticalSliceOrchestration.test.js`)
- Tests E2E API (`__tests__/e2e/orchestration.e2e.test.js`)
- Tests workflows (`__tests__/workflows/workflowPhases.test.js`)
- Tests Web3 (`__tests__/web3/web3Pipeline.test.js`)
- Tests execution (`__tests__/exec/toolsRegistry.test.js`, `actionToolMapper.test.js`)
- Golden snapshots (`__fixtures__/golden/`) : outputs de référence

#### Documentation

- Coverage matrix (`docs/coverage/COVERAGE_MATRIX.md`)
- Reality check (`docs/coverage/REALITY_CHECK_R5.md`)
- Legal compliance checklist (`docs/security/LEGAL_COMPLIANCE_CHECKLIST.md`)
- Compliance traceability (`docs/security/COMPLIANCE_TRACEABILITY.md`)
- Load test plan (`docs/testing/LOAD_TEST_PLAN.md`)
- Chaos plan (`docs/testing/CHAOS_PLAN.md`)
- Resilience report (`docs/testing/RESILIENCE_REPORT.md`)
- Metrics model (`docs/observability/METRICS_MODEL.md`)
- Grafana dashboard (`docs/observability/grafana/GRAFANA_DASHBOARD.json`)
- Runbooks ops (`docs/ops/RUNBOOK_PROD.md`, `GO_LIVE_CHECKLIST.md`, `INCIDENT_MATRIX.md`)

#### Compliance

- Compliance check script (`scripts/compliance/check-compliance.js`)
- Validation passive (docs, flags PROD, secrets policy)

### Modifié

- Orchestrateur : enrichissement ops/systemStatus (metrics, alerts, degradation)
- Agents : normalisation sorties (summary, findings, actions, confidence, assumptions, limits, citations)
- RAG : fallback local si remote indisponible
- LLM : cache + déduplication inter-agents
- Quotas : WARN/BLOCK thresholds (80%/100%)
- Degradation : ordre déterministe appliqué
- Telemetry : émission run + alerts CRITICAL

### Limité (STUB / PARTIAL)

- **8 agents stubs/partiels** : InvestorDemoAgent, QAPlaywrightAgent, CurriculumAgent, WalletAuthAgent, SolanaAnchorAgent, MintingAgent, RiskFraudAgent (désactivé), APIContractAgent (partiel)
- **WorkflowMap partiel** : couverture limitée (pas toutes journeys/phases)
- **Web3 pipeline simulée** : aucune exécution on-chain réelle (DRY_RUN uniquement)
- **REAL execution bloqué** : REAL reste ultra-guardé (opt-in explicite)
- **UI-E2E non intégré** : présent mais non intégré pipeline go-live (optionnel)

### Sécurité

- Never-throw invariant : toutes les requêtes retournent des réponses structurées
- DRY_RUN par défaut : REAL ultra-guardé (EXECUTION_ENABLED, kill switch, secrets)
- Multi-tenant isolation : stores partitionnés par tenantId
- Secrets policy : blocage PROD si secrets manquants
- Web3 guards : validation proof/anchor/mint
- Conformité RGPD : pas de stockage persistant PII, logs sans PII, audit trail limité

---

## Pré-versions (R3 → R5)

### R3.0 - Orchestration Base

- Orchestrateur Zyno initial
- Agents registry (24 agents)
- Intent router
- WorkflowMap basique
- RAG client (local fallback)
- LLM client (mock par défaut)
- Validation Zod
- Sanitisation réponses

### R3.1 - Production Readiness

- Production guards
- Ops diagnostics (warnings, fallbacks, timeouts, failures)
- Audit trail store (in-memory, TTL + FIFO)
- System status enrichi

### R3.2 - Robustesse

- **Step 1** : Agent coverage (remplacement stubs)
- **Step 2** : Idempotence & replay safety
- **Step 3** : Web3 guards (proof/anchor/mint)
- **Step 4** : Kill switch + seuils automatiques
- **Step 5** : Release scripts (preflight, smoke, rollback)

### R3.3 - Qualité Agents

- Coverage matrix
- Plans d'action par agent
- Normalisation sorties agents
- Cohérence orchestration ↔ parcours ↔ agents

### R3.4 - Activation Progressive

- Executive summaries & human plans
- Feature flags agents
- Budgets par environnement
- Shadow REAL mode
- Presets métiers
- DEMO_MODE

### R4.0 - Observabilité

- **Step 1** : E2E API/UI + smoke
- **Step 2** : SLO registry, metrics store, alerting engine
- **Step 3** : LLM cache, cost model, dégradation contrôlée

### R4.1 - Multi-Tenant & Scalabilité

- Tenant quota registry
- Multi-tenant partitioning (stores)
- Load shedding
- Fairness per tenant

### R4.2 - Télémétrie & Go-Live

- Telemetry adapter
- Degradation policy (ordre déterministe)
- Runbooks ops
- Go-live script complet

### R5.0 - Reality Check

- Gap report (annoncé vs réel)
- Execution map
- Plan R5 (phases)

### R5.1 - Agents Réels (P0)

- Implémentations minimales agents stubs (InvestorDemoAgent, QAPlaywrightAgent, CurriculumAgent, WalletAuthAgent, SolanaAnchorAgent, MintingAgent)

### R5.2 - Workflows Multi-Phases

- WorkflowMap étendu
- Accumulation artifacts cross-phase
- Progression de phase
- Replay idempotent par phase

### R5.3 - Pipeline Web3 Simulée

- State machine proof → anchor → mint
- Idempotence & replay
- Validation transitions
- Exposition systemStatus.web3Pipeline

### R5.4 - Tool Mapping & Execution Plan

- Tools registry déclaratif
- Action → tool mapping déterministe
- Execution plan simulé crédible
- Shadow delta enrichi

### R5.5 - Ops & Go-Live Final

- SLO exporter (snapshot JSON)
- Golden snapshots (fixtures de référence)
- Go-live script durci (preflight + smoke + golden + SLO snapshot)
- Documentation ops finale

### R6.1 - Sécurité Légale & Conformité

- Legal compliance checklist
- Compliance traceability matrix
- Compliance check script (validation passive)

### R6.2 - Dashboard Grafana

- Metrics model
- Grafana dashboard template (JSON)
- README import instructions

### R6.3 - Tests de Charge & Chaos

- Load test plan (7 scénarios)
- Chaos plan (7 injections simulées)
- Simulation scripts (load + chaos)
- Resilience report

---

## Format

### Types de changements

- **Ajouté** : nouvelles fonctionnalités
- **Modifié** : changements fonctionnels existants
- **Déprécié** : fonctionnalités bientôt supprimées
- **Supprimé** : fonctionnalités supprimées
- **Corrigé** : corrections de bugs
- **Sécurité** : vulnérabilités corrigées
- **Limité** : limitations connues (STUB/PARTIAL)

---

**Money Factory AI - Orchestration Changelog**
*Version 1.0.0 - 2025-12-26*

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer
