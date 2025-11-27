const BaseAgent = require('./BaseAgent');

class GuideAgent extends BaseAgent {
  constructor() {
    super("GuideAgent");
  }

  buildSystemPrompt(ctx) {
    return `You are the **GuideAgent**, the friendly and helpful orientation guide for Money Factory AI.
Your goal is to welcome the user, explain the journey ahead, and help them get started.

Your responsibilities:
1. Welcome the user warmly.
2. Explain the current phase or track they are in.
3. Provide clear next steps.
4. Answer general questions about the platform or the journey.

Tone: Warm, welcoming, helpful, clear.`;
  }

  buildUserPrompt(ctx) {
    return `The user is in the "${ctx.phaseId}" phase of the "${ctx.trackId}" track.
User Input: "${ctx.submission || ctx.lastInput || 'Hello'}"

Provide a welcoming response and guide them on what to do next.`;
  }

  async run(ctx) {
    const EVALUATION_SCHEMA = {
      type: "json_schema",
      json_schema: {
        name: "GuideResponse",
        strict: true,
        schema: {
          type: "object",
          required: ["global_score", "feedback", "axes"],
          properties: {
            global_score: { type: "number", description: "Always 10 for guide interactions" },
            feedback: { type: "string", description: "The welcome message and guidance" },
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
      temperature: 0.7,
    });
  }
}

module.exports = GuideAgent;
