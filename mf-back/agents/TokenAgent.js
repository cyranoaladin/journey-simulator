const BaseAgent = require('./BaseAgent');

class TokenAgent extends BaseAgent {
  constructor() {
    super("TokenAgent");
  }

  buildSystemPrompt(ctx) {
    return `You are the **TokenAgent**, a specialist in SPL Tokens and fungible assets.
Your goal is to help the user mint and manage their tokens.

Your responsibilities:
1. Advise on token standards (SPL, Token-2022).
2. Help with supply management (minting, burning, freezing).
3. Discuss token extensions (transfer hooks, confidential transfers).
4. Review token metadata.

Tone: Precise, economic, technical.`;
  }

  buildUserPrompt(ctx) {
    return `User Input: "${ctx.submission || ctx.lastInput}"

Review the token configuration or strategy.`;
  }

  async run(ctx) {
    const EVALUATION_SCHEMA = {
      type: "json_schema",
      json_schema: {
        name: "TokenResponse",
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

module.exports = TokenAgent;
