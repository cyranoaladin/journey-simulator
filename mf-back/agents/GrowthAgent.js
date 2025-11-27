const BaseAgent = require("./BaseAgent");

const GROWTH_EVALUATION_SCHEMA = {
  type: "json_schema",
  json_schema: {
    name: "GrowthEvaluationResponse",
    strict: true,
    schema: {
      type: "object",
      required: ["global_score", "feedback", "axes", "action_plan"],
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
              comment: { type: "string" }
            },
            additionalProperties: false
          }
        },
        action_plan: {
          type: "object",
          required: ["immediate_actions", "week_1", "month_1"],
          properties: {
            immediate_actions: {
              type: "array",
              items: { type: "string" }
            },
            week_1: {
              type: "array",
              items: { type: "string" }
            },
            month_1: {
              type: "array",
              items: { type: "string" }
            }
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
    }
  }
};

class GrowthAgent extends BaseAgent {
  constructor() {
    super("GrowthAgent");
  }

  buildSystemPrompt(ctx) {
    return `You are the **GrowthAgent** of Money Factory AI, an expert in growth marketing for Web3 projects.

Your expertise covers:
1. **Go-to-Market Strategy**: Product-market fit, positioning, launch strategy
2. **Community Building**: Discord/Telegram growth, engagement loops, ambassador programs
3. **Content Marketing**: Twitter threads, blog articles, educational content
4. **Growth Loops**: Viral mechanics, referral programs, retention strategies
5. **Metrics & Analytics**: AARRR Framework (Acquisition, Activation, Retention, Revenue, Referral)

Evaluation criteria (0-10 each):
1. **Market Positioning**: Value prop clarity, differentiation, target audience
2. **Go-to-Market Plan**: Launch strategy, channel selection, timeline
3. **Community Strategy**: Engagement tactics, moderation, growth mechanics
4. **Content Quality**: Messaging, storytelling, educational value
5. **Growth Mechanics**: Viral loops, incentives, retention hooks

Your tone: Energetic, data-driven, actionable. Use terms like "PMF", "CAC", "LTV", "Viral Coefficient", "Engagement Rate".

You must ALWAYS provide:
- Precise scores for each criterion
- Detailed and constructive feedback
- Immediate actions (this week)
- Short-term goals (1 month)
- Relevant Web3 examples and case studies`;
  }

  buildUserPrompt(ctx) {
    const { submission, trackId, phaseId } = ctx;

    return `Context:
- Track : ${trackId}
- Phase : ${phaseId}
- User's GTM/Growth proposal:
"${submission}"

Evaluate this growth strategy and provide:
1. Scores for each criterion (Market Positioning, GTM Plan, Community, Content, Growth Mechanics)
2. Detailed feedback on strengths and weaknesses
3. Action plan with:
   - Immediate actions (to do this week)
   - Week 1 goals (7 days)
   - Month 1 goals (30 days)

Be specific and reference Web3 best practices. Use the AARRR framework to structure your recommendations.`;
  }

  async run(ctx) {
    return super.run(ctx, {
      response_format: GROWTH_EVALUATION_SCHEMA,
      temperature: 0.6, // Balanced for creativity + structure
      metadata: {
        agent: this.name,
        track: ctx.trackId,
        phase: ctx.phaseId,
        framework: 'AARRR'
      }
    });
  }
}

module.exports = GrowthAgent;

