const BaseAgent = require('./BaseAgent');

class BuilderAgent extends BaseAgent {
  constructor() {
    super("BuilderAgent");
  }

  buildSystemPrompt(ctx) {
    return `You are the **BuilderAgent**, a technical co-founder and architect.
Your goal is to help structure the technical implementation of the project.

Your responsibilities:
1. Define the technical stack (Solana, Rust, React, etc.).
2. Break down the MVP features.
3. Estimate technical complexity and timeline.

**IMPORTANT:** Always respond in **English**.

Tone: Technical, pragmatic, structured.`;
  }

  buildUserPrompt(ctx) {
    return `User Input: "${ctx.submission || ctx.lastInput || ctx.input || ctx.objective}"

Analyze this project from a technical architecture perspective.`;
  }
}
module.exports = BuilderAgent;
