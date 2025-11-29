const axios = require("axios");
const { getRagSnippets } = require("../rag/ragClient");
const {
    callGpt5,
    DEFAULT_LLM_MODEL,
    DEFAULT_LLM_TEMPERATURE,
    DEFAULT_LLM_MAX_OUTPUT_TOKENS,
} = require("../utils/openaiClient");

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
            console.log(`[${this.name}] Querying RAG with: "${query.substring(0, 50)}..." (Domain: ${domain})`);

            const hits = await getRagSnippets({
                query: query,
                userContext: { id: ctx.userId },
                // We might want to pass domain/collection if ragClient supports it, 
                // but ragClient currently uses env RAG_COLLECTION. 
                // For now, we rely on ragClient's logic.
            });

            if (hits.length === 0) {
                console.log(`[${this.name}] RAG returned 0 hits.`);
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
            console.error(`[${this.name}] RAG Error:`, error.message);
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
        // 1. Retrieve RAG Context
        const ragQuery = this.getRagQuery(ctx);
        let ragContext = "";
        let ragSources = [];

        try {
            const ragResult = await this.retrieveRagContext(ragQuery, ctx);
            ragContext = ragResult.context;
            ragSources = ragResult.hits;
        } catch (err) {
            // Propagate the error to block execution
            throw err;
        }

        // 2. Build Prompts
        let systemPrompt = this.buildSystemPrompt(ctx);
        const userPrompt = this.buildUserPrompt(ctx);

        // 3. Inject RAG Context into System Prompt
        if (ragContext) {
            systemPrompt += `\n\n--- RAG CONTEXT ---\n${ragContext}\n--- END CONTEXT ---\n\nYou are an expert. Use EXCLUSIVELY the context above to answer if relevant. If the answer is not there, say so.`;
        } else {
            // Should we block if no context found? The requirement says "If RAG returns 200 OK: Continue".
            // So empty hits is fine, but we might want to warn the model.
            systemPrompt += `\n\n(Note: No specific information found in the knowledge base for this query.)`;
        }

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ];

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

        console.log(`[${this.name}] Running with context:`, {
            phase: ctx.phaseId,
            track: ctx.trackId,
            ragContextLength: ragContext.length,
            model: llmOptions.model,
            useCache: llmOptions.useCache
        });

        const { message } = await callGpt5(llmOptions);
        const text = message.content || "";
        const payload = this.parseOutput(text, ctx);

        return {
            rawMessage: message,
            payload,
            sources: ragSources,
            ...(typeof payload === 'object' && payload !== null ? payload : {})
        };
    }
}

module.exports = BaseAgent;
