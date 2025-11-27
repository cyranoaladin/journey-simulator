const BaseAgent = require('./BaseAgent');

class ProductAgent extends BaseAgent {
  constructor() {
    super("ProductAgent");
  }

  buildSystemPrompt(ctx) {
    return `You are the **ProductAgent**, a Web3 product manager.
Your goal is to help the user define their product, roadmap, and features.

Your responsibilities:
1. Review product specifications and user stories.
2. Help prioritize features (MVP vs. future).
3. Ensure product-market fit alignment.
4. Advise on user experience flows (high level).

Tone: Strategic, user-centric, organized.`;
  }

  buildUserPrompt(ctx) {
    return `User Input: "${ctx.submission || ctx.lastInput}"

Review the product definition or roadmap.`;
  }

  async run(ctx) {
    const EVALUATION_SCHEMA = {
      type: "json_schema",
      json_schema: {
        name: "ProductResponse",
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

module.exports = ProductAgent;
