<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Cahier des charges – Journey Simulator (MVP multi‑agents · GPT‑5.1 · Solana devnet)

> Contrainte temporaire: le RAG n’est pas encore opérationnel. Les agents utilisent provisoirement GPT‑5.1 via OpenAI, avec sorties structurées (JSON) et contrats stables. L’intégration RAG sera branchée plus tard sans casser l’API.
> Objectif: transformer les parcours en expérience interactive multi‑agents, démontrable aux investisseurs, avec missions, quiz, livrables, évaluations, mint NFT testnet et logs d’agents visibles.

---

## Table des matières
1. Contexte & vision produit
2. Portée MVP (in/out) et décisions rapides
3. Architecture cible (multi‑agents) et piles supportées
4. Intégration GPT‑5.1 (Responses API) et sorties structurées
5. Orchestration Zyno (prompt système + contrat JSON)
6. API v1 (OpenAPI) et sécurité
7. Modèles de données (JSON Schema) et persistance
8. Solana devnet (comptes, instructions, IDL) & UX mint
9. Frontend (mapping UI Blocks → composants React) et flows
10. Journalisation, métriques, observabilité
11. Tests (≥85% backend), E2E, charge
12. CI/CD, versioning SemVer, rollback
13. Critères d’acceptation MVP & checklist
14. Plan de démo investisseurs (runbook + fallback)
15. Roadmap vNext et risques
16. Annexes (OpenAPI, JSON Schemas, IDL, prompt Zyno, .env)

---

## 1) Contexte & vision produit
Journey Simulator est un module de Money Factory AI qui:
- Orchestré par Zyno, coordonne des agents spécialisés (Builder, Growth, DAO, Risk, Tokenomics, Education, etc.).
- Met en scène des parcours Solana/Web3 par persona (Cognitive Activation Hub, Capital Foundry, System Architect, Experience Studio, Impact Engine, Resilience Master) suivant Learn → Build → Prove → Activate → Scale.
- Démontre un Internet Capital Market sur Solana: XP, NFTs Proof‑of‑*, staking, votes DAO.

MVP: démo en quelques minutes montrant un choix de persona, progression en phases, missions interactives avec feedback IA, au moins 1 interaction réelle devnet (mint NFT), et un feed d’activité multi‑agents.

---

## 2) Portée MVP (in/out) et décisions rapides
In:
- Sélection persona → phases → missions, quiz, documents, évaluations, XP.
- UI Blocks générés par Zyno (JSON) mappés en composants front.
- Mint NFT “Proof‑of‑*” sur Solana devnet (1 collection test), affichage signature/solscan.
- Logs agents (timeline) + métriques basiques.

Out (post‑MVP):
- Marketplace publique, paiement réel, multichain, analytics avancées, RAG complet.

Décisions à valider vite:
- Backend MVP: Option A (web/ Next.js + Prisma) ou Option B (mf‑back Express + Mongo). Le document reste agnostique avec JSON Schemas communs.
- Auth: SIWS (Sign‑In With Solana) + JWT (recommandé pour API v1).

---

## 3) Architecture cible (multi‑agents) et piles supportées
Vue d’ensemble (agnostique persistance):

```txt
[Frontend React/TS (journey-simulator)]
   |  REST/JSON (v1) + WebSockets (optionnel)
   v
[Backend API v1]
   |-- Zyno Orchestrator (GPT‑5.1 Responses API, Structured Outputs)
   |-- Agents spécialisés (5–6 MVP) → sorties JSON contractuelles
   |-- Data adapters (Prisma/Postgres ou Mongoose/Mongo)
   |-- Solana connector (devnet) : mint NFT + signatures
   |-- Logs/Metrics (Prometheus/OpenTelemetry – niveau MVP)
```

Agents MVP et rôles:
- Orchestrator (Zyno): décide des UI Blocks, des agents à invoquer, des actions.
- Simulation: génère interactions (quiz, missions, documents) suivant le contexte.
- Evaluator: score/feedback multi‑axes, recommandations.
- Compliance/Safety: garde‑fous (prompt injection, PII, red teaming léger).
- On‑chain: prépare/valide tx Solana, écoute confirmations.
- Data: normalisation/persistance des journaux et événements.

---

## 4) Intégration GPT‑5.1 (Responses API) et sorties structurées
- Modèle: gpt‑5.1 (raisonnement), gpt‑5.1‑mini pour agents légers.
- Endpoint: /v1/responses (Structured Outputs, tools), avec `response_format = { type: "json_schema", strict: true }`.
- Paramètres utiles: temperature (0.2–0.6), top_p (0.9–0.95), max_output_tokens (contrôle coûts), reasoning_effort (medium par défaut, high ponctuellement).
- .env (extrait):
  - OPENAI_API_KEY
  - LLM_MODEL_NAME=gpt-5.1
  - LLM_TEMPERATURE=0.4
  - LLM_MAX_OUTPUT_TOKENS=1500
- LLM client unique (wrapper) avec: timeout, retry/backoff 429/5xx, budget tokens, metadata (user_id, persona_id, journey_id, agent_name) et logs d’usage.
- Migration RAG: prévoir une tool `search_in_knowledge_base` abstraite (aujourd’hui mock), bascule demain vers RAG/File Search.

---

## 5) Orchestration Zyno (prompt système + contrat JSON)
- Zyno reçoit: user_id, persona_id, track, phase_id, journey_state, user_input, langue.
- Zyno produit: JSON conforme au schema JourneyStepResponse (voir Annexe B):
  - metadata (persona/track/phase/lang/title/summary + extensions UI/UX: mode, tone)
  - ui_blocks: text_block, checklist_block, quiz_block, mission_block, resource_block, document_block, evaluation_block, action_suggestions_block, xp_block
  - agent_actions (actions internes à déclencher)
  - next_state (phase, missions complétées, xp_delta, notes)
- Zyno System Prompt complet: voir Annexe C (FR). Règle: sortie JSON stricte, aucune prose hors JSON.
- Extensions UI/UX (voir docs/ui-ux):
  - metadata.mode: discovery | builder | expert
  - metadata.tone: pedagogical | investor_pitch | critical

---

## 6) API v1 (OpenAPI) et sécurité
- Versioning: /api/v1
- Auth (reco): SIWS + JWT Bearer.
- Endpoints clés:
  - POST /auth/siws/challenge
  - POST /auth/siws/verify
  - POST /journeys
  - GET /journeys/{id}
  - POST /journeys/{id}/step  (déclenche Zyno → retourne JourneyStepResponse)
  - POST /journeys/{id}/complete
  - POST /journeys/{id}/mint-badge
  - GET /healthz
  - GET /metrics
- Erreurs: { error: { code, message, correlation_id } }
- Idempotency: header Idempotency‑Key sur POST critiques.
- Sécurité: CORS restrictif, rate limiting, validation stricte (zod/pydantic), TLS en prod, secrets via env/secrets manager.
- OpenAPI v3 squelette: Annexe A.

---

## 7) Modèles de données (JSON Schema) et persistance
Entités MVP:
- User: id, pubkey, roles, preferences.
- Journey: id, owner_pubkey, title, steps[], state, created_at, last_run_at.
- Step: id, title, input, status, outputs.
- SimulationRun: id, journey_id, result, score, logs.
- Reward: journey_id, mint_address, tx_signature, status.
- AgentLog/LLMLog: événements structurés (agent_name, action_type, latence, tokens, timestamp).

Exigences:
- JSON Schemas validables (Annexe B/C + Journey.schema.json en Annexe B’ si besoin).
- Indexes (ex: unique (owner_pubkey, journey_id)), migrations (Prisma) ou scripts (Mongoose).

---

## 8) Solana devnet (comptes, instructions, IDL) & UX mint
- Réseau: devnet. Env: SOLANA_CLUSTER, SOLANA_RPC_URL, WALLET_KEYPAIR_PATH (dev only).
- Comptes: JourneyAccount (PDA ["journey", owner_pubkey, journey_id]), BadgeMint, RewardVault.
- Instructions: initialize_journey, progress_step, complete_journey, mint_badge.
- Événements: JourneyInitialized, StepProgressed, JourneyCompleted, BadgeMinted.
- Front UX: modale de mint après mission “Prove”/score seuil, affiche nom NFT, bénéfices, bouton Mint → signature → lien Solscan.
- IDL (brouillon): Annexe D.

---

## 9) Frontend (mapping UI Blocks → composants React) et flows
- Mapping recommandé (existant à enrichir):
  - text_block → composant texte (ZynoBox/sections)
  - checklist_block → Checklist component
  - quiz_block → Quiz component (feedback immédiat; modes entraînement/certifiant)
  - mission_block → Mission panel (input: text/markdown/code/link/choice) avec bouton “Comprendre la mission”
  - resource_block → ResourceList (templates cliquables, flashcards)
  - document_block → Document viewer (Markdown → export PDF plus tard)
  - evaluation_block → MissionFeedbackSummary (axes + indicateurs)
  - action_suggestions_block → CTA list (choix narratifs/branchements)
  - xp_block → XPTracker
- Layout recommandé (desktop): 3 colonnes (Timeline & résumé | Contenu actif | Activity/Resources). Responsive mobile: pile verticale.
- Micro‑interactions: apparition douce des blocs, pulsation icônes d’agents lors d’agent_actions.
- Accessibilité: contrastes, tailles, navigation clavier, hiérarchie titres.
- Flows clés:
  - Connexion wallet → SIWS → JWT
  - Créer Journey → POST /journeys
  - Avancer une étape → POST /journeys/{id}/step (Zyno JSON) → rendu des UI Blocks
  - Compléter → POST /journeys/{id}/complete → Mint → Affichage NFT/solscan
- Agent Activity Feed: alimenté par AgentLog entries (agent, action, score, etc.).
- Voir détails: journey-simulator/docs/ui-ux/guide.md et checklist.

---

## 10) Journalisation, métriques, observabilité
- Logs JSON: correlation_id, user_id, persona_id, agent_name, latence, tokens, status.
- Métriques (Prometheus): http_requests_total, http_request_duration_seconds, agent_runs_total, solana_tx_latency_seconds.
- Traces (optionnel MVP): OpenTelemetry.
- Dashboards/alertes minimales: erreurs 5xx, latence P95, échecs mint.

---

## 11) Tests (≥85% backend), E2E, charge
- Backend: unit/int (≥85%), contrats JSON Schema (ajv), cas d’erreur/idempotence.
- Front: unit + composants (Vitest), snapshots critiques.
- E2E: Playwright (SIWS, create → step → mint) avec fixtures.
- Solana: tests localnet/devnet (Anchor/ts) pour chemins heureux et erreurs courantes.
- Charge légère (k6) sur endpoints critiques (/step, /mint-badge).

---

## 12) CI/CD, versioning SemVer, rollback
- Pipeline: lint (ESLint/Prettier), SAST (Semgrep), tests + coverage gate, build images Docker, scan images, publier artefacts (OpenAPI/Storybook), déploiement env démo après tag SemVer, rollback possible.
- Fichiers YAML de référence à fournir en /.github/workflows/* (annexe de référence).

---

## 13) Critères d’acceptation MVP & checklist
Doit inclure:
- API v1 décrite (OpenAPI lint OK), auth SIWS + JWT opérationnelle ou stub raisonnable.
- Zyno orchestrateur via GPT‑5.1 (Responses API) avec JourneyStepResponse strict.
- UI Blocks mappés aux composants front et parcours rendu.
- Mint NFT devnet visible (signature + explorer).
- Logs agents + métriques basiques.
- Sécurité: secrets non hardcodés, CORS restreint, rate limit, TLS prod.
- Tests backend ≥85%, E2E Playwright, lint ok, npm audit clean=0.
- CI/CD documenté (pipeline et rollback). Diagrams Mermaid et annexes à jour.

---

## 14) Plan de démo investisseurs (runbook + fallback)
Script:
1) Connexion wallet (devnet) + SIWS
2) Création d’un Journey 3 étapes
3) Étape via Zyno → UI Blocks (quiz/mission/document) + Activity Feed en direct
4) Complétion → mint NFT badge (signature affichée) → lien Solscan
5) Tableau de bord XP/NFT
Fallback: mode “replay” (artefacts enregistrés) si RPC indispo.

---

## 15) Roadmap vNext et risques
vNext:
- RAG réel, analytics avancées, marketplace de journeys, paiements (Solana Pay), gating, RBAC, audit trails.
Risques: latence/couts LLM, limites devnet, dérives prompts. Mitigations: cache, retries, budgets, guardrails Compliance.

---

## 16) Annexes

### Annexe A — OpenAPI v3 (squelette)
```yaml
openapi: 3.0.3
info: { title: Journey Simulator API, version: 1.0.0 }
servers: [{ url: /api/v1 }]
paths:
  /auth/siws/challenge: { post: { summary: Issue challenge, responses: { "200": { description: OK }}}}
  /auth/siws/verify: { post: { summary: Verify & issue JWT, responses: { "200": { description: OK }}}}
  /journeys:
    post: { summary: Create journey, responses: { "201": { description: Created }, "409": { description: Conflict } } }
  /journeys/{id}:
    get: { summary: Get journey, parameters: [{ name: id, in: path, required: true }], responses: { "200": { description: OK }, "404": { description: Not Found } } }
  /journeys/{id}/step:
    post: { summary: Run step (Zyno), responses: { "200": { description: OK } } }
  /journeys/{id}/complete:
    post: { summary: Complete, responses: { "200": { description: OK } } }
  /journeys/{id}/mint-badge:
    post: { summary: Mint badge NFT, responses: { "202": { description: Accepted } } }
  /healthz:
    get: { summary: Health, responses: { "200": { description: OK } } }
  /metrics:
    get: { summary: Prometheus, responses: { "200": { description: OK } } }
components:
  securitySchemes:
    bearerAuth: { type: http, scheme: bearer, bearerFormat: JWT }
  schemas:
    Error: { type: object, properties: { error: { type: object, properties: { code: { type: string }, message: { type: string }, correlation_id: { type: string }}}}}
security: [{ bearerAuth: [] }]
```

### Annexe B — JSON Schema JourneyStepResponse (extrait consolidé)

Note: Extensions UI/UX ajoutées dans `metadata` (mode, tone). Voir également journey-simulator/docs/schemas/JourneyStepResponse.schema.json.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "JourneyStepResponse",
  "type": "object",
  "required": ["metadata", "ui_blocks", "agent_actions", "next_state"],
  "properties": {
    "metadata": {
      "type": "object",
      "required": ["persona_id", "journey_track", "phase_id", "language"],
      "properties": {
        "persona_id": { "type": "string" },
        "journey_track": { "type": "string" },
        "phase_id": { "type": "string", "enum": ["learn", "build", "prove", "activate", "scale"] },
        "language": { "type": "string", "enum": ["fr", "en"] },
        "title": { "type": "string" },
        "summary": { "type": "string" }
      },
      "additionalProperties": false
    },
    "ui_blocks": { "type": "array", "items": { "$ref": "#/definitions/UIBlock" } },
    "agent_actions": { "type": "array", "items": { "$ref": "#/definitions/AgentAction" } },
    "next_state": { "$ref": "#/definitions/NextState" }
  },
  "definitions": {
    "UIBlock": {
      "type": "object",
      "required": ["kind"],
      "properties": { "kind": { "type": "string" } },
      "discriminator": { "propertyName": "kind" },
      "oneOf": [
        { "$ref": "#/definitions/TextBlock" },
        { "$ref": "#/definitions/ChecklistBlock" },
        { "$ref": "#/definitions/QuizBlock" },
        { "$ref": "#/definitions/MissionBlock" },
        { "$ref": "#/definitions/ResourceBlock" },
        { "$ref": "#/definitions/DocumentBlock" },
        { "$ref": "#/definitions/EvaluationBlock" },
        { "$ref": "#/definitions/ActionSuggestionsBlock" },
        { "$ref": "#/definitions/XpBlock" }
      ]
    },
    "TextBlock": {
      "type": "object",
      "required": ["kind", "id", "title", "body_markdown"],
      "properties": {
        "kind": { "type": "string", "enum": ["text_block"] },
        "id": { "type": "string" },
        "title": { "type": "string" },
        "body_markdown": { "type": "string" }
      },
      "additionalProperties": false
    },
    "ChecklistBlock": {
      "type": "object",
      "required": ["kind", "id", "title", "items"],
      "properties": {
        "kind": { "type": "string", "enum": ["checklist_block"] },
        "id": { "type": "string" },
        "title": { "type": "string" },
        "items": { "type": "array", "items": { "type": "object", "required": ["label"], "properties": { "label": { "type": "string" }, "checked": { "type": "boolean", "default": false } }, "additionalProperties": false } }
      },
      "additionalProperties": false
    },
    "QuizBlock": {
      "type": "object",
      "required": ["kind", "id", "title", "questions"],
      "properties": {
        "kind": { "type": "string", "enum": ["quiz_block"] },
        "id": { "type": "string" },
        "title": { "type": "string" },
        "questions": { "type": "array", "items": { "type": "object", "required": ["id", "question", "options", "correct_option_index", "explanation"], "properties": { "id": { "type": "string" }, "question": { "type": "string" }, "options": { "type": "array", "items": { "type": "string" }, "minItems": 2 }, "correct_option_index": { "type": "integer", "minimum": 0 }, "explanation": { "type": "string" } }, "additionalProperties": false } }
      },
      "additionalProperties": false
    },
    "MissionBlock": {
      "type": "object",
      "required": ["kind", "id", "title", "description", "mission_type", "expected_input_type", "xp_reward"],
      "properties": {
        "kind": { "type": "string", "enum": ["mission_block"] },
        "id": { "type": "string" },
        "title": { "type": "string" },
        "description": { "type": "string" },
        "mission_type": { "type": "string" },
        "expected_input_type": { "type": "string", "enum": ["text", "markdown_document", "code_snippet", "link", "choice"] },
        "xp_reward": { "type": "integer", "minimum": 0 },
        "nft_reward_id": { "type": "string" },
        "is_mandatory": { "type": "boolean", "default": true }
      },
      "additionalProperties": false
    },
    "ResourceBlock": {
      "type": "object",
      "required": ["kind", "id", "title", "resources"],
      "properties": {
        "kind": { "type": "string", "enum": ["resource_block"] },
        "id": { "type": "string" },
        "title": { "type": "string" },
        "resources": { "type": "array", "items": { "type": "object", "required": ["id", "label", "resource_type", "agent_owner"], "properties": { "id": { "type": "string" }, "label": { "type": "string" }, "description": { "type": "string" }, "url": { "type": "string" }, "resource_type": { "type": "string", "enum": ["article", "video", "template", "code_snippet", "checklist", "tool_link"] }, "agent_owner": { "type": "string" } }, "additionalProperties": false } }
      },
      "additionalProperties": false
    },
    "DocumentBlock": {
      "type": "object",
      "required": ["kind", "id", "title", "doc_type", "content_markdown"],
      "properties": {
        "kind": { "type": "string", "enum": ["document_block"] },
        "id": { "type": "string" },
        "title": { "type": "string" },
        "doc_type": { "type": "string" },
        "content_markdown": { "type": "string" }
      },
      "additionalProperties": false
    },
    "EvaluationBlock": {
      "type": "object",
      "required": ["kind", "id", "title", "global_score", "max_score", "feedback", "axes"],
      "properties": {
        "kind": { "type": "string", "enum": ["evaluation_block"] },
        "id": { "type": "string" },
        "title": { "type": "string" },
        "global_score": { "type": "number" },
        "max_score": { "type": "number" },
        "feedback": { "type": "string" },
        "axes": { "type": "array", "items": { "type": "object", "required": ["name", "score", "max_score", "comment"], "properties": { "name": { "type": "string" }, "score": { "type": "number" }, "max_score": { "type": "number" }, "comment": { "type": "string" } }, "additionalProperties": false } }
      },
      "additionalProperties": false
    },
    "ActionSuggestionsBlock": {
      "type": "object",
      "required": ["kind", "id", "title", "suggestions"],
      "properties": {
        "kind": { "type": "string", "enum": ["action_suggestions_block"] },
        "id": { "type": "string" },
        "title": { "type": "string" },
        "suggestions": { "type": "array", "items": { "type": "object", "required": ["label", "action_id"], "properties": { "label": { "type": "string" }, "action_id": { "type": "string" } }, "additionalProperties": false } }
      },
      "additionalProperties": false
    },
    "XpBlock": {
      "type": "object",
      "required": ["kind", "id", "current_xp", "gained_xp", "next_level_xp"],
      "properties": {
        "kind": { "type": "string", "enum": ["xp_block"] },
        "id": { "type": "string" },
        "title": { "type": "string" },
        "current_xp": { "type": "integer" },
        "gained_xp": { "type": "integer" },
        "next_level_xp": { "type": "integer" },
        "comment": { "type": "string" }
      },
      "additionalProperties": false
    },
    "AgentAction": {
      "type": "object",
      "required": ["agent_name", "reason", "action"],
      "properties": {
        "agent_name": { "type": "string" },
        "reason": { "type": "string" },
        "action": { "type": "string" },
        "parameters": { "type": "object" }
      },
      "additionalProperties": false
    },
    "NextState": {
      "type": "object",
      "required": ["phase_id", "completed_missions", "xp_delta"],
      "properties": {
        "phase_id": { "type": "string" },
        "completed_missions": { "type": "array", "items": { "type": "string" } },
        "xp_delta": { "type": "integer" },
        "notes": { "type": "string" }
      },
      "additionalProperties": false
    }
  }
}
```

### Annexe C — Zyno System Prompt (version FR)
```text
Tu es Zyno, l’orchestrateur cognitif des parcours de Money Factory AI – Journey Simulator.
Rôle: analyser l’état (persona, track, phase, missions, XP, NFTs), décider des blocs UI à afficher, coordonner implicitement les agents (Builder, Growth, DAO, Risk, Tokenomics, Education…), et proposer missions, quiz, ressources, documents, évaluations, actions et next_state.
Règles: SORTIE STRICTEMENT JSON conforme au schema JourneyStepResponse; aucune prose hors JSON; adapter au persona/track/phase/langue/niveau; textes concis et pédagogiques; quiz avec bonne réponse + explication; documents en Markdown; évaluations avec scores + axes d’amélioration.
Contexte: écosystème Solana, Internet Capital Markets, parcours Learn→Build→Prove→Activate→Scale, NFT Proof‑of‑*, XP, DAO.
Blocs UI autorisés: text_block, checklist_block, quiz_block, mission_block, resource_block, document_block, evaluation_block, action_suggestions_block, xp_block.
Sortie attendue: { metadata, ui_blocks[], agent_actions[], next_state } – voir JSON Schema.
```

### Annexe D — IDL Solana (brouillon)
```json
{
  "version": "0.1.0",
  "name": "journey_simulator",
  "instructions": [
    { "name": "initializeJourney", "accounts": [], "args": [ { "name": "journeyId", "type": "string" }, { "name": "metadataHash", "type": "bytes" } ] }
  ],
  "accounts": [
    { "name": "JourneyAccount", "type": { "kind": "struct", "fields": [ { "name": "owner", "type": "publicKey" }, { "name": "journeyId", "type": "string" } ] } }
  ],
  "events": [ { "name": "JourneyCompleted", "fields": [ { "name": "journeyId", "type": "string", "index": false } ] } ]
}
```

### Annexe E — .env.example (extrait consolidé)
```bash
# OpenAI / LLM
OPENAI_API_KEY=sk-...
LLM_MODEL_NAME=gpt-5.1
LLM_TEMPERATURE=0.4
LLM_MAX_OUTPUT_TOKENS=1500

# Solana
echo SOLANA_CLUSTER=devnet
SOLANA_RPC_URL=...
WALLET_KEYPAIR_PATH=~/.config/solana/id.json

# API / Auth
JWT_SECRET_FILE=/run/secrets/jwt
API_BASE_URL=http://localhost:3000/api/v1
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

