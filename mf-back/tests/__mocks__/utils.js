/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 * 
 * Mock pour modules utils - utilisé dans tous les tests
 */

module.exports = {
  agentIdempotence: {
    generateIdempotencyKey: jest.fn((input) => `key-${Date.now()}`),
    checkIdempotency: jest.fn().mockReturnValue(false),
    storeResult: jest.fn()
  },
  resourceValidator: {
    validateResource: jest.fn().mockReturnValue({ valid: true }),
    validateResources: jest.fn().mockReturnValue({ valid: true, errors: [] })
  }
};
