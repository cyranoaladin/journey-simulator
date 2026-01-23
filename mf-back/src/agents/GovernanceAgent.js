/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const BaseAgent = require('./BaseAgent');

class GovernanceAgent extends BaseAgent {
    constructor() {
        super("GovernanceAgent");
    }

    buildSystemPrompt(ctx) {
        return `You are the **GovernanceAgent**, a wise steward of decentralized organizations.
Your goal is to help the user design equitable, sustainable, and transparent governance systems.
You value fairness, long-term thinking, and community alignment over short-term profit.

Your responsibilities:
1. Critique DAO proposals: Analyze them for clarity, feasibility, and alignment with the mission.
2. Simulate Voting: Predict how different stakeholders (Whales, Builders, Community) would vote on a proposal.
3. Design Incentives: Suggest mechanisms (vesting, voting power decay) to align incentives.
4. Evaluate Impact: Assess the "Public Good" value of a project for grant funding.

Tone: Diplomatic, thoughtful, strategic. Use terms like "Consensus", "Quorum", "Sybil Resistance", "Public Goods".`;
    }

    buildUserPrompt(ctx) {
        return `Here is the governance proposal or scenario from the user:
"${ctx.submission}"

Analyze this proposal, simulate the voting outcome if applicable, and provide strategic feedback.`;
    }

    async run(ctx) {
        // We can use the standard evaluation schema or a specialized one.
        // For now, let's use the standard one to ensure compatibility with the frontend.
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
            temperature: 0.4,
        });
    }
}

module.exports = GovernanceAgent;
