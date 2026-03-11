/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 * 
 * Mock pour tous les models - utilisé dans tous les tests
 */

const createModelMock = () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  remove: jest.fn()
});

module.exports = {
  User: createModelMock(),
  JourneyRun: createModelMock(),
  PhaseProgress: createModelMock(),
  Submission: createModelMock(),
  AgentRun: createModelMock(),
  AgentFeedbackLog: createModelMock()
};
