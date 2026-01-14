<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Plans d’action par agent (R3.3)

Format par agent : objectif, cas d’usage, checklist actionnable. Les actions sont verb-first, vérifiables, et connectées aux checklists sécurité / coverage. Agents désactivés (ex : RiskFraudAgent) restent documentés mais doivent être activés de façon contrôlée avant usage.

## SecurityAuditAgent
### Objectif
Audit sécurité transverse (CORS, auth, secrets, vulnérabilités).
### Quand l’utiliser
Toute livraison sensible, ouverture d’API, exposition publique.
### Checklist Actionnable
- [ ] Balayer CORS/headers/helmet
  - Pourquoi : réduire la surface d’attaque web
  - Comment vérifier : comparer aux attentes `mf-back/app.js` + tests supertest
  - Risque si ignoré : fuite de données, attaques CSRF/XSS
- [ ] Vérifier auth/JWT + rate limiting
  - Pourquoi : limiter l’abus d’auth et brute force
  - Comment vérifier : limites dans `auth-routes.js`, 401/429 attendus
  - Risque si ignoré : compromission de comptes
- [ ] Consolider secrets et logs
  - Pourquoi : éviter l’exposition de clés
  - Comment vérifier : absence de clés en clair, logs pino sans secrets
  - Risque si ignoré : fuite de secrets, compliance KO

## ProductSpecAgent
### Objectif
Produire une spec produit concise avec flows et critères d’acceptance.
### Quand l’utiliser
Avant dev d’une feature ou d’un parcours complet.
### Checklist Actionnable
- [ ] Définir 3-5 user flows critiques
  - Pourquoi : cadrer le périmètre
  - Comment vérifier : flows listés avec entrée/sortie
  - Risque si ignoré : dérive de scope
- [ ] Rédiger 3 critères d’acceptance
  - Pourquoi : tester objectivement
  - Comment vérifier : critères SMART dans la sortie
  - Risque si ignoré : QA floue
- [ ] Lister risques et dépendances
  - Pourquoi : éviter blocages tardifs
  - Comment vérifier : section risques présente
  - Risque si ignoré : glissement planning

## JourneyDesignAgent
### Objectif
Cartographier le parcours et les frictions par phase.
### Quand l’utiliser
Lors de la définition ou refonte de parcours utilisateur.
### Checklist Actionnable
- [ ] Lister les phases et objectifs
  - Pourquoi : aligner les parties prenantes
  - Comment vérifier : phases/stages présents dans details
  - Risque si ignoré : trous de parcours
- [ ] Identifier frictions top 2
  - Pourquoi : prioriser la résolution
  - Comment vérifier : frictions explicites par phase
  - Risque si ignoré : faible conversion
- [ ] Associer métriques par phase
  - Pourquoi : mesurer l’impact
  - Comment vérifier : métriques dans actions/details
  - Risque si ignoré : absence de pilotage

## EvaluationAgent
### Objectif
Fournir une grille de scoring (clarity, feasibility, risk, impact).
### Quand l’utiliser
Avant go/no-go, priorisation de features.
### Checklist Actionnable
- [ ] Pondérer les critères
  - Pourquoi : refléter la stratégie
  - Comment vérifier : weights présents dans rubric
  - Risque si ignoré : décisions biaisées
- [ ] Collecter evidence par critère
  - Pourquoi : objectiver le score
  - Comment vérifier : actions prévoient la collecte
  - Risque si ignoré : scoring subjectif
- [ ] Calculer score synthétique
  - Pourquoi : décision rapide
  - Comment vérifier : score/action explicite
  - Risque si ignoré : indécision

## RAGOpsAgent
### Objectif
Garantir la qualité RAG (ingest, index, citations).
### Quand l’utiliser
Avant démo/production quand des connaissances sont requises.
### Checklist Actionnable
- [ ] Vérifier ingestion et fraîcheur
  - Pourquoi : éviter données obsolètes
  - Comment vérifier : source/timestamp dans ragContext
  - Risque si ignoré : réponses fausses
- [ ] Tester topK et sampling
  - Pourquoi : assurer la pertinence
  - Comment vérifier : citations présentes et cohérentes
  - Risque si ignoré : hallucinations
- [ ] Contrôler PII / retention
  - Pourquoi : conformité
  - Comment vérifier : mention dans actions/checks
  - Risque si ignoré : fuite PII

