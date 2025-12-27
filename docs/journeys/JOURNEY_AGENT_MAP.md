# Journey → Agents map (R3.3)

Source de vérité : `mf-back/orchestration/workflowMap.js`. Objectif : rendre lisible l’enchaînement Journey → Phase → Intents → Agents et l’output attendu, en signalant les agents désactivés ou stub.

| Journey | Phase | Intents (workflowMap) | Agents attendus | Output attendu | Notes |
| --- | --- | --- | --- | --- | --- |
| onboarding | design | product_spec, ux_writing | ProductSpecAgent, UXWritingAgent | spec courte, flows, critères d’acceptance ; CTA/microcopy alignés | Agents réels OK |
| onboarding | security | security_audit | SecurityAuditAgent | audit secu (findings/actions, citations RAG) | Réel |
| audit | governance | governance_dao, compliance, risk_fraud | GovernanceDAOAgent, ComplianceAgent, RiskFraudAgent | gouvernance (proposal, quorum), conformité (données/consentement), contrôles fraude | RiskFraudAgent désactivé par défaut (PARTIAL) |
| audit | tech | security_audit, api_contract | SecurityAuditAgent, APIContractAgent | revue sécurité + draft contrat API (idempotence, erreurs) | Réels |
| certification | tokenomics | tokenomics | TokenomicsAgent | modèle token (supply/vesting/allocations) | Réel |
| certification | curriculum | curriculum | CurriculumAgent | parcours d’apprentissage, modules, quiz | Stub (à implémenter) |

Rappels opérationnels
- Les intents sont dédupliqués et combinés avec l’input utilisateur (voir `resolveWorkflowIntents` dans `zynoVerticalSlice.js`).
- Les agents disabled (ex : RiskFraudAgent) sont ignorés silencieusement mais restent documentés pour activation contrôlée.
- Les phases sans mapping restent sans effet ; ajouter un mapping passe par `workflowMap.js` (pas via la route API).
- Les sorties agents doivent rester structurées (summary, findings, actions, confidence, assumptions) pour permettre l’agrégation décisionnelle et les evidence packs.

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer
