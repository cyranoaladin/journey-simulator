/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const { normalizeIntents, selectAgentsForIntents, routeIntent } = require('../orchestration/intentRouter');

describe('Intent Router', () => {
  it('selects security agent for security.audit', () => {
    const res = routeIntent({ intent: 'security.audit' });
    expect(res.selectedAgents.length).toBe(1);
    expect(res.selectedAgents[0].agentId).toBe('SecurityAuditAgent');
    expect(res.intentNormalized).toBe('security_audit');
  });

  it('selects product agent for product.spec', () => {
    const res = routeIntent({ intent: 'product.spec' });
    expect(res.selectedAgents.length).toBe(1);
    expect(res.selectedAgents[0].agentId).toBe('ProductSpecAgent');
    expect(res.intentNormalized).toBe('product_spec');
  });

  it('supports composite intent array (security + product)', () => {
    const res = routeIntent({ intent: ['product.spec', 'security.audit'] });
    expect(res.selectedAgents.length).toBe(2);
    expect(res.selectedAgents[0].agentId).toBe('SecurityAuditAgent'); // higher priority
    expect(res.selectedAgents[1].agentId).toBe('ProductSpecAgent');
    expect(res.intentNormalized).toBe('product_spec+security_audit');
  });

  it('supports composite intent string with + separator', () => {
    const res = routeIntent({ intent: 'security.audit+product.spec' });
    expect(res.selectedAgents.length).toBe(2);
  });

  it('falls back to ProductSpecAgent on unknown intent', () => {
    const res = routeIntent({ intent: 'foo.bar' });
    expect(res.selectedAgents.length).toBe(1);
    expect(res.selectedAgents[0].agentId).toBe('ProductSpecAgent');
    expect(res.intentNormalized).toBe('foo_bar');
  });

  it('falls back to ProductSpecAgent on missing intent', () => {
    const res = routeIntent({});
    expect(res.selectedAgents.length).toBe(1);
    expect(res.selectedAgents[0].agentId).toBe('ProductSpecAgent');
    expect(res.intentNormalized).toBe('product_spec');
  });

  it('ignores disabled agents and falls back gracefully', () => {
    const res = routeIntent({ intent: 'risk.fraud' });
    expect(res.selectedAgents.every((a) => a.agentId !== 'RiskFraudAgent')).toBe(true);
    expect(res.selectedAgents.some((a) => a.agentId === 'ProductSpecAgent')).toBe(true);
  });

  it('normalizeIntents splits strings and trims', () => {
    expect(normalizeIntents('a+b + c')).toEqual(['a', 'b', 'c']);
    expect(normalizeIntents(['x', 'y+z'])).toEqual(['x', 'y', 'z']);
  });

  it('routes new coverage agents by intent', () => {
    expect(routeIntent({ intent: 'api.contract' }).selectedAgents[0].agentId).toBe('APIContractAgent');
    expect(routeIntent({ intent: 'journey.design' }).selectedAgents[0].agentId).toBe('JourneyDesignAgent');
    expect(routeIntent({ intent: 'evaluation' }).selectedAgents[0].agentId).toBe('EvaluationAgent');
    expect(routeIntent({ intent: 'rag.ops' }).selectedAgents[0].agentId).toBe('RAGOpsAgent');
    expect(routeIntent({ intent: 'data.integrity' }).selectedAgents[0].agentId).toBe('DataIntegrityAgent');
    expect(routeIntent({ intent: 'tokenomics' }).selectedAgents[0].agentId).toBe('TokenomicsAgent');
    expect(routeIntent({ intent: 'growth' }).selectedAgents[0].agentId).toBe('GrowthAgent');
    expect(routeIntent({ intent: 'observability' }).selectedAgents[0].agentId).toBe('ObservabilityAgent');
  });

  it('routes to stub agent without crashing', () => {
    const res = routeIntent({ intent: 'governance.dao' });
    expect(res.selectedAgents.some((a) => a.agentId === 'GovernanceDAOAgent')).toBe(true);
  });
});
