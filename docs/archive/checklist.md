<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

Voici une checklist structurée et **cochable** pour vérifier que le MVP est réellement au niveau avant une démo investisseur.
On distingue **Backend (BE)**, **Frontend (FE)** et **Contenu / Produit (CT)**.

---

## 1. Préparation générale & environnement

* [x] **(BE)** `.env` configuré avec :

  * [x] `OPENAI_API_KEY`
  * [x] paramètres de base pour Solana devnet (RPC, cluster)
  * [x] variables d’URL frontend / backend (si séparés)
* [x] **(BE)** Client OpenAI centralisé (`openaiClient.ts` ou équivalent) instancié une seule fois.
* [x] **(BE)** Environnement de staging fonctionnel (base + backend + frontend) pour les tests internes.
* [x] **(BE)** Script simple pour réinitialiser un utilisateur “de démo” (journey_state + XP + NFTs) entre deux démonstrations.

---

## 2. Intégration GPT-5.1 & Zyno (LLM + orchestration)

### 2.1. Accès au modèle

* [x] **(BE)** Fonction générique d’appel LLM pour Zyno (via Responses API ou Chat Completions) :

  * [x] Paramètre `model` (par défaut `"gpt-5.1"`).
  * [x] Paramètre `temperature`.
  * [x] Paramètre de longueur (`max_output_tokens` / `max_tokens`).
* [x] **(BE)** Gestion des erreurs LLM :

  * [x] Retry de base sur erreurs réseau / 5xx.
  * [x] Gestion des 429 (rate limit) avec backoff.
  * [x] Logs d’erreurs lisibles pour debug.

### 2.2. Zyno orchestrateur

* [x] **(BE)** Prompt système **complet** de Zyno implémenté (celui que nous avons défini, adapté si besoin).
* [x] **(BE)** Zyno reçoit bien :

  * [x] `persona_id`
  * [x] `journey_track` (builder / growth / dao / migration / education…)
  * [x] `phase_id` (learn / build / prove / activate / scale)
  * [x] `mode` (discovery / builder / expert)
  * [x] `language` (fr/en)
  * [x] état courant du `journey_state` (missions, XP, NFTs…)
  * [x] dernière entrée utilisateur.
* [x] **(BE)** Réponse de Zyno **strictement** au format JSON `JourneyStepResponse` (Structured Outputs / JSON Schema).
* [x] **(BE)** Validation JSON côté backend (parser, vérifier que tous les champs obligatoires sont présents).
* [x] **(BE)** Logs pour chaque appel Zyno :

  * [x] temps de réponse
  * [x] tokens consommés (si dispo)
  * [x] identifiants de contexte (`user_id`, `journey_id`, `phase_id`).

---

## 3. Backend métier “Journey” (parcours, missions, états)

### 3.1. Modèles de données

* [ ] **(BE)** Modèle `User` avec :

  * [ ] `walletAddress` (optionnel)
  * [ ] `journeys` ou `journey_state` (avec `persona_id`, `phase_id`, `completed_missions`, `xp`, `nfts`).
* [ ] **(BE)** Modèle `PersonaJourney` (config) :

  * [ ] 6 personas définis (Cognitive Activation Hub, Capital Foundry, System Architect, Experience Studio, Impact Engine, Resilience Master).
  * [ ] Pour chaque persona, 5 phases (`learn`, `build`, `prove`, `activate`, `scale`).
  * [ ] Pour chaque phase, au moins 2 missions + 3 ressources *définies en configuration* (journeyData.ts ou équivalent).
* [ ] **(BE)** Modèle `AgentLogEntry` (journal d’activité des agents) opérationnel.

### 3.2. Endpoints

* [x] **(BE)** `POST /api/journeys/:journeyId/step` :

  * [x] prend entrée utilisateur + contexte
  * [x] appelle Zyno
  * [x] renvoie `JourneyStepResponse`.
* [x] **(BE)** Endpoint pour **soumission de mission** (si séparé) :

  * [x] reçoit payload utilisateur (texte, lien, etc.)
  * [x] appelle l’agent d’évaluation (ou Zyno)
  * [x] met à jour XP, missions, éventuellement NFTs (MVP: xp_delta renvoyé et appliqué côté front).
* [x] **(BE)** `GET /api/journeys/:journeyId/state` (ou équivalent) :

  * [x] renvoie l’état global de progression (pour réaffichage ou debug).
* [x] **(BE)** `GET /api/agents/logs?userId=...` :

  * [x] renvoie les derniers `AgentLogEntry` pour l’Agent Activity Feed (MVP en mémoire).

### 3.3. Progression, XP, modes

