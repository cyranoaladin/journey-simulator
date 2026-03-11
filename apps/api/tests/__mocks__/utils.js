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
    validateResources: jest.fn().mockReturnValue({ valid: true, errors: [] }),
    isValidUrl: (string) => {
      try { return Boolean(new URL(string)); } catch (e) { return false; }
    },
    sanitizeResourceBlock: async (block) => {
      // Simple mock implementation for testing
      const axios = require('axios');
      if (!block.resources) return block;
      for (const res of block.resources) {
        try {
          if (res.url.includes('bad-site')) throw new Error('Network Error'); // Simulate failure based on URL content
          await axios.head(res.url); // Mocked
        } catch (e) {
          res.url = `https://google.com/search?q=${encodeURIComponent(res.label)}`;
          res.status = 'unreachable';
        }
      }
      return block;
    },
    validateAndSanitizeResponse: async (response) => {
      // Traverse and sanitize
      if (response.ui_blocks) {
        for (const block of response.ui_blocks) {
          if (block.kind === 'resource_block') {
            // Start of sanitize logic duplicate call
            // In real code call sanitizeResourceBlock
            // But here we need to define it first or reference it.
            // Since this is an object property value, `this` might be tricky or we duplicate logic for the mock.
            // Let's use the same logic inline for simplicity in a mock file.
            const axios = require('axios');
            if (block.resources) {
              for (const res of block.resources) {
                // Assume good for this test case
              }
            }
          }
        }
      }
      return response;
    }
  }
};
