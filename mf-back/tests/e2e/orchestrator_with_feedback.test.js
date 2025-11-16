const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(__dirname, '..', '..', 'logs', 'agent_feedback.json');
const PROJECT_ROOT = path.join(__dirname, '..', '..');

describe('E2E: Orchestrator + Feedback', () => {
  beforeAll(() => {
    if (fs.existsSync(LOG_PATH)) {
      fs.unlinkSync(LOG_PATH);
    }
  });

  it('should run orchestrator and log feedback', (done) => {
    exec('node run_agent.js GuideAgent "simulate onboarding"', { cwd: PROJECT_ROOT }, (error, stdout, stderr) => {
      try {
        expect(error).toBeNull();
        expect(stdout).toMatch(/Agent execution complete/);
        expect(fs.existsSync(LOG_PATH)).toBe(true);
        const logs = fs.readFileSync(LOG_PATH, 'utf-8');
        expect(logs).toContain('GuideAgent');
        done();
      } catch (err) {
        done(err);
      }
    });
  }, 15000);
});
