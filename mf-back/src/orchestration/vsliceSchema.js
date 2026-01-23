/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const { z } = require('zod');
const { normalizeRequest } = require('./agentProtocol');

const journeySchema = z
  .object({
    journeyId: z.string().optional(),
    journeyType: z.string().optional(),
    phaseId: z.string().optional(),
    phases: z.array(z.string()).optional(),
    objectives: z.array(z.string()).optional(),
    artifacts: z.array(z.string()).optional(),
  })
  .optional()
  .nullable();

const requestSchema = z.object({
  traceId: z.string().optional(),
  runId: z.string().optional(),
  userId: z.string().optional(),
  intent: z.union([z.string(), z.array(z.string())]).optional(),
  input: z.string().optional(),
  context: z
    .object({
      rag: z
        .object({
          enabled: z.boolean().optional(),
          topK: z.number().optional(),
        })
        .optional(),
      llm: z
        .object({
          provider: z.string().optional(),
          model: z.string().optional(),
        })
        .optional(),
      journey: journeySchema,
    })
    .optional(),
  constraints: z
    .object({
      timeoutMs: z.number().optional(),
      maxTokens: z.number().optional(),
    })
    .optional(),
  toolsAllowed: z.array(z.string()).optional(),
});

const agentResponseSchema = z
  .object({
    agentId: z.string(),
    status: z.enum(['OK', 'WARN', 'FAIL', 'TIMEOUT']).default('WARN'),
    summary: z.string(),
    details: z.any().optional(),
    findings: z
      .array(
        z.object({
          item: z.string().optional(),
          status: z.string().optional(),
          severity: z.string().optional(),
          detail: z.string().optional(),
        })
      )
      .optional(),
    actions: z.array(z.any()).default([]),
    citations: z.array(z.any()).default([]),
    confidence: z.number().min(0).max(1).optional(),
    assumptions: z.array(z.string()).optional(),
    limits: z.array(z.string()).optional(),
    metrics: z
      .object({
        latencyMs: z.number().optional(),
        tokens: z.number().optional(),
        ragHits: z.number().optional(),
      })
      .partial()
      .optional(),
    errors: z.array(z.string()).optional(),
    traceId: z.string().optional(),
  })
  .passthrough();

function validateRequest(payload = {}) {
  const warnings = [];
  let parsed = payload;
  try {
    parsed = requestSchema.parse(payload || {});
  } catch (err) {
    warnings.push('invalid_input_schema');
  }
  const req = normalizeRequest(parsed);
  return { req, warnings };
}

function sanitizeAgentResponse(raw = {}) {
  const warnings = [];
  try {
    const parsed = agentResponseSchema.parse(raw);
    return { response: parsed, warnings };
  } catch (err) {
    warnings.push('invalid_agent_response');
    return {
      response: {
        agentId: raw.agentId || 'unknown_agent',
        status: 'WARN',
        summary: 'Agent response invalid',
        actions: [],
        citations: [],
        metrics: raw.metrics || { latencyMs: 0 },
        errors: [...(raw.errors || []), err.message].filter(Boolean),
        traceId: raw.traceId,
      },
      warnings,
    };
  }
}

module.exports = {
  validateRequest,
  sanitizeAgentResponse,
};
