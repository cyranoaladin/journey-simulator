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

// Cleanup après chaque test
afterEach(() => {
  jest.clearAllMocks();
});
