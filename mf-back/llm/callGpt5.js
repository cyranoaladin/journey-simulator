const { openai, llmCache } = require("../utils/openaiClient");
const hash = require("object-hash");

/**
 * Calls OpenAI via Chat Completions API with structured outputs
 * @param {Object} params - Parameters for the API call
 * @param {string} params.systemPrompt - System prompt
 * @param {string} params.userPrompt - User prompt
 * @param {Object} params.responseFormat - JSON Schema response format
 * @param {string} [params.model='gpt-4o'] - Model to use
 * @param {number} [params.temperature=0.6] - Temperature
 * @param {number} [params.maxTokens=1500] - Max output tokens
 * @returns {Promise<Object>} Structured API response
 */
async function callGpt5Responses(params) {
  const {
    systemPrompt,
    userPrompt,
    responseFormat,
    model = process.env.LLM_MODEL_NAME || "gpt-4o",
    temperature = 0.6,
    maxTokens = 1500,
  } = params;

  try {
    console.log(`🚀 Calling OpenAI with model: ${model}`);

    // Cache Key Generation
    const cacheKey = hash({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
      response_format: responseFormat,
    });

    // Check Cache
    if (llmCache.has(cacheKey)) {
      console.log(`[callGpt5Responses] Cache HIT for model ${model}`);
      return llmCache.get(cacheKey);
    }

    // MOCK FOR TESTING WITHOUT API KEY
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "dummy-key") {
      console.log("[callGpt5Responses] Mocking OpenAI response (No API Key)");
      const mockResult = {
        parsed: {
          metadata: { persona_id: "test", journey_track: "test", phase_id: "learn", language: "fr" },
          ui_blocks: [{ kind: "text_block", id: "1", title: "Mock", body_markdown: "Mock content" }],
          agent_actions: [],
          next_state: { phase_id: "learn", completed_missions: [], xp_delta: 0 }
        },
        raw: { role: "assistant", content: "{}" },
        usage: { total_tokens: 100 },
        id: "mock-id-" + Date.now(),
      };
      llmCache.set(cacheKey, mockResult);
      return mockResult;
    }

    // Using the Chat Completions API (Standard for GPT-4o)
    const completion = await openai.chat.completions.parse({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: responseFormat,
      temperature,
      max_tokens: maxTokens,
    });

    const choice = completion.choices[0];
    console.log("✅ OpenAI Response received");

    const result = {
      parsed: choice.message.parsed,
      raw: choice.message,
      usage: completion.usage,
      id: completion.id,
    };

    // Store in Cache
    llmCache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error("❌ Error during OpenAI call:", error);
    throw error;
  }
}

module.exports = { callGpt5Responses };