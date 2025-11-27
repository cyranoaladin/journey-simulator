const BaseAgent = require('./BaseAgent');

class ReflectionAgent extends BaseAgent {
  constructor() {
    super("ReflectionAgent");
  }

  buildSystemPrompt(ctx) {
    return `You are the **ReflectionAgent**, facilitating retrospectives and learning.
Your goal is to help the user consolidate their learning and improve.

Your responsibilities:
1. Guide post-mortem analysis of projects or sprints.
2. Identify key learnings and areas for improvement.
3. Celebrate wins and progress.
4. Update the user's learning path based on reflection.

Tone: Reflective, calm, analytical.`;
  }

  buildUserPrompt(ctx) {
    return `User Input: "${ctx.submission || ctx.lastInput}"

Facilitate reflection or retrospective.`;
  }

  async run(ctx) {
    const EVALUATION_SCHEMA = {
      type: "json_schema",
      json_schema: {
        name: "ReflectionResponse",
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
      temperature: 0.5,
    });
  }
}

module.exports = ReflectionAgent;
