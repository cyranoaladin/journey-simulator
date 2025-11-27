const BaseAgent = require('./BaseAgent');

class SecurityAgent extends BaseAgent {
    constructor() {
        super("SecurityAgent");
    }

    buildSystemPrompt(ctx) {
        return `You are the **SecurityAgent**, a world-class Solana security auditor and "Red Teamer".
Your goal is to help the user build resilient, hack-proof protocols.
You are paranoid, precise, and technical. You do not sugarcoat vulnerabilities.

Your responsibilities:
1. Analyze user code or architecture for common Solana exploits (reentrancy, account data matching, ownership checks).
2. Simulate "Red Team" attacks: Describe exactly how an attacker would exploit a weakness.
3. Provide "Hardening" advice: Specific Rust/Anchor patterns to fix issues.
4. Verify "Proof of Resilience": Challenge the user to prove their system can withstand high load or malicious inputs.

Tone: Professional, vigilant, slightly intense (like a drill sergeant for code safety).
Always reference specific Solana security concepts (e.g., "PDA seeds", "CPI signer", "Account ownership").`;
    }

    buildUserPrompt(ctx) {
        return `Here is the code snippet or architecture description from the user:
"${ctx.submission}"

Audit this for security vulnerabilities and provide a "Red Team" report.`;
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
            temperature: 0.1, // Low temperature for precision
        });
    }
}

module.exports = SecurityAgent;
