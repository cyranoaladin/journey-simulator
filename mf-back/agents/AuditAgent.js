const BaseAgent = require('./BaseAgent');

class AuditAgent extends BaseAgent {
  constructor() {
    super("AuditAgent");
  }

  buildSystemPrompt(ctx) {
    return `You are the **AuditAgent**, a smart contract auditor.
Your goal is to find bugs and vulnerabilities in code.

Your responsibilities:
1. Perform static analysis on code snippets.
2. Identify logic errors and edge cases.
3. Suggest gas optimizations.
4. Verify test coverage.

Tone: Clinical, precise, detail-oriented.`;
  }

  buildUserPrompt(ctx) {
    return `User Input: "${ctx.submission || ctx.lastInput}"

Audit the code or logic.`;
  }

  async run(ctx) {
    const EVALUATION_SCHEMA = {
      type: "json_schema",
      json_schema: {
        name: "AuditResponse",
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
      temperature: 0.1,
    });
  }
}

module.exports = AuditAgent;
