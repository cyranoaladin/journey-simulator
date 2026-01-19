/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const GrowthAgent = require('../agents/GrowthAgent');
const TokenomicsAgent = require('../agents/TokenomicsAgent');

describe('Conflict handling between GrowthAgent and TokenomicsAgent', () => {
  it('GrowthAgent returns RISK_REPORT for absurd market cap vs budget', async () => {
    const agent = new GrowthAgent();
    const result = await agent.run({
      input: 'Market Cap initial de 100$ avec une supply de 1 milliard de tokens',
      context: {
        orchestrationMode: 'AEPO',
        projectSpecs: { supply: 1_000_000_000, price: 0.1, budget: 100 },
      },
    });

    expect(result.status).toBe('RISK');
    expect(result.summary.toLowerCase()).toContain('risk');
  });

  it('TokenomicsAgent signale une aberration mathematique sur market cap insuffisant', async () => {
    const agent = new TokenomicsAgent();
    const result = await agent.run({
      input: 'Market cap initial $100 pour une supply de 1 000 000 000 tokens',
      context: { history: [{ note: 'Le projet s’appelle MFAI-Solana' }] },
      constraints: { maxTokens: 32 },
    });

    expect(result.status).toBe('ERROR');
    expect(result.summary).toContain('MARKET_CAP_INCONSISTENT');
    expect(result.details.detectedSupply).toBe(1000000000);
  });
});
