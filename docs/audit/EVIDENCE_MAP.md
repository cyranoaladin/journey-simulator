# Evidence Map - Audit SOC2 Simulé

**Version** : 1.0.0
**Date** : 2025-12-26
**Scope** : Money Factory AI Orchestration v1.0.0

---

## Avertissement

Cette carte de preuves est basée sur l'examen du code source, de la documentation, et des tests disponibles. Elle ne constitue **pas une attestation formelle** ni une certification SOC2.

---

## Tableau Evidence Map

| Control | Evidence | File | Confidence |
|---------|----------|------|------------|
| **Security - Accès Non Autorisé** | Validation Zod des entrées | `mf-back/orchestration/vsliceSchema.js` | 🟢 **Élevée** |
| **Security - Accès Non Autorisé** | Isolation multi-tenant par tenantId | `mf-back/orchestration/idempotencyStore.js` (ligne 41-49) | 🟢 **Élevée** |
| **Security - Accès Non Autorisé** | Tests isolation tenant | `mf-back/__tests__/verticalSliceOrchestration.test.js` | 🟢 **Élevée** |
| **Security - Protection Abus** | Quotas WARN/BLOCK | `mf-back/orchestration/tenantQuotaRegistry.js` | 🟢 **Élevée** |
| **Security - Protection Abus** | Kill switch manual + auto | `mf-back/orchestration/killSwitch.js` (ligne 1-62) | 🟢 **Élevée** |
| **Security - Protection Abus** | Production guards | `mf-back/orchestration/productionGuards.js` | 🟢 **Élevée** |
| **Security - Protection Abus** | Tests charge/chaos (15,660 requêtes, 0 crash) | `docs/testing/RESILIENCE_REPORT.md` | 🟢 **Élevée** |
| **Security - Secrets Management** | Secrets policy blocage PROD | `mf-back/orchestration/secretsPolicy.js` | 🟢 **Élevée** |
| **Security - Secrets Management** | Pas de logging secrets | `mf-back/orchestration/llmClient.js` (log provider/model, pas de clé) | 🟢 **Élevée** |
| **Security - Secrets Management** | Checklist conformité | `docs/security/LEGAL_COMPLIANCE_CHECKLIST.md` (section 2.2) | 🟢 **Élevée** |
| **Security - Web3 Guards** | Validation proof/anchor/mint | `mf-back/orchestration/web3Guards.js` | 🟢 **Élevée** |
| **Security - Web3 Guards** | Pipeline simulée (DRY_RUN) | `mf-back/orchestration/web3Pipeline.js` | 🟢 **Élevée** |
| **Availability - Never-Crash** | Try/catch global | `mf-back/orchestration/zynoVerticalSlice.js` (ligne 332-1900) | 🟢 **Élevée** |
| **Availability - Never-Crash** | Timeout guards agents | `mf-back/orchestration/zynoVerticalSlice.js` (timeoutGuard) | 🟢 **Élevée** |
| **Availability - Never-Crash** | Tests résilience (15,660 requêtes, 0 crash) | `docs/testing/RESILIENCE_REPORT.md` | 🟢 **Élevée** |
| **Availability - Fallbacks** | Circuit breaker fallback mock | `mf-back/orchestration/circuitBreaker.js` | 🟢 **Élevée** |
| **Availability - Fallbacks** | RAG fallback local | `mf-back/orchestration/ragClient.js` | 🟢 **Élevée** |
| **Availability - Fallbacks** | Degradation policy ordre | `mf-back/orchestration/degradationPolicy.js` | 🟢 **Élevée** |
| **Availability - Fallbacks** | Tests chaos validés | `docs/testing/CHAOS_PLAN.md` | 🟢 **Élevée** |
| **Availability - SLO Compliance** | SLO registry définitions | `mf-back/orchestration/sloRegistry.js` | 🟢 **Élevée** |
| **Availability - SLO Compliance** | Metrics store agrégation | `mf-back/orchestration/metricsStore.js` | 🟢 **Élevée** |
| **Availability - SLO Compliance** | Alerting engine | `mf-back/orchestration/alertingEngine.js` | 🟢 **Élevée** |
| **Confidentiality - Isolation Multi-Tenant** | Stores partitionnés tenantId | `mf-back/orchestration/idempotencyStore.js`, `auditTrailStore.js`, `llmCache.js`, `metricsStore.js` | 🟢 **Élevée** |
| **Confidentiality - Isolation Multi-Tenant** | Quotas par tenant | `mf-back/orchestration/tenantQuotaRegistry.js` | 🟢 **Élevée** |
| **Confidentiality - Isolation Multi-Tenant** | Tests isolation tenant | `mf-back/__tests__/verticalSliceOrchestration.test.js` | 🟢 **Élevée** |
| **Confidentiality - Pas de PII** | Stores in-memory TTL | `mf-back/orchestration/idempotencyStore.js` (DEFAULT_TTL_MS = 10 *60* 1000) | 🟢 **Élevée** |
| **Confidentiality - Pas de PII** | Logs structurés (traceId/runId/tenantId) | `mf-back/utils/logger.js` | 🟢 **Élevée** |
| **Confidentiality - Pas de PII** | Checklist conformité | `docs/security/LEGAL_COMPLIANCE_CHECKLIST.md` (section 1.1, 2.1) | 🟢 **Élevée** |
| **Confidentiality - Chiffrement au Repos** | Stores in-memory uniquement | `mf-back/orchestration/idempotencyStore.js`, `auditTrailStore.js` | 🟡 **Moyenne** (non applicable, données volatiles) |
| **Processing Integrity - Validation Entrées** | Validation Zod | `mf-back/orchestration/vsliceSchema.js` | 🟢 **Élevée** |
| **Processing Integrity - Validation Entrées** | Sanitisation réponses | `mf-back/orchestration/agentProtocol.js` | 🟢 **Élevée** |
| **Processing Integrity - Validation Entrées** | Tests validation | `mf-back/__tests__/verticalSliceOrchestration.test.js` | 🟢 **Élevée** |
| **Processing Integrity - Idempotence** | Idempotency store replay | `mf-back/orchestration/idempotencyStore.js` | 🟢 **Élevée** |
| **Processing Integrity - Idempotence** | Clé déterministe | `mf-back/orchestration/zynoVerticalSlice.js` (calcul clé idempotence) | 🟢 **Élevée** |
| **Processing Integrity - Idempotence** | Tests replay | `mf-back/__tests__/verticalSliceOrchestration.test.js` | 🟢 **Élevée** |
| **Processing Integrity - Checksums** | Hash stable clé idempotence | `mf-back/orchestration/idempotencyStore.js` (object-hash) | 🟡 **Moyenne** (hash pour clé, pas checksum intégrité) |
| **Privacy - Minimisation Données** | Pas de stockage persistant PII | `mf-back/orchestration/idempotencyStore.js`, `auditTrailStore.js` | 🟢 **Élevée** |
| **Privacy - Minimisation Données** | TTL automatique | `mf-back/orchestration/idempotencyStore.js` (DEFAULT_TTL_MS) | 🟢 **Élevée** |
| **Privacy - Minimisation Données** | Checklist conformité | `docs/security/LEGAL_COMPLIANCE_CHECKLIST.md` (section 1.1) | 🟢 **Élevée** |
| **Privacy - Rétention Limitée** | TTL 10 minutes | `mf-back/orchestration/idempotencyStore.js` (DEFAULT_TTL_MS = 10 *60* 1000) | 🟢 **Élevée** |
| **Privacy - Rétention Limitée** | Éviction FIFO automatique | `mf-back/orchestration/idempotencyStore.js` (pruneTenant) | 🟢 **Élevée** |
| **Privacy - Rétention Limitée** | Checklist conformité | `docs/security/LEGAL_COMPLIANCE_CHECKLIST.md` (section 1.2) | 🟢 **Élevée** |
| **Privacy - Droits Utilisateurs** | Isolation tenantId | `mf-back/orchestration/idempotencyStore.js` (partition par tenantId) | 🟡 **Moyenne** (isolation OK, mais pas d'API explicite) |
| **Privacy - Droits Utilisateurs** | Checklist conformité | `docs/security/LEGAL_COMPLIANCE_CHECKLIST.md` (section 1.3 - PARTIAL) | 🟡 **Moyenne** |

---

## Légende Confidence

- 🟢 **Élevée** : Preuve directe dans le code, tests validés, documentation complète
- 🟡 **Moyenne** : Preuve indirecte ou partielle, documentation présente mais incomplète
- 🔴 **Faible** : Preuve absente ou insuffisante

---

## Statistiques

- **Total contrôles** : 16
- **Preuves élevées** : 38
- **Preuves moyennes** : 4
- **Preuves faibles** : 0

**Taux de confiance global** : 90.5% (preuves élevées)

---

**Money Factory AI - Evidence Map v1.0.0**
*Basé sur code source, documentation, tests disponibles*

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer
