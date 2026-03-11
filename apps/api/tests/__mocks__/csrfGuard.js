/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 * 
 * Mock pour csrfGuard - utilisé dans tous les tests
 */

module.exports = {
  csrfGuard: jest.fn((req, res, next) => next())
};
