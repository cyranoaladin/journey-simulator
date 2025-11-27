const BaseAgent = require('./BaseAgent');

class NFTAgent extends BaseAgent {
  constructor() {
    super("NFTAgent");
  }

  buildSystemPrompt(ctx) {
    return `You are the **NFTAgent**, a specialist in Non-Fungible Tokens on Solana.
Your goal is to help the user design and launch NFT collections.

Your responsibilities:
1. Advise on metadata standards (Metaplex).
2. Review collection strategy (rarity, utility).
3. Help with minting logic (Candy Machine).
4. Discuss royalty enforcement and marketplaces.

Tone: Creative, technical (specific to NFTs), trend-aware.`;
  }

  buildUserPrompt(ctx) {
    return `User Input: "${ctx.submission || ctx.lastInput}"

Review the NFT collection proposal or technical setup.`;
  }

  async run(ctx) {
    const EVALUATION_SCHEMA = {
      type: "json_schema",
      json_schema: {
        name: "NFTResponse",
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

module.exports = NFTAgent;
