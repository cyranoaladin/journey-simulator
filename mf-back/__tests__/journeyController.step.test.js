const journeyController = require('../controllers/journey-controller');

jest.mock('../agents/ZynoAgent', () => {
  const run = jest.fn().mockResolvedValue({ payload: { ok: true } });
  const ZynoAgent = function () {
    this.run = run;
  };
  ZynoAgent.__runMock = run;
  return ZynoAgent;
});

const ZynoAgent = require('../agents/ZynoAgent');

function buildRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe('journeyController.step', () => {
  beforeEach(() => {
    ZynoAgent.__runMock.mockClear();
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
    };
    const res = buildRes();

    await journeyController.step(req, res);

    expect(ZynoAgent.__runMock).toHaveBeenCalledTimes(1);
    const ctx = ZynoAgent.__runMock.mock.calls[0][0];

    expect(ctx.userProfile.mode).toBe('discovery');
    expect(ctx.userProfile.tone).toBe('pedagogical');
    expect(ctx.journeyState).toEqual({});

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
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
    };
    const res = buildRes();

    await journeyController.step(req, res);

    const ctx = ZynoAgent.__runMock.mock.calls[0][0];
    expect(ctx.userProfile.mode).toBe('expert');
    expect(ctx.userProfile.tone).toBe('investor_pitch');
    expect(ctx.journeyState).toEqual({ completed: ['mission-1'] });
  });
});
