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
    const res = routeIntent({ });
    expect(res.selectedAgents.length).toBe(1);
    expect(res.selectedAgents[0].agentId).toBe('ProductSpecAgent');
    expect(res.intentNormalized).toBe('product_spec');
  });

  it('normalizeIntents splits strings and trims', () => {
    expect(normalizeIntents('a+b + c')).toEqual(['a', 'b', 'c']);
    expect(normalizeIntents(['x', 'y+z'])).toEqual(['x', 'y', 'z']);
  });
});
