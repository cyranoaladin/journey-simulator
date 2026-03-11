/**
 * Mock pour journey-metrics-service
 */
module.exports = {
  calculateMetrics: jest.fn().mockResolvedValue({
    totalJourneys: 10,
    completedJourneys: 5,
    averageCompletionTime: 3600,
    successRate: 0.5
  }),
  getJourneyMetrics: jest.fn().mockResolvedValue({
    journeyId: 'mock-journey-id',
    phases: [],
    totalTime: 0,
    status: 'active'
  }),
  updateMetrics: jest.fn().mockResolvedValue({ updated: true }),
  aggregateMetrics: jest.fn().mockResolvedValue({ aggregated: true })
};
