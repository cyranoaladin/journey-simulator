/**
 * @file llmRouter.ts
 * @description Routeur LLM multi-modèle avec fallback automatique et streaming SSE.
 * Remplace l'appel direct à OpenAI par une abstraction résiliente.
 *
 * Hiérarchie de fallback :
 *   reasoning  : Claude Sonnet → GPT-4o → Gemini Flash
 *   speed      : Gemini Flash → GPT-4o-mini → Claude Haiku
 *   code       : GPT-4o → Claude Sonnet → Gemini Pro
 *   agent      : GPT-4o → Claude Sonnet (pour function calling)
 *
 * @author Kimi Code CLI — 2026-03-11
 */

import OpenAI from 'openai';
import type { Response } from 'express';

export type TaskType = 'reasoning' | 'speed' | 'code' | 'agent';
export type MessageRole = 'system' | 'user' | 'assistant';

export interface LLMMessage {
  role: MessageRole;
  content: string;
}

export interface LLMRouterOptions {
  taskType?: TaskType;
  maxTokens?: number;
  temperature?: number;
  /** Si true, lève une exception au lieu de retourner null en cas d'échec total */
  throwOnFailure?: boolean;
  /** Si true, active le streaming de la réponse */
  stream?: boolean;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
  fallback?: boolean;
}

// Configuration des modèles par type de tâche
interface ModelConfig {
  provider: 'openai' | 'anthropic' | 'google';
  modelId: string;
  apiKeyEnv: string;
}

const MODEL_CHAINS: Record<TaskType, ModelConfig[]> = {
  reasoning: [
    { provider: 'openai', modelId: 'gpt-4o', apiKeyEnv: 'OPENAI_API_KEY' },
    { provider: 'openai', modelId: 'gpt-4o-mini', apiKeyEnv: 'OPENAI_API_KEY' },
  ],
  speed: [
    { provider: 'openai', modelId: 'gpt-4o-mini', apiKeyEnv: 'OPENAI_API_KEY' },
    { provider: 'openai', modelId: 'gpt-4o', apiKeyEnv: 'OPENAI_API_KEY' },
  ],
  code: [
    { provider: 'openai', modelId: 'gpt-4o', apiKeyEnv: 'OPENAI_API_KEY' },
    { provider: 'openai', modelId: 'gpt-4o-mini', apiKeyEnv: 'OPENAI_API_KEY' },
  ],
  agent: [
    { provider: 'openai', modelId: 'gpt-4o', apiKeyEnv: 'OPENAI_API_KEY' },
    { provider: 'openai', modelId: 'gpt-4o-mini', apiKeyEnv: 'OPENAI_API_KEY' },
  ],
};

// Cache des clients OpenAI
const openaiClients: Map<string, OpenAI> = new Map();

function getOpenAIClient(apiKey: string): OpenAI {
  if (!openaiClients.has(apiKey)) {
    openaiClients.set(apiKey, new OpenAI({ apiKey }));
  }
  return openaiClients.get(apiKey)!;
}

/**
 * Génère une réponse avec fallback automatique entre les modèles disponibles.
 * Pour l'instant, utilise uniquement OpenAI. L'intégration Anthropic/Google
 * sera ajoutée en Phase 2 quand les clés API seront disponibles.
 */
export async function routeWithFallback(
  messages: LLMMessage[],
  options: LLMRouterOptions = {}
): Promise<LLMResponse | null> {
  const {
    taskType = 'reasoning',
    maxTokens = 2000,
    temperature = 0.4,
    throwOnFailure = false,
  } = options;

  const chain = MODEL_CHAINS[taskType];
  const errors: Array<{ model: string; error: string }> = [];
  const startTime = Date.now();

  for (const modelConfig of chain) {
    const { provider, modelId, apiKeyEnv } = modelConfig;
    const apiKey = process.env[apiKeyEnv];

    if (!apiKey || apiKey === 'mock-key-safe') {
      errors.push({ model: modelId, error: `API key ${apiKeyEnv} not configured` });
      continue;
    }

    try {
      if (provider === 'openai') {
        const client = getOpenAIClient(apiKey);
        
        const response = await client.chat.completions.create({
          model: modelId,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          max_tokens: maxTokens,
          temperature,
        });

        const choice = response.choices[0];
        if (!choice?.message?.content) {
          throw new Error('Empty response from OpenAI');
        }

        return {
          content: choice.message.content,
          model: response.model,
          usage: {
            promptTokens: response.usage?.prompt_tokens || 0,
            completionTokens: response.usage?.completion_tokens || 0,
            totalTokens: response.usage?.total_tokens || 0,
          },
          latencyMs: Date.now() - startTime,
          fallback: false,
        };
      }
      
      // TODO: Phase 2 - Ajouter support Anthropic et Google
      errors.push({ model: modelId, error: 'Provider not yet implemented' });
      
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      errors.push({ model: modelId, error: errMsg });
      console.warn(`[LLMRouter] ${modelId} failed: ${errMsg.slice(0, 100)} — trying next...`);
    }
  }

  const summary = errors.map(e => `${e.model}: ${e.error}`).join(' | ');
  console.error(`[LLMRouter] All models failed for task "${taskType}": ${summary}`);

  if (throwOnFailure) {
    throw new Error(`[LLMRouter] All ${chain.length} models failed: ${summary}`);
  }

  // Return fallback response
  return {
    content: JSON.stringify({
      status: 'FALLBACK',
      reasoning: `[SYSTEM_FALLBACK] All LLM providers failed. Errors: ${summary}`,
      summary: 'Analysis unavailable - all AI providers offline',
      recommendations: [
        'Check API key configuration (OPENAI_API_KEY)',
        'Verify network connectivity',
        'Contact support if problem persists'
      ]
    }, null, 2),
    model: 'fallback-mode',
    usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    latencyMs: Date.now() - startTime,
    fallback: true,
  };
}

