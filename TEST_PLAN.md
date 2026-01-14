<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Money Factory AI – Global Test & Validation Plan (MVP Journey Simulator + Web3 Stack)

## 🚀 Commandes “source de vérité” (local + CI)

Le repo contient déjà des scripts pour exécuter **les validations CI-like** et démarrer une stack **prod-like locale** pour QA manuelle.

### Validation CI-like (recommandé avant tout déploiement)

Depuis la racine :

```bash
bash scripts/ci-verify.sh
```

Inclut : install (`npm ci`), lint, build, unit tests, puis E2E (Playwright).

### Clean restart “prod-like” (recommandé quand vous suspectez un cache / port conflict)

```bash
# Soft clean + restart stack
bash scripts/local-restart-prod.sh

# Hard clean (node_modules + playwright cache) + restart stack
bash scripts/local-restart-prod.sh --hard
```

### Validation locale complète (unit + build + E2E Chromium + Firefox)

```bash
bash scripts/local-verify.sh
```

### Environnement “prod local” (QA manuelle en conditions prod)

Démarre DB (Mongo + Postgres), Redis (si dispo), puis :
- `mf-back` (API)
- `web` (Next API) + worker mint
- `journey-simulator` en `vite preview` (build prod)

```bash
bash scripts/prod-local-up.sh
```

Arrêt :

```bash
bash scripts/prod-local-down.sh
```

Logs/PIDs : `tmp/prod-local/*`.

### E2E (Playwright) – local

```bash
cd journey-simulator
npm run test:e2e
```

## 0. Objectif du document

Ce document définit **tout ce qui doit être testé et vérifié** pour considérer le MVP Money Factory AI / Journey Simulator comme réellement fonctionnel :

* **Tests unitaires**
* **Tests d’intégration**
* **Tests end-to-end (E2E)**
* **Workflows de navigation et de parcours**
* **Authentification (SIWS)**
* **Mint (Proof-of-Skill + Pass)**
* **DAO / staking (si présent dans le MVP)**
* **XP, progression, cohérence des étapes**
* **Agents IA, RAG, appels LLM, production de ressources**
* **Simulation “Launch Collaterize”**
* **Persistance (Mongo / Postgres / Redis)**
* **Robustesse, erreurs, sécurité**

En plus de la mise en place des tests, je demande **des preuves concrètes** de réalisation :

> Pour chaque bloc de fonctionnalités annoncé comme “fait”, je veux :
>
> * du **code explicite** (fichiers, chemins),
> * des **tests automatisés** (unitaires / E2E),
> * et, si besoin, des **captures / vidéos / liens de transactions devnet** montrant que ça fonctionne réellement.

Tout ce qui n’est pas vérifiable **par code + tests + preuves** doit être considéré comme **non réalisé** ou **à re-faire**.

---

## 1. Rappel de l’architecture (pour cadrer les tests)

Nous partons de l’architecture suivante :

* **journey-simulator** (Vite/React)

  * Frontend UI : navigation, choix de parcours, affichage des agents IA, XP, ressources produites, écrans de mint, Pass, DAO/staking, etc.
* **mf-back** (Express + MongoDB)

  * Logique métier des journeys :

    * définition des phases,
    * scoring XP,
    * cohérence & avancement des étapes,
    * agrégation des résultats pour le mint et la simulation Collaterize.
* **web** (Next.js + Prisma + Postgres + Redis)

  * Authentification par **Sign-In With Solana (SIWS)** (Challenges stockés dans Redis),
  * API de mint (Pass, Proof-of-Skill) via Metaplex / UMI,
  * API de metadata dynamique,
  * API d’intégration Collaterize (`/api/integrations/collaterize/simulate`),
  * gestion des Pass, des logs de mint, des jobs, etc.
* **Worker de mint**

  * Service Node/UMI lisant une queue Redis (**BullMQ**) pour exécuter les mint de manière asynchrone et robuste.
* **Solana (devnet pour les tests)**

  * Collection “Pass MFAI”,
  * NFTs Proof-of-Skill.

Les tests doivent couvrir **tous les liens entre ces blocs**.

---

## 2. Types de tests et outils attendus

### 2.1. Tests unitaires

