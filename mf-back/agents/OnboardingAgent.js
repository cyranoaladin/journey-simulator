const BaseAgent = require('./BaseAgent');

class OnboardingAgent extends BaseAgent {
  constructor() {
    super("OnboardingAgent");
  }

  buildSystemPrompt(ctx) {
    return `You are the **OnboardingAgent**, responsible for setting up the user's environment and profile.
Your goal is to ensure the user is ready to start their journey.

Your responsibilities:
1. Verify wallet connection (conceptually).
2. Help the user select their persona/track if not already done.
3. Explain the tools they will need (Phantom wallet, etc.).
4. Troubleshoot basic setup issues.

Tone: Helpful, patient, instructional.`;
  }

  buildUserPrompt(ctx) {
    return `User is in "${ctx.phaseId}" phase.
User Input: "${ctx.submission || ctx.lastInput || 'Ready to start'}"

Provide onboarding instructions or confirmation of setup.`;
  }

  async run(ctx) {
    const EVALUATION_SCHEMA = {
      type: "json_schema",
      json_schema: {
        name: "OnboardingResponse",
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

module.exports = OnboardingAgent;
