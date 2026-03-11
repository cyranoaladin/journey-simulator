/**
 * Mock pour agent_metrics
 */
module.exports = {
  saveFeedback: jest.fn().mockResolvedValue({ saved: true }),
  getMetrics: jest.fn().mockResolvedValue({ metrics: [] }),
  updateMetrics: jest.fn().mockResolvedValue({ updated: true })
};
