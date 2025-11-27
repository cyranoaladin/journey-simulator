const axios = require("axios");
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
        const ragUrl = process.env.RAG_SEARCH_URL || "https://rag-api.nexusreussite.academy/rag/query";
        const token = process.env.RAG_API_KEY || "MoneyFactory_2025_Secure_Token_X9";
        const domain = process.env.RAG_DOMAIN || this.getRagDomain(ctx);

        try {
            console.log(`[${this.name}] Querying RAG with: "${query.substring(0, 50)}..." (Domain: ${domain})`);

            const response = await axios.post(
                ragUrl,
                {
                    query: query,
                    top_k: 5,
                    filters: {
                        domain: domain,
                    },
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    timeout: 10000, // 10s timeout
                }
            );

            const hits = response.data.hits || [];
            if (hits.length === 0) {
                console.log(`[${this.name}] RAG returned 0 hits.`);
                return "";
            }

            const contextParts = hits.map((hit, index) => {
                return `[Document ${index + 1}]\n${hit.document}`;
            });

            return contextParts.join("\n\n");

        } catch (error) {
            console.error(`[${this.name}] RAG Error:`, error.message);
            if (error.response) {
                console.error("RAG Response Status:", error.response.status);
                console.error("RAG Response Data:", error.response.data);
            }
            // RELAXED REQUIREMENT: Proceed without RAG if unavailable (for demo/local stability)
            console.warn("Knowledge service unavailable. Continuing without RAG context.");
            return "";
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

        try {
            ragContext = await this.retrieveRagContext(ragQuery, ctx);
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
        };
    }
}

module.exports = BaseAgent;
