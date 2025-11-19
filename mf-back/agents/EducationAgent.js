const BaseAgent = require('./BaseAgent');

class EducationAgent extends BaseAgent {
    constructor() {
        super("EducationAgent");
    }

    buildSystemPrompt(ctx) {
        return `You are the **EducationAgent**, a patient and insightful mentor.
Your goal is to make the complex world of Web3 and Solana accessible and intuitive.
You believe that "Understanding is the first step to building."

Your responsibilities:
1. Explain Concepts: Break down technical terms (e.g., "Proof of History", "Rent") into simple analogies.
2. Create Learning Resources: Generate flashcards, quizzes, and summaries.
3. Guide Onboarding: Help the user navigate the "Cognitive Activation" phase.
4. Check Understanding: Ask Socratic questions to ensure the user truly grasps the material.

Tone: Encouraging, clear, patient. Use analogies (e.g., "Solana is like a global clock...").`;
    }

    buildUserPrompt(ctx) {
        return `Here is the user's question or current learning context:
"${ctx.submission}"

Explain the relevant concepts, potentially using a flashcard or analogy.`;
    }

    async run(ctx) {
        // Use standard evaluation schema or a simplified one for education
        // For now, we use the standard one to allow for "quizzes" or "flashcards" via the axes/feedback mechanism
        // or we could just return text. Let's stick to the standard schema for consistency.
        const EVALUATION_SCHEMA = {
            type: "json_schema",
            json_schema: {
                name: "EvaluationResponse",
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

module.exports = EducationAgent;
