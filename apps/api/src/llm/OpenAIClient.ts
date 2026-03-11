/**
 * OpenAI Client - TypeScript/Production Ready with Fallback Mode
 * Project: Money Factory AI (MFAI)
 */

import OpenAI from 'openai';

// Types
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
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
  cached: boolean;
  fallback?: boolean;
}

export interface LLMOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  messages: LLMMessage[];
}

// Constants - Configurable via environment
export const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';
export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_MAX_TOKENS = 2048;
export const FALLBACK_ENABLED = process.env.LLM_FALLBACK_ENABLED !== 'false';

// Singleton OpenAI client
let openaiClient: OpenAI | null = null;
let clientInitialized = false;

function getOpenAIClient(): OpenAI | null {
  if (clientInitialized) {
    return openaiClient;
  }
  
  clientInitialized = true;
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey.trim() === '' || apiKey === 'mock-key-safe') {
    console.warn('⚠️  [LLM] No valid OPENAI_API_KEY - running in fallback mode');
    return null;
  }

  try {
    openaiClient = new OpenAI({ apiKey });
    console.log('✅ OpenAI client initialized');
    return openaiClient;
  } catch (error: any) {
    console.error('[LLM Error] Failed to initialize OpenAI client:', error.message);
    return null;
  }
}

/**
 * Generate fallback response when API is unavailable
 */
function generateFallbackResponse(messages: LLMMessage[], errorMessage: string, latencyMs: number): LLMResponse {
  const userMessage = messages.find(m => m.role === 'user')?.content || 'your request';
  const shortUserMsg = userMessage.substring(0, 100);
  
  const fallbackContent = JSON.stringify({
    status: 'FALLBACK',
    reasoning: `[SYSTEM_FALLBACK] Zyno is currently operating in offline mode due to API restrictions. (Error: ${errorMessage})`,
    summary: `Analysis en mode hors-ligne pour: "${shortUserMsg}..."`,
    recommendations: [
      'Le système fonctionne en mode dégradé',
      'Les analyses seront simulées jusqu\'à la restauration de l\'API',
      'Vérifiez la configuration OPENAI_API_KEY et OPENAI_MODEL'
    ],
    architecture: {
      frontend: 'React/Next.js avec TailwindCSS',
      backend: 'Node.js/Express avec TypeScript',
      blockchain: 'Solana avec Anchor Framework',
      data: 'PostgreSQL avec Prisma ORM'
    },
    actions: [
      'Définir les spécifications fonctionnelles',
      'Créer le schéma de base de données',
      'Implémenter les smart contracts de base'
    ]
  }, null, 2);

  console.log('[LLM] Returning fallback response');

  return {
    content: fallbackContent,
    model: 'fallback-mode',
    usage: {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    },
    latencyMs,
    cached: false,
    fallback: true,
  };
}

/**
 * Call OpenAI Chat Completion API with Fallback
 */
export async function callLLM(options: LLMOptions): Promise<LLMResponse> {
  const startTime = Date.now();
  
  const {
    model = DEFAULT_MODEL,
    temperature = DEFAULT_TEMPERATURE,
    maxTokens = DEFAULT_MAX_TOKENS,
    messages,
  } = options;

  if (!messages || messages.length === 0) {
    const latencyMs = Date.now() - startTime;
    return generateFallbackResponse([], 'Messages array is empty', latencyMs);
  }

  const client = getOpenAIClient();
  
  // If no client available, return fallback immediately
  if (!client) {
    const latencyMs = Date.now() - startTime;
    return generateFallbackResponse(messages, 'OpenAI client not available', latencyMs);
  }

  try {
    const response = await client.chat.completions.create({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    });

    const latencyMs = Date.now() - startTime;
    const choice = response.choices[0];
    
    if (!choice || !choice.message) {
      return generateFallbackResponse(messages, 'No response from OpenAI', latencyMs);
    }

    return {
      content: choice.message.content || '',
      model: response.model,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      latencyMs,
      cached: false,
      fallback: false,
    };
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    const errorMsg = error.message || 'Unknown error';
    const status = error?.status || 'N/A';
    
    console.error('[LLM Error]', {
      message: errorMsg,
      status,
      model,
      latencyMs,
    });

    // Return fallback instead of throwing
    if (FALLBACK_ENABLED) {
      return generateFallbackResponse(messages, `${status}: ${errorMsg}`, latencyMs);
    }
    
    throw error;
  }
}

/**
 * Build a simple prompt for agent interactions
 */
export function buildAgentPrompt(
  systemPrompt: string,
  userMessage: string,
  context?: string
): LLMMessage[] {
  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
  ];

  if (context) {
    messages.push({
      role: 'system',
      content: `--- CONTEXT ---\n${context}\n--- END CONTEXT ---`,
    });
  }

  messages.push({ role: 'user', content: userMessage });

  return messages;
}

// Legacy exports for backward compatibility
export const DEFAULT_LLM_MODEL = DEFAULT_MODEL;
export const DEFAULT_LLM_TEMPERATURE = DEFAULT_TEMPERATURE;
export const DEFAULT_LLM_MAX_OUTPUT_TOKENS = DEFAULT_MAX_TOKENS;

export async function callGpt5(options: any): Promise<{ message: { content: string }; usage?: any }> {
  const response = await callLLM({
    model: options.model || DEFAULT_MODEL,
    temperature: options.temperature || DEFAULT_TEMPERATURE,
    maxTokens: options.maxOutputTokens || DEFAULT_MAX_TOKENS,
    messages: options.messages,
  });
  
  return {
    message: { content: response.content },
    usage: response.usage,
  };
}
