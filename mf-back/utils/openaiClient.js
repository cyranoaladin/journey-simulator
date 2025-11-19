const OpenAI = require("openai");
require("dotenv").config();

if (!process.env.OPENAI_API_KEY) {
  console.warn("WARNING: OPENAI_API_KEY is missing in .env");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Call GPT-5.1 (or fallback) with chat completions or responses API.
 * @param {Object} params
 * @param {string} [params.model="gpt-5.1"] - Model to use.
 * @param {Array} params.messages - Chat messages.
 * @param {number} [params.temperature=0.6]
 * @param {number} [params.maxTokens=1500]
 * @param {Object} [params.response_format] - For structured outputs (JSON Schema).
 * @returns {Promise<Object>} - { message, usage, id }
 */
async function callGpt5({
  model = "gpt-4o", // Fallback to gpt-4o if gpt-5.1 not available/accessible
  messages,
  temperature = 0.6,
  maxTokens = 1500,
  response_format = null,
}) {
  try {
    const options = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    if (response_format) {
      options.response_format = response_format;
    }

    const completion = await openai.chat.completions.create(options);
    const choice = completion.choices[0];

    return {
      message: choice.message,
      usage: completion.usage,
      id: completion.id,
    };
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw error;
  }
}

module.exports = {
  openai,
  callGpt5,
};
