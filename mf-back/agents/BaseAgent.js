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
        return this.buildUserPrompt(ctx);
    }

    /**
     * Returns the RAG domain filter for this agent.
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
     * @returns {Promise<Object>}
     */
    async retrieveRagContext(query, ctx) {
        if (!query) return { context: "", hits: [] };

        const domain = ctx.trackId || "general";

        try {
            console.log(`[${this.name}] Querying RAG with: "${query.substring(0, 50)}..." (Domain: ${domain})`);

            const hits = await getRagSnippets({
                query: query,
                userContext: { id: ctx.userId },
            });

            if (hits.length === 0) {
                console.log(`[${this.name}] RAG returned 0 hits.`);
                return { context: "", hits: [] };
            }

            const contextParts = hits.map((hit, index) => {
                return `[Document ${index + 1} - ${hit.title}]\n${hit.content}`;
            });

            return {
                context: contextParts.join("\n\n"),
                hits: hits
            };

        } catch (error) {
            console.error(`[${this.name}] RAG Error:`, error.message);
            // Critical fix: Return empty context on error instead of throwing
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
            // FIX: Don't block execution if RAG fails entirely (e.g. network down)
            console.warn(`[${this.name}] RAG completely failed (proceeding without context):`, err.message);
            ragContext = "";
            ragSources = [];
        }

        // 2. Build Prompts
        let systemPrompt = this.buildSystemPrompt(ctx);
        const userPrompt = this.buildUserPrompt(ctx);

        // 3. Inject RAG Context into System Prompt
        if (ragContext) {
            systemPrompt += `\n\n--- RAG CONTEXT ---\n${ragContext}\n--- END CONTEXT ---\n\nYou are an expert. Use EXCLUSIVELY the context above to answer if relevant. If the answer is not there, say so.`;
        } else {
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