* **journey-simulator**

  * Framework : Jest + React Testing Library.
* **mf-back**

  * Framework : Jest (ou Vitest) + supertest pour les routes HTTP.
* **web**

  * Framework : Jest (ou Vitest) + supertest pour les routes API Next (ou tests via `next-test-api-route-handler`).

### 2.2. Tests d’intégration

* **Entre mf-back et web**

  * Tests qui appellent vraiment des routes réelles (`/api/integrations/...`) sur l’environnement de test.
* **Entre web / worker / Solana devnet**

  * Tests de mint complets (environnement devnet).

### 2.3. Tests End-to-End (E2E)

* Framework attendu : **Cypress** ou **Playwright**.
* Cible : **journey-simulator** + backends démarrés, sur un environnement de test cohérent :

  * un utilisateur simule un vrai parcours,
  * se connecte avec un wallet,
  * effectue un mint,
  * voit les résultats on-chain.

### 2.4. Preuves & rapports

Pour chaque type de test :

* Fichiers de test présents dans le repo.
* Commandes `npm test`, `npm run test:e2e`, etc. **documentées**.
* Rapports (ou au moins screenshots/vidéos pour les E2E).

---

## 3. Workflows de navigation (front journey-simulator)

### 3.1. Objectifs

Vérifier que :

* Tous les écrans principaux sont accessibles.
* Les transitions sont cohérentes.
* Les états (loading, error, success) sont gérés.

### 3.2. Cas à couvrir (E2E + tests React)

1. **Accueil / Home**

   * Lancement de l’app → affichage de l’écran d’accueil.
   * Présence des CTA : “Try demo”, “Login / Connect Wallet”, etc.

2. **Liste des parcours**

   * Navigation vers la liste des journeys disponibles.
   * Affichage des différents types de parcours (Builder, Growth, DAO, etc.).
   * Filtrage / tri (si existant).

3. **Démarrage d’un parcours**

   * Click sur “Start Journey”.
   * Vérification que l’ID de journey est créé côté `mf-back` (via logs/tests).
   * Affichage de la première phase.

4. **Retour / reprise de parcours**

   * Recharger la page en milieu de parcours → l’utilisateur retrouve son état :

     * phase courante,
     * XP accumulé,
     * messages précédents des agents.

**Tests demandés :**

* Composants de navigation testés en Jest + React Testing Library (montage, routage).
* Scénarios E2E : au moins 1 parcours complet (du début jusqu’à la dernière phase) avec simulation Collaterize.

---

## 4. Workflows de parcours & cohérence des étapes

### 4.1. Objectifs

Vérifier :

* L’ordre des phases d’un journey.
* Les conditions de passage à la phase suivante.
* La cohérence du statut global (PENDING / IN_PROGRESS / COMPLETED).

### 4.2. Points à tester (mf-back + front)

1. **Création de journey**

   * `mf-back` crée un document avec :

     * liste des phases (types corrects),
     * statut initial (`IN_PROGRESS` ou `PENDING`),
     * liaison avec l’utilisateur.

2. **Transitions de phase**

   * Appel à l’endpoint “completePhase” ou équivalent → la phase passe à `COMPLETED`, la suivante devient active.
   * Impossible de :

     * sauter une phase,
     * marquer comme complété un journey si une phase n’est pas complétée.

3. **Statut global du journey**

   * Automatiquement `COMPLETED` lorsque toutes les phases le sont.
   * Les endpoints ne doivent pas revenir un journey `COMPLETED` si une phase est encore `PENDING`.

4. **Phase “Launch Collaterize”**

   * Est bien créée dans la liste des phases.
   * Ne peut être simulée que si les phases précédentes sont complétées.
   * Une simulation réussie marque la phase `LAUNCH_COLLATERIZE` comme `COMPLETED`.

**Tests unitaires / intégration attendus :**

* Fonctions de transition d’état des phases.
* Endpoint de simulation Collaterize (journey incomplet → erreur, journey complet → simulation OK).

---

## 5. Authentification & SIWS (Sign-In With Solana)

### 5.1. Objectifs

* Vérifier le login via wallet Solana.
* Sécuriser les endpoints protégés (Pass, mint, etc.).

### 5.2. Flows à tester

1. **Challenge SIWS**

   * `POST /api/auth/siws/challenge` :

     * Renvoie un message à signer **et** un `challengeId`.
     * Stocke le challenge dans Redis avec TTL.
   * Tests :

     * challenge bien enregistré,
     * TTL appliqué,
     * le message contient bien le wallet.

2. **Verification SIWS**

   * `POST /api/auth/siws/verify` avec :

     * `address`,
     * `signature`,
     * `challengeId`.
   * Comportement :

     * Vérification Ed25519 de la signature.
     * Récupération du challenge dans Redis.
     * Marquage comme “consommé”.
     * Emission d’un JWT ou session interne.
   * Tests :

     * bonne signature → OK + token,
     * challenge expiré → erreur,
     * challenge déjà utilisé → erreur.

3. **Protection des routes**

   * Endpoints “sensibles” (Pass, mint, jobs, etc.) exigent un token SIWS valide.
   * Tests d’intégration :

     * appel sans token → 401,
     * appel avec token invalide → 401,
     * appel avec token correct → 200.

**Preuves attendues :**

* Fichiers de test (Jest) pour chacune des routes.
* Logs Redis montrant la création / consommation des challenges (pour QA manuelle).

---

## 6. XP, scoring et progression

### 6.1. Objectifs

* Vérifier que le système d’XP fonctionne comme décrit :

  * XP par phase,
  * scoring global,
  * badges / niveaux éventuels.

### 6.2. Points à tester

1. **Calcul d’XP par phase**

   * Fonctions pures qui prennent en entrée :

     * réponses de l’utilisateur,
     * feedback des agents,
     * éventuels flags de réussite/échec,
   * retournent :

     * un XP gagné,
     * un score phase.

2. **Agrégation du score global**

   * Calcul du score final du journey (0–100).
   * Cohérence avec les exigences pour :

     * Proof-of-Skill,
     * simulation Collaterize (journeyScore).

3. **Visibilité dans le front**

   * L’UI montre l’XP courant et le score global (ou un résumé).
   * Mise à jour en temps réel lors de la progression.

**Tests unitaires attendus :**

* Fonctions de calcul d’XP : scénarios bord, pénalités, max XP.
* Tests de cohérence : somme des phases = score global attendu.

---

## 7. Agents IA, RAG, appels LLM & production de ressources

### 7.1. Objectifs

* Vérifier que les agents IA fonctionnent réellement, et pas juste en “mock vide”.
* S’assurer que :

  * les prompts sont correctement construits,
  * les appels RAG récupèrent des documents pertinents,
  * les réponses sont enregistrées / traçables,
  * les ressources produites (résumés, plans, checklists) sont attachées à l’utilisateur / journey.

### 7.2. Points à tester

1. **Construction des prompts**

   * Fonctions qui construisent les prompts pour :

     * Builder Agent,
     * Growth Agent,
     * DAO Agent,
     * autres agents éventuels.
   * Tests unitaires :

     * Vérifier que le prompt contient :

       * le contexte du journey,
       * les réponses précédentes,
       * les objectifs de la phase,
       * les contraintes (ton, format attendu, langue, etc.).

2. **RAG – requêtes sur la base de connaissances**

   * Fonctions qui :

     * prennent une question,
     * appellent la couche RAG (Chroma, Pinecone, ou autre),
     * obtiennent les documents les plus pertinents.
   * Tests :

     * mocking de la couche RAG (pas d’appel externe),
     * vérifier que :

       * un “topic A” renvoie des documents étiquetés “A”,
       * on ne renvoie pas de résultats vides si la base n’est pas vide.

3. **Appels LLM**

   * Intégration avec le provider (OpenAI / autre) :

     * tests unitaires avec mocks,
     * tests d’intégration sur un environnement de test (si budget).
   * Vérifier :

     * gestion des erreurs (timeouts, rate limits),
     * fallback (réessais, message d’erreur lisible côté front).

4. **Production de ressources par les agents**

   * Exemple de ressources :

     * plan de lancement,
     * checklist marketing,
     * plan de gouvernance DAO,
     * scripts ou canevas de contenu.
   * Tests :

     * les ressources sont stockées dans Mongo (ou autre store),
     * attachées au bon `journeyId` et `userId`,
     * récupérables et affichables dans le front.

5. **Cohérence multi-agents**

   * Vérifier que :

     * l’ordre des interventions (Builder / Growth / DAO) est cohérent,
     * les décisions ou sorties ne se contredisent pas au niveau du code (au-delà, c’est du contenu IA).

**Preuves attendues :**

* Tests unitaires sur la génération de prompt.
* Tests sur la couche RAG (au moins avec mocks).
* Un ou deux “journeys IA” réels (capturés en vidéo) montrant :

  * l’enchaînement des agents,
  * les ressources générées.

---

## 8. Mint, NFT Pass & Proof-of-Skill

### 8.1. Objectifs

* Vérifier le pipeline complet de mint :

  * simulation,
  * création de job,
  * exécution par le worker,
  * écriture en base (Postgres),
  * retour au front,
  * état on-chain visible via un explorer.

### 8.2. Flux à tester

1. **Mint Proof-of-Skill**

   * Appel à `/api/mint/simulate` :

     * simulation d’une transaction de mint,
     * renvoi d’un spec (signatures, taille, estimation de frais).
   * Appel à `/api/mint/execute` :

     * création d’un `MintJob` dans Postgres,
     * push dans Redis `mint:jobs`.
   * Worker :

     * consomme la queue,
     * reconstruit la transaction,
     * signe et envoie sur devnet,
     * met à jour `MintJob` + `MintLog` (txSig, mintAddress).

   **Tests :**

   * Unitaires :

     * fonctions de préparation de spec de mint (UMI/Metaplex).
   * Intégration :

     * simulation → job créé → job exécuté → NFT devnet visible.
   * E2E :

     * depuis le front journey-simulator, l’utilisateur termine un parcours, clique sur “Mint Proof-of-Skill”, et voit le lien vers l’explorer devnet.

2. **Mint Pass MFAI (collection)**

   * Flux similaire (simulate → execute → worker).
   * Tests spécifiques :

     * vérifier l’appartenance du NFT à la collection “Pass MFAI”,
     * vérifier la présence des métadonnées (tier, type de Pass).

3. **Routes metadata dynamiques**

   * `GET /api/metadata/pass/:mint` (ou équivalent).
   * Tests :

     * renvoie un JSON conforme au standard Metaplex,
     * valeurs cohérentes avec la DB.

**Preuves attendues :**

* Liste des transactions devnet réelles (txSig) de tests.
* Lien vers au moins 1 NFT Pass + 1 NFT Proof-of-Skill dans un explorer (devnet).
* Tests automatisés pour la partie simulation + job.

---

## 9. Pass, DAO & Staking

*(Si ces fonctionnalités sont partiellement implémentées dans le MVP, elles doivent être testées au niveau atteint.)*

### 9.1. Pass & gating

* API `/api/pass/check?wallet=...` :

  * interroge la collection Pass sur Solana (via DAS/Helius),
  * met à jour Postgres (Wallet, NftPass, hasActivePass),
  * renvoie une décision d’accès.

**Tests :**

* Wallet sans Pass → accès refusé aux parcours gated.
* Wallet avec Pass tier `BUILDER` → accès autorisé aux parcours Builder.
* E2E : tenter d’entrer dans un parcours gated sans Pass → message clair / redirection.

### 9.2. DAO & staking (si implémenté)

* Dépôt de tokens en staking :

  * vérification on-chain (ou mock sur devnet),
  * mise à jour des données (Postgres).
* Calcul des rewards :

  * tests unitaires sur les formules.
* Retrait (unstake) :

  * flux complet on-chain ou mock devnet.

**Preuves :**

* Si le staking est annoncé comme “fait” :

  * liens devnet pour au moins 1 dépôt et 1 retrait,
  * tests unitaires sur la logique de calcul des rewards.

---

## 10. Simulation “Launch Collaterize”

Tu as déjà le cahier des charges technique détaillé. Ici, les tests attendus sont :

### 10.1. API `web` `/api/integrations/collaterize/simulate`

