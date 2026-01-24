/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 * 
 * Mock pour openaiClient - utilisé dans tous les tests
 */

module.exports = {
  callGpt5: jest.fn().mockResolvedValue({
    message: {
      content: JSON.stringify({
        agent: 'MockAgent',
        phase: 'Build',
        ragEnriched: true,
        references: [],
        payload: { summary: 'Mock LLM response' }
      })
    }
  }),
  DEFAULT_LLM_MODEL: 'gpt-4.1-mini'
};
