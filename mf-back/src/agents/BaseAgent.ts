/**
 * Project: Money Factory AI (MFAI)
 * BaseAgent - TypeScript/Prisma Version
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { PrismaClient } from '@prisma/client';
import { 
  callLLM, 
  LLMMessage, 
  LLMResponse,
  DEFAULT_MODEL,
  DEFAULT_TEMPERATURE,
  DEFAULT_MAX_TOKENS 
} from '../llm/OpenAIClient';
import { routeWithFallback, buildMFAISystemMessage, LLMMessage as RouterMessage } from '../services/llmRouter';
import { traceAgentRun } from '../services/observability';

const prisma = new PrismaClient();

// Legacy constants for backward compatibility
const DEFAULT_LLM_MODEL = DEFAULT_MODEL;
const DEFAULT_LLM_TEMPERATURE = DEFAULT_TEMPERATURE;
const DEFAULT_LLM_MAX_OUTPUT_TOKENS = DEFAULT_MAX_TOKENS;

// Dynamic imports for CommonJS modules
const getRagSnippets = require('../rag/ragClient').getRagSnippets;
const { findOrCreateAgentRun, generateIdempotencyKey } = require('../utils/agent-idempotence');

// Types
interface AgentContext {
    userId: string;
    journeyId?: string;
    phaseId?: string;
    trackId?: string;
    language?: string;
    userProfile?: Record<string, any>;
    history?: any[];
    submission?: string;
}

interface AgentOutput {
    rawMessage: { content: string };
    payload: Record<string, any>;
    sources?: any[];
    [key: string]: any;
}

interface LLMOptions {
    model?: string;
    temperature?: number;
    maxOutputTokens?: number;
    useCache?: boolean;
    idempotencyKey?: string;
    metadata?: Record<string, any>;
    messages?: Array<{ role: string; content: string }>;
}

interface AgentRun {
    id: string;
    status: string;
    output?: any;
    durationMs?: number;
    error?: any;
}

// Utility functions
const escapeDiagramText = (value: any): any => {
    if (typeof value !== 'string') return value;
    return value
        .replaceAll('(', '\\(')
        .replaceAll(')', '\\)')
        .replaceAll('-', '\\-');
};

const sanitizeDiagramFields = (payload: any): any => {
    if (!payload || typeof payload !== 'object') return payload;
    const clone = Array.isArray(payload) ? [...payload] : { ...payload };
    const sanitizeIfString = (obj: any, key: string) => {
        if (obj && typeof obj[key] === 'string') {
            obj[key] = escapeDiagramText(obj[key]);
        }
    };
    if (clone.resources?.diagram) {
        sanitizeIfString(clone.resources.diagram, 'content');
        sanitizeIfString(clone.resources.diagram, 'label');
    }
    if (clone.resources?.data && typeof clone.resources.data === 'object') {
        sanitizeIfString(clone.resources.data, 'content');
    }
    if (clone.diagram) {
        sanitizeIfString(clone, 'diagram');
    }
    return clone;
};

const enforceReasoning = (payload: any, fallbackText: string): any => {
    if (!payload || typeof payload !== 'object') {
        return { reasoning: fallbackText || 'Aucune explication fournie', output: payload };
    }
    if (typeof payload.reasoning !== 'string' || !payload.reasoning.trim()) {
        return { ...payload, reasoning: fallbackText || 'Aucune explication fournie' };
    }
    return payload;
};

const validateMermaidContent = (diagramContent: any): { ok: boolean; reason?: string } => {
    if (typeof diagramContent !== 'string' || !diagramContent.trim()) {
        return { ok: true };
    }
    const trimmed = diagramContent.trim();
    const startsCorrectly = /^graph\s+(TD|LR)\b/i.test(trimmed);
    const hasScript = /<\s*script/i.test(trimmed);
    if (!startsCorrectly || hasScript) {
        return { ok: false, reason: 'Invalid Mermaid syntax or unsafe content' };
    }
    return { ok: true };
};

const validatePayloadShape = (payload: any): { ok: boolean; reason?: string } => {
    if (!payload || typeof payload !== 'object') {
        return { ok: false, reason: 'Payload is not an object' };
    }
    if (payload.status && String(payload.status).toLowerCase() === 'error') {
        return { ok: false, reason: 'Agent returned status ERROR' };
    }
    const diagram = payload.resources?.diagram?.content || payload.diagram;
    const mermaidCheck = validateMermaidContent(diagram);
    if (!mermaidCheck.ok) {
        return { ok: false, reason: mermaidCheck.reason || 'Invalid Mermaid diagram' };
    }
    return { ok: true };
};

class BaseAgent {
    public name: string;
    public specialty?: string;

    constructor(name: string) {
        this.name = name;
    }

    buildSystemPrompt(ctx: AgentContext): string {
        throw new Error("Method 'buildSystemPrompt' must be implemented.");
    }

    buildUserPrompt(ctx: AgentContext): string {
        throw new Error("Method 'buildUserPrompt' must be implemented.");
    }

    parseOutput(text: string, ctx: AgentContext): any {
        try {
            return JSON.parse(text);
        } catch {
            return text;
        }
    }

    getRagQuery(ctx: AgentContext): string {
        if (ctx.submission) {
            return ctx.submission;
        }
        return this.buildUserPrompt(ctx);
    }

    getRagDomain(ctx: AgentContext): string {
        return "mfai_web3";
    }

    async retrieveRagContext(query: string, ctx: AgentContext): Promise<{ context: string; hits: any[] }> {
        if (!query) return { context: "", hits: [] };

        const domain = ctx.trackId || "general";

        try {
            if (process.env.NODE_ENV !== 'test') {
                console.log(`[${this.name}] Querying RAG with: "${query.substring(0, 50)}..." (Domain: ${domain})`);
            }

            const hits = await getRagSnippets({
                query: query,
                userContext: { id: ctx.userId },
            });

            if (hits.length === 0) {
                if (process.env.NODE_ENV !== 'test') {
                    console.log(`[${this.name}] RAG returned 0 hits.`);
                }
                return { context: "", hits: [] };
            }

            const contextParts = hits.map((hit: any, index: number) => {
                return `[Document ${index + 1} - ${hit.title}]\n${hit.content}`;
            });

            return {
                context: contextParts.join("\n\n"),
                hits: hits
            };

        } catch (error: any) {
            if (process.env.NODE_ENV !== 'test') {
                console.error('RAG error', { agent: this.name, error: error.message });
            }
            return { context: "", hits: [] };
        }
    }

    async run(ctx: AgentContext, options: LLMOptions = {}): Promise<AgentOutput> {
        const startTime = Date.now();
        let agentRunId: string | null = null;

        const ragQuery = this.getRagQuery(ctx);
        const { context: ragContext, hits: ragSources } = await this.safeRetrieveRag(ragQuery, ctx);

        const { systemPrompt, userPrompt, messages } = this.buildPromptsWithContext(ctx, ragContext);

        const agentLog = await this.createAgentRunLog(ctx, systemPrompt, userPrompt, ragSources, options);
        agentRunId = agentLog.agentRunId;
        if (agentLog.cachedResponse) {
            return agentLog.cachedResponse;
        }

        const llmOptions: LLMOptions = {
            model: options.model || DEFAULT_LLM_MODEL,
            temperature: DEFAULT_LLM_TEMPERATURE,
            maxOutputTokens: DEFAULT_LLM_MAX_OUTPUT_TOKENS,
            useCache: options.useCache !== undefined ? options.useCache : true,
            ...options,
            messages,
            metadata: {
                agent: this.name,
                phase: ctx.phaseId,
                track: ctx.trackId,
                userId: ctx.userId,
                ...(options?.metadata || {}),
            },
        };

        console.log('Running with context', {
            agent: this.name,
            phase: ctx.phaseId,
            track: ctx.trackId,
            ragContextLength: ragContext.length,
            model: llmOptions.model,
            useCache: llmOptions.useCache
        });

        const runWithValidation = async (attemptMessages: any[], attemptLabel: string) => {
            // Utiliser le LLM Router avec fallback multi-modèle
            const response = await routeWithFallback(
                attemptMessages as RouterMessage[],
                {
                    taskType: 'reasoning',
                    maxTokens: llmOptions.maxOutputTokens || DEFAULT_LLM_MAX_OUTPUT_TOKENS,
                    temperature: llmOptions.temperature || DEFAULT_LLM_TEMPERATURE,
                    throwOnFailure: false, // Retourner fallback au lieu de throw
                }
            );
            
            if (!response) {
                throw new Error('LLM Router returned null response');
            }
            
            const message = { content: response.content };
            const text = response.content || "";
            let rawPayload;
            try {
                rawPayload = this.parseOutput(text, ctx);
            } catch {
                rawPayload = null;
            }
            const payloadWithReasoning = enforceReasoning(rawPayload, text);
            const payload = sanitizeDiagramFields(payloadWithReasoning);
            const validation = validatePayloadShape(payload);
            return { message, text, payload, validation, attemptLabel, fallback: response.fallback };
        };

        let attemptMessages = [...messages];
        let attempt = 0;
        let finalResult: any = null;
        let validationError: string | null = null;

        try {
            while (attempt < 2) {
                try {
                    const res = await runWithValidation(attemptMessages, `attempt_${attempt + 1}`);
                    finalResult = res;
                    if (res.validation.ok) {
                        break;
                    }
                    validationError = res.validation.reason || 'Unknown validation error';
                    attempt += 1;
                    if (attempt >= 2) break;
                    attemptMessages = [
                        ...messages,
                        { role: "system", content: `Previous output invalid: ${validationError}. Re-emit STRICT JSON with reasoning, status not ERROR, valid Mermaid diagram.` }
                    ];
                } catch (err: any) {
                    validationError = err.message;
                    attempt += 1;
                    const retriable = err?.status === 429 || (typeof err?.status === 'number' && err.status >= 500);
                    if (!retriable || attempt >= 2) {
                        throw err;
                    }
                    attemptMessages = [
                        ...messages,
                        { role: "system", content: `Previous call failed (${err.message}). Re-emit STRICT JSON with reasoning.` }
                    ];
                }
            }

            if (!finalResult) {
                const error = new Error(validationError || 'Failed to produce valid output');
                await this.updateAgentRun(agentRunId, 'failed', startTime, null, error);
                throw error;
            }

            const { message, text, payload } = finalResult;

            const resultPayload = (typeof payload === 'object' && payload !== null) ? payload : {};
            if (!resultPayload.summary && !resultPayload.output && !resultPayload.details) {
                resultPayload.summary = `Analysis complete by ${this.name}. Specialty: ${this.specialty || 'Generalist'}.`;
                resultPayload.details = `Agent ${this.name} executed successfully but produced no specific detail fields. Fallback documentation provided.`;
            }

            await this.updateAgentRun(agentRunId, 'succeeded', startTime, { raw: text, payload: resultPayload });

            // Tracing non-bloquant pour LangFuse observability
            const _runEnd = Date.now();
            traceAgentRun(
                { userId: ctx.userId, journeyId: ctx.journeyId },
                {
                    agentName: (this as any).agentId ?? this.constructor.name,
                    model: llmOptions.model ?? 'unknown',
                    input: { userPrompt: userPrompt.substring(0, 500) },
                    output: resultPayload,
                    durationMs: _runEnd - startTime,
                    success: true,
                }
            ).catch(() => {});

            return {
                rawMessage: message,
                payload: resultPayload,
                sources: ragSources,
                ...resultPayload
            };
        } catch (err: any) {
            await this.updateAgentRun(agentRunId, 'failed', startTime, null, err);

            // Tracing erreur non-bloquant
            traceAgentRun(
                { userId: ctx.userId, journeyId: ctx.journeyId },
                {
                    agentName: (this as any).agentId ?? this.constructor.name,
                    model: llmOptions?.model ?? 'unknown',
                    input: { userPrompt: userPrompt?.substring(0, 500) ?? '' },
                    output: null,
                    durationMs: Date.now() - startTime,
                    success: false,
                    error: err instanceof Error ? err.message : String(err),
                }
            ).catch(() => {});

            throw err;
        }
    }

    async safeRetrieveRag(ragQuery: string, ctx: AgentContext): Promise<{ context: string; hits: any[] }> {
        try {
            const ragResult = await this.retrieveRagContext(ragQuery, ctx);
            return { context: ragResult.context, hits: ragResult.hits };
        } catch (err: any) {
            console.warn('RAG retrieval failed, continuing without context', { agent: this.name, error: err.message });
            return { context: "", hits: [] };
        }
    }

    buildPromptsWithContext(ctx: AgentContext, ragContext: string): { systemPrompt: string; userPrompt: string; messages: Array<{ role: string; content: string }> } {
        let systemPrompt = this.buildSystemPrompt(ctx);
        const userPrompt = this.buildUserPrompt(ctx);
        if (ragContext) {
            systemPrompt += `\n\n--- RAG CONTEXT ---\n${ragContext}\n--- END CONTEXT ---\n\nYou are an expert. Use EXCLUSIVELY the context above to answer if relevant. If the answer is not there, say so.`;
        } else {
            systemPrompt += `\n\n(Note: No specific information found in the knowledge base for this query.)`;
        }
        systemPrompt += `\n\nMANDATORY: Return JSON with a "reasoning" field (string) explaining your calculations/logic BEFORE resources/actions. Be explicit and concise.`;
        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ];
        return { systemPrompt, userPrompt, messages };
    }

    async createAgentRunLog(ctx: AgentContext, systemPrompt: string, userPrompt: string, ragSources: any[], options: LLMOptions): Promise<{ agentRunId: string | null; cachedResponse: AgentOutput | null }> {
        if (!ctx.journeyId || !ctx.userId) {
            return { agentRunId: null, cachedResponse: null };
        }
        try {
            const idempotencyKey = options.idempotencyKey || generateIdempotencyKey(ctx.journeyId, ctx.phaseId || 'unknown', this.name, { userId: ctx.userId, userPrompt });
            const { run, isNew } = await findOrCreateAgentRun({
                journeyId: ctx.journeyId,
                userId: ctx.userId,
                stepId: ctx.phaseId || 'unknown',
                agentName: this.name,
                model: options.model || DEFAULT_LLM_MODEL,
                input: {
                    systemPrompt: systemPrompt.substring(0, 5000),
                    userPrompt,
                    ragHits: ragSources.length
                },
                journeyMode: ctx.userProfile?.mode,
                idempotencyKey
            });

            if (!isNew && run.status === 'succeeded' && run.output) {
                console.log('Returning cached result', { agent: this.name, idempotencyKey });
                return {
                    agentRunId: run.id || run._id,
                    cachedResponse: {
                        rawMessage: { content: run.output.raw },
                        payload: run.output.payload,
                        sources: ragSources,
                        ...(typeof run.output.payload === 'object' ? run.output.payload : {})
                    }
                };
            }

            return { agentRunId: run.id || run._id, cachedResponse: null };
        } catch (logErr: any) {
            console.warn('Failed to create AgentRun log', { agent: this.name, error: logErr.message });
            return { agentRunId: null, cachedResponse: null };
        }
    }

    async updateAgentRun(agentRunId: string | null, status: string, startTime: number, output: any, error?: Error): Promise<void> {
        if (!agentRunId) {
            return;
        }
        try {
            await prisma.agentRun.update({
                where: { id: agentRunId },
                data: {
                    status,
                    latencyMs: Date.now() - startTime,
                    output: output || (error ? { error: error.message } : undefined),
                },
            });
        } catch (e: any) {
            if (process.env.NODE_ENV !== 'test') {
                console.warn('Failed to update AgentRun', { status, error: e.message });
            }
        }
    }
}

export default BaseAgent;
module.exports = BaseAgent;
