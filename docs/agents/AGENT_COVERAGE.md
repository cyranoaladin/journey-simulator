<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Matrice de couverture des agents (R3.3)

Objectif : cartographier l’état réel des 24 agents référencés dans `mf-back/agents/registry.js`, sans modifier le code, afin de préparer leur mise en qualité finale. Statuts : 🟢 REAL (utile/structuré), 🟡 PARTIAL (utile mais incomplet/désactivé), 🔴 STUB (placeholder).

| Agent | Domaine | Statut | Entrées attendues | Sorties actuelles | Gaps | Action requise |
| --- | --- | --- | --- | --- | --- | --- |
| SecurityAuditAgent | security | 🟢 REAL | input, rag.chunks | summary, findings LL(M) text, citations, metrics | Summary parfois générique, findings non structurés | Normaliser findings/actions, limiter summary à 1 phrase |
| ProductSpecAgent | product | 🟢 REAL | input, rag.chunks | summary, flows/risks LL(M) text, citations, metrics | Pas de findings structurés, actions vides | Structurer findings/actions, ajouter confidence |
| JourneyDesignAgent | journey | 🟢 REAL | input, journey.phaseId/phases, objectives | summary, stages, actions, metrics | Pas de confidence/assumptions | Ajouter confidence + assumptions |
| EvaluationAgent | quality | 🟢 REAL | input, journey phase/objectives | summary, rubric, actions, metrics | Pas de confidence/assumptions | Ajouter confidence + assumptions |
| RAGOpsAgent | rag | 🟢 REAL | input, ragContext.chunks, journey | summary, checks, citations, actions | Findings non normalisés | Aligner findings/actions + confidence |
| DataIntegrityAgent | data | 🟢 REAL | input, journey phase/objectives | summary, checks, actions | Manque confidence/assumptions | Ajouter champs normalisés |
| APIContractAgent | api | 🟢 REAL | input, journey phase/objectives | summary, checklist, actions | Manque confidence/assumptions | Ajouter champs normalisés |
| TokenomicsAgent | tokenomics | 🟢 REAL | input, ragContext (facultatif), journey | summary, model, actions, citations | Manque confidence/assumptions | Ajouter champs normalisés |
| GovernanceDAOAgent | governance | 🟢 REAL | input, ragContext, journey | summary, focus, actions, citations | Manque confidence/assumptions | Ajouter champs normalisés |
| GrowthAgent | growth | 🟢 REAL | input, journey phase/objectives | summary, levers, actions | Manque confidence/assumptions | Ajouter champs normalisés |
| ObservabilityAgent | observability | 🟢 REAL | input, journey phase/objectives | summary, telemetry/SLOs, actions | Manque confidence/assumptions | Ajouter champs normalisés |
| ComplianceAgent | compliance | 🟢 REAL | input, ragContext, journey | summary, focus, actions, citations | Manque confidence/assumptions | Ajouter champs normalisés |
| UXWritingAgent | ux | 🟢 REAL | input, ragContext, journey | summary, considerations, actions, citations | Manque confidence/assumptions | Ajouter champs normalisés |
| RiskFraudAgent (disabled) | risk | 🟡 PARTIAL | input, ragContext, journey | summary, focus, actions, citations | Disabled par défaut, pas de confidence | Décider activation contrôlée, ajouter confidence/assumptions |
| InvestorDemoAgent | investor | 🔴 STUB | input | summary “Not implemented yet” | Pas de contenu métier | Implémenter réponse structurée + actions |
| QAPlaywrightAgent | qa | 🔴 STUB | input | summary “Not implemented yet” | Pas de contenu métier | Implémenter génération de scénarios Playwright simulés |
| DevOpsAgent | devops | 🔴 STUB | input | summary “Not implemented yet” | Pas de contenu métier | Implémenter checklist CI/CD, infra, rollback |
| CurriculumAgent | education | 🔴 STUB | input | summary “Not implemented yet” | Pas de contenu métier | Implémenter parcours d’apprentissage + actions |
| MarketplaceAgent | marketplace | 🔴 STUB | input | summary “Not implemented yet” | Pas de contenu métier | Implémenter pricing/listing plan + actions |
| AnalyticsAgent | analytics | 🔴 STUB | input | summary “Not implemented yet” | Pas de contenu métier | Implémenter plan instrumentation/experiments |
| PerformanceAgent | performance | 🔴 STUB | input | summary “Not implemented yet” | Pas de contenu métier | Implémenter perf budget, profilage, actions |
| WalletAuthAgent | auth | 🔴 STUB | input | summary “Not implemented yet” | Pas de contenu métier | Implémenter flow wallet auth, risques, actions |
| SolanaAnchorAgent | blockchain | 🔴 STUB | input | summary “Not implemented yet” | Pas de contenu métier | Implémenter pré-vérifs Anchor (TESTNET), actions |
| MintingAgent | mint | 🔴 STUB | input | summary “Not implemented yet” | Pas de contenu métier | Implémenter flux mint côté serveur (dry-run) |

Synthèse : 13 agents réalistes utilisables, 1 partiel (RiskFraudAgent désactivé), 10 stubs à implémenter. Axes prioritaires : normaliser les champs (summary/findings/actions/confidence/assumptions), décider de l’activation contrôlée des agents risk/Web3, et remplacer les stubs rouges par des sorties actionnables.

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer
