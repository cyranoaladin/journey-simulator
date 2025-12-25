const { callGpt5, DEFAULT_LLM_MODEL } = require('../utils/openaiClient');
const loggerFactory = require('../utils/logger');
const createLogger = loggerFactory.createLogger || loggerFactory.default || loggerFactory;

class LLMClient {
  constructor({ provider = 'openai', model = DEFAULT_LLM_MODEL } = {}) {
    this.provider = provider;
    this.model = model || DEFAULT_LLM_MODEL;
    this.logger = createLogger(__filename);
    this.hasApiKey = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());
  }

  async generate({ prompt, traceId, agentId, maxTokens = 800, temperature = 0.2 }) {
    const started = Date.now();
    const useMock = !this.hasApiKey || process.env.SKIP_OPENAI === 'true' || process.env.NODE_ENV === 'test';
    const systemPrompt = prompt?.system || '';
    const userPrompt = prompt?.user || '';

    if (useMock) {
      const snippet = `${systemPrompt} ${userPrompt}`.slice(0, 120);
      const text = `[MOCK][${agentId}] ${snippet}`;
      const latencyMs = Date.now() - started;
      this.logger.info('LLM mock response', { traceId, agentId, latencyMs, provider: 'mock' });
      return {
        text,
        tokensUsed: 0,
        provider: 'mock',
        model: 'mock-llm',
        latencyMs,
        mock: true,
      };
    }

    const res = await callGpt5({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      maxTokens,
      maxOutputTokens: maxTokens,
      useCache: true,
      metadata: { agent: agentId, traceId },
    });

    const text = res?.message?.content || '';
    const tokensUsed = res?.usage?.total_tokens || null;
    const latencyMs = Date.now() - started;
    this.logger.info('LLM call completed', { traceId, agentId, latencyMs, provider: this.provider, model: this.model, tokensUsed });
    return {
      text,
      tokensUsed,
      provider: this.provider,
      model: this.model,
      latencyMs,
      mock: false,
    };
  }
}

module.exports = {
  LLMClient,
};