* [ ] **(BE)** Système d’XP cohérent (récompense par mission / quiz / étape).
* [x] **(BE)** `next_state` de `JourneyStepResponse` correctement appliqué (phase actuelle, missions complétées, XP delta).
* [ ] **(CT/BE)** Modes **discovery / builder / expert** définis :

  * [x] Zyno reçoit ce paramètre.
  * [ ] Variation réelle de la complexité des missions / évaluations selon le mode.

---

## 4. Intégration Solana (devnet)

* [x] **(BE)** Paramètres Solana devnet configurés (RPC, cluster).
* [x] **(BE)** Connecteur simple pour :

  * [x] Mint d’un NFT “Proof-of-*” sur devnet pour un user/wallet.
* [x] **(FE)** Intégration wallet (Phantom ou autre) fonctionnelle sur desktop :

  * [x] connexion
  * [x] affichage de l’adresse
* [x] **(BE/FE)** Un **flux complet** testé :

  * [x] une mission de type `prove` validée → backend détecte condition → front propose modale de mint → signature sur devnet → confirmation visuelle (et log).
* [ ] **(CT)** Nomenclature simple des NFT (3–5 type max) + visuels corrects (même simples).

---

## 5. Frontend – structure, composants, expérience

### 5.1. Navigation & structure globale

* [ ] **(FE)** Écran d’accueil Journey Simulator avec :

  * [ ] présentation rapide,
  * [x] sélection de persona,
  * [x] sélection de mode (discovery / builder / expert).
* [x] **(FE)** Écran principal de parcours avec layout **3 colonnes** (ou équivalent) :

  * [ ] gauche : timeline phases + résumé persona + XP.
  * [x] centre : blocs actifs (missions, quiz, documents…).
  * [x] droite : logs des agents + ressources.

### 5.2. Composants par type de bloc UI

Pour chaque type de `UIBlock` du JSON :

* [x] **(FE)** `TextBlock` :

  * [x] titre + contenu Markdown correctement rendu.
* [x] **(FE)** `ChecklistBlock` :

  * [ ] cases à cocher
  * [ ] état visuel persistant (au moins côté frontend pendant la session).
* [x] **(FE)** `QuizBlock` :

  * [ ] affichage question / options
  * [ ] interaction : choix d’une option
  * [ ] retour “bonne réponse / mauvaise réponse” + explication
* [x] **(FE)** `MissionBlock` :

  * [x] affichage titre / description / mission_type / xp_reward
  * [x] champ d’entrée adapté (`expected_input_type` : texte, markdown, code, lien, etc.)
  * [x] bouton “Soumettre” relié au backend.
* [x] **(FE)** `ResourceBlock` :

  * [x] cards de ressources avec label, description, agent_owner, lien (si dispo).
* [x] **(FE)** `DocumentBlock` :

  * [ ] rendu Markdown lisible (titre, sections, listes).
  * [ ] option “Copier” ou “Télécharger” à terme (facultatif pour MVP, mais idéal).
* [x] **(FE)** `EvaluationBlock` :

  * [ ] affichage du score global
  * [ ] affichage des axes (scores + commentaires) sous forme de liste ou graph simplifié.
* [x] **(FE)** `ActionSuggestionsBlock` :

  * [x] boutons / liens pour chaque suggestion (`label` → `action_id`).
  * [x] propagation de l’action au backend ou au routeur front.
* [x] **(FE)** `XpBlock` :

  * [ ] barre ou compteur XP
  * [ ] XP actuelle, XP gagnée, XP nécessaire pour prochain palier.

### 5.3. Agent Activity Feed & Zyno

* [x] **(FE)** Composant `AgentActivityFeed` :

  * [x] liste des événements (nom de l’agent, résumé de l’action).
* [ ] **(FE)** (Optionnel mais très “wow”) Petite “pastille active” sur les agents actuellement impliqués dans la réponse courante.
* [x] **(FE)** Entrée centrale pour “Parler à Zyno” :

  * [x] champ texte,
  * [x] envoi → `POST /journeys/:id/step` → rafraîchissement des blocs.

---

## 6. Contenu & prompts (qualité pédagogique et stratégique)

### 6.1. Personas & phases

* [ ] **(CT)** Pour chaque persona :

  * [ ] résumé clair en 2–3 phrases (qui est ce persona, pour qui, pour quoi).
* [ ] **(CT)** Pour chaque phase (`learn`, `build`, `prove`, `activate`, `scale`) :

  * [ ] objectif pédagogique ou business explicite (une phrase).
  * [ ] 2 missions cohérentes avec cet objectif.
  * [ ] 3 ressources pertinentes.

### 6.2. Thématiques critiques (tokenomics, DAO, launch, migration)

* [ ] **(CT)** Phase tokenomics (au moins pour un track builder) :

  * [ ] missions orientées utility / supply / allocations / incitations / risques.
  * [ ] document `tokenomics_one_pager` (ou équivalent) propre.
* [ ] **(CT)** Phase DAO / gouvernance :

  * [ ] missions sur propositions de gouvernance, rôles, process.
  * [ ] document type “governance_proposal” ou “governance_playbook”.
* [ ] **(CT)** Phase launch / Internet Capital Market :

  * [ ] missions sur pricing, liquidité, calendrier de lancement.
  * [ ] ressources sur risques et bonnes pratiques.
* [ ] **(CT)** Parcours migration Web2 → Solana :

  * [ ] missions pour cartographier le business actuel,
  * [ ] propositions de scénarios de tokenisation.

### 6.3. Prompting agents

* [ ] **(CT/BE)** Prompts système **propres** pour au moins :

  * [ ] Zyno (orchestrateur).
  * [ ] TokenomicsAgent (analyse / design).
  * [ ] GrowthAgent (contenu & go-to-market).
  * [ ] DAOAgent (gouvernance).
  * [ ] CoachAgent/EvalAgent (évaluations & feedback pédagogique).
* [ ] **(CT)** Ton adapté :

  * [ ] pédagogique par défaut,
  * [ ] plus “investisseur” en mode démo, si activé.

---

## 7. Interactions & scénarisation (simulation, choix, branches)

* [ ] **(CT/FE)** Au moins **un écran** par parcours qui propose **des choix explicites** via `ActionSuggestionsBlock` (arbre de décisions simple).
* [ ] **(CT)** Pour chaque phase :

  * [ ] au moins **un élément interactif fort** : mission à produire, quiz, ou simulation on-chain.
* [ ] **(CT/BE)** Mise en place d’un petit scénario “branched” :

  * [ ] choix A → design tokenomics conservateur,
  * [ ] choix B → design plus agressif,
  * [ ] Zyno génère un feedback différent selon le choix.

---

## 8. UI/UX & design (niveau “produit sérieux”)

* [ ] **(FE)** Layout responsive (desktop + mobile au moins “correct”).
* [ ] **(FE)** Design system cohérent :

  * [ ] palette de couleurs cohérente (Solana + Money Factory AI).
  * [ ] typographie homogène.
* [x] **(FE)** États de chargement :

  * [x] spinner ou skeleton sur les blocs en attente de réponse LLM.
* [x] **(FE)** États d’erreur :

  * [x] message clair en cas de problème LLM / réseau, avec possibilité de retenter.
* [ ] **(CT)** Micro-copy :

  * [ ] titres courts,
  * [ ] textes structurés (markdown),
  * [ ] pas de jargon non défini.

---

## 9. Mode “Démo investisseur”

* [ ] **(BE)** Utilisateur de démo prédéfini (`demo_user_id`) avec :

  * [ ] journey_state prérempli pour un parcours “type” (ex. builder tokenomics).
* [x] **(CT)** Script de démo écrit (séquence des écrans à montrer) :

  * [x] 1) choix persona + mode,
  * [x] 2) écran d’une phase avec missions + ressources,
  * [x] 3) soumission d’une mission / quiz,
  * [x] 4) évaluation + XP + suggestion de mint NFT,
  * [x] 5) lancement d’un vote ou action DAO simulée (si prévu).
* [x] **(BE/FE)** Bouton ou paramètre pour basculer en “mode démo” (désactive par exemple l’enregistrement réel des données personnelles).

---

## 10. Tests & validation

* [x] **(BE)** Tests unitaires de base :

  * [x] parsing de `JourneyStepResponse`,
  * [x] mise à jour de `journey_state`,
  * [x] gestion des erreurs LLM.
* [ ] **(FE)** Tests manuels (ou Cypress/Playwright minimal) :

  * [ ] un scénario complet par persona principal.
* [ ] **(CT)** Relecture croisée du contenu (au moins une personne autre que l’auteur lit et corrige).
* [ ] **(BE)** Mesure simple des temps de réponse :

  * [ ] temps < 3–5 s pour une étape Zyno sur environnement réaliste (si possible).

---

## 11. Observabilité & monitoring

* [x] **(BE)** Logs centralisés :

  * [x] appels à Zyno,
  * [x] erreurs LLM,
  * [x] actions on-chain (mint).
* [x] **(BE)** Un petit écran interne (ou simple fichier JSON) listant :

  * [x] derniers utilisateurs,
  * [x] dernier `journey_state`,
  * [x] dernière réponse de Zyno (pour debug live).
