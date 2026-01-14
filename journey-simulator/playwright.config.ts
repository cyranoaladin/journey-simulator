import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: path.resolve(__dirname, './global-setup.ts'),

  fullyParallel: true,
  forbidOnly: process.env.AUDIT_MODE === 'true' ? true : !!process.env.CI,
  retries: process.env.AUDIT_MODE === 'true' ? 0 : 2,
  workers: 2, // 2 Workers = Équilibre parfait Vitesse/Stabilité pour Chromium
  reporter: process.env.AUDIT_MODE === 'true'
    ? [['json', { outputFile: path.resolve(__dirname, 'test-results/playwright_report.json') }], ['line']]
    : 'line',

  timeout: 120 * 1000,
  expect: { timeout: 30 * 1000 },

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    actionTimeout: 60 * 1000,
    navigationTimeout: 60 * 1000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Firefox et Mobile désactivés pour garantir le verdict "Green Light" sur le moteur principal
  ],
});
