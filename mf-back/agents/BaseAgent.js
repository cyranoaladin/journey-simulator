const { getRagSnippets } = require("../rag/ragClient");
const {
    callGpt5,
    DEFAULT_LLM_MODEL,
    DEFAULT_LLM_TEMPERATURE,
    DEFAULT_LLM_MAX_OUTPUT_TOKENS,
} = require("../utils/openaiClient");

class BaseAgent {
    constructor(name) {
        this.name = name;
    }

    buildSystemPrompt(ctx) { throw new Error("Method 'buildSystemPrompt' must be implemented."); }
    buildUserPrompt(ctx) { throw new Error("Method 'buildUserPrompt' must be implemented."); }

    parseOutput(text, ctx) {
        try { return JSON.parse(text); } catch (e) { return text; }
    }

    getRagQuery(ctx) {
        return ctx.submission || this.buildUserPrompt(ctx);
    }

    getRagDomain(ctx) { return "mfai_web3"; }

    async retrieveRagContext(query, ctx) {
        if (!query) return { context: "", hits: [] };
        
        // MOCK TEST: Avoid network calls in test mode
        if (process.env.NODE_ENV === 'test') {
            return { context: "", hits: [] };
        }

        try {
            console.log(`[${this.name}] Querying RAG...`);
            const hits = await getRagSnippets({
                query: query,
                userContext: { id: ctx.userId },
            });

            if (!hits || hits.length === 0) return { context: "", hits: [] };

            const contextParts = hits.map((hit, index) => 
                `[Document ${index + 1} - ${hit.title}]\n${hit.content}`
            );

            return { context: contextParts.join("\n\n"), hits: hits };

        } catch (error) {
            // FIX: Single string argument for console.warn (Critical for CI/CD tests)
            console.warn(`[${this.name}] RAG Error (Recoverable): ${error.message}`);
            return { context: "", hits: [] };
        }
    }

    async run(ctx, options = {}) {
        let ragContext = "";
        let ragSources = [];

        try {
            const ragResult = await this.retrieveRagContext(this.getRagQuery(ctx), ctx);
            ragContext = ragResult.context;
            ragSources = ragResult.hits;
        } catch (err) {
            // FIX: Single string argument here too
            console.warn(`[${this.name}] RAG failure (proceeding without context): ${err.message}`);
        }

        let systemPrompt = this.buildSystemPrompt(ctx);
        const userPrompt = this.buildUserPrompt(ctx);

        if (ragContext) {
            systemPrompt += `\n\n--- RAG CONTEXT ---\n${ragContext}\n--- END CONTEXT ---\n\nUse this context primarily.`;
        }

        const llmOptions = {
            model: options.model || DEFAULT_LLM_MODEL,
            temperature: DEFAULT_LLM_TEMPERATURE,
            maxOutputTokens: DEFAULT_LLM_MAX_OUTPUT_TOKENS,
            useCache: options.useCache !== undefined ? options.useCache : true,
            ...options,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ]
        };

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
