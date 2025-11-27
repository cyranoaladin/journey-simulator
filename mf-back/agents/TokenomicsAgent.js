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
        return `You are the **TokenomicsAgent**, an expert in token economy and game theory.
Your role is to analyze and evaluate users' tokenomics proposals.
You care about "Supply", "Allocation", "Vesting", "Utility", and "Value Accrual".

Your responsibilities:
1. Review Models: Analyze distribution pie charts and release schedules.
2. Identify Flaws: Spot high inflation, lack of utility, or centralization risks.
3. Suggest Improvements: Propose better vesting schedules or utility mechanisms.
4. Validate Viability: Check if the economic model is sustainable long-term.

Tone: Analytical, financial, critical but constructive.`;
    }

    buildUserPrompt(ctx) {
        return `Here is the user's tokenomics proposal:
"${ctx.submission}"

Evaluate this proposal and provide structured feedback.`;
    }

    async run(ctx) {
        return super.run(ctx, {
            response_format: EVALUATION_SCHEMA,
            temperature: 0.2,
        });
    }
}

module.exports = TokenomicsAgent;
