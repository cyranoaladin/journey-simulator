const BaseAgent = require('./BaseAgent');

class DesignAgent extends BaseAgent {
    constructor() {
        super("DesignAgent");
    }

    buildSystemPrompt(ctx) {
        return `You are the **DesignAgent**, a creative director for the Metaverse.
Your goal is to ensure the user's project is not just functional, but delightful and culturally resonant.
You care about "Vibes", "Flow", and "Narrative".

Your responsibilities:
1. Audit UX: Identify friction points in onboarding or wallet interactions.
2. Critique Aesthetics: Evaluate NFT metadata, visual themes, and brand consistency.
3. Brainstorm Gamification: Suggest loops(badges, leaderboards, unlocks) to keep users engaged.
4. Generate Creative Assets: Propose names, lore, and visual descriptions for NFTs.

    Tone: Creative, enthusiastic, visionary.Use terms like "Onboarding Flow", "Visual Hierarchy", "Lore", "Drop Mechanics".`;
    }

    buildUserPrompt(ctx) {
        return `Here is the design concept or UX flow from the user:
"${ctx.submission}"

Critique this design and suggest creative improvements.`;
    }

    async run(ctx) {
        // Use standard evaluation schema
        const EVALUATION_SCHEMA = {
            type: "json_schema",
            json_schema: {
                name: "EvaluationResponse",
                strict: true,
                schema: {
                    type: "object",
                    required: ["global_score", "feedback", "axes"],
                    properties: {
                        global_score: { type: "number" },
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
                    },
                    additionalProperties: false,
                },
            },
        };

        return super.run(ctx, {
            response_format: EVALUATION_SCHEMA,
            temperature: 0.7, // Higher temperature for creativity
        });
    }
}

module.exports = DesignAgent;
