/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 * 
 * Jest Global Setup - Configuration pour tous les tests
 */

const { webcrypto } = require('node:crypto');
const { Buffer } = require('node:buffer');

// Setup crypto polyfills pour Node.js
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

if (typeof globalThis.crypto === 'undefined') {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      getRandomValues: (arr) => webcrypto.getRandomValues(arr),
      randomUUID: () => webcrypto.randomUUID(),
      subtle: webcrypto.subtle,
      randomBytes: (size) => webcrypto.getRandomValues(Buffer.alloc(size)),
    },
    configurable: true,
  });
}

if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}

// Mock environment variables pour les tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.SKIP_DB_CONNECTION = 'true';

// Augmenter les timeouts pour les tests d'intégration
jest.setTimeout(30000);

// Mock console pour réduire le bruit dans les tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global Prisma Mock to avoid "role root does not exist"
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn((callback) => callback({ user: { findUnique: jest.fn() } })),
    user: { findUnique: jest.fn(), create: jest.fn(), upsert: jest.fn() },
    journey: { create: jest.fn(), findUnique: jest.fn(), findMany: jest.fn() },
    agentLog: { create: jest.fn(), createMany: jest.fn() },
    wallet: { findUnique: jest.fn(), upsert: jest.fn() },
    journeyState: { upsert: jest.fn() }
  }))
}));

// Mock Langfuse to avoid ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG
jest.mock('langfuse', () => ({
  Langfuse: jest.fn().mockImplementation(() => ({
    trace: jest.fn().mockReturnValue({
      span: jest.fn().mockReturnValue({ end: jest.fn() }),
      generation: jest.fn().mockReturnValue({ end: jest.fn() }),
      event: jest.fn(),
      update: jest.fn(),
    }),
    flush: jest.fn().mockResolvedValue(undefined),
  })),
  observe: jest.fn().mockReturnValue({
    span: jest.fn().mockReturnValue({ end: jest.fn() }),
    generation: jest.fn().mockReturnValue({ end: jest.fn() }),
  }),
}));

// Mock observability module
jest.mock('../src/services/observability', () => ({
  traceAgentRun: jest.fn().mockResolvedValue(undefined),
  getLangfuseClient: jest.fn().mockReturnValue(null),
  withTracing: jest.fn((fn) => fn),
}));

// Cleanup après chaque test
afterEach(() => {
  jest.clearAllMocks();
});
