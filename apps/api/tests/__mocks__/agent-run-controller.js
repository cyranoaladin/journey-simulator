/**
 * Mock pour agent-run-controller
 */
module.exports = {
  createAgentRun: jest.fn().mockResolvedValue({ id: 'mock-run-id', status: 'started' }),
  getAgentRun: jest.fn().mockResolvedValue({ id: 'mock-run-id', status: 'completed' }),
  getAgentRuns: jest.fn((req, res) => {
    res.status(200).json({
      runs: [],
      total: 0,
      page: 1,
      limit: 10
    });
  }),
  updateAgentRun: jest.fn().mockResolvedValue({ id: 'mock-run-id', status: 'updated' }),
  listAgentRuns: jest.fn().mockResolvedValue([]),
  deleteAgentRun: jest.fn().mockResolvedValue({ deleted: true })
};
