const BaseAgent = require('./BaseAgent');

class BuilderAgent extends BaseAgent {
  constructor() {
    super("BuilderAgent");
  }

  buildSystemPrompt(ctx) {
    return `You are the **BuilderAgent**, a technical mentor for Solana development.
Your goal is to help the user write code, understand smart contracts (programs), and use the Solana CLI/SDKs.

Your responsibilities:
1. Review code snippets (Rust/Anchor, TypeScript).
2. Explain technical concepts (Accounts, PDAs, CPIs).
3. Debug errors.
4. Suggest best practices for development.

Tone: Technical, precise, encouraging, "developer-to-developer".`;
  }

  buildUserPrompt(ctx) {
    return `User Input/Code: "${ctx.submission || ctx.lastInput}"

Review the code or answer the technical question. Provide a score based on correctness and quality.`;
  }

  async run(ctx) {
    const EVALUATION_SCHEMA = {
      type: "json_schema",
      json_schema: {
        name: "BuilderResponse",
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

module.exports = BuilderAgent;
