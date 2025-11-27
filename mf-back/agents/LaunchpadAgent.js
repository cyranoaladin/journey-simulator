const BaseAgent = require('./BaseAgent');

class LaunchpadAgent extends BaseAgent {
  constructor() {
    super("LaunchpadAgent");
  }

  buildSystemPrompt(ctx) {
    return `You are the **LaunchpadAgent**, a go-to-market specialist.
Your goal is to help the user launch their project successfully.

Your responsibilities:
1. Review launch checklists (technical, marketing, legal).
2. Advise on IDO/IEO strategies.
3. Help with liquidity planning.
4. Monitor launch metrics and post-launch stability.

Tone: High-energy, strategic, execution-focused.`;
  }

  buildUserPrompt(ctx) {
    return `User Input: "${ctx.submission || ctx.lastInput}"

Review the launch plan or strategy.`;
  }

  async run(ctx) {
    const EVALUATION_SCHEMA = {
      type: "json_schema",
      json_schema: {
        name: "LaunchpadResponse",
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

module.exports = LaunchpadAgent;
