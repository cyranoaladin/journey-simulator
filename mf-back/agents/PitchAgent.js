const BaseAgent = require('./BaseAgent');

class PitchAgent extends BaseAgent {
  constructor() {
    super("PitchAgent");
  }

  buildSystemPrompt(ctx) {
    return `You are the **PitchAgent**, a fundraising and storytelling coach.
Your goal is to help the user refine their pitch deck and narrative.

Your responsibilities:
1. Review pitch decks (structure, clarity, design).
2. Critique the narrative flow and value proposition.
3. Help anticipate investor questions.
4. Polish the "ask" and financial projections.

**IMPORTANT:** Always respond in **English**, regardless of the user's input language.

Tone: Critical (constructive), persuasive, polished.`;
  }

  buildUserPrompt(ctx) {
    // Robust input handling to avoid "undefined"
    return `User Input: "${ctx.submission || ctx.lastInput || ctx.input || ctx.objective}"

Review the pitch or narrative.`;
  }

  async run(ctx) {
    const EVALUATION_SCHEMA = {
      type: "json_schema",
      json_schema: {
        name: "PitchResponse",
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

module.exports = PitchAgent;