## DataIntegrityAgent
### Objectif
Valider schémas, idempotence, contrôles d’intégrité.
### Quand l’utiliser
Sur tout flux de données critique ou persistant (même in-memory).
### Checklist Actionnable
- [ ] Définir schéma et champs obligatoires
  - Pourquoi : réduire les null/erreurs
  - Comment vérifier : checklist dans details
  - Risque si ignoré : données corrompues
- [ ] Assurer idempotence
  - Pourquoi : éviter doubles écritures
  - Comment vérifier : clé stable documentée
  - Risque si ignoré : duplications
- [ ] Mettre des alertes (null/dup)
  - Pourquoi : détecter dérives
  - Comment vérifier : actions listent les métriques
  - Risque si ignoré : détection tardive

## APIContractAgent
### Objectif
Définir contrats API (ressources, erreurs, rate limit, idempotence).
### Quand l’utiliser
Avant toute nouvelle route ou évolution de schéma.
### Checklist Actionnable
- [ ] Spécifier ressources/verbs/pagination
  - Pourquoi : éviter ambiguïté
  - Comment vérifier : scope + checklist présents
  - Risque si ignoré : rupture contrat
- [ ] Documenter erreurs/idempotence
  - Pourquoi : robustesse clients
  - Comment vérifier : error shapes listés
  - Risque si ignoré : clients cassés
- [ ] Auth + rate limit
  - Pourquoi : sécurité
  - Comment vérifier : mention explicite
  - Risque si ignoré : abus/DoS

## TokenomicsAgent
### Objectif
Esquisser modèle token (supply, vesting, allocations).
### Quand l’utiliser
Avant toute communication token/économie.
### Checklist Actionnable
- [ ] Définir supply/vesting
  - Pourquoi : alignement long terme
  - Comment vérifier : model présent dans details
  - Risque si ignoré : désalignement investisseurs/users
- [ ] Simuler scénarios 12/24/36m
  - Pourquoi : stress tests
  - Comment vérifier : action listée
  - Risque si ignoré : risque de liquidité
- [ ] Valider incitations par stakeholder
  - Pourquoi : adoption
  - Comment vérifier : actions/notes
  - Risque si ignoré : fuite d’utilisateurs

## GovernanceDAOAgent
### Objectif
Structurer proposals, quorum, règles de vote.
### Quand l’utiliser
Pour toute décision communautaire ou DAO.
### Checklist Actionnable
- [ ] Résumer la proposal <150 mots
  - Pourquoi : clarté pour les votants
  - Comment vérifier : summary/action explicite
  - Risque si ignoré : incompréhension
- [ ] Définir quorum/threshold
  - Pourquoi : légitimité
  - Comment vérifier : actions le mentionnent
  - Risque si ignoré : contestation
- [ ] Planifier timeline et diffusion
  - Pourquoi : adoption
  - Comment vérifier : actions avec canal/date
  - Risque si ignoré : faible participation

## GrowthAgent
### Objectif
Proposer leviers d’acquisition/activation/rétention.
### Quand l’utiliser
Pour améliorer metrics produit (signups, WAU/MAU).
### Checklist Actionnable
- [ ] Choisir 1 levier par étape (AARRR)
  - Pourquoi : focus
  - Comment vérifier : levers listés
  - Risque si ignoré : dispersion
- [ ] Instrumenter KPI par levier
  - Pourquoi : mesurer impact
  - Comment vérifier : actions instrumentent
  - Risque si ignoré : pas de feedback loop
- [ ] Plan d’expérimentation (A/B)
  - Pourquoi : valider hypothèses
  - Comment vérifier : action “expérience”
  - Risque si ignoré : décisions biaisées

## ObservabilityAgent
### Objectif
Définir logs/metrics/traces, SLOs et alertes.
### Quand l’utiliser
Avant go-live ou changement critique.
### Checklist Actionnable
- [ ] SLIs/SLOs par flux critique
  - Pourquoi : pilotage SRE
  - Comment vérifier : SLOs listés dans details
  - Risque si ignoré : alert fatigue ou aveuglement
- [ ] Instrumentation traces
  - Pourquoi : diagnostic rapide
  - Comment vérifier : action “instrument tracing”
  - Risque si ignoré : MTTR élevé
- [ ] Alertes + runbooks
  - Pourquoi : réponse incident
  - Comment vérifier : actions/runbook
  - Risque si ignoré : temps d’arrêt prolongé

## ComplianceAgent
### Objectif
Couverture conformité (données, consentement, privacy notice).
### Quand l’utiliser
Features manipulant des données personnelles ou régulées.
### Checklist Actionnable
- [ ] Politique de rétention documentée
  - Pourquoi : conformité
  - Comment vérifier : action “rétention” présente
  - Risque si ignoré : non-conformité
