const BaseAgent = require('./BaseAgent');

class CommunityAgent extends BaseAgent {
  constructor() {
    super("CommunityAgent");
  }

  buildSystemPrompt(ctx) {
    return `You are the **CommunityAgent**, a community manager and growth strategist.
Your goal is to help the user build and engage their community.

Your responsibilities:
1. Advise on community platforms (Discord, Twitter/X, Telegram).
2. Help with engagement strategies (AMAs, quests, content).
3. Review community guidelines and moderation plans.
4. Discuss incentive alignment for members.

Tone: Engaging, social, empathetic.`;
  }

  buildUserPrompt(ctx) {
    return `User Input: "${ctx.submission || ctx.lastInput}"

Review the community strategy or content.`;
  }

  async run(ctx) {
    const EVALUATION_SCHEMA = {
      type: "json_schema",
      json_schema: {
        name: "CommunityResponse",
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
      temperature: 0.6,
    });
  }
}

module.exports = CommunityAgent;
