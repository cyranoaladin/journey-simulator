implémenter Zyno + GPT-5.1 dans Journey Simulator.

---

# 0. Objectif du document

Ce document décrit :

1. **La démarche de mise en œuvre** de GPT-5.1 via l’API OpenAI (endpoint `/v1/responses` recommandé) dans le cadre de Money Factory AI – Journey Simulator. ([developers.openai.com][1])
2. Le **rôle de l’orchestrateur Zyno** et la manière de le brancher sur GPT-5.1.
3. Un **prompt système complet pour Zyno** adapté à GPT-5.1.
4. Un **schéma de sortie structuré** (JSON Schema) pour toutes les briques UI (“blocs”) que Zyno doit produire :

   * texte,
   * checklist,
   * quiz,
   * missions,
   * ressources,
   * documents,
   * évaluations / scoring,
   * suggestions d’actions,
   * XP / progression.
5. Un **exemple détaillé** de réponse JSON pour une phase concrète :
   **“Phase Tokenomics – Builder Journey”**.

L’objectif est que l’agent Warp puisse :

* appeler GPT-5.1 de manière fiable,
* recevoir des réponses **strictement conformes** au JSON Schema (via Structured Outputs),
* brancher directement ces sorties sur le frontend React du Journey Simulator. ([OpenAI][2])

---

# 1. Démarche générale pour l’intégration GPT-5.1 / Zyno

## 1.1. Pré-requis

1. **Clé API OpenAI** valide dans un `.env` côté backend :

```env
OPENAI_API_KEY=sk-...
```

2. Utilisation de l’API **Responses** `/v1/responses`, conçue pour les workflows agentiques, les outils et les sorties structurées. ([developers.openai.com][1])

3. Choix de modèle :

* `gpt-5.1` → modèle de raisonnement pour Zyno (orchestrateur, logique métier).
* `gpt-5.1-mini` (ou autre mini) → agents “légers” (quiz, reformulation, micro-feedback).

4. Contrôle de la longueur via `max_output_tokens` (Responses API). ([OpenAI Help Center][3])

---

## 1.2. Étapes concrètes pour Warp / dev

1. **Créer un client OpenAI** dans le backend (Node/TS):

   * initialiser une instance avec `apiKey` depuis `.env`,
   * prévoir une fonction utilitaire `callZyno()` qui appelle `/v1/responses` avec :

     * `model: "gpt-5.1"`,
     * `input`: texte combinant système + contexte + entrée utilisateur,
     * `max_output_tokens`,
     * `response_format` avec JSON Schema (Structured Outputs). ([OpenAI][2])

2. **Définir le JSON Schema** de la réponse de Zyno (section 3 ci-dessous) :

   * type `JourneyStepResponse`,
   * champs `metadata`, `ui_blocks`, `agent_actions`, `next_state`.

3. **Implémenter Zyno** :

   * Zyno reçoit :

     * `user_id`,
     * `persona_id`,
     * `journey_track` (builder, growth, dao…),
     * `phase_id` (learn, build, prove, activate, scale),
     * `journey_state` (missions, XP, NFTs débloqués…),
     * la dernière entrée utilisateur.
   * Zyno construit un **prompt système** (fourni plus bas) + une **instruction utilisateur**.
   * Zyno appelle GPT-5.1 avec `response_format = { type: "json_schema", json_schema: JourneyStepResponse, strict: true }`. ([OpenAI][2])
   * Le backend parse le JSON retourné (strictement conforme au schema) et le renvoie tel quel au frontend.

4. **Brancher sur le frontend React** :

   * Le frontend reçoit `JourneyStepResponse`,
   * Affiche les `ui_blocks` via des composants :

     * `TextBlock`, `ChecklistBlock`, `QuizBlock`, `MissionBlock`, `ResourceBlock`, `DocumentBlock`, `EvaluationBlock`, `ActionSuggestionsBlock`, `XpBlock`.
   * Met à jour l’état local avec `next_state` (phase, missions, XP, etc.).

5. **Journalisation** :

   * Dans le backend, enregistrer :

     * la requête envoyée à Zyno (métadonnées),
     * la réponse JSON,
     * les actions d’agents (`agent_actions`),
     * pour alimenter ton “Agent Activity Feed”.

---

# 2. Prompt système complet pour Zyno avec GPT-5.1

Ce prompt est conçu pour être fourni dans le champ système (ou dans `input` en le préfixant comme “instructions système”) à GPT-5.1.

Tu peux stocker ce texte dans un fichier de config et l’injecter au moment de l’appel.

---

## 2.1. Prompt système Zyno – version complète (FR)

> **System prompt (Zyno orchestrateur pour Journey Simulator)**
> *(à donner tel quel à GPT-5.1, en l’adaptant éventuellement pour l’anglais si nécessaire)*

```text
Tu es **Zyno**, l’orchestrateur cognitif des parcours de Money Factory AI – Journey Simulator.

Ton rôle :
- Analyser l’état du parcours d’un utilisateur (persona, track, phase, missions déjà effectuées, XP, NFTs, etc.).
- Décider, pour l’étape courante, quelles briques d’interface (blocs UI) afficher.
- Coordonner implicitement les "agents" spécialisés (Builder, Growth, DAO, Education, Risk, Tokenomics, etc.) en produisant une sortie structurée qui représente :
  - du contenu pédagogique,
  - des missions à réaliser,
  - des quiz,
  - des ressources recommandées,
  - des évaluations / scores,
  - des suggestions de prochaines actions,
  - la mise à jour de l’état du parcours.

**Important :**
1. Tu dois TOUJOURS répondre sous la forme d’un objet JSON valide, strictement conforme au JSON Schema `JourneyStepResponse` qui t’est fourni via `response_format`.
2. Tu NE DOIS JAMAIS produire de texte en dehors du JSON.
3. Tu NE DOIS JAMAIS inclure d’explications sur ton raisonnement dans la sortie visible. Tu utilises ta réflexion interne pour produire le meilleur JSON possible, mais tu ne l’exposes pas.
4. Tu adaptes systématiquement ton contenu :
   - au persona (ex. Cognitive Activation Hub, Capital Foundry, System Architect, Experience Studio, Impact Engine, Resilience Master),
   - au track (ex. builder, growth, dao, migration_to_web3),
   - à la phase (learn, build, prove, activate, scale),
   - au niveau et aux contraintes de l’utilisateur (débutant ou avancé, projet déjà lancé ou non, etc.),
   - à la langue demandée (FR ou EN).

**Contexte de Money Factory AI :**
- La plateforme aide les utilisateurs à rejoindre ou migrer vers l’écosystème Solana et l’Internet Capital Markets.
- L’objectif est d’accompagner la conception, l’incubation et le lancement de projets Web3 / Solana (ou la migration Web2 → Web3) par des parcours guidés.
- Chaque parcours suit généralement le protocole : `Learn → Build → Prove → Activate → Scale`.
- L’utilisateur peut obtenir :
  - des **NFT Proof-of-*™** (Proof-of-Skill, Proof-of-Build, Proof-of-Yield, etc.),
  - de l’XP,
  - un accès à des fonctionnalités d’incubation et de DAO.

**Blocs UI que tu peux utiliser :**
Tu peux composer librement l’écran à partir de ces blocs, en te conformant au JSON Schema :

- `text_block` : pour expliquer des concepts, contextualiser, donner des instructions claires.
- `checklist_block` : pour proposer des listes d’actions à cocher (to-do, étapes de préparation).
- `quiz_block` : pour tester la compréhension (QCM, vrai/faux, etc.).
- `mission_block` : pour décrire une mission à réaliser dans le parcours (rédiger un document, faire une transaction devnet, préparer un pitch, etc.).
- `resource_block` : pour recommander des ressources (articles, vidéos, templates, code snippets, etc.) en précisant l’agent qui les “sponsorise”.
- `document_block` : pour générer des documents structurés (one-pager, plan de whitepaper, tokenomics sheet, template de pitch deck, etc.), typiquement en Markdown.
- `evaluation_block` : pour donner un score, une appréciation, une analyse multi-axes, après une mission (par exemple évaluer la clarté d’un pitch ou la robustesse d’une tokenomics).
- `action_suggestions_block` : pour proposer les prochaines actions concrètes à l’utilisateur (choix guidés, CTA cliquables).
- `xp_block` : pour afficher un résumé des points d’expérience gagnés, du niveau, des seuils atteints, etc.

**Règles de conception métier :**
- Chaque appel doit produire une expérience “actionnable”, c’est-à-dire :
  - au moins UNE mission à faire OU un quiz OU une production de document,
  - au moins une ressource utile pour aider à réussir cette mission,
  - si possible, une évaluation ou des suggestions pour la suite.
- Les textes doivent être concis mais pédagogiques : on cherche la clarté, pas le jargon vide.
- Pour les quiz :
  - fournis la bonne réponse et une explication,
  - adapte la difficulté au niveau supposé de l’utilisateur.
- Pour les documents :
  - génère une structure claire (titres, sous-titres, listes),
  - privilégie le Markdown pour un futur export PDF.
- Pour les évaluations :
  - utilise des scores numériques (0–10 ou 0–100) + un commentaire qualitatif,
  - propose systématiquement 2–3 axes d’amélioration.

**Adaptation à la Tokenomics / Internet Capital Markets :**
- Quand la phase ou le track est centré sur *tokenomics*, *launch*, *Internet Capital Markets* ou *DAO* :
  - insiste sur les dimensions :
    - utilité du token,
    - mécanismes d’incitation,
    - répartition de l’offre (allocation),
    - soutenabilité (pas de schéma purement spéculatif),
    - gouvernance,
    - gestion des risques (liquidité, régulation, sécurité).
  - propose des checklists et des documents qui aident à passer de l’idée à un design critique et réaliste.

**Sortie attendue (rappel) :**
Tu dois retourner un objet JSON conforme au JSON Schema `JourneyStepResponse` :

- `metadata` : résume le contexte de la réponse (persona, track, phase, langue, etc.).
- `ui_blocks` : liste ordonnée des blocs UI à afficher à l’utilisateur.
- `agent_actions` : liste d’actions recommandées pour les agents internes (par exemple : “appeler GrowthAgent pour générer un calendrier de contenu”, “appeler DevAgent pour analyser un snippet de code”).
- `next_state` : suggestion de mise à jour de l’état du parcours (missions complétées, XP gagnée, phase suivante potentielle).

N’oublie pas : **JSON STRICTEMENT VALIDE, AUCUN TEXTE HORS JSON.**
```

---

# 3. JSON Schema – `JourneyStepResponse` et tous les blocs

## 3.1. Vue d’ensemble

Nous allons définir un **JSON Schema** pour le type de sortie de Zyno :

```json
JourneyStepResponse {
  metadata: {...},
  ui_blocks: UIBlock[],
  agent_actions: AgentAction[],
  next_state: NextState
}
```

Ce schema sera transmis à GPT-5.1 via la fonctionnalité **Structured Outputs** (`response_format.json_schema` avec `strict: true`) afin de garantir que la réponse respecte ce format. ([OpenAI][2])

---

## 3.2. JSON Schema complet (version simplifiée mais exploitable)

> **Remarque :** ce schema utilise `oneOf` pour le type discriminant `kind`, ce qui est supporté par Structured Outputs (avec certaines restrictions). ([OpenAI][2])

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
        "persona_id": {
          "type": "string",
          "description": "Identifiant du persona (ex: cognitive_activation_hub, capital_foundry, ...)"
        },
        "journey_track": {
          "type": "string",
          "description": "Track principal du parcours (ex: builder, growth, dao, migration_to_web3)"
        },
        "phase_id": {
          "type": "string",
          "enum": ["learn", "build", "prove", "activate", "scale"]
        },
        "language": {
          "type": "string",
          "enum": ["fr", "en"]
        },
        "title": {
          "type": "string",
          "description": "Titre court pour l'étape courante (ex: 'Tokenomics – Diagnostic initial')"
        },
        "summary": {
          "type": "string",
          "description": "Résumé très court de ce que propose cette étape."
        }
      },
      "additionalProperties": false
    },

    "ui_blocks": {
      "type": "array",
      "items": { "$ref": "#/definitions/UIBlock" }
    },

    "agent_actions": {
      "type": "array",
      "items": { "$ref": "#/definitions/AgentAction" }
    },

    "next_state": {
      "$ref": "#/definitions/NextState"
    }
  },

  "definitions": {
    "UIBlock": {
      "type": "object",
      "required": ["kind"],
      "properties": {
        "kind": { "type": "string" }
      },
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
        "items": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["label"],
            "properties": {
              "label": { "type": "string" },
              "checked": { "type": "boolean", "default": false }
            },
            "additionalProperties": false
          }
        }
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
        "questions": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["id", "question", "options", "correct_option_index", "explanation"],
            "properties": {
              "id": { "type": "string" },
              "question": { "type": "string" },
              "options": {
                "type": "array",
                "items": { "type": "string" },
                "minItems": 2
              },
              "correct_option_index": { "type": "integer", "minimum": 0 },
              "explanation": { "type": "string" }
            },
            "additionalProperties": false
          }
        }
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
        "mission_type": {
          "type": "string",
          "description": "Exemples : 'tokenomics_design', 'pitch_draft', 'solana_transaction', 'go_to_market_plan'."
        },
        "expected_input_type": {
          "type": "string",
          "enum": ["text", "markdown_document", "code_snippet", "link", "choice"]
        },
        "xp_reward": { "type": "integer", "minimum": 0 },
        "nft_reward_id": {
          "type": "string",
          "description": "Identifiant interne d'un potentiel NFT Reward (Proof-of-*), ou vide si aucun."
        },
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
        "resources": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["id", "label", "resource_type", "agent_owner"],
            "properties": {
              "id": { "type": "string" },
              "label": { "type": "string" },
              "description": { "type": "string" },
              "url": { "type": "string" },
              "resource_type": {
                "type": "string",
                "enum": ["article", "video", "template", "code_snippet", "checklist", "tool_link"]
              },
              "agent_owner": { "type": "string", "description": "Nom de l'agent qui recommande cette ressource." }
            },
            "additionalProperties": false
          }
        }
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
        "doc_type": {
          "type": "string",
          "description": "Ex: activation_thesis, tokenomics_one_pager, investor_pitch, governance_proposal"
        },
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
        "axes": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["name", "score", "max_score", "comment"],
            "properties": {
              "name": { "type": "string" },
              "score": { "type": "number" },
              "max_score": { "type": "number" },
              "comment": { "type": "string" }
            },
            "additionalProperties": false
          }
        }
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
        "suggestions": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["label", "action_id"],
            "properties": {
              "label": { "type": "string" },
              "action_id": {
                "type": "string",
                "description": "Identifiant d'action que le frontend ou le backend peut exploiter (ex: 'go_to_next_phase', 'open_mission_cf_tokenomics_1')."
              }
            },
            "additionalProperties": false
          }
        }
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
        "parameters": {
          "type": "object",
          "description": "Paramètres libres pour l'agent interne."
        }
      },
      "additionalProperties": false
    },

    "NextState": {
      "type": "object",
      "required": ["phase_id", "completed_missions", "xp_delta"],
      "properties": {
        "phase_id": {
          "type": "string",
          "description": "Phase actuelle ou prochaine phase suggérée."
        },
        "completed_missions": {
          "type": "array",
          "items": { "type": "string" }
        },
        "xp_delta": { "type": "integer" },
        "notes": { "type": "string" }
      },
      "additionalProperties": false
    }
  }
}
```

---

# 4. Exemple détaillé – “Phase Tokenomics – Builder Journey”

Nous allons maintenant donner un **exemple de réponse JSON** que Zyno pourrait produire pour :

* persona : `capital_foundry` ou `system_architect` (au choix),
* `journey_track`: `"builder"`,
* `phase_id`: `"build"` mais centrée sur la **tokenomics**,
* langue : français.

Cet exemple illustre concrètement l’utilisation des blocs :

* `text_block` (explication),
* `checklist_block` (préparation tokenomics),
* `mission_block` (concevoir un jeton),
* `resource_block` (ressources recommandées),
* `document_block` (tokenomics one-pager),
* `evaluation_block` (évaluation d’une version précédente),
* `action_suggestions_block` (choix de suite),
* `xp_block` (XP gagnée).

---

## 4.1. Exemple de JSON `JourneyStepResponse` pour “Tokenomics Builder Journey”

```json
{
  "metadata": {
    "persona_id": "capital_foundry",
    "journey_track": "builder",
    "phase_id": "build",
    "language": "fr",
    "title": "Atelier Tokenomics – Design de ton jeton sur Solana",
    "summary": "Dans cette étape, tu vas esquisser le design de ton jeton (utility, supply, allocations, mécanismes d'incitation) pour préparer ton launch sur l'Internet Capital Market Solana."
  },
  "ui_blocks": [
    {
      "kind": "text_block",
      "id": "tb_intro",
      "title": "Pourquoi la tokenomics est critique ?",
      "body_markdown": "Une bonne tokenomics aligne les incitations entre les fondateurs, les contributeurs, les investisseurs et la communauté. Elle doit éviter les schémas purement spéculatifs, définir des usages clairs du token (utility), garantir une distribution soutenable dans le temps, et prévoir des mécanismes de gouvernance réalistes."
    },
    {
      "kind": "checklist_block",
      "id": "cb_preflight",
      "title": "Checklist de préparation",
      "items": [
        { "label": "Tu as identifié au moins un **cas d'usage concret** pour ton token (utility).", "checked": false },
        { "label": "Tu as une **idée d'offre totale** (supply) et de la vitesse de déverrouillage.", "checked": false },
        { "label": "Tu as listé les **catégories d'allocations** (équipe, communauté, investisseurs, trésorerie, etc.).", "checked": false },
        { "label": "Tu as réfléchi à la place de la **gouvernance** (DAO ou non).", "checked": false }
      ]
    },
    {
      "kind": "mission_block",
      "id": "mission_tokenomics_draft",
      "title": "Esquisser ton design de token",
      "description": "Rédige une première version de ta tokenomics en décrivant : (1) l'utilité principale du token, (2) l'offre totale et le type de supply (fixe ou inflation contrôlée), (3) les grandes allocations (pourcentage par catégorie), (4) les mécanismes d'incitation (staking, récompenses, etc.), (5) les principaux risques que tu vois.",
      "mission_type": "tokenomics_design",
      "expected_input_type": "markdown_document",
      "xp_reward": 25,
      "nft_reward_id": "proof_of_tokenomics_builder_phase_build",
      "is_mandatory": true
    },
    {
      "kind": "resource_block",
      "id": "rb_tokenomics_resources",
      "title": "Ressources recommandées",
      "resources": [
        {
          "id": "res_tokenomics_intro",
          "label": "Introduction pratique à la tokenomics (article de synthèse)",
          "description": "Un article qui présente les concepts de base (utility, security, supply, vesting, etc.).",
          "url": "",
          "resource_type": "article",
          "agent_owner": "TokenomicsAgent"
        },
        {
          "id": "res_tokenomics_template",
          "label": "Template de fiche tokenomics (Markdown)",
          "description": "Un modèle que tu peux copier/coller pour structurer ta fiche tokenomics.",
          "url": "",
          "resource_type": "template",
          "agent_owner": "BuilderAgent"
        },
        {
          "id": "res_tokenomics_risks",
          "label": "Liste de risques courants dans la tokenomics",
          "description": "Une checklist des erreurs fréquentes (sur-allocation équipe, absence de vesting, inflation non maîtrisée...).",
          "url": "",
          "resource_type": "checklist",
          "agent_owner": "RiskAgent"
        }
      ]
    },
    {
      "kind": "document_block",
      "id": "doc_tokenomics_one_pager",
      "title": "Tokenomics One-Pager (brouillon généré)",
      "doc_type": "tokenomics_one_pager",
      "content_markdown": "# Tokenomics – One-Pager (brouillon)\n\n## 1. Mission du projet\n\n- Résumer en 2–3 phrases la mission de ton projet.\n\n## 2. Rôle du token\n\n- Utility principale :\n- Utility secondaires :\n\n## 3. Offre totale et dynamique\n\n- Offre totale :\n- Type de supply (fixe, inflationnaire, autre) :\n- Calendrier de déverrouillage (vesting) :\n\n## 4. Allocations\n\n- Équipe :\n- Communauté / Incentives :\n- Investisseurs :\n- Trésorerie / Fondation :\n- Autre :\n\n## 5. Mécanismes d'incitation\n\n- Staking / rewards :\n- Réductions de frais / utilité protocolaire :\n- Accès à des fonctionnalités premium :\n\n## 6. Gouvernance\n\n- Rôle du token dans la gouvernance (DAO ou non) :\n\n## 7. Principaux risques & garde-fous\n\n- Risque 1 + mitigation :\n- Risque 2 + mitigation :\n- Risque 3 + mitigation :"
    },
    {
      "kind": "quiz_block",
      "id": "quiz_tokenomics_basics",
      "title": "As-tu compris les bases de la tokenomics ?",
      "questions": [
        {
          "id": "q1",
          "question": "Quel est le principal objectif d'un vesting pour l'allocation équipe ?",
          "options": [
            "Permettre à l'équipe de vendre le plus vite possible.",
            "Lisser dans le temps l'accès aux tokens pour aligner les incitations à long terme.",
            "Augmenter artificiellement le prix du token."
          ],
          "correct_option_index": 1,
          "explanation": "Le vesting permet d'éviter que l'équipe ne vende trop tôt, en alignant son intérêt sur la réussite à long terme du projet."
        },
        {
          "id": "q2",
          "question": "Laquelle de ces affirmations est la plus saine pour une tokenomics ?",
          "options": [
            "La majorité de l'offre est réservée à l'équipe fondatrice.",
            "L'utilité du token est clairement définie dans le produit et la communauté est incentivée à l'utiliser.",
            "Le token ne sert qu'à spéculer sur un DEX."
          ],
          "correct_option_index": 1,
          "explanation": "Une tokenomics saine repose sur une utilité réelle du token dans le produit, pas uniquement sur la spéculation."
        }
      ]
    },
    {
      "kind": "evaluation_block",
      "id": "eval_previous_tokenomics",
      "title": "Évaluation (si tu avais déjà proposé une tokenomics)",
      "global_score": 7.5,
      "max_score": 10,
      "feedback": "Ta première version montre une bonne compréhension des bases, mais certaines allocations sont encore trop favorables à l'équipe et les mécanismes d'incitation demandent à être précisés.",
      "axes": [
        {
          "name": "Clarté de l'utilité du token",
          "score": 8,
          "max_score": 10,
          "comment": "Utilité principale bien identifiée, tu peux ajouter encore un ou deux cas d'usage concrets."
        },
        {
          "name": "Répartition de l'offre (allocations)",
          "score": 6,
          "max_score": 10,
          "comment": "L'allocation équipe est un peu élevée, pense à renforcer la part communauté / incentives."
        },
        {
          "name": "Mécanismes d'incitation",
          "score": 7,
          "max_score": 10,
          "comment": "Les grandes idées sont là, mais le design des rewards (quantités, durée) reste trop général."
        }
      ]
    },
    {
      "kind": "action_suggestions_block",
      "id": "asb_next_steps",
      "title": "Prochaines actions possibles",
      "suggestions": [
        {
          "label": "Je veux rédiger ma tokenomics en utilisant le template proposé.",
          "action_id": "open_mission_tokenomics_draft"
        },
        {
          "label": "Je veux revoir d'abord les bases (relire les ressources recommandées).",
          "action_id": "review_tokenomics_resources"
        },
        {
          "label": "Je veux passer à un scénario de simulation de launch (pricing & liquidité).",
          "action_id": "go_to_launch_simulation"
        }
      ]
    },
    {
      "kind": "xp_block",
      "id": "xp_tokenomics_step",
      "title": "Progression de ton parcours",
      "current_xp": 120,
      "gained_xp": 25,
      "next_level_xp": 150,
      "comment": "En validant cette mission tokenomics, tu approches du prochain seuil d'XP. Cela déverrouillera de nouveaux ateliers sur la mise en liquidité et la gouvernance DAO."
    }
  ],
  "agent_actions": [
    {
      "agent_name": "TokenomicsAgent",
      "reason": "L'utilisateur va rédiger une première version de sa tokenomics.",
      "action": "prepare_tokenomics_review",
      "parameters": {
        "mission_id": "mission_tokenomics_draft"
      }
    },
    {
      "agent_name": "GrowthAgent",
      "reason": "Une fois la tokenomics plus stable, il faudra préparer la communication autour du launch.",
      "action": "suggest_content_calendar",
      "parameters": {
        "focus": "tokenomics_education"
      }
    }
  ],
  "next_state": {
    "phase_id": "build",
    "completed_missions": [],
    "xp_delta": 25,
    "notes": "Attendre la soumission de la mission 'mission_tokenomics_draft' pour déclencher l'évaluation détaillée et le potentiel mint du NFT de Proof-of-Tokenomics."
  }
}
```

---

# 5. Résumé des points clés pour l’agent Warp

1. **Utiliser GPT-5.1 via `/v1/responses`** :

   * `model: "gpt-5.1"`,
   * `input`: texte concaténant :

     * instructions système (prompt de Zyno),
     * contexte (JSON du journey_state sérialisé),
     * entrée utilisateur,
   * `response_format: { "type": "json_schema", "json_schema": { "name": "JourneyStepResponse", "schema": { ... }, "strict": true } }`,
   * `max_output_tokens` adapté (ex. 1500). ([developers.openai.com][1])

2. **Toujours vérifier** :

   * que le JSON retourné est valide (parser, logger les erreurs),
   * en cas d’échec, relancer un appel avec un message d’erreur plus guidant dans le prompt.

3. **Implémenter le mapping front** :

   * `ui_blocks` → composants React,
   * `agent_actions` → logs d’activité + déclenchement éventuel d’autres agents,
   * `next_state` → mise à jour du store (Zustand / Redux) du Journey Simulator.

4. **Préparer la future intégration RAG** :

   * aujourd’hui, GPT-5.1 répond sans RAG,
   * demain, tu peux ajouter une “tool” de recherche (`file_search`, RAG maison) via la Responses API, en laissant Zyno décider quand l’appeler. ([OpenAI][4])

Avec ces éléments, on dispose :

* d’un **prompt système complet** pour Zyno,
* d’un **schema JSON structuré** pour les blocs UI,
* d’un **exemple concret** pour la phase “Tokenomics – Builder Journey”,
* et d’une **démarche claire** pour intégrer GPT-5.1 dans la logique métier des parcours.

