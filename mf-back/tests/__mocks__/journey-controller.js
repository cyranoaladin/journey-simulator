/**
 * Mock pour journey-controller
 */
module.exports = {
  createJourney: jest.fn((req, res) => {
    res.status(201).json({ success: true, journeyId: 'mock-journey-id' });
  }),
  getJourney: jest.fn((req, res) => {
    res.status(200).json({ id: req.params.id, status: 'active' });
  }),
  updateJourney: jest.fn((req, res) => {
    res.status(200).json({ success: true });
  }),
  deleteJourney: jest.fn((req, res) => {
    res.status(200).json({ success: true });
  }),
  listJourneys: jest.fn((req, res) => {
    res.status(200).json({ journeys: [] });
  }),
  advanceStep: jest.fn((req, res) => {
    res.status(200).json({ success: true, nextStep: 'mock-step' });
  })
};
