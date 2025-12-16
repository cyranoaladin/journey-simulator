const { z } = require('zod');
const dotenv = require('dotenv');

dotenv.config({ quiet: true });

const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'http://localhost:3000',
  'http://localhost:3003',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3003',
  'https://journey.mfai.app',
  'http://journey.mfai.app'
];

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  MONGO_URI: z.string().url().optional(),
  ADMIN_API_KEY: z.string().optional(),
  SKIP_DB_CONNECTION: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().default(120),
  CORS_ALLOWED_ORIGINS: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('[env] Invalid environment configuration', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

// Always include safe local defaults, and extend with env-provided origins.
// This avoids breaking local preview/prod-like runs when CORS_ALLOWED_ORIGINS is set but incomplete.
const allowedOriginsSet = new Set(DEFAULT_ORIGINS);
if (env.CORS_ALLOWED_ORIGINS) {
  env.CORS_ALLOWED_ORIGINS
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .forEach((origin) => allowedOriginsSet.add(origin));
}
const allowedOrigins = Array.from(allowedOriginsSet);

const rateLimitConfig = {
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX
};

module.exports = {
  env,
  allowedOrigins,
  rateLimitConfig
};