* Tests unitaires sur `computeCollaterizeSimulation` :

  * projet fort → CORE / accepted,
  * moyen → EXPERIMENTAL / accepted,
  * faible → REJECTED.
* Test de l’API :

  * payload valide → 200 + simulation cohérente,
  * payload invalide → 400.

### 10.2. Intégration `mf-back`

* Endpoint `/api/journeys/:id/phases/launch-collaterize/simulate` :

  * journey inexistant → 404,
  * journey non éligible (phases non complétées) → 400,
  * journey complet → simulation enregistrée sur la phase + `COMPLETED`.

### 10.3. Front journey-simulator

* UI de la phase :

  * bouton “Simulate launch on Collaterize”,
  * état loading,
  * affichage de la simulation.

---

## 11. Persistance (Mongo / Postgres / Redis), erreurs & sécurité

### 11.1. Persistance

* Tests d’intégration :

  * `mf-back` :

    * création de journey,
    * mis à jour des phases,
    * sauvegarde des ressources IA.
  * `web` :

    * enregistrement des MintJobs, MintLogs, Pass, CollaterizeSimulationLog (si créé).
  * Redis :

    * challenges SIWS,
    * jobs de mint.

### 11.2. Robustesse & erreurs

* Pour chaque API :

  * tests d’erreur (mauvais paramètres, timeouts, services indisponibles).
* Pour chaque worker :

  * gestion des erreurs de mint (RPC down, transaction échouée, etc.) → retry / statut “failed” explicite.

### 11.3. Sécurité

* Vérifier que :

  * les routes internes (entre `mf-back` et `web`) exigent une clef d’API interne,
  * les routes publiques sont protégées par SIWS si nécessaire,
  * aucune information sensible (clé privée, seed) n’apparaît dans les logs.

---

## 12. Ce que j’attends de toi (développeur)

### 12.1. État des lieux honnête

Je veux un **document d’état des lieux** (ex. `MVP_STATUS.md`) avec un tableau pour chaque composant :

| Domaine / Feature                    | État actuel                             | Preuves / Références                              |
| ------------------------------------ | --------------------------------------- | ------------------------------------------------- |
| Navigation front (journey-simulator) | Implémenté, tests unitaires OK, E2E WIP | `journey-simulator/src/...`, vidéo, tests Cypress |
| Auth SIWS                            | Implémenté + tests unitaires            | `web/app/api/auth/...`, tests Jest, logs Redis    |
| Mint Proof-of-Skill                  | Simulate OK, execute partiel            | code, tests, tx devnet, TODO: worker retry, etc.  |
| Pass MFAI                            | Non implémenté / partiel                | ...                                               |
| RAG / Agents IA                      | Implémenté sans tests / etc.            | ...                                               |
| Launch Collaterize                   | Spécifié, pas encore implémenté         | ...                                               |

L’objectif est d’éliminer les zones floues où quelque chose est “annoncé fait” mais **sans code ni tests**.

### 12.2. Preuves concrètes

Pour chaque feature présentée comme “done” :

* Lien vers :

  * les fichiers de code principaux,
  * les fichiers de tests,
  * la commande à exécuter pour lancer les tests.
* Si c’est lié à Solana :

  * au moins une transaction devnet (txSig) montrant la fonctionnalité.
* Pour le front :

  * un court screencast (même brut) montrant le parcours complet.

### 12.3. Plan d’action

Je veux que tu :

1. **Complètes les tests unitaires** sur :

   * logique de phases / journeys,
   * XP / scoring,
   * mint (simulation),
   * SIWS,
   * Collaterize simulation.
2. **Mettes en place au moins 1 scénario E2E complet** :

   * user → parcours complet → mint Proof-of-Skill → simulation Collaterize.
3. **Documentes dans le repo** :

   * `TEST_PLAN.md` (ce document ou un résumé),
   * `MVP_STATUS.md` (état des lieux),
   * la commande unique pour lancer tous les tests automatisés.

---

Si tu annonces une fonctionnalité comme “implémentée”, elle doit être :

* visible dans le code,
* couverte par au moins un test,
* démontrable (via logs / vidéos / tx devnet / captures).

Sinon, on la considère comme **non livrée** dans le MVP et on la remet dans la backlog.

