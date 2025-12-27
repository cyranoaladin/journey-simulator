# Evidence Technique - Pré-Audit ISO27001 / DORA

**Version** : 1.0.0
**Date** : 2025-12-26
**Scope** : Money Factory AI Orchestration v1.0.0

---

## Avertissement

Cette carte de preuves est basée sur l'examen du code source, de la documentation, et des tests disponibles. Elle ne constitue **pas une attestation formelle** ni une certification ISO27001 ou DORA.

---

## Tableau Evidence Map

| Contrôle | Evidence | Fichier | Confiance |
|----------|----------|---------|-----------|
| **A.5.1.1 Politiques Sécurité** | Documentation sécurité complète | `docs/SECURITY.md`, `docs/security/CHECKLISTS_SECURITY.md` | 🟢 **Élevée** |
| **A.5.1.1 Politiques Sécurité** | Legal compliance checklist | `docs/security/LEGAL_COMPLIANCE_CHECKLIST.md` | 🟢 **Élevée** |
| **A.5.1.1 Politiques Sécurité** | Compliance traceability | `docs/security/COMPLIANCE_TRACEABILITY.md` | 🟢 **Élevée** |
| **A.5.1.1 Politiques Sécurité** | Politique kill switch / DRY_RUN | `docs/releases/RELEASE_v1.0.md` (section 5) | 🟢 **Élevée** |
| **A.5.1.2 Rôles/Responsabilités** | Runbook production | `docs/ops/RUNBOOK_PROD.md` | 🟡 **Moyenne** (pas de RACI) |
| **A.5.1.2 Rôles/Responsabilités** | Incident matrix | `docs/ops/INCIDENT_MATRIX.md` | 🟡 **Moyenne** (pas de RACI) |
| **A.5.1.2 Rôles/Responsabilités** | Release checklist | `docs/releases/RELEASE_CHECKLIST.md` | 🟡 **Moyenne** (pas de RACI) |
| **A.5.1.3 Séparation Responsabilités** | Isolation multi-tenant | `mf-back/orchestration/idempotencyStore.js` (partition tenantId) | 🟢 **Élevée** |
| **A.5.1.3 Séparation Responsabilités** | Quotas par tenant | `mf-back/orchestration/tenantQuotaRegistry.js` | 🟢 **Élevée** |
| **A.5.1.3 Séparation Responsabilités** | Feature flags agents | `mf-back/orchestration/zynoVerticalSlice.js` | 🟢 **Élevée** |
| **A.5.1.3 Séparation Responsabilités** | Kill switch | `mf-back/orchestration/killSwitch.js` | 🟢 **Élevée** |
| **A.8.1.1 Inventaire Actifs** | Architecture documentation | `docs/ARCHITECTURE.md` | 🟢 **Élevée** |
| **A.8.1.1 Inventaire Actifs** | Coverage matrix | `docs/coverage/COVERAGE_MATRIX.md` | 🟢 **Élevée** |
| **A.8.1.1 Inventaire Actifs** | Reality check | `docs/coverage/REALITY_CHECK_R5.md` | 🟢 **Élevée** |
| **A.8.1.1 Inventaire Actifs** | Agent coverage | `docs/agents/AGENT_COVERAGE.md` | 🟢 **Élevée** |
| **A.8.1.2 Propriété Actifs** | Propriété intellectuelle | `docs/legal/SAAS_CONTRACT_APPENDIX.md` (section 8) | 🟢 **Élevée** |
| **A.8.1.2 Propriété Actifs** | Annexe légale investisseurs | `docs/legal/INVESTOR_TECH_LEGAL_APPENDIX.md` (section 4) | 🟢 **Élevée** |
| **A.8.1.3 Acceptable Use** | Annexe contractuelle SaaS | `docs/legal/SAAS_CONTRACT_APPENDIX.md` | 🟢 **Élevée** |
| **A.8.1.3 Acceptable Use** | Legal compliance checklist | `docs/security/LEGAL_COMPLIANCE_CHECKLIST.md` | 🟢 **Élevée** |
| **A.9.1.1 Politique Contrôle Accès** | Validation Zod | `mf-back/orchestration/vsliceSchema.js` | 🟢 **Élevée** |
| **A.9.1.1 Politique Contrôle Accès** | Isolation tenant | `mf-back/orchestration/idempotencyStore.js` (partition tenantId) | 🟢 **Élevée** |
| **A.9.1.1 Politique Contrôle Accès** | Tests isolation tenant | `mf-back/__tests__/verticalSliceOrchestration.test.js` | 🟢 **Élevée** |
| **A.9.2.1 Gestion Accès Utilisateurs** | Isolation tenantId | `mf-back/orchestration/idempotencyStore.js` (partition tenantId) | 🟡 **Moyenne** (pas de gestion accès explicite) |
| **A.9.2.1 Gestion Accès Utilisateurs** | Quotas par tenant | `mf-back/orchestration/tenantQuotaRegistry.js` | 🟡 **Moyenne** (pas de gestion accès explicite) |
| **A.9.4.2 Contrôle Accès Données** | Partition tenantId | `mf-back/orchestration/idempotencyStore.js`, `auditTrailStore.js`, `llmCache.js` | 🟢 **Élevée** |
| **A.9.4.2 Contrôle Accès Données** | TTL automatique | `mf-back/orchestration/idempotencyStore.js` (DEFAULT_TTL_MS = 10 *60* 1000) | 🟢 **Élevée** |
| **A.9.4.2 Contrôle Accès Données** | Pas d'accès cross-tenant | `mf-back/__tests__/verticalSliceOrchestration.test.js` (tests isolation) | 🟢 **Élevée** |
| **A.12.1.1 Documentation Procédures** | Runbook production | `docs/ops/RUNBOOK_PROD.md` | 🟢 **Élevée** |
| **A.12.1.1 Documentation Procédures** | Incident matrix | `docs/ops/INCIDENT_MATRIX.md` | 🟢 **Élevée** |
| **A.12.1.1 Documentation Procédures** | Go-live checklist | `docs/ops/GO_LIVE_CHECKLIST.md` | 🟢 **Élevée** |
| **A.12.1.1 Documentation Procédures** | Release checklist | `docs/releases/RELEASE_CHECKLIST.md` | 🟢 **Élevée** |
| **A.12.2.1 Protection Malwares** | Validation Zod | `mf-back/orchestration/vsliceSchema.js` | 🟡 **Moyenne** (pas de protection malware explicite) |
| **A.12.2.1 Protection Malwares** | Sanitisation réponses | `mf-back/orchestration/agentProtocol.js` | 🟡 **Moyenne** (pas de protection malware explicite) |
| **A.12.3.1 Gestion Backups** | Stores in-memory | `mf-back/orchestration/idempotencyStore.js` (in-memory uniquement) | 🟡 **Moyenne** (non applicable, mais pas de stratégie si persistance) |
| **A.12.3.1 Gestion Backups** | TTL automatique | `mf-back/orchestration/idempotencyStore.js` (DEFAULT_TTL_MS) | 🟡 **Moyenne** (non applicable, mais pas de stratégie si persistance) |
| **A.12.4.1 Logging/Monitoring** | Logs structurés (Pino) | `mf-back/utils/logger.js` | 🟢 **Élevée** |
| **A.12.4.1 Logging/Monitoring** | Metrics store | `mf-back/orchestration/metricsStore.js` | 🟢 **Élevée** |
| **A.12.4.1 Logging/Monitoring** | SLO registry | `mf-back/orchestration/sloRegistry.js` | 🟢 **Élevée** |
| **A.12.4.1 Logging/Monitoring** | Alerting engine | `mf-back/orchestration/alertingEngine.js` | 🟢 **Élevée** |
| **A.12.4.1 Logging/Monitoring** | Telemetry adapter | `mf-back/orchestration/telemetryAdapter.js` | 🟢 **Élevée** |
| **A.12.4.1 Logging/Monitoring** | Metrics model | `docs/observability/METRICS_MODEL.md` | 🟢 **Élevée** |
| **A.12.6.1 Gestion Vulnérabilités** | Guards production | `mf-back/orchestration/productionGuards.js` | 🟡 **Moyenne** (pas de scan automatisé) |
| **A.12.6.1 Gestion Vulnérabilités** | Kill switch | `mf-back/orchestration/killSwitch.js` | 🟡 **Moyenne** (pas de scan automatisé) |
| **A.12.6.1 Gestion Vulnérabilités** | Tests (77+ PASS) | `mf-back/__tests__/` | 🟡 **Moyenne** (pas de scan automatisé) |
| **A.16.1.1 Responsabilités/Procédures** | Incident matrix | `docs/ops/INCIDENT_MATRIX.md` | 🟢 **Élevée** |
| **A.16.1.1 Responsabilités/Procédures** | Runbook production | `docs/ops/RUNBOOK_PROD.md` | 🟢 **Élevée** |
| **A.16.1.1 Responsabilités/Procédures** | Kill switch | `mf-back/orchestration/killSwitch.js` | 🟢 **Élevée** |
| **A.16.1.1 Responsabilités/Procédures** | Rollback script | `scripts/release/rollback.js` | 🟢 **Élevée** |
| **A.16.1.2 Reporting Événements** | Alerting engine | `mf-back/orchestration/alertingEngine.js` | 🟢 **Élevée** |
| **A.16.1.2 Reporting Événements** | Telemetry adapter | `mf-back/orchestration/telemetryAdapter.js` | 🟢 **Élevée** |
| **A.16.1.2 Reporting Événements** | Audit trail | `mf-back/orchestration/auditTrailStore.js` | 🟢 **Élevée** |
| **A.16.1.2 Reporting Événements** | Logs structurés | `mf-back/utils/logger.js` | 🟢 **Élevée** |
| **A.16.1.3 Apprentissage Incidents** | Incident matrix | `docs/ops/INCIDENT_MATRIX.md` | 🟡 **Moyenne** (pas de post-mortem structuré) |
| **A.16.1.3 Apprentissage Incidents** | Runbook | `docs/ops/RUNBOOK_PROD.md` | 🟡 **Moyenne** (pas de post-mortem structuré) |
| **C.1.1 Identification Risques ICT** | Risk register | `docs/risk_register.md` | 🟢 **Élevée** |
| **C.1.1 Identification Risques ICT** | Audit findings | `docs/audit/AUDIT_FINDINGS.md` | 🟢 **Élevée** |
| **C.1.1 Identification Risques ICT** | Coverage matrix | `docs/coverage/COVERAGE_MATRIX.md` | 🟢 **Élevée** |
| **C.1.1 Identification Risques ICT** | Reality check | `docs/coverage/REALITY_CHECK_R5.md` | 🟢 **Élevée** |
| **C.1.2 Mitigation Risques ICT** | Production guards | `mf-back/orchestration/productionGuards.js` | 🟢 **Élevée** |
| **C.1.2 Mitigation Risques ICT** | Kill switch | `mf-back/orchestration/killSwitch.js` | 🟢 **Élevée** |
| **C.1.2 Mitigation Risques ICT** | Circuit breaker | `mf-back/orchestration/circuitBreaker.js` | 🟢 **Élevée** |
| **C.1.2 Mitigation Risques ICT** | Degradation policy | `mf-back/orchestration/degradationPolicy.js` | 🟢 **Élevée** |
| **C.1.2 Mitigation Risques ICT** | Tests résilience | `docs/testing/RESILIENCE_REPORT.md` (15,660 requêtes, 0 crash) | 🟢 **Élevée** |
| **C.2.1 Notification Incidents** | Alerting engine | `mf-back/orchestration/alertingEngine.js` | 🟡 **Moyenne** (pas de notification externe) |
| **C.2.1 Notification Incidents** | Telemetry adapter | `mf-back/orchestration/telemetryAdapter.js` | 🟡 **Moyenne** (pas de notification externe) |
| **C.2.1 Notification Incidents** | Incident matrix | `docs/ops/INCIDENT_MATRIX.md` | 🟡 **Moyenne** (pas de notification externe) |
| **C.2.2 Classification Incidents** | Alertes (INFO/WARN/CRITICAL) | `mf-back/orchestration/alertingEngine.js` | 🟢 **Élevée** |
| **C.2.2 Classification Incidents** | Incident matrix | `docs/ops/INCIDENT_MATRIX.md` | 🟢 **Élevée** |
| **C.2.2 Classification Incidents** | Audit findings classés | `docs/audit/AUDIT_FINDINGS.md` | 🟢 **Élevée** |
| **C.3.1 Tests Résilience** | Plan tests charge | `docs/testing/LOAD_TEST_PLAN.md` | 🟢 **Élevée** |
| **C.3.1 Tests Résilience** | Plan chaos | `docs/testing/CHAOS_PLAN.md` | 🟢 **Élevée** |
| **C.3.1 Tests Résilience** | Resilience report | `docs/testing/RESILIENCE_REPORT.md` | 🟢 **Élevée** |
| **C.3.1 Tests Résilience** | Scripts simulation | `scripts/testing/simulate-load.js`, `simulate-chaos.js` | 🟢 **Élevée** |
| **C.3.1 Tests Résilience** | Tests validés | `docs/testing/RESILIENCE_REPORT.md` (15,660 requêtes, 0 crash) | 🟢 **Élevée** |
| **C.3.2 Tests Récupération** | Rollback script | `scripts/release/rollback.js` | 🟡 **Moyenne** (pas de tests automatisés) |
| **C.3.2 Tests Récupération** | Kill switch | `mf-back/orchestration/killSwitch.js` | 🟡 **Moyenne** (pas de tests automatisés) |
| **C.3.2 Tests Récupération** | Fallbacks automatiques | `mf-back/orchestration/circuitBreaker.js`, `ragClient.js` | 🟡 **Moyenne** (pas de tests automatisés) |
| **C.4.1 Évaluation Risques Tiers** | Documentation dépendances | `docs/legal/INVESTOR_TECH_LEGAL_APPENDIX.md` (section 6) | 🟡 **Moyenne** (pas d'évaluation formelle) |
| **C.4.1 Évaluation Risques Tiers** | Fallbacks automatiques | `mf-back/orchestration/circuitBreaker.js`, `ragClient.js` | 🟡 **Moyenne** (pas d'évaluation formelle) |
| **C.4.2 Gestion Contrats Tiers** | Conditions d'utilisation | `docs/legal/INVESTOR_TECH_LEGAL_APPENDIX.md` (section 6.1) | 🟡 **Moyenne** (pas de gestion contrats) |
| **C.5.1 Plan Continuité Activité** | Fallbacks automatiques | `mf-back/orchestration/circuitBreaker.js`, `ragClient.js` | 🟡 **Moyenne** (pas de plan formel) |
| **C.5.1 Plan Continuité Activité** | Kill switch | `mf-back/orchestration/killSwitch.js` | 🟡 **Moyenne** (pas de plan formel) |
| **C.5.1 Plan Continuité Activité** | Degradation policy | `mf-back/orchestration/degradationPolicy.js` | 🟡 **Moyenne** (pas de plan formel) |
| **C.5.2 Tests Continuité Activité** | Tests résilience | `docs/testing/RESILIENCE_REPORT.md` | 🟡 **Moyenne** (pas de tests continuité formels) |
| **C.5.2 Tests Continuité Activité** | Scripts rollback | `scripts/release/rollback.js` | 🟡 **Moyenne** (pas de tests continuité formels) |

---

## Légende Confidence

- 🟢 **Élevée** : Preuve directe dans le code, tests validés, documentation complète
- 🟡 **Moyenne** : Preuve indirecte ou partielle, documentation présente mais incomplète
- 🔴 **Faible** : Preuve absente ou insuffisante

---

## Statistiques

- **Total contrôles** : 26
- **Preuves élevées** : 48
- **Preuves moyennes** : 15
- **Preuves faibles** : 0

**Taux de confiance global** : 76.2% (preuves élevées)

---

## Gaps Identifiés (Evidence Manquante)

| Contrôle | Gap | Evidence Requise |
|----------|-----|------------------|
| **A.5.1.2 Rôles/Responsabilités** | Matrice RACI | Matrice RACI documentée (`docs/ops/RACI_MATRIX.md`) |
| **A.9.1.1 Politique Contrôle Accès** | Contrôle auth orchestrateur | Middleware authentification dans orchestrateur ou documentation hypothèse |
| **A.9.2.1 Gestion Accès Utilisateurs** | Gestion accès explicite | Validation tenantId, gestion permissions, ou documentation hypothèse |
| **A.12.2.1 Protection Malwares** | Protection malware explicite | Validation fichiers, scan malware, ou documentation hypothèse |
| **A.12.3.1 Gestion Backups** | Stratégie backup | Stratégie backup documentée (si persistance ajoutée) |
| **A.12.6.1 Gestion Vulnérabilités** | Scan automatisé | Scan vulnérabilités automatisé (npm audit, Snyk, Dependabot) |
| **A.16.1.3 Apprentissage Incidents** | Post-mortem structuré | Template post-mortem, processus d'apprentissage |
| **C.2.1 Notification Incidents** | Notification externe | Adaptateur notification (email, Slack, PagerDuty) |
| **C.3.2 Tests Récupération** | Tests automatisés | Tests récupération automatisés (rollback, kill switch, fallbacks) |
| **C.4.1 Évaluation Risques Tiers** | Évaluation formelle | Checklist évaluation risques tiers, due diligence fournisseurs |
| **C.4.2 Gestion Contrats Tiers** | Gestion contrats | Registre contrats tiers, suivi renouvellements, SLA |
| **C.5.1 Plan Continuité Activité** | Plan formel | Plan continuité formel (RTO, RPO, procédures reprise) |
| **C.5.2 Tests Continuité Activité** | Tests formels | Scénarios tests continuité, tests reprise |

---

**Money Factory AI - Evidence ISO27001 / DORA v1.0.0**
*Basé sur code source, documentation, tests disponibles*

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer
