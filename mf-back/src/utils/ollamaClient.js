/**
 * Project: Money Factory AI (MFAI)
 * Ollama Client - Local LLM Inference (replaces OpenAI for cost-free local AI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA
 */

const { Ollama } = require("ollama");
require("dotenv").config({ quiet: true });

const { LRUCache } = require("lru-cache");
const hash = require("object-hash");

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";

const ollama = new Ollama({ host: OLLAMA_HOST });

const llmCache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 60 * 24,
});

const DEFAULT_LLM_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:32b';
const EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';
const DEFAULT_LLM_TEMPERATURE = Number(process.env.LLM_TEMPERATURE ?? 0.4) || 0.4;
const DEFAULT_LLM_MAX_OUTPUT_TOKENS = Number(process.env.LLM_MAX_OUTPUT_TOKENS ?? 1500) || 1500;

/**
 * Call Ollama for chat completions (replaces OpenAI callGpt5)
 * @param {Object} params
 * @param {string} [params.model] - Model name (e.g., 'qwen2.5:32b', 'llama3:8b')
 * @param {Array} [params.messages] - Chat messages [{role, content}]
 * @param {number} [params.temperature]
 * @param {number} [params.maxOutputTokens]
 * @param {number} [params.maxTokens]
 * @param {number} [params.max_output_tokens]
 * @param {Object} [params.response_format] - For structured outputs (JSON mode)
 * @param {Object} [params.metadata] - Ignored (for compatibility)
 * @param {boolean} [params.useCache] - Whether to use caching (default: true)
 * @returns {Promise<Object>} - { message, usage, id, raw }
 */
async function callOllama({
  model = DEFAULT_LLM_MODEL,
  messages,
  temperature = DEFAULT_LLM_TEMPERATURE,
  maxOutputTokens,
  maxTokens,
  max_output_tokens,
  response_format = null,
  metadata,
  useCache = true,
} = {}) {
  try {
    const resolvedMaxTokens =
      Number(maxOutputTokens ?? max_output_tokens ?? maxTokens ?? DEFAULT_LLM_MAX_OUTPUT_TOKENS) ||
      DEFAULT_LLM_MAX_OUTPUT_TOKENS;

    const cacheKey = hash({
      model,
      messages,
      temperature,
      max_tokens: resolvedMaxTokens,
      response_format,
    });

    if (useCache && llmCache.has(cacheKey)) {
      if (process.env.NODE_ENV !== 'test') {
        console.log('[OLLAMA_DEBUG]: Cache hit');
      }
      return llmCache.get(cacheKey);
    }

    if (process.env.NODE_ENV !== 'test') {
      console.log(`[OLLAMA_DEBUG]: Calling model ${model}`);
    }

    const options = {
      temperature,
      num_predict: resolvedMaxTokens,
    };

    if (response_format?.type === 'json_object') {
      options.format = 'json';
    }

    const response = await ollama.chat({
      model,
      messages,
      options,
      stream: false,
    });

    if (process.env.NODE_ENV !== 'test') {
      console.log('[OLLAMA_DEBUG]: Response received');
    }

    const result = {
      message: response.message || { role: "assistant", content: "" },
      usage: {
        prompt_tokens: response.prompt_eval_count || 0,
        completion_tokens: response.eval_count || 0,
        total_tokens: (response.prompt_eval_count || 0) + (response.eval_count || 0),
      },
      id: `ollama-${Date.now()}`,
      raw: response,
    };

    if (useCache) {
      llmCache.set(cacheKey, result);
    }

    return result;
  } catch (error) {
    console.error("[Ollama] Error calling local LLM:", error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error(`[Ollama] Connection refused. Is Ollama running at ${OLLAMA_HOST}?`);
      console.error(`[Ollama] Start Ollama with: ollama serve`);
    }
    
    throw error;
  }
}

/**
 * Generate embeddings using Ollama (replaces OpenAI embeddings)
 * @param {string} text - Text to embed
 * @param {string} [model] - Embedding model (default: nomic-embed-text)
 * @returns {Promise<number[]>} - Embedding vector
 */
async function generateEmbedding(text, model = EMBEDDING_MODEL) {
  try {
    const response = await ollama.embeddings({
      model,
      prompt: text.substring(0, 8000),
    });

    return response.embedding || [];
  } catch (error) {
    console.error("[Ollama] Embedding generation error:", error.message);
    
    if (error.message?.includes('not found')) {
      console.error(`[Ollama] Model '${model}' not found. Pull it with: ollama pull ${model}`);
    }
    
    throw error;
  }
}

/**
 * Check if Ollama is available and running
 * @returns {Promise<boolean>}
 */
async function isOllamaAvailable() {
  try {
    await ollama.list();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * List available models
 * @returns {Promise<string[]>}
 */
async function listModels() {
  try {
    const response = await ollama.list();
    return response.models.map(m => m.name);
  } catch (error) {
    console.error("[Ollama] Error listing models:", error.message);
    return [];
  }
}

module.exports = {
  ollama,
  callOllama,
  generateEmbedding,
  isOllamaAvailable,
  listModels,
  llmCache,
  DEFAULT_LLM_MODEL,
  EMBEDDING_MODEL,
  DEFAULT_LLM_TEMPERATURE,
  DEFAULT_LLM_MAX_OUTPUT_TOKENS,
  OLLAMA_HOST,
};
