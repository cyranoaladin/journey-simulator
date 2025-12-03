const OpenAI = require("openai");
require("dotenv").config();

if (!process.env.OPENAI_API_KEY) {
  console.warn("WARNING: OPENAI_API_KEY is missing in .env");
}

const hasRealApiKey = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());
const apiKey = hasRealApiKey ? process.env.OPENAI_API_KEY : "dummy-key";

const { LRUCache } = require("lru-cache");
const hash = require("object-hash");

const openai = new OpenAI({
  apiKey,
});

// Initialize LRU Cache
// Max 500 items, max age 24 hours
const llmCache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 60 * 24,
});

const DEFAULT_LLM_MODEL = process.env.LLM_MODEL_NAME || "gpt-4o";
const GPT_MINI_MODEL = "gpt-4o-mini"; // Cost-effective model for simpler tasks
const DEFAULT_LLM_TEMPERATURE = Number(process.env.LLM_TEMPERATURE ?? 0.4) || 0.4;
const DEFAULT_LLM_MAX_OUTPUT_TOKENS = Number(process.env.LLM_MAX_OUTPUT_TOKENS ?? 1500) || 1500;

/**
 * Call GPT-3.5-turbo via the Chat Completions API with optional structured output.
 * @param {Object} params
 * @param {string} [params.model]
 * @param {Array} [params.messages]
 * @param {number} [params.temperature]
 * @param {number} [params.maxOutputTokens]
 * @param {number} [params.maxTokens]
 * @param {number} [params.max_output_tokens]
 * @param {Object} [params.response_format] - For structured outputs
 * @param {Object} [params.metadata]
 * @param {string} [params.reasoning_effort] - Reasoning effort level
 * @param {boolean} [params.useCache] - Whether to use caching (default: true)
 * @returns {Promise<Object>} - { message, usage, id, raw }
 */
async function callGpt5({
  model = DEFAULT_LLM_MODEL,
  messages,
  temperature = DEFAULT_LLM_TEMPERATURE,
  maxOutputTokens,
  maxTokens,
  max_output_tokens,
  response_format = null,
  metadata,
  reasoning_effort,
  useCache = true,
} = {}) {
  try {
    const shouldMockResponse =
      !hasRealApiKey ||
      process.env.NODE_ENV === "test" ||
      process.env.SKIP_OPENAI === "true";

    const resolvedMaxTokens =
      Number(maxOutputTokens ?? max_output_tokens ?? maxTokens ?? DEFAULT_LLM_MAX_OUTPUT_TOKENS) ||
      DEFAULT_LLM_MAX_OUTPUT_TOKENS;

    const payload = {
      model,
      messages,
      temperature,
      max_tokens: resolvedMaxTokens,
    };

    // Add response format for structured outputs if provided
    if (response_format) {
      // Handle both traditional response_format and new structured outputs format
      if (response_format.type === 'json_schema') {
        // For structured outputs, we'll need to use the beta API separately
        // For now, we return the traditional format if response_format is provided but use standard call
        payload.response_format = { type: "text" }; // Default, for compatibility
      } else {
        payload.response_format = response_format;
      }
    }

    // Cache Key Generation
    const cacheKey = hash({
      model,
      messages,
      temperature,
      max_tokens: resolvedMaxTokens,
      response_format: payload.response_format,
    });

    // Check Cache
    if (useCache && llmCache.has(cacheKey)) {
      console.log(`[callGpt5] Cache HIT for model ${model}`);
      return llmCache.get(cacheKey);
    }

    if (shouldMockResponse) {
      const mockMessage = {
        role: "assistant",
        content: "[MOCK] OpenAI response unavailable in current environment.",
      };

      const mockResult = {
        message: mockMessage,
        usage: null,
        id: `mock-openai-${Date.now()}`,
        raw: null,
      };

      if (useCache) {
        llmCache.set(cacheKey, mockResult);
      }

      return mockResult;
    }

    // Add metadata if provided
    if (metadata) {
      // OpenAI doesn't accept metadata in payload directly, but we could log it or handle differently
      console.log(`[callGpt5] Calling model ${model} for agent: ${metadata.agent || 'unknown'}, phase: ${metadata.phase || 'unknown'}`);
    }

    // Add reasoning_effort if supported (currently not in OpenAI API but keeping for future compatibility)
    if (reasoning_effort) {
      console.log(`[callGpt5] Reasoning effort: ${reasoning_effort} (not supported by OpenAI API)`);
    }

    const completion = await openai.chat.completions.create(payload);
    const choice = completion.choices[0];

    const result = {
      message: choice?.message || { role: "assistant", content: "" },
      usage: completion.usage || null,
      id: completion.id,
      raw: completion,
    };

    // Store in Cache
    if (useCache) {
      llmCache.set(cacheKey, result);
    }

    return result;
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw error;
  }
}

module.exports = {
  openai,
  callGpt5,
  llmCache,
  DEFAULT_LLM_MODEL,
  GPT_MINI_MODEL,
  DEFAULT_LLM_TEMPERATURE,
  DEFAULT_LLM_MAX_OUTPUT_TOKENS,
};
