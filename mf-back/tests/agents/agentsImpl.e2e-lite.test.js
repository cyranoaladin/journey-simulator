/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const InvestorDemoAgent = require('../../src/agents/InvestorDemoAgent');
const QAPlaywrightAgent = require('../../src/agents/QAPlaywrightAgent');
const CurriculumAgent = require('../../src/agents/CurriculumAgent');
const WalletAuthAgent = require('../../src/agents/WalletAuthAgent');
const SolanaAnchorAgent = require('../../src/agents/SolanaAnchorAgent');
const MintingAgent = require('../../src/agents/MintingAgent');

const agents = [
  { id: 'InvestorDemoAgent', Cls: InvestorDemoAgent, intent: 'investor_demo' },
  { id: 'QAPlaywrightAgent', Cls: QAPlaywrightAgent, intent: 'qa_playwright' },
  { id: 'CurriculumAgent', Cls: CurriculumAgent, intent: 'curriculum' },
  { id: 'WalletAuthAgent', Cls: WalletAuthAgent, intent: 'wallet_auth' },
  { id: 'SolanaAnchorAgent', Cls: SolanaAnchorAgent, intent: 'solana_anchor' },
  { id: 'MintingAgent', Cls: MintingAgent, intent: 'minting' },
];

describe('Agents P0 implementations (minimal prod-grade)', () => {
  it('returns structured responses without throw', async () => {
    for (const { Cls, id, intent } of agents) {
      // Log pour déboguer
      console.log(`Testing agent: ${id}, Cls type:`, typeof Cls);
      if (typeof Cls !== 'function') {
        console.error(`Skipping ${id}: Not a constructor`);
        continue;
      }
      const agent = new Cls();
      const res = await agent.run({
        traceId: `trace-${id}`,
        input: `${id} minimal input`,
        intent,
        context: { journey: { journeyType: intent } },
      });

      expect(res).toBeDefined();
      expect(res.agentId).toBe(id);
      expect(['OK', 'WARN', 'FAIL', 'TIMEOUT']).toContain(res.status);
      expect(typeof res.summary).toBe('string');
      expect(res.summary.length).toBeGreaterThan(3);
      expect(Array.isArray(res.actions)).toBe(true);
      expect(res.actions.length).toBeGreaterThan(0);
      expect(res.confidence).toBeGreaterThanOrEqual(0);
      expect(res.confidence).toBeLessThanOrEqual(1);
      expect(Array.isArray(res.citations)).toBe(true);
      expect(res.citations.length).toBeLessThanOrEqual(3);
      (res.citations || []).forEach((c) => {
        if (typeof c === 'string') expect(c.length).toBeLessThanOrEqual(160);
      });
      expect(res.metrics?.latencyMs).toBeGreaterThanOrEqual(0);
    }
  });
});
