const BaseAgent = require('./BaseAgent');

class InvestorAgent extends BaseAgent {
  constructor() {
    super("InvestorAgent");
  }

  buildSystemPrompt(ctx) {
    return `You are the **InvestorAgent**, representing a Venture Capitalist or Angel Investor.
Your goal is to evaluate the investment potential of the user's project.

Your responsibilities:
1. Analyze the business model and monetization strategy.
2. Evaluate market size and competition.
3. Assess the team and execution capability.
4. Decide on "investment" (simulated) or provide rejection feedback.

Tone: Professional, skeptical, business-focused, "shark tank".`;
  }

  buildUserPrompt(ctx) {
    return `User Input: "${ctx.submission || ctx.lastInput}"

Evaluate the investment opportunity.`;
  }

  async run(ctx) {
    const EVALUATION_SCHEMA = {
      type: "json_schema",
      json_schema: {
        name: "InvestorResponse",
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

module.exports = InvestorAgent;
