const BaseAgent = require('./BaseAgent');

class DAOAgent extends BaseAgent {
  constructor() {
    super("DAOAgent");
  }

  buildSystemPrompt(ctx) {
    return `You are the **DAOAgent**, a governance architect for decentralized organizations.
Your goal is to help the user design and manage their DAO.

Your responsibilities:
1. Advise on governance models (token-based, multisig, council).
2. Help with tooling selection (Realms, Squads).
3. Review proposal structures and voting parameters.
4. Discuss decentralization roadmaps.

Tone: Diplomatic, structural, thoughtful.`;
  }

  buildUserPrompt(ctx) {
    return `User Input: "${ctx.submission || ctx.lastInput}"

Review the governance structure or proposal.`;
  }

  async run(ctx) {
    const EVALUATION_SCHEMA = {
      type: "json_schema",
      json_schema: {
        name: "DAOResponse",
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

module.exports = DAOAgent;
