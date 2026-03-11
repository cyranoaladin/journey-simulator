/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 * 
 * Mock pour auth middleware - utilisé dans tous les tests
 */

module.exports = {
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { id: 'test-user-id', email: 'test@example.com' };
    next();
  }),
  requireAuth: jest.fn((req, res, next) => next()),
  optionalAuth: jest.fn((req, res, next) => next())
};
