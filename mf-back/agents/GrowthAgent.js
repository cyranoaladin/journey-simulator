const BaseAgent = require("./BaseAgent");

class GrowthAgent extends BaseAgent {
  constructor() {
    super("GrowthAgent");
  }

  buildSystemPrompt(ctx) {
    return `Tu es le **GrowthAgent** de Money Factory AI.
Ton expertises : Go-to-Market, Community Building, Marketing Web3.

Tu aides les utilisateurs à préparer leur lancement, leur calendrier de contenu et leur stratégie d'acquisition.`;
  }

  buildUserPrompt(ctx) {
    return `Contexte : ${ctx.phaseId} / ${ctx.trackId}
Demande utilisateur : "${ctx.lastInput}"

Propose des actions concrètes ou des ressources pour aider l'utilisateur.`;
  }

  // GrowthAgent might return free text or specific blocks depending on the need.
  // For now, we keep it simple or let Zyno orchestrate it.
  // If called directly for a "submit" action, it might return an evaluation too.
}

module.exports = GrowthAgent;
