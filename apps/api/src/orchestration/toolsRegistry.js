/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

// Declarative tools registry (no real execution).
// Side effects classification: none | external | db | irreversible

const web3Pipeline = require('./web3Pipeline');

function simulateTool(toolId, context = {}) {
  const { traceId, runId, tenantId = 'default', gateApproved = false } = context;
  const warnings = [];
  const effects = [];

  switch (toolId) {
    case 'enable_rate_limit':
      effects.push('Rate limiting enabled on auth routes');
      return { status: 'SIMULATED_OK', effects, warnings };
    case 'rotate_secrets':
      if (!gateApproved) {
        return { status: 'BLOCKED_BY_GATE', effects: [], warnings: ['Requires gate approval'] };
      }
      effects.push('Secrets rotation scheduled');
      return { status: 'SIMULATED_OK', effects, warnings };
    case 'add_governance_rule':
      effects.push('Governance rule added to registry');
      return { status: 'SIMULATED_OK', effects, warnings };
    case 'deploy_contract':
      if (!gateApproved) {
        return { status: 'BLOCKED_BY_GATE', effects: [], warnings: ['Requires gate approval'] };
      }
      effects.push('Contract deployment simulated (no on-chain call)');
      warnings.push('Real deployment requires EXECUTION_ENABLED=true');
      return { status: 'SIMULATED_OK', effects, warnings };
    case 'mint_token':
      if (!gateApproved) {
        return { status: 'BLOCKED_BY_GATE', effects: [], warnings: ['Requires gate approval'] };
      }
      const pipelineContext = { tenantId, runId: runId || traceId || 'unknown' };
      const pipelineState = web3Pipeline.getState(pipelineContext);
      if (pipelineState.state !== 'ANCHOR_CREATED') {
        warnings.push('Mint requires anchor to be created first');
        return { status: 'SIMULATED_FAIL', effects: [], warnings };
      }
      const mintResult = web3Pipeline.applyAction('mint', pipelineContext);
      if (mintResult.success) {
        effects.push(`Token minted (simulated): ${mintResult.mint?.tokenId || 'unknown'}`);
        return { status: 'SIMULATED_OK', effects, warnings };
      }
      return { status: 'SIMULATED_FAIL', effects: [], warnings: [mintResult.reason || 'mint_failed'] };
    case 'notify_user':
      effects.push('User notification queued (simulated)');
      return { status: 'SIMULATED_OK', effects, warnings };
    case 'noop':
      return { status: 'SKIPPED', effects: [], warnings: ['No-op tool (unknown action)'] };
    case 'allow_uploads':
      if (!gateApproved) {
        return { status: 'BLOCKED_BY_GATE', effects: [], warnings: ['Requires gate approval'] };
      }
      effects.push('Uploads enabled (simulated)');
      return { status: 'SIMULATED_OK', effects, warnings };
    case 'deny_uploads':
      if (!gateApproved) {
        return { status: 'BLOCKED_BY_GATE', effects: [], warnings: ['Requires gate approval'] };
      }
      effects.push('Uploads disabled (simulated)');
      return { status: 'SIMULATED_OK', effects, warnings };
    case 'enable_checklist':
      effects.push('Checklist enabled (simulated)');
      return { status: 'SIMULATED_OK', effects, warnings };
    default:
      return { status: 'SKIPPED', effects: [], warnings: [`Unknown tool: ${toolId}`] };
  }
}

const TOOLS = [
  {
    id: 'enable_rate_limit',
    toolId: 'enable_rate_limit',
    description: 'Enable rate limiting on auth routes',
    risk: 'LOW',
    requiresGate: false,
    web3: false,
    sideEffects: 'external',
    requiresConfirmation: false,
    simulate: simulateTool,
  },
  {
    id: 'rotate_secrets',
    toolId: 'rotate_secrets',
    description: 'Rotate API keys and secrets',
    risk: 'HIGH',
    requiresGate: true,
    web3: false,
    sideEffects: 'irreversible',
    requiresConfirmation: true,
    simulate: simulateTool,
  },
  {
    id: 'add_governance_rule',
    toolId: 'add_governance_rule',
    description: 'Add a governance rule to the registry',
    risk: 'MEDIUM',
    requiresGate: false,
    web3: false,
    sideEffects: 'db',
    requiresConfirmation: false,
    simulate: simulateTool,
  },
  {
    id: 'deploy_contract',
    toolId: 'deploy_contract',
    description: 'Deploy smart contract (simulated)',
    risk: 'HIGH',
    requiresGate: true,
    web3: true,
    sideEffects: 'irreversible',
    requiresConfirmation: true,
    simulate: simulateTool,
  },
  {
    id: 'mint_token',
    toolId: 'mint_token',
    description: 'Mint NFT/token (simulated, requires web3Pipeline)',
    risk: 'HIGH',
    requiresGate: true,
    web3: true,
    sideEffects: 'irreversible',
    requiresConfirmation: true,
    simulate: simulateTool,
  },
  {
    id: 'notify_user',
    toolId: 'notify_user',
    description: 'Send notification to user',
    risk: 'LOW',
    requiresGate: false,
    web3: false,
    sideEffects: 'external',
    requiresConfirmation: false,
    simulate: simulateTool,
  },
  {
    id: 'noop',
    toolId: 'noop',
    description: 'No-op tool for unknown actions',
    risk: 'LOW',
    requiresGate: false,
    web3: false,
    sideEffects: 'none',
    requiresConfirmation: false,
    simulate: simulateTool,
  },
  {
    id: 'allow_uploads',
    toolId: 'allow_uploads',
    description: 'Enable uploads for the current workspace or project scope.',
    inputSchema: { type: 'object', properties: { scope: { type: 'string' } } },
    sideEffects: 'external',
    requiresConfirmation: true,
    requiresGate: true,
    risk: 'MEDIUM',
    web3: false,
    simulate: simulateTool,
  },
  {
    id: 'deny_uploads',
    toolId: 'deny_uploads',
    description: 'Disable uploads for the current workspace or project scope.',
    inputSchema: { type: 'object', properties: { scope: { type: 'string' } } },
    sideEffects: 'external',
    requiresConfirmation: true,
    requiresGate: true,
    risk: 'MEDIUM',
    web3: false,
    simulate: simulateTool,
  },
  {
    id: 'enable_checklist',
    toolId: 'enable_checklist',
    description: 'Activate a product delivery checklist.',
    inputSchema: { type: 'object', properties: { checklistId: { type: 'string' } } },
    sideEffects: 'none',
    requiresConfirmation: false,
    requiresGate: false,
    risk: 'LOW',
    web3: false,
    simulate: simulateTool,
  },
];

function getTool(toolId) {
  return TOOLS.find((t) => t.toolId === toolId || t.id === toolId);
}

function getAllTools() {
  return TOOLS;
}

module.exports = TOOLS;
module.exports.getTool = getTool;
module.exports.getAllTools = getAllTools;
module.exports.simulateTool = simulateTool;
