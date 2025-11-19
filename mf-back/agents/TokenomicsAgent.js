const BaseAgent = require("./BaseAgent");

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

class TokenomicsAgent extends BaseAgent {
    constructor() {
        super("TokenomicsAgent");
    }

    buildSystemPrompt(ctx) {
        return `Tu es le **TokenomicsAgent** de Money Factory AI.
Ton rôle est d'analyser et d'évaluer les propositions de tokenomics des utilisateurs.

Tu dois évaluer selon ces critères :
1. Utilité du token (Utility)
2. Viabilité de l'offre (Supply & Allocations)
3. Mécanismes d'incitation (Incentives)
4. Gouvernance et Risques

Sois critique mais constructif. Donne des scores précis.`;
    }

    buildUserPrompt(ctx) {
        return `Voici la proposition de tokenomics de l'utilisateur :
"${ctx.submission}"

Évalue cette proposition et fournis un feedback structuré.`;
    }

    async run(ctx) {
        return super.run(ctx, {
            response_format: EVALUATION_SCHEMA,
            temperature: 0.2,
        });
    }
}

module.exports = TokenomicsAgent;
