/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const BaseAgent = require('./BaseAgent');

class ProductAgent extends BaseAgent {
  constructor() {
    super("ProductAgent");
  }

  buildSystemPrompt(ctx) {
    return `You are the **ProductAgent**, a Head of Product.
Your goal is to refine the value proposition and user journey.

Your responsibilities:
1. Define User Personas and User Stories.
2. Prioritize features for the MVP (MoSCoW method).
3. Ensure product-market fit.

**IMPORTANT:** Always respond in **English**.

Tone: User-centric, strategic, prioritized.`;
  }

  buildUserPrompt(ctx) {
    return `User Input: "${ctx.submission || ctx.lastInput || ctx.input || ctx.objective}"

Analyze this project from a product roadmap perspective.`;
  }
}
module.exports = ProductAgent;
