const { callGpt5 } = require("../utils/openaiClient");

/**
 * @typedef {Object} AgentContext
 * @property {string} userId
 * @property {string} journeyId
 * @property {string} phaseId
 * @property {string} trackId
 * @property {string} language
 * @property {Object} userProfile
 * @property {Array} history
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
            console.warn(`[${this.name}] Failed to parse JSON, returning raw text.`);
            return text;
        }
    }

    /**
     * Runs the agent.
     * @param {AgentContext} ctx
     * @param {Object} [options] - Override LLM options (model, temp, etc.)
     * @returns {Promise<AgentOutput>}
     */
    async run(ctx, options = {}) {
        const systemPrompt = this.buildSystemPrompt(ctx);
        const userPrompt = this.buildUserPrompt(ctx);

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ];

        // Merge default options with passed options
        const llmOptions = {
            model: "gpt-4o", // Default model
            temperature: 0.6,
            maxTokens: 2000,
            ...options,
            messages,
        };

        console.log(`[${this.name}] Running with context:`, {
            phase: ctx.phaseId,
            track: ctx.trackId,
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
