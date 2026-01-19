/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Comprehensive E2E Test Configuration
 * Comprehensive E2E Test Configuration
 * Zero-Failure Policy: All tests must pass for deployment
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Global setup for authentication
  globalSetup: path.resolve(__dirname, './global-setup.ts'),

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // Force ZERO retries for strict audit (R1.3-FLAKY-ZERO)
  workers: process.env.CI ? 1 : '50%',

  // Reporter configuration
  reporter: [
    ['line'],
    ['json', { outputFile: 'playwright_report.json' }],
    ['html', { outputFolder: 'test-results/html-report', open: 'never' }],
    ['list'],
  ],

  // Test artifacts output
  outputDir: 'test-results/artifacts',

  // Global test settings
  use: {
    baseURL: 'http://127.0.0.1:3000',
    bypassCSP: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // HARD PURGE PROTOCOL: Eliminate Service Worker interference
    serviceWorkers: 'block',
    offline: false,

    // ZERO-SANDBOX: Disable browser isolation to enable native network access
    launchOptions: {
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    },

    // Inject authenticated state - ABSOLUTE PATH REQUIRED
    storageState: path.resolve(__dirname, 'test-results/.auth/user.json'),

    // Browser context options
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,

    // Sanitized Defaults (R1.3 Structural Stabilization)
    actionTimeout: 60000,
    navigationTimeout: 60000,
  },

  // Test timeout
  timeout: 90000, // accommodate hardened env latency
  expect: {
    timeout: 15000,
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
    },
  },

  // Projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

  ],

  // Web server configuration
  webServer: process.env.CI ? undefined : {
    command: 'npm run preview -- --port 3000',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
