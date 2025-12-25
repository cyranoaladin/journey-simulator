/**
 * Agent Interface Contract (source of truth)
 *
 * Each agent module MUST export a class with:
 * - static agentId (optional) or instance agentId property
 * - run(request) => Promise<AgentResponse>
 *
 * request (normalized):
 * {
 *   traceId: string,
 *   runId: string,
 *   intentNormalized: string,
 *   input: string,
 *   ragContext: any,
 *   constraints: { timeoutMs?: number, maxTokens?: number },
 * }
 *
 * AgentResponse (structured, no throws):
 * {
 *   agentId: string,
 *   status: "OK" | "WARN" | "FAIL" | "TIMEOUT",
 *   summary: string,
 *   details?: string,
 *   actions?: string[],
 *   citations?: any[],
 *   metrics?: { latencyMs?: number, tokensUsed?: number, ragHits?: number },
 *   errors?: string[],
 *   traceId?: string
 * }
 *
 * Metadata stored in registry:
 * {
 *   agentId: string,
 *   domain: string,
 *   capabilities: string[],
 *   intents: string[],
 *   requiresRag: boolean,
 *   defaultModel: string,
 *   maxTokens: number,
 *   timeoutMs: number,
 *   confidenceWeight: number,
 *   inputSchema: object,
 *   outputSchema: object,
 * }
 */

module.exports = {};
