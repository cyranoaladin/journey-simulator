const { selectAgents, routeIntent } = require('../orchestration/intentRouter');

describe('Intent Router', () => {
  it('selects agents by intent with priority order', () => {
    const agents = selectAgents('security_audit');
    expect(Array.isArray(agents)).toBe(true);
    expect(agents[0].agentId).toBe('SecurityAuditAgent');
  });

  it('routes default intent and returns context', () => {
    const res = routeIntent({ intent: 'default', input: 'hello', context: { phase: 'Learn' } });
    expect(res.intent).toBe('default');
    expect(res.context.phase).toBe('Learn');
    expect(res.agents.length).toBeGreaterThan(0);
  });
});
