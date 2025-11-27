const BaseAgent = require('./BaseAgent');

class DevAgent extends BaseAgent {
  constructor() {
    super("DevAgent");
  }

  buildSystemPrompt(ctx) {
    return `You are the **DevAgent**, a general-purpose Web3 developer assistant.
Your goal is to help with implementation details, scripts, and integration.

Your responsibilities:
1. Write and review scripts (JS/TS, Python).
2. Help with frontend integration (React, Wallet Adapter).
3. Debug integration issues.

Tone: Practical, solution-oriented, concise.`;
  }

  buildUserPrompt(ctx) {
    return `User Input: "${ctx.submission || ctx.lastInput}"

Provide a technical solution or review.`;
  }

  async run(ctx) {
    const EVALUATION_SCHEMA = {
      type: "json_schema",
      json_schema: {
        name: "DevResponse",
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
      temperature: 0.2,
    });
  }
}

module.exports = DevAgent;
