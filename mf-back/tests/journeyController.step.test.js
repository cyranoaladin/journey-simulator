/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const mockRun = jest.fn().mockResolvedValue({ payload: { ok: true } });

jest.mock('../src/agents/ZynoAgent', () => {
  return class ZynoAgent {
    async run(ctx) {
      return mockRun(ctx);
    }
  };
});

jest.mock('@mocks/JourneyRun', () => ({
  findOne: jest.fn().mockReturnThis(),
  sort: jest.fn().mockResolvedValue({ interaction_logs: [] }),
  save: jest.fn().mockResolvedValue(true)
}));

const journeyController = require('../controllers/journey-controller');

function buildRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe('journeyController.step', () => {
  beforeEach(() => {
    mockRun.mockClear();
  });

  it('defaults mode and tone when none supplied', async () => {
    const req = {
      params: { journeyId: 'journey-123' },
      body: {
        userInput: 'next',
        phaseId: 'build',
        trackId: 'capital-foundry',
      },
      user: { id: 'user-42' },
      headers: {} // Crucial fix for req.headers['x-journey-id'] crash
    };
    const res = buildRes();

    await journeyController.step(req, res);

    expect(mockRun).toHaveBeenCalledTimes(1);
    const ctx = mockRun.mock.calls[0][0];

    expect(ctx.userProfile.mode).toBe('discovery');
    expect(ctx.userProfile.tone).toBe('pedagogical');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('passes explicit mode and tone through to Zyno', async () => {
    const req = {
      params: { journeyId: 'journey-777' },
      body: {
        userInput: 'advance',
        phaseId: 'build',
        trackId: 'impact-engine',
        journeyState: { completed: ['mission-1'] },
        mode: 'expert',
        tone: 'investor_pitch',
      },
      user: { id: 'user-77' },
      headers: {}
    };
    const res = buildRes();

    await journeyController.step(req, res);

    expect(mockRun).toHaveBeenCalledTimes(1);
    const ctx = mockRun.mock.calls[0][0];
    expect(ctx.userProfile.mode).toBe('expert');
    expect(ctx.userProfile.tone).toBe('investor_pitch');
  });
});
