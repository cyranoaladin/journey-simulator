export const config = {
  // App
  app: {
    name: 'Money Factory AI',
    version: '1.0.0',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://mfai.app',
  },
  
  // API
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.mfai.app',
    timeout: 30000,
    retries: 3,
  },
  
  // Solana
  solana: {
    cluster: (process.env.SOLANA_CLUSTER || 'devnet') as 'devnet' | 'testnet' | 'mainnet-beta',
    rpcUrl: process.env.SOLANA_RPC_URL,
    commitment: 'confirmed' as const,
    priorityFee: 10000, // lamports
    computeUnits: 200000,
  },
  
  // AI / LLM
  ai: {
    model: process.env.LLM_MODEL_NAME || 'gpt-4o',
    temperature: 0.3,
    maxTokens: 2000,
    timeout: 30000,
  },
  
  // Evaluation
  evaluation: {
    threshold: 60, // Minimum score to validate
    rubric: {
      completeness: { weight: 0.25, max: 25 },
      relevance: { weight: 0.25, max: 25 },
      clarity: { weight: 0.20, max: 20 },
      specificity: { weight: 0.20, max: 20 },
      innovation: { weight: 0.10, max: 10 },
    },
  },
  
  // Security
  security: {
    jwtExpiresIn: '7d',
    passwordMinLength: 8,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // requests per window
    },
  },
  
  // Features
  features: {
    enableZynoEval: process.env.ENABLE_ZYNO_EVAL === 'true',
    skipSkillVerification: process.env.SKIP_SKILL_VERIFICATION === 'true',
    demoMode: process.env.DEMO_MODE === 'true',
    killSwitch: process.env.KILL_SWITCH === '1',
  },
};

export type Config = typeof config;

// Environment validation
export function validateEnv(): void {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'ADMIN_API_KEY',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Feature flags
export const features = {
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  
  enableAI: !!process.env.OPENAI_API_KEY,
  enableRAG: !!process.env.RAG_API_KEY,
  enableWeb3: !!process.env.MINTER_SECRET_KEY,
};
