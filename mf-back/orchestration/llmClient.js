const { callGpt5, DEFAULT_LLM_MODEL } = require('../utils/openaiClient');
const loggerFactory = require('../utils/logger');
const createLogger = loggerFactory.createLogger || loggerFactory.default || loggerFactory;
const llmCache = require('./llmCache');

class LLMClient {
  constructor({ provider = 'openai', model = DEFAULT_LLM_MODEL } = {}) {
    this.provider = provider;
    this.model = model || DEFAULT_LLM_MODEL;
    this.logger = createLogger(__filename);
    this.hasApiKey = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());
  }

  async generate({
    prompt,
    traceId,
    agentId,
    maxTokens = 800,
    temperature = 0.2,
    intent,
    ragSignature,
    journeySignature,
    preset,
    tenantId,
  }) {
    const started = Date.now();
    const useMock = !this.hasApiKey || process.env.SKIP_OPENAI === 'true' || process.env.NODE_ENV === 'test';
    const systemPrompt = prompt?.system || '';
    const userPrompt = prompt?.user || '';
    const tenantScoped = tenantId || traceId || 'default';
    const cacheKey = llmCache.makeKey({
      agentId,
      intent,
      prompt: { system: systemPrompt, user: userPrompt },
      constraints: { maxTokens, temperature, model: this.model },
      ragSignature,
      journeySignature,
      preset,
      tenant: tenantScoped,
    });

    const cached = llmCache.get(cacheKey, tenantScoped);
    if (cached) {
      this.logger.info('LLM cache hit', { traceId, agentId });
      return { ...cached, cacheHit: true };
    }

    if (useMock) {
      const snippet = `${systemPrompt} ${userPrompt}`.slice(0, 120);
      const text = `[MOCK][${agentId}] ${snippet}`;
      const latencyMs = Date.now() - started;
      this.logger.info('LLM mock response', { traceId, agentId, latencyMs, provider: 'mock' });
      const result = {
        text,
        tokensUsed: 0,
        provider: 'mock',
        model: 'mock-llm',
        latencyMs,
        mock: true,
      };
      llmCache.set(cacheKey, result, { tenantId: tenantScoped });
      return { ...result, cacheHit: false };
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
      useCache: false,
      metadata: { agent: agentId, traceId },
    });

    const text = res?.message?.content || '';
    const tokensUsed = res?.usage?.total_tokens || null;
    const latencyMs = Date.now() - started;
    this.logger.info('LLM call completed', { traceId, agentId, latencyMs, provider: this.provider, model: this.model, tokensUsed });
    const result = {
      text,
      tokensUsed,
      provider: this.provider,
      model: this.model,
      latencyMs,
      mock: false,
    };
    llmCache.set(cacheKey, result, { tenantId: tenantScoped });
    return result;
  }
}

module.exports = {
  LLMClient,
};
