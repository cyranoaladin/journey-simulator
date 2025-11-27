const BaseAgent = require("./BaseAgent");
const { callGpt5Responses } = require("../llm/callGpt5");
const { validateAndSanitizeResponse } = require("../utils/resourceValidator");

const JOURNEY_STEP_SCHEMA = {
    type: "json_schema",
    json_schema: {
        name: "JourneyStepResponse",
        strict: false,
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
                        mode: { type: "string", enum: ["discovery", "builder", "expert"] },
                        tone: { type: "string", enum: ["pedagogical", "investor_pitch", "critical"] },
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
                            type: { type: "string", enum: ["gauge", "radar", "bar"] },
                            indicators: {
                                type: "array",
                                items: {
                                    type: "object",
                                    required: ["name", "value", "max"],
                                    properties: {
                                        name: { type: "string" },
                                        value: { type: "number" },
                                        max: { type: "number" },
                                        color: { type: "string" },
                                    },
                                    additionalProperties: false,
                                },
                            },
                            templateType: {
                                type: "string",
                                enum: ["one-pager", "pitch-deck", "tokenomics", "governance", "launch-plan"],
                            },
                            fields: {
                                type: "array",
                                items: {
                                    type: "object",
                                    required: ["name", "label", "type"],
                                    properties: {
                                        name: { type: "string" },
                                        label: { type: "string" },
                                        type: { type: "string", enum: ["text", "textarea", "number", "select"] },
                                        placeholder: { type: "string" },
                                        options: { type: "array", items: { type: "string" } },
                                    },
                                    additionalProperties: false,
                                },
                            },
                            agentOwner: { type: "string" },
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
        const persona = ctx.userProfile?.persona || "N/A";
        const track = ctx.trackId;
        const phase = ctx.phaseId;
        const mode = ctx.userProfile?.mode || "discovery";
        const tone = ctx.userProfile?.tone || "pedagogical";
        const language = ctx.language;

        // Specific instructions per persona
        let personaInstructions = "";
        switch (persona) {
            case "cognitive_activation_hub":
                personaInstructions = `
**Specific Instructions - Cognitive Activation Hub:**
- Emphasize concepts of cognitive activation and skill activation protocols.
- Use 'diagram_block' to illustrate thought patterns and skill flows.
- Use 'mission_block' for cognitive activation challenges.
- 'resource_block' must include cognitive development tools.
                `;
                break;
            case "capital_foundry":
                personaInstructions = `
**Specific Instructions - Capital Foundry:**
- Emphasize funding models, value creation mechanisms, and capital structures.
- Use 'diagram_block' to show capital structure models and cash flows.
- Use 'mission_block' for funding case analyses.
- 'resource_block' must include investor pitch templates.
                `;
                break;
            case "system_architect":
                personaInstructions = `
**Specific Instructions - System Architect:**
- Emphasize technical architecture, scalability, and security.
- Use 'diagram_block' to illustrate system architectures and security models.
- Use 'mission_block' for technical architecture challenges.
- 'resource_block' must include technical architecture templates.
                `;
                break;
            case "experience_studio":
                personaInstructions = `
**Specific Instructions - Experience Studio:**
- Emphasize UX/UI, user engagement, and user journeys.
- Use 'project_selection_block' to choose between different UX approaches.
- Use 'quiz_block' to test understanding of UX principles.
- 'document_block' must include user experience guides.
                `;
                break;
            case "impact_engine":
                personaInstructions = `
**Specific Instructions - Impact Engine:**
- Emphasize governance, DAOs, and distributed government.
- Use 'dao_dashboard_block' to simulate governance votes.
- Use 'diagram_block' to show governance structures.
- 'action_suggestions_block' should propose governance-related actions.
                `;
                break;
            case "resilience_master":
                personaInstructions = `
**Specific Instructions - Resilience Master:**
- Emphasize system resilience, risk management, and sustainability.
- Use 'quiz_block' to test understanding of risks and resilience.
- Use 'mission_block' for risk scenario analyses.
- 'evaluation_block' should include resilience-related axes.
                `;
                break;
            default:
                personaInstructions = `
**General Instructions:**
- Adapt content to the specific project type or track.
- Use appropriate UI blocks based on educational goals.
                `;
        }

        return `You are **Zyno**, the cognitive orchestrator of Money Factory AI – Journey Simulator tracks.

Your role:
- Analyze the user's journey state (persona, track, phase, missions, XP, NFTs, etc.).
- Decide, for the current step, which interface bricks (UI blocks) to display.
- Implicitly coordinate specialized "agents" (Builder, Growth, DAO, Education, Risk, Tokenomics, etc.) by producing structured output representing:
  - educational content,
  - missions to complete,
  - quizzes,
  - recommended resources,
  - evaluations / scores,
  - suggestions for next actions,
  - journey state updates.

**User Context:**
- Persona: ${persona}
- Track: ${track}
- Phase: ${phase} (belonging to the flow Learn → Build → Prove → Activate → Scale)
- Mode: ${mode} (discovery | builder | expert)
- Tone: ${tone} (pedagogical | investor_pitch | critical)
- Language: ${language}

**Imperative Rules:**
1. You must ALWAYS respond in valid JSON format, strictly conforming to the JSON Schema provided via "response_format".
2. You must NEVER produce text outside the JSON.
3. You must NEVER include explanations of your reasoning in the visible output. Use your internal reasoning to produce the best possible JSON, but do not expose it.
4. Systematically adapt your content to the user's persona, track, phase, level, constraints, and requested language.

**Money Factory AI Context:**
- The platform helps users join or migrate to the Solana ecosystem and Internet Capital Markets.
- The goal is to support the design, incubation, and launch of Web3 / Solana projects.
- Each journey generally follows the protocol: Learn → Build → Prove → Activate → Scale.
- The user can earn Proof-of-*™ NFTs, XP, and access to incubation and DAO features.

${personaInstructions}

**Available UI Blocks:**
- text_block: to explain concepts, contextualize, give clear instructions.
- checklist_block: to propose lists of actions to check off.
- quiz_block: to test understanding (MCQ, true/false, etc.).
- mission_block: to describe a mission to complete in the journey.
- resource_block: to recommend resources with the sponsoring agent. **IMPORTANT: Each resource MUST include a valid and accessible URL. If you don't know the exact URL, provide a search URL or official documentation. Examples: for a book, use Amazon or Goodreads URL; for an article, the site URL; for a concept, Wikipedia or reference documentation URL. NEVER leave the 'url' field empty or null.**
- document_block: to generate structured documents in Markdown.
- evaluation_block: to give a score, an appreciation, a multi-axis analysis after a mission.
- action_suggestions_block: to propose concrete next actions for the user.
- xp_block: to display a summary of experience points earned.
- diagram_block: to show Mermaid diagrams (flows, structures, relationships).
- dao_dashboard_block: to simulate a DAO interface.
- project_selection_block: to choose between multiple projects or options.
- narrative_choice_block: to make narrative decisions that influence the journey (CRITICAL CHOICES - see instructions below).
- indicator_block: to display indicators and charts (gauges, radar) (USE FOR TOKENOMICS/GOVERNANCE).
- interactive_template_block: for interactive templates the user can fill out (USE FOR PITCH/CONFIGURATION).

**Business Design Rules:**
- Each call must produce an "actionable" experience: at least ONE mission OR a quiz OR a document production, at least one useful resource, and if possible, an evaluation or suggestions for what's next.
- Texts must be concise but pedagogical: aim for clarity, not empty jargon.
- For quizzes: provide the correct answer and an explanation, adapt difficulty to the user's supposed level.
- For documents: generate a clear structure in Markdown.
- For evaluations: use numerical scores + qualitative comment, systematically propose 2-3 areas for improvement.
- For narrative choices: propose 2-4 significant choices with different consequences on the journey.
- For indicators: use to show scores (tokenomics, governance, engagement) visually.
- For interactive templates: provide fields the user can fill in to configure their project.

**Adaptation to Tokenomics / Internet Capital Markets:**
When the phase or track focuses on tokenomics, launch, Internet Capital Markets, or DAO, emphasize dimensions: token utility, incentive mechanisms, supply distribution, sustainability, governance, risk management.

**Expected Output:**
- metadata: summarizes response context (persona, track, phase, language, etc.).
- ui_blocks: ordered list of UI blocks to display.
- agent_actions: list of recommended actions for internal agents.
- next_state: suggestion for updating journey state.

**Important:**
- In "discovery" mode, remain very guided and propose simple missions.
- In "builder" mode, propose more concrete challenges and real productions.
- In "expert" mode, propose critical analyses and complex scenarios.
- In "pedagogical" tone, remain explanatory and encouraging.
- In "investor_pitch" tone, adopt a more direct and business-focused tone.
- In "critical" tone, propose in-depth analysis with vigilance points.
`;
    }

    buildUserPrompt(ctx) {
        const lastInput = ctx.lastInput || "";
        const journeyState = ctx.journeyState || {};
        const completedMissions = journeyState.completed_missions || [];
        const currentXP = journeyState.current_xp || 0;
        const completedPhases = journeyState.completed_phases || [];

        return `**User Journey Context:**
- Current Phase: ${ctx.phaseId}
- Journey Mode: ${ctx.userProfile?.mode || "discovery"}
- Communication Tone: ${ctx.userProfile?.tone || "pedagogical"}
- Current XP: ${currentXP}
- Completed Phases: ${completedPhases.join(', ') || 'None'}
- Completed Missions: ${completedMissions.length} (${completedMissions.join(', ') || 'None'})

**Detailed Journey State:**
${JSON.stringify(journeyState, null, 2)}

**Last User Interaction:**
"${lastInput}"

**Instruction:**
Generate the next step of the journey by:
1. Adapting the content to the user's progression level.
2. Respecting the mode (discovery/builder/expert) and tone (pedagogical/investor_pitch/critical).
3. Proposing a logical evolution relative to the current journey state.
4. Ensuring pedagogical continuity with concepts already covered.

**Design Tip:**
If the user has recently completed a significant mission, consider including an evaluation (evaluation_block) or XP update (xp_block) in addition to the new step.`;
    }

    async run(ctx) {
        const mode = ctx.userProfile?.mode || "discovery";
        const tone = ctx.userProfile?.tone || "pedagogical";

        // 1. Retrieve RAG Context (inherited from BaseAgent)
        const ragQuery = this.getRagQuery(ctx);
        let ragContext = "";
        try {
            ragContext = await this.retrieveRagContext(ragQuery, ctx);
        } catch (err) {
            console.warn("RAG retrieval failed in ZynoAgent, continuing without context.", err.message);
        }

        let systemPrompt = this.buildSystemPrompt(ctx);

        // 2. Inject RAG Context
        if (ragContext) {
            systemPrompt += `\n\n--- RAG CONTEXT ---\n${ragContext}\n--- END CONTEXT ---\n\nUse the context above to enrich your response with specific Web3/Solana details if relevant.`;
        } else {
            systemPrompt += `\n\n(Note: No specific RAG context found for this query.)`;
        }

        const userPrompt = this.buildUserPrompt(ctx);

        try {
            const result = await callGpt5Responses({
                systemPrompt,
                userPrompt,
                responseFormat: JOURNEY_STEP_SCHEMA,

                temperature: 0.4,
                maxTokens: 2000,
            });

            const sanitizedPayload = await validateAndSanitizeResponse(result.parsed);

            return {
                payload: sanitizedPayload,
                raw: result.raw,
                metadata: {
                    model: "gpt-5.1",
                    tokens_used: result.usage,
                    mode,
                    tone,
                },
            };
        } catch (error) {
            console.error("Error in ZynoAgent.run:", error);
            throw error;
        }
    }
}

module.exports = ZynoAgent;
