/**
 * Mock pour journey-state-service
 */
module.exports = {
  getJourneyState: jest.fn().mockResolvedValue({
    journeyId: 'mock-journey-id',
    currentPhase: 'phase1',
    status: 'active',
    progress: 0.5
  }),
  updateJourneyState: jest.fn().mockResolvedValue({ updated: true }),
  transitionPhase: jest.fn().mockResolvedValue({ 
    success: true, 
    newPhase: 'phase2' 
  }),
  resetJourneyState: jest.fn().mockResolvedValue({ reset: true })
};
