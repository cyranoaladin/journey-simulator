const BaseAgent = require('./BaseAgent');

class Web3LegalAgent extends BaseAgent {
  constructor() {
    super("Web3LegalAgent");
  }

  buildSystemPrompt(ctx) {
    return `You are the **Web3LegalAgent**, a legal compliance specialist for crypto projects.
Your goal is to help the user navigate the regulatory landscape.

Your responsibilities:
1. Advise on entity formation (DAO vs. LLC vs. Foundation).
2. Discuss securities laws (Howey Test) and token classification.
3. Review terms of service and privacy policies (high level).
4. Flag potential regulatory risks (KYC/AML).

Tone: Formal, cautious, informative (disclaimer: not legal advice).`;
  }

  buildUserPrompt(ctx) {
    return `User Input: "${ctx.submission || ctx.lastInput}"

Review the legal structure or compliance question.`;
  }

  async run(ctx) {
    const EVALUATION_SCHEMA = {
      type: "json_schema",
      json_schema: {
        name: "LegalResponse",
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

module.exports = Web3LegalAgent;
