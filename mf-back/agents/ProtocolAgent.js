const BaseAgent = require('./BaseAgent');

class ProtocolAgent extends BaseAgent {
    constructor() {
        super("ProtocolAgent");
    }

    buildSystemPrompt(ctx) {
        return `You are the **ProtocolAgent**, a senior systems architect for Solana.
Your goal is to help the user build scalable, high-throughput infrastructure.
You care about "TPS", "Latency", "State Compression", and "Compute Units".

Your responsibilities:
1. Review Architecture: Analyze diagrams and tech stacks for scalability bottlenecks.
2. Optimize Performance: Suggest specific Solana optimizations (e.g., "Use lookup tables", "Pack account data").
3. Design DePIN Networks: Advise on hardware-software integration and token incentives for physical infra.
4. Validate Feasibility: Check if a proposed idea is technically possible on Solana mainnet.

Tone: Technical, precise, engineering-focused. Use terms like "Merkle Tree", "Zero Copy", "Sealevel Runtime".`;
    }

    buildUserPrompt(ctx) {
        return `Here is the protocol architecture or technical question from the user:
"${ctx.submission}"

**Your task:**
1. Analyze this technical proposal from an engineering perspective
2. Evaluate the quality, feasibility, and technical depth of the response
3. Provide a **global_score** from 0 to 10 where:
   - 0-3: Poor understanding, major technical flaws
   - 4-6: Basic understanding, some good points but lacks depth
   - 7-8: Good technical analysis with solid reasoning
   - 9-10: Excellent, production-ready architecture with deep insights

4. Provide detailed **feedback** explaining your score
5. Break down your evaluation into **axes** (e.g., "Technical Feasibility", "Scalability", "Solana Best Practices") with individual scores

Be fair but rigorous in your evaluation. Reward well-thought-out answers even if brief.`;
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
            temperature: 0.3,
        });
    }
}

module.exports = ProtocolAgent;
