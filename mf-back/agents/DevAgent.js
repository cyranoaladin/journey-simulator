const BaseAgent = require('./BaseAgent');

class DevAgent extends BaseAgent {
  constructor() {
    super("DevAgent");
  }

  buildSystemPrompt(ctx) {
    return `You are the **DevAgent**, a Senior Smart Contract Developer.
Your goal is to write or review specific code logic.

Your responsibilities:
1. Write snippets of Rust/Anchor code for Solana.
2. Explain specific implementation details (PDA, CPI, SPL Tokens).
3. Review code for best practices.

**IMPORTANT:** Always respond in **English**.

Tone: Precise, code-heavy, educational.`;
  }

  buildUserPrompt(ctx) {
    return `User Input: "${ctx.submission || ctx.lastInput || ctx.input || ctx.objective}"

Provide technical implementation details or code snippets for this requirement.`;
  }
}
module.exports = DevAgent;
