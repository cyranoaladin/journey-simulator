const actionToolMapper = require('../../orchestration/actionToolMapper');

describe('actionToolMapper', () => {
  describe('mapActionToTool', () => {
    it('maps known actions to tools', () => {
      const mapped = actionToolMapper.mapActionToTool('enable rate limiting');
      expect(mapped.toolId).toBe('enable_rate_limit');
      expect(mapped.tool).toBeDefined();
      expect(mapped.confidence).toBeGreaterThan(0);
    });

    it('maps rotate secrets to rotate_secrets tool', () => {
      const mapped = actionToolMapper.mapActionToTool('rotate secrets');
      expect(mapped.toolId).toBe('rotate_secrets');
      expect(mapped.tool).toBeDefined();
    });

    it('maps add governance rule to add_governance_rule tool', () => {
      const mapped = actionToolMapper.mapActionToTool('add governance rule');
      expect(mapped.toolId).toBe('add_governance_rule');
      expect(mapped.tool).toBeDefined();
    });

    it('maps deploy contract to deploy_contract tool', () => {
      const mapped = actionToolMapper.mapActionToTool('deploy contract');
      expect(mapped.toolId).toBe('deploy_contract');
      expect(mapped.tool).toBeDefined();
    });

    it('maps mint token to mint_token tool', () => {
      const mapped = actionToolMapper.mapActionToTool('mint token');
      expect(mapped.toolId).toBe('mint_token');
      expect(mapped.tool).toBeDefined();
    });

    it('maps notify user to notify_user tool', () => {
      const mapped = actionToolMapper.mapActionToTool('notify user');
      expect(mapped.toolId).toBe('notify_user');
      expect(mapped.tool).toBeDefined();
    });

    it('maps unknown action to noop tool', () => {
      const mapped = actionToolMapper.mapActionToTool('unknown action xyz');
      expect(mapped.toolId).toBe('noop');
      expect(mapped.tool).toBeDefined();
      expect(mapped.confidence).toBe(0);
      expect(mapped.reason).toBe('unknown_action');
    });

    it('maps empty action to noop', () => {
      const mapped = actionToolMapper.mapActionToTool('');
      expect(mapped.toolId).toBe('noop');
      expect(mapped.reason).toBe('empty_action');
    });

    it('maps null/undefined to noop', () => {
      const mapped1 = actionToolMapper.mapActionToTool(null);
      expect(mapped1.toolId).toBe('noop');
      const mapped2 = actionToolMapper.mapActionToTool(undefined);
      expect(mapped2.toolId).toBe('noop');
    });

    it('uses verb-based matching when pattern fails', () => {
      const mapped = actionToolMapper.mapActionToTool('enable something');
      expect(mapped.toolId).toBe('enable_rate_limit');
      expect(mapped.confidence).toBe(0.7);
      expect(mapped.reason).toBe('verb_match');
    });
  });

  describe('normalizeAction', () => {
    it('normalizes action strings', () => {
      expect(actionToolMapper.normalizeAction('Enable Rate Limiting')).toBe('enable rate limiting');
      expect(actionToolMapper.normalizeAction('  TEST  ')).toBe('test');
      expect(actionToolMapper.normalizeAction(null)).toBe('');
    });
  });

  describe('extractVerbAndObject', () => {
    it('extracts verb and object from action', () => {
      const { verb, object } = actionToolMapper.extractVerbAndObject('enable rate limiting');
      expect(verb).toBe('enable');
      expect(object).toBe('rate limiting');
    });

    it('handles single word actions', () => {
      const { verb, object } = actionToolMapper.extractVerbAndObject('enable');
      expect(verb).toBe('enable');
      expect(object).toBe('');
    });
  });
});
