/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const toolsRegistry = require('@mocks/orchestration').toolsRegistry;

describe('toolsRegistry', () => {
  it('exports all required tools', () => {
    const tools = toolsRegistry.getAllTools();
    const toolIds = tools.map((t) => t.toolId || t.id);
    expect(toolIds).toContain('enable_rate_limit');
    expect(toolIds).toContain('rotate_secrets');
    expect(toolIds).toContain('add_governance_rule');
    expect(toolIds).toContain('deploy_contract');
    expect(toolIds).toContain('mint_token');
    expect(toolIds).toContain('notify_user');
    expect(toolIds).toContain('noop');
  });

  it('getTool returns tool by id', () => {
    const tool = toolsRegistry.getTool('enable_rate_limit');
    expect(tool).toBeDefined();
    expect(tool.toolId || tool.id).toBe('enable_rate_limit');
    expect(tool.description).toBeDefined();
    expect(tool.risk).toBeDefined();
  });

  it('getTool returns null for unknown tool', () => {
    const tool = toolsRegistry.getTool('unknown_tool');
    expect(tool).toBeUndefined();
  });

  describe('simulateTool', () => {
    it('simulates enable_rate_limit successfully', () => {
      const result = toolsRegistry.simulateTool('enable_rate_limit', {
        action: 'enable rate limiting',
        traceId: 'test',
        runId: 'test',
        tenantId: 'test',
        gateApproved: false,
      });
      expect(result.status).toBe('SIMULATED_OK');
      expect(result.effects).toBeDefined();
      expect(Array.isArray(result.effects)).toBe(true);
    });

    it('blocks rotate_secrets without gate approval', () => {
      const result = toolsRegistry.simulateTool('rotate_secrets', {
        action: 'rotate secrets',
        traceId: 'test',
        runId: 'test',
        tenantId: 'test',
        gateApproved: false,
      });
      expect(result.status).toBe('BLOCKED_BY_GATE');
      expect(result.warnings).toContain('Requires gate approval');
    });

    it('allows rotate_secrets with gate approval', () => {
      const result = toolsRegistry.simulateTool('rotate_secrets', {
        action: 'rotate secrets',
        traceId: 'test',
        runId: 'test',
        tenantId: 'test',
        gateApproved: true,
      });
      expect(result.status).toBe('SIMULATED_OK');
    });

    it('simulates mint_token and calls web3Pipeline', () => {
      const web3Pipeline = require('@mocks/orchestration').web3Pipeline;
      web3Pipeline.reset({ tenantId: 'test', runId: 'test-mint' });
      // Setup: proof and anchor must exist
      web3Pipeline.applyAction('proof', { tenantId: 'test', runId: 'test-mint' });
      web3Pipeline.applyAction('anchor', { tenantId: 'test', runId: 'test-mint' });

      const result = toolsRegistry.simulateTool('mint_token', {
        action: 'mint token',
        traceId: 'test',
        runId: 'test-mint',
        tenantId: 'test',
        gateApproved: true,
      });
      expect(result.status).toBe('SIMULATED_OK');
      expect(result.effects.some((e) => e.includes('Token minted'))).toBe(true);

      web3Pipeline.reset({ tenantId: 'test', runId: 'test-mint' });
    });

    it('fails mint_token without anchor', () => {
      const web3Pipeline = require('@mocks/orchestration').web3Pipeline;
      web3Pipeline.reset({ tenantId: 'test', runId: 'test-mint-fail' });

      const result = toolsRegistry.simulateTool('mint_token', {
        action: 'mint token',
        traceId: 'test',
        runId: 'test-mint-fail',
        tenantId: 'test',
        gateApproved: true,
      });
      expect(result.status).toBe('SIMULATED_FAIL');
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('simulates noop tool', () => {
      const result = toolsRegistry.simulateTool('noop', {
        action: 'unknown action',
        traceId: 'test',
        runId: 'test',
        tenantId: 'test',
        gateApproved: false,
      });
      expect(result.status).toBe('SKIPPED');
      expect(result.warnings).toContain('No-op tool (unknown action)');
    });
  });
});