/**
 * Streame la réponse LLM via SSE vers le client Express.
 * À utiliser dans les routes Express qui nécessitent des réponses temps réel.
 *
 * @example
 * // Dans une route Express :
 * app.get('/api/zyno/stream', async (req, res) => {
 *   setupSSEHeaders(res);
 *   await streamLLMResponse(messages, res, { taskType: 'reasoning' });
 * });
 */
export function setupSSEHeaders(res: Response): void {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Nginx : désactiver le buffering
  res.flushHeaders();
}

export async function streamLLMResponse(
  messages: LLMMessage[],
  res: Response,
  options: LLMRouterOptions = {}
): Promise<void> {
  const { taskType = 'reasoning', maxTokens = 2000, temperature = 0.4 } = options;
  const chain = MODEL_CHAINS[taskType];

  for (const modelConfig of chain) {
    const { provider, modelId, apiKeyEnv } = modelConfig;
    const apiKey = process.env[apiKeyEnv];

    if (!apiKey || apiKey === 'mock-key-safe') {
      continue;
    }

    try {
      if (provider === 'openai') {
        const client = getOpenAIClient(apiKey);
        
        const stream = await client.chat.completions.create({
          model: modelId,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          max_tokens: maxTokens,
          temperature,
          stream: true,
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            res.write(`data: ${JSON.stringify({ token: content, type: 'token' })}

`);
          }
        }

        res.write(`data: ${JSON.stringify({ type: 'done' })}

`);
        res.end();
        return;
      }
      
      // TODO: Phase 2 - Support streaming pour Anthropic/Google
      console.warn(`[LLMRouter Stream] ${modelId} streaming not yet implemented`);
      
    } catch (error) {
      const modelId = modelConfig.modelId;
      console.warn(`[LLMRouter Stream] ${modelId} failed, trying next...`);
      continue;
    }
  }

  // Tous les modèles ont échoué
  res.write(`data: ${JSON.stringify({ type: 'error', message: 'All LLM providers failed' })}

`);
  res.end();
}

/**
 * Construit un message système enrichi avec le contexte MFAI.
 * Utilisé par tous les agents pour maintenir la cohérence de marque.
 */
export function buildMFAISystemMessage(agentRole: string, extraContext?: string): LLMMessage {
  return {
    role: 'system',
    content: `You are ${agentRole}, a specialized AI agent within the Money Factory AI (MFAI) ecosystem on Solana.

MFAI context:
- Platform: Proof-of-Merit Economy — skills proven on-chain via Proof-of-Skill™ cNFTs
- Core agent: Zyno (AI orchestrator guiding founders through Cognitive Activation Protocol™)
- Journey phases: Learn → Build → Prove → Activate → Scale → Launch
- Token economy: $MFAI (SPL Token-2022), AEPO scoring, Neuro-Dividends™
- Blockchain: Solana mainnet (devnet for testing)

Always respond in the user's language (French or English).
Format your response as valid JSON matching the expected output schema.
Be precise, actionable, and web3-native in your recommendations.
${extraContext ? `\nAdditional context:\n${extraContext}` : ''}`,
  };
}

/**
 * Vérifie la santé des providers LLM configurés.
 * Retourne un rapport de disponibilité.
 */
export async function checkLLMHealth(): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};
  
  // Check OpenAI
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && openaiKey !== 'mock-key-safe') {
    try {
      const client = getOpenAIClient(openaiKey);
      // Simple models list call to verify connectivity
      await client.models.list();
      results['openai'] = true;
    } catch {
      results['openai'] = false;
    }
  } else {
    results['openai'] = false;
  }
  
  // TODO: Phase 2 - Check Anthropic and Google
  results['anthropic'] = false;
  results['google'] = false;
  
  return results;
}
