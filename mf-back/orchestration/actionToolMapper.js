/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const toolsRegistry = require('./toolsRegistry');

function normalizeAction(action) {
  if (!action) return '';
  const str = typeof action === 'string' ? action : String(action);
  return str.toLowerCase().trim();
}

function extractVerbAndObject(action) {
  const normalized = normalizeAction(action);
  const parts = normalized.split(/\s+/);
  if (parts.length === 0) return { verb: '', object: '' };
  const verb = parts[0];
  const object = parts.slice(1).join(' ');
  return { verb, object };
}

function mapActionToTool(action) {
  const normalized = normalizeAction(action);
  if (!normalized) {
    return { toolId: 'noop', tool: toolsRegistry.getTool('noop'), confidence: 0, reason: 'empty_action' };
  }

  const { verb } = extractVerbAndObject(action);

  // Direct keyword matching (deterministic)
  const patterns = [
    { pattern: /enable.*rate.*limit|rate.*limit.*enable/i, toolId: 'enable_rate_limit' },
    { pattern: /rotate.*secret|secret.*rotate|rotate.*key/i, toolId: 'rotate_secrets' },
    { pattern: /add.*governance|governance.*rule|add.*rule/i, toolId: 'add_governance_rule' },
    { pattern: /deploy.*contract|contract.*deploy/i, toolId: 'deploy_contract' },
    { pattern: /mint.*token|token.*mint|mint.*nft/i, toolId: 'mint_token' },
    { pattern: /notify.*user|send.*notification|notify/i, toolId: 'notify_user' },
    { pattern: /allow.*upload|enable.*upload/i, toolId: 'allow_uploads' },
    { pattern: /deny.*upload|disable.*upload/i, toolId: 'deny_uploads' },
    { pattern: /enable.*checklist|activate.*checklist/i, toolId: 'enable_checklist' },
  ];

  for (const { pattern, toolId } of patterns) {
    if (pattern.test(normalized)) {
      const tool = toolsRegistry.getTool(toolId);
      if (tool) {
        return { toolId, tool, confidence: 0.9, reason: 'pattern_match' };
      }
    }
  }

  // Verb-based matching
  const verbMap = {
    enable: 'enable_rate_limit',
    rotate: 'rotate_secrets',
    add: 'add_governance_rule',
    deploy: 'deploy_contract',
    mint: 'mint_token',
    notify: 'notify_user',
    allow: 'allow_uploads',
    deny: 'deny_uploads',
  };

  if (verb && verbMap[verb]) {
    const toolId = verbMap[verb];
    const tool = toolsRegistry.getTool(toolId);
    if (tool) {
      return { toolId, tool, confidence: 0.7, reason: 'verb_match' };
    }
  }

  // Fallback to noop
  const noopTool = toolsRegistry.getTool('noop');
  return { toolId: 'noop', tool: noopTool, confidence: 0, reason: 'unknown_action' };
}

module.exports = {
  mapActionToTool,
  normalizeAction,
  extractVerbAndObject,
};
