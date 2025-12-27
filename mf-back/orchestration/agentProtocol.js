const { randomUUID } = require('node:crypto');

const REQUEST_SCHEMA = {
  type: 'object',
  required: ['traceId', 'runId', 'intent', 'input'],
  properties: {
    traceId: { type: 'string' },
    runId: { type: 'string' },
    userId: { type: 'string' },
    intent: { type: 'string' },
    input: { type: 'string' },
    context: {
      type: 'object',
      properties: {
        rag: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: true },
            topK: { type: 'number', default: 4 },
          },
        },
        llm: {
          type: 'object',
          properties: {
            provider: { type: 'string', default: 'openai' },
            model: { type: 'string', default: 'gpt-4o' },
          },
        },
        journey: {
          type: 'object',
          properties: {
            journeyId: { type: 'string' },
            journeyType: { type: 'string' },
            phaseId: { type: 'string' },
            objectives: { type: 'array', items: { type: 'string' } },
            artifacts: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    constraints: {
      type: 'object',
      properties: {
        timeoutMs: { type: 'number', default: 6000 },
        maxTokens: { type: 'number', default: 800 },
      },
    },
    toolsAllowed: { type: 'array', items: { type: 'string' } },
  },
};

const RESPONSE_SCHEMA = {
  type: 'object',
  required: ['traceId', 'agentId', 'status', 'summary'],
  properties: {
    traceId: { type: 'string' },
    agentId: { type: 'string' },
    status: { enum: ['OK', 'WARN', 'FAIL'] },
    summary: { type: 'string' },
    details: { type: 'string' },
    citations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          source: { type: 'string' },
          snippet: { type: 'string' },
        },
      },
    },
    actions: { type: 'array', items: { type: 'object' } },
    metrics: {
      type: 'object',
      properties: {
        latencyMs: { type: 'number' },
        tokens: { type: 'number' },
        ragHits: { type: 'number' },
      },
    },
    errors: { type: 'array', items: { type: 'string' } },
  },
};

const normalizeRequest = (payload = {}) => {
  let intent = payload.intent;
  if (intent == null) intent = 'default';
  else if (typeof intent !== 'string' && !Array.isArray(intent)) intent = String(intent);
  return {
    traceId: payload.traceId || randomUUID(),
    runId: payload.runId || `run-${Date.now()}`,
    userId: payload.userId || 'demo-user',
    intent,
    input: payload.input || '',
    context: {
      rag: {
        enabled: payload.context?.rag?.enabled !== false,
        topK: payload.context?.rag?.topK || 4,
      },
      llm: {
        provider: payload.context?.llm?.provider || 'openai',
        model: payload.context?.llm?.model || 'gpt-4o',
      },
      journey: payload.context?.journey || payload.journeyContext || null,
    },
    intentSource: {
      input: payload.intent || null,
      workflow: payload.context?.journey ? `${payload.context?.journey?.journeyType || ''}/${payload.context?.journey?.phaseId || ''}` : null,
    },
    constraints: {
      timeoutMs: payload.constraints?.timeoutMs || 6000,
      maxTokens: payload.constraints?.maxTokens || 800,
    },
    toolsAllowed: Array.isArray(payload.toolsAllowed) ? payload.toolsAllowed : [],
    raw: payload,
  };
};

module.exports = {
  REQUEST_SCHEMA,
  RESPONSE_SCHEMA,
  normalizeRequest,
};