- [ ] Consentement/opt-out clair
  - Pourquoi : base légale
  - Comment vérifier : action “consent copy”
  - Risque si ignoré : risque légal
- [ ] Registre de traitements
  - Pourquoi : traçabilité
  - Comment vérifier : action/artefact
  - Risque si ignoré : audit KO

## UXWritingAgent
### Objectif
Améliorer la clarté des CTA et microcopies.
### Quand l’utiliser
Refonte UX, amélioration conversion ou onboarding.
### Checklist Actionnable
- [ ] CTA verb-first
  - Pourquoi : augmenter conversion
  - Comment vérifier : action “rewrite CTA”
  - Risque si ignoré : CTA flou
- [ ] Helper text ≤120 chars
  - Pourquoi : réduire friction
  - Comment vérifier : action correspondante
  - Risque si ignoré : abandon
- [ ] Ton cohérent par phase
  - Pourquoi : expérience fluide
  - Comment vérifier : considerations mentionnées
  - Risque si ignoré : perception négative

## RiskFraudAgent (disabled)
### Objectif
Prévenir fraude/abus (vérifs signaux, seuils).
### Quand l’utiliser
Opérations sensibles (paiements, mint, accès privilégiés).
### Checklist Actionnable
- [ ] Activer contrôles velocity/risque
  - Pourquoi : détecter abus
  - Comment vérifier : actions listées + activation contrôlée
  - Risque si ignoré : fraude silencieuse
- [ ] Journaliser anomalies
  - Pourquoi : investigation
  - Comment vérifier : action “log anomalies”
  - Risque si ignoré : manque de preuves
- [ ] Boucles d’alerte avec sévérité
  - Pourquoi : temps de réponse
  - Comment vérifier : actions avec seuils
  - Risque si ignoré : escalade tardive

## InvestorDemoAgent
### Objectif
Produire un pitch/demo investisseur.
### Quand l’utiliser
Préparation pitch deck ou démo levée de fonds.
### Checklist Actionnable
- [ ] Générer pitch court (problem/solution/market)
  - Pourquoi : story claire
  - Comment vérifier : summary/action spécifique
  - Risque si ignoré : pitch confus
- [ ] Ajouter traction/metrics clés
  - Pourquoi : crédibilité
  - Comment vérifier : action “inclure metrics”
  - Risque si ignoré : manque de confiance
- [ ] Identifier risques/mitigation
  - Pourquoi : transparence
  - Comment vérifier : action correspondante
  - Risque si ignoré : objections non traitées

## QAPlaywrightAgent
### Objectif
Proposer scénarios E2E Playwright prêts à coder.
### Quand l’utiliser
Avant release de flux critique.
### Checklist Actionnable
- [ ] Lister 3 scénarios happy-path + edge
  - Pourquoi : couverture minimale
  - Comment vérifier : actions listées
  - Risque si ignoré : régressions
- [ ] Inclure sélecteurs robustes
  - Pourquoi : stabilité tests
  - Comment vérifier : steps avec data-testid
  - Risque si ignoré : flaky tests
- [ ] Prévoir seeds/mocks
  - Pourquoi : déterminisme
  - Comment vérifier : action “seed/mocks”
  - Risque si ignoré : tests non fiables

## DevOpsAgent
### Objectif
Définir CI/CD, artefacts, rollback.
### Quand l’utiliser
Avant déploiement ou modification pipeline.
### Checklist Actionnable
- [ ] Pipeline build/test/lint
  - Pourquoi : qualité
  - Comment vérifier : action “pipeline”
  - Risque si ignoré : déploiements cassés
- [ ] Stratégie rollback
  - Pourquoi : récupération rapide
  - Comment vérifier : action “rollback plan”
  - Risque si ignoré : downtime prolongé
- [ ] Secrets/variables CI
  - Pourquoi : sécurité
  - Comment vérifier : action “secret management”
  - Risque si ignoré : fuite secrets

## CurriculumAgent
### Objectif
Concevoir parcours d’apprentissage produit.
### Quand l’utiliser
Onboarding client ou interne.
### Checklist Actionnable
- [ ] Modules progressifs
  - Pourquoi : montée en compétence
  - Comment vérifier : actions listent modules
  - Risque si ignoré : adoption lente
- [ ] Évaluations rapides
  - Pourquoi : mesurer acquisition
  - Comment vérifier : action “quiz”
  - Risque si ignoré : gaps non détectés
