/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const fs = require('node:fs');
const path = require('node:path');
const computeAEPO = require('../../metrics/computeAEPO');
const { saveFeedback } = require('../../memory/agent_metrics');

const FEEDBACK_LOG_PATH = path.join(__dirname, '..', '..', 'logs', 'agent_feedback.json');

describe('Integration: Multi-agent AEPO/AECO', () => {
  beforeEach(() => {
    if (fs.existsSync(FEEDBACK_LOG_PATH)) {
      fs.unlinkSync(FEEDBACK_LOG_PATH);
    }
  });

  it('should compute AEPO and save AECO feedback', async () => {
    const result = {
      duration: 1500,
      success: true,
      retries: 1
    };

    const aepo = computeAEPO(result);
    expect(aepo).toBeGreaterThan(0);

    const feedback = {
      agent: 'BuilderAgent',
      userId: 'integration-user',
      missionId: 'mission-99',
      aepeScore: aepo,
      aecoFeedback: {
        clarity: 4,
        helpfulness: 5,
        satisfaction: 4,
        comment: 'Agent helped clearly define tasks.'
      }
    };

    const res = await saveFeedback(feedback);
    expect(res.saved).toBe(true);

    const stored = JSON.parse(fs.readFileSync(FEEDBACK_LOG_PATH, 'utf-8'));
    expect(Array.isArray(stored)).toBe(true);
    const entry = stored.find((item) => item.agentName === 'BuilderAgent');
    expect(entry).toBeDefined();
    expect(entry.feedback).toMatchObject(feedback.aecoFeedback);
  });
});
