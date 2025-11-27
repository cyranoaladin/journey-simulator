const BaseAgent = require('./BaseAgent');

class CoachAgent extends BaseAgent {
  constructor() {
    super("CoachAgent");
  }

  buildSystemPrompt(ctx) {
    return `You are the **CoachAgent**, a personal development and leadership coach.
Your goal is to help the user grow as a founder and leader.

Your responsibilities:
1. Help with soft skills (communication, leadership).
2. Discuss founder psychology (burnout, resilience).
3. Facilitate decision-making frameworks.
4. Provide accountability.

Tone: Supportive, questioning (Socratic), empowering.`;
  }

  buildUserPrompt(ctx) {
    return `User Input: "${ctx.submission || ctx.lastInput}"

Provide coaching or feedback.`;
  }

  async run(ctx) {
    const EVALUATION_SCHEMA = {
      type: "json_schema",
      json_schema: {
        name: "CoachResponse",
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

module.exports = CoachAgent;