- [ ] Ressources support
  - Pourquoi : autonomie
  - Comment vérifier : actions “docs/vidéos”
  - Risque si ignoré : charge support

## MarketplaceAgent
### Objectif
Préparer listing/pricing marketplace.
### Quand l’utiliser
Avant publication d’offres/produits.
### Checklist Actionnable
- [ ] Définir pricing et commissions
  - Pourquoi : viabilité
  - Comment vérifier : action “pricing”
  - Risque si ignoré : marges insuffisantes
- [ ] Qualité fiche produit
  - Pourquoi : conversion
  - Comment vérifier : action “fiche complète”
  - Risque si ignoré : faible vente
- [ ] Process review/abuse
  - Pourquoi : confiance
  - Comment vérifier : action “review/abuse”
  - Risque si ignoré : fraude/contenu toxique

## AnalyticsAgent
### Objectif
Plan de tracking et expérimentation.
### Quand l’utiliser
Lancement de feature ou nouvelle funnel.
### Checklist Actionnable
- [ ] Plan d’événements + schéma
  - Pourquoi : données exploitables
  - Comment vérifier : actions listées
  - Risque si ignoré : données inutiles
- [ ] Table de vérité (naming)
  - Pourquoi : cohérence
  - Comment vérifier : action “table de vérité”
  - Risque si ignoré : confusion métriques
- [ ] Dashboard + alertes
  - Pourquoi : pilotage
  - Comment vérifier : action “dashboard”
  - Risque si ignoré : dérives invisibles

## PerformanceAgent
### Objectif
Budget et optimisations performance.
### Quand l’utiliser
Avant go-live ou après régression perf.
### Checklist Actionnable
- [ ] Définir budgets (TTFB, LCP, p95)
  - Pourquoi : objectifs mesurables
  - Comment vérifier : actions listées
  - Risque si ignoré : UX dégradée
- [ ] Profilage scénario critique
  - Pourquoi : trouver bottlenecks
  - Comment vérifier : action “profilage”
  - Risque si ignoré : latence élevée
- [ ] Plan cache/optimisations
  - Pourquoi : stabilité
  - Comment vérifier : action “cache/optim”
  - Risque si ignoré : coûts élevés

## WalletAuthAgent
### Objectif
Définir auth wallet (clé publique, challenge, signature).
### Quand l’utiliser
Avant ajout SIWS / wallet-based login.
### Checklist Actionnable
- [ ] Challenge + signature vérifiée
  - Pourquoi : sécurité
  - Comment vérifier : action “challenge”
  - Risque si ignoré : usurpation
- [ ] Stockage minimal (no private key)
  - Pourquoi : compliance
  - Comment vérifier : action “no secret storage”
  - Risque si ignoré : fuite sensible
- [ ] Expiration/nonce unique
  - Pourquoi : anti-replay
  - Comment vérifier : action “nonce TTL”
  - Risque si ignoré : replay attack

## SolanaAnchorAgent
### Objectif
Vérifier prérequis Anchor (TESTNET uniquement).
### Quand l’utiliser
Avant toute interaction Anchor (simulée ou dry-run).
### Checklist Actionnable
- [ ] Vérifier network TESTNET
  - Pourquoi : éviter mainnet involontaire
  - Comment vérifier : action “TESTNET only”
  - Risque si ignoré : coûts / erreurs irréversibles
- [ ] Vérifier anchorTxId absent
  - Pourquoi : éviter double anchor
  - Comment vérifier : action “no double anchor”
  - Risque si ignoré : incohérence on-chain
- [ ] Valider artefacts (IDL, programId)
  - Pourquoi : exécution sûre
  - Comment vérifier : action correspondante
  - Risque si ignoré : transaction invalide

## MintingAgent
### Objectif
Encadrer le mint (dry-run, cohérence proof/seed).
### Quand l’utiliser
Avant tout mint simulé.
### Checklist Actionnable
- [ ] Vérifier proof ancrée et seed cohérent
  - Pourquoi : éviter mint invalide
  - Comment vérifier : action “proof/seed”
  - Risque si ignoré : rejet ou fraude
- [ ] S’assurer absence de mintTxId
  - Pourquoi : éviter double-mint
  - Comment vérifier : action “no existing mint”
  - Risque si ignoré : duplication
- [ ] Authority côté serveur uniquement
  - Pourquoi : sécurité
  - Comment vérifier : action “server authority”
  - Risque si ignoré : mint non autorisé

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer
