const BaseAgent = require("./BaseAgent");

const JOURNEY_STEP_SCHEMA = {
    type: "json_schema",
    json_schema: {
        name: "JourneyStepResponse",
        strict: true,
        schema: {
            type: "object",
            required: ["metadata", "ui_blocks", "agent_actions", "next_state"],
            properties: {
                metadata: {
                    type: "object",
                    required: ["persona_id", "journey_track", "phase_id", "language"],
                    properties: {
                        persona_id: { type: "string" },
                        journey_track: { type: "string" },
                        phase_id: { type: "string", enum: ["learn", "build", "prove", "activate", "scale"] },
                        language: { type: "string", enum: ["fr", "en"] },
                        title: { type: "string" },
                        summary: { type: "string" },
                    },
                    additionalProperties: false,
                },
                ui_blocks: {
                    type: "array",
                    items: {
                        type: "object",
                        required: ["kind", "id"],
                        properties: {
                            kind: {
                                type: "string",
                                enum: [
                                    "text_block",
                                    "checklist_block",
                                    "quiz_block",
                                    "mission_block",
                                    "resource_block",
                                    "document_block",
                                    "evaluation_block",
                                    "action_suggestions_block",
                                    "xp_block",
                                    "diagram_block",
                                    "dao_dashboard_block",
                                    "project_selection_block",
                                ],
                            },
                            id: { type: "string" },
                            title: { type: "string" },
                            body_markdown: { type: "string" },
                            items: {
                                type: "array",
                                items: {
                                    type: "object",
                                    required: ["label"],
                                    properties: {
                                        label: { type: "string" },
                                        checked: { type: "boolean" },
                                    },
                                    additionalProperties: false,
                                },
                            },
                            questions: {
                                type: "array",
                                items: {
                                    type: "object",
                                    required: ["id", "question", "options", "correct_option_index", "explanation"],
                                    properties: {
                                        id: { type: "string" },
                                        question: { type: "string" },
                                        options: { type: "array", items: { type: "string" } },
                                        correct_option_index: { type: "integer" },
                                        explanation: { type: "string" },
                                    },
                                    additionalProperties: false,
                                },
                            },
                            description: { type: "string" },
                            mission_type: { type: "string" },
                            expected_input_type: {
                                type: "string",
                                enum: ["text", "markdown_document", "code_snippet", "link", "choice"],
                            },
                            xp_reward: { type: "integer" },
                            nft_reward_id: { type: "string" },
                            is_mandatory: { type: "boolean" },
                            resources: {
                                type: "array",
                                items: {
                                    type: "object",
                                    required: ["id", "label", "resource_type", "agent_owner"],
                                    properties: {
                                        id: { type: "string" },
                                        label: { type: "string" },
                                        description: { type: "string" },
                                        url: { type: "string" },
                                        resource_type: { type: "string" },
                                        agent_owner: { type: "string" },
                                    },
                                    additionalProperties: false,
                                },
                            },
                            doc_type: { type: "string" },
                            content_markdown: { type: "string" },
                            global_score: { type: "number" },
                            max_score: { type: "number" },
                            feedback: { type: "string" },
                            axes: {
                                type: "array",
                                items: {
                                    type: "object",
                                    required: ["name", "score", "max_score", "comment"],
                                    properties: {
                                        name: { type: "string" },
                                        score: { type: "number" },
                                        max_score: { type: "number" },
                                        comment: { type: "string" },
                                    },
                                    additionalProperties: false,
                                },
                            },
                            suggestions: {
                                type: "array",
                                items: {
                                    type: "object",
                                    required: ["label", "action_id"],
                                    properties: {
                                        label: { type: "string" },
                                        action_id: { type: "string" },
                                    },
                                    additionalProperties: false,
                                },
                            },
                            current_xp: { type: "integer" },
                            gained_xp: { type: "integer" },
                            next_level_xp: { type: "integer" },
                            comment: { type: "string" },
                            diagram_type: { type: "string", enum: ["mermaid"] },
                            content: { type: "string" },
                            caption: { type: "string" },
                            votingPower: { type: "integer" },
                            proposals: {
                                type: "array",
                                items: {
                                    type: "object",
                                    required: ["id", "title", "description", "votesFor", "votesAgainst", "status", "endDate"],
                                    properties: {
                                        id: { type: "string" },
                                        title: { type: "string" },
                                        description: { type: "string" },
                                        votesFor: { type: "integer" },
                                        votesAgainst: { type: "integer" },
                                        status: { type: "string", enum: ["active", "passed", "rejected"] },
                                        endDate: { type: "string" },
                                    },
                                    additionalProperties: false,
                                },
                            },
                            projects: {
                                type: "array",
                                items: {
                                    type: "object",
                                    required: ["id", "name", "description", "tags", "fundingGoal", "currentFunding"],
                                    properties: {
                                        id: { type: "string" },
                                        name: { type: "string" },
                                        description: { type: "string" },
                                        tags: { type: "array", items: { type: "string" } },
                                        fundingGoal: { type: "number" },
                                        currentFunding: { type: "number" },
                                    },
                                    additionalProperties: false,
                                },
                            },
                        },
                        additionalProperties: false,
                    },
                },
                agent_actions: {
                    type: "array",
                    items: {
                        type: "object",
                        required: ["agent_name", "reason", "action"],
                        properties: {
                            agent_name: { type: "string" },
                            reason: { type: "string" },
                            action: { type: "string" },
                            parameters: { type: "object", additionalProperties: true },
                        },
                        additionalProperties: false,
                    },
                },
                next_state: {
                    type: "object",
                    required: ["phase_id", "completed_missions", "xp_delta"],
                    properties: {
                        phase_id: { type: "string" },
                        completed_missions: { type: "array", items: { type: "string" } },
                        xp_delta: { type: "integer" },
                        notes: { type: "string" },
                    },
                    additionalProperties: false,
                },
            },
            additionalProperties: false,
        },
    },
};

class ZynoAgent extends BaseAgent {
    constructor() {
        super("Zyno");
    }

    buildSystemPrompt(ctx) {
        return `Tu es **Zyno**, l’orchestrateur cognitif des parcours de Money Factory AI – Journey Simulator.

Ton rôle :
- Analyser l’état du parcours d’un utilisateur.
- Décider, pour l’étape courante, quelles briques d’interface (blocs UI) afficher.
- Coordonner les agents spécialisés.

**Contexte :**
- Persona: ${ctx.userProfile?.persona || "N/A"}
- Track: ${ctx.trackId}
- Phase: ${ctx.phaseId}
- Langue: ${ctx.language}

**Règles :**
1. Tu dois TOUJOURS répondre sous la forme d’un objet JSON valide, strictement conforme au JSON Schema fourni.
2. Tu NE DOIS JAMAIS produire de texte en dehors du JSON.
3. Adapte le contenu au persona et au niveau de l'utilisateur.

**Instructions Spécifiques par Parcours (Curriculum) :**
- **Impact Engine (DAO & Governance) :**
  - Utilise 'dao_dashboard_block' pour simuler des votes sur des propositions de gouvernance.
  - Utilise 'diagram_block' (Mermaid) pour visualiser les structures de gouvernance (ex: Conseil vs Communauté).
- **DeFi Hedge Fund (Tokenomics & Finance) :**
  - Utilise 'diagram_block' pour montrer les flux de tokens (Token Flow) ou les mécanismes de staking.
  - Utilise 'resource_block' (type: flashcard) pour enseigner des concepts complexes comme "Impermanent Loss" ou "Bonding Curve".
- **Meme Coin (Community & Viral) :**
  - Utilise 'project_selection_block' pour choisir des partenariats ou des stratégies de lancement.
  - Utilise 'quiz_block' pour tester la connaissance de la culture crypto.

**Blocs UI disponibles :**
- text_block, checklist_block, quiz_block, mission_block, resource_block, document_block, evaluation_block, action_suggestions_block, xp_block, diagram_block, dao_dashboard_block, project_selection_block.

**Sortie attendue :**
- metadata, ui_blocks, agent_actions, next_state.
`;
    }

    buildUserPrompt(ctx) {
        const lastInput = ctx.lastInput || "";
        const stateSummary = JSON.stringify(ctx.journeyState || {});
        return `État actuel du parcours : ${stateSummary}
Dernière entrée utilisateur : "${lastInput}"
Génère la prochaine étape du parcours.`;
    }

    async run(ctx) {
        // Use the specific schema for Zyno
        return super.run(ctx, {
            response_format: JOURNEY_STEP_SCHEMA,
            temperature: 0.4,
        });
    }
}

module.exports = ZynoAgent;
