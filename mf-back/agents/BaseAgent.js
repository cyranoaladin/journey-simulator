const axios = require("axios");
const { getRagSnippets } = require("../rag/ragClient");
const {
    callGpt5,
    DEFAULT_LLM_MODEL,
    DEFAULT_LLM_TEMPERATURE,
    DEFAULT_LLM_MAX_OUTPUT_TOKENS,
} = require("../utils/openaiClient");
const AgentRun = require("../models/agent-run");
const { findOrCreateAgentRun, generateIdempotencyKey } = require("../utils/agent-idempotence");

const escapeDiagramText = (value) => {
    if (typeof value !== 'string') return value;
    return value
        .replaceAll('(', '\\(')
        .replaceAll(')', '\\)')
        .replaceAll('-', '\\-');
};

const sanitizeDiagramFields = (payload) => {
    if (!payload || typeof payload !== 'object') return payload;
    const clone = Array.isArray(payload) ? [...payload] : { ...payload };
    const sanitizeIfString = (obj, key) => {
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

const enforceReasoning = (payload, fallbackText) => {
    if (!payload || typeof payload !== 'object') {
        return { reasoning: fallbackText || 'Aucune explication fournie', output: payload };
    }
    if (typeof payload.reasoning !== 'string' || !payload.reasoning.trim()) {
        return { ...payload, reasoning: fallbackText || 'Aucune explication fournie' };
    }
    return payload;
};

const validateMermaidContent = (diagramContent) => {
    if (typeof diagramContent !== 'string' || !diagramContent.trim()) {
        return { ok: true };
    }
    try {
        // Optional server-side parse if available
        // eslint-disable-next-line global-require, import/no-extraneous-dependencies
        const mermaid = require('mermaid'); // may throw if not installed server-side
        if (mermaid?.parse) {
            mermaid.parse(diagramContent);
            return { ok: true };
        }
    } catch (err) {
        // fall back to regex validation
    }
    const trimmed = diagramContent.trim();
    const startsCorrectly = /^graph\s+(TD|LR)\b/i.test(trimmed);
    const hasScript = /<\s*script/i.test(trimmed);
    if (!startsCorrectly || hasScript) {
        return { ok: false, reason: 'Invalid Mermaid syntax or unsafe content' };
    }
    return { ok: true };
};

const validatePayloadShape = (payload) => {
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

/**
 * @typedef {Object} AgentContext
 * @property {string} userId
 * @property {string} journeyId
 * @property {string} phaseId
 * @property {string} trackId
 * @property {string} language
 * @property {Object} userProfile
 * @property {Array} history
 * @property {string} [submission]
 */

/**
 * @typedef {Object} AgentOutput
 * @property {Object} rawMessage
 * @property {Object} payload
 */

class BaseAgent {
    constructor(name) {
        this.name = name;
    }

    /**
     * Builds the system prompt.
     * @param {AgentContext} ctx
     * @returns {string}
     */
    buildSystemPrompt(ctx) {
        throw new Error("Method 'buildSystemPrompt' must be implemented.");
    }

    /**
     * Builds the user prompt.
     * @param {AgentContext} ctx
     * @returns {string}
     */
    buildUserPrompt(ctx) {
        throw new Error("Method 'buildUserPrompt' must be implemented.");
    }

    /**
     * Parses the LLM output.
     * @param {string} text
     * @param {AgentContext} ctx
     * @returns {any}
     */
    parseOutput(text, ctx) {
        try {
            return JSON.parse(text);
        } catch (e) {
            // Failed to parse JSON, returning raw text.
            return text;
        }
    }

    /**
     * Extracts the query for the RAG system.
     * @param {AgentContext} ctx
     * @returns {string}
     */
    getRagQuery(ctx) {
        // Prefer the explicit submission if available, otherwise fall back to user prompt
        if (ctx.submission) {
            return ctx.submission;
        }
        // Fallback: might be too long or contain instructions, but better than nothing
        // In a real scenario, we might want a specific method to extract the core query
        return this.buildUserPrompt(ctx);
    }

    /**
     * Returns the RAG domain filter for this agent.
     * Subclasses can override this to target specific knowledge bases.
     * @param {AgentContext} ctx
     * @returns {string}
     */
    getRagDomain(ctx) {
        return "mfai_web3";
    }

    /**
     * Retrieves context from the local RAG.
     * @param {string} query
     * @param {AgentContext} ctx
     * @returns {Promise<string>}
     */
    async retrieveRagContext(query, ctx) {
        if (!query) return { context: "", hits: [] };

        const domain = ctx.trackId || "general";

        try {
            // Only log in non-test environments to reduce noise in CI
            if (process.env.NODE_ENV !== 'test') {
                console.log(`[${this.name}] Querying RAG with: "${query.substring(0, 50)}..." (Domain: ${domain})`);
            }

            const hits = await getRagSnippets({
                query: query,
                userContext: { id: ctx.userId },
                // We might want to pass domain/collection if ragClient supports it,
                // but ragClient currently uses env RAG_COLLECTION.
                // For now, we rely on ragClient's logic.
            });

            if (hits.length === 0) {
                if (process.env.NODE_ENV !== 'test') {
                    console.log(`[${this.name}] RAG returned 0 hits.`);
                }
                return { context: "", hits: [] };
            }

            const contextParts = hits.map((hit, index) => {
                // ragClient returns { title, content }
                return `[Document ${index + 1} - ${hit.title}]\n${hit.content}`;
            });

            return {
                context: contextParts.join("\n\n"),
                hits: hits
            };

        } catch (error) {
            // Only log errors in non-test environments to reduce noise in CI
            // RAG errors are non-blocking - continue without context
            if (process.env.NODE_ENV !== 'test') {
                console.error('RAG error', { agent: this.name, error: error.message });
            }
            // ragClient handles fallback, so if we get here, it's a critical error
            return { context: "", hits: [] };
        }
    }

    /**
     * Runs the agent.
     * @param {AgentContext} ctx
     * @param {Object} [options] - Override LLM options (model, temp, etc.)
     * @returns {Promise<AgentOutput>}
     */
    async run(ctx, options = {}) {
        const startTime = Date.now();
        let agentRun = null;

        const ragQuery = this.getRagQuery(ctx);
        const { context: ragContext, hits: ragSources } = await this.safeRetrieveRag(ragQuery, ctx);

        const { systemPrompt, userPrompt, messages } = this.buildPromptsWithContext(ctx, ragContext);

        const agentLog = await this.createAgentRunLog(ctx, systemPrompt, userPrompt, ragSources, options);
        agentRun = agentLog.agentRun;
        if (agentLog.cachedResponse) {
            return agentLog.cachedResponse;
        }

        // Merge default options with passed options
        const llmOptions = {
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

        const runWithValidation = async (attemptMessages, attemptLabel) => {
            const { message } = await callGpt5({ ...llmOptions, messages: attemptMessages });
            const text = message.content || "";
            let rawPayload;
            try {
                rawPayload = this.parseOutput(text, ctx);
            } catch (parseErr) {
                rawPayload = null;
            }
            const payloadWithReasoning = enforceReasoning(rawPayload, text);
            const payload = sanitizeDiagramFields(payloadWithReasoning);
            const validation = validatePayloadShape(payload);
            return { message, text, payload, validation, attemptLabel };
        };

        let attemptMessages = [...messages];
        let attempt = 0;
        let finalResult = null;
        let validationError = null;

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
                } catch (err) {
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
                await this.updateAgentRun(agentRun, 'failed', startTime, null, error);
                throw error;
            }

            const { message, text, payload } = finalResult;

            await this.updateAgentRun(agentRun, 'succeeded', startTime, { raw: text, payload });

            return {
                rawMessage: message,
                payload,
                sources: ragSources,
                ...(typeof payload === 'object' && payload !== null ? payload : {})
            };
        } catch (err) {
            await this.updateAgentRun(agentRun, 'failed', startTime, null, err);
            throw err;
        }
    }

    async safeRetrieveRag(ragQuery, ctx) {
        try {
            const ragResult = await this.retrieveRagContext(ragQuery, ctx);
            return { context: ragResult.context, hits: ragResult.hits };
        } catch (err) {
            console.warn('RAG retrieval failed, continuing without context', { agent: this.name, error: err.message });
            return { context: "", hits: [] };
        }
    }

    buildPromptsWithContext(ctx, ragContext) {
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

    async createAgentRunLog(ctx, systemPrompt, userPrompt, ragSources, options) {
        if (!ctx.journeyId || !ctx.userId) {
            return { agentRun: null, cachedResponse: null };
        }
        try {
            const idempotencyKey = options.idempotencyKey || generateIdempotencyKey(ctx.journeyId, ctx.phaseId || 'unknown', this.name, { userId: ctx.userId });
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
                    agentRun: run,
                    cachedResponse: {
                        rawMessage: { content: run.output.raw },
                        payload: run.output.payload,
                        sources: ragSources,
                        ...(typeof run.output.payload === 'object' ? run.output.payload : {})
                    }
                };
            }

            return { agentRun: run, cachedResponse: null };
        } catch (logErr) {
            console.warn('Failed to create AgentRun log', { agent: this.name, error: logErr.message });
            return { agentRun: null, cachedResponse: null };
        }
    }

    async updateAgentRun(agentRun, status, startTime, output, error) {
        if (!agentRun) {
            return;
        }
        agentRun.status = status;
        agentRun.durationMs = Date.now() - startTime;
        if (output) {
            agentRun.output = output;
        }
        if (error) {
            agentRun.error = { message: error.message, stack: error.stack };
        }
        await agentRun.save().catch((e) => {
            const errorMsg = e instanceof Error ? e.message : String(e);
            if (process.env.NODE_ENV !== 'test') {
                console.warn('Failed to update AgentRun', { status, error: errorMsg });
            }
        });
    }
}

module.exports = BaseAgent;
