/**
 * Shared Playwright test fixture enforcing real-mode executions and unified auth.
 * Ensures all tests run with the storage state produced by global-setup
 * and that backend requests include the required headers.
 */

import { test as base, expect, APIRequestContext } from '../_support/fixtures';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');
const storageRelativePath = 'test-results/.auth/user.json';
const RUN_MODE = 'real';
const BACKEND_BASE_URL = process.env.BACKEND_URL ?? 'http://127.0.0.1:3002';
const resolveStorageStatePath = () => {
  if (process.env.E2E_STORAGE_STATE) {
    const customPath = process.env.E2E_STORAGE_STATE;
    const resolvedCustomPath = path.isAbsolute(customPath)
      ? customPath
      : path.resolve(repoRoot, customPath);
    if (existsSync(resolvedCustomPath)) {
      return resolvedCustomPath;
    }
  }

  const canonicalPath = path.resolve(repoRoot, storageRelativePath);
  if (existsSync(canonicalPath)) {
    return canonicalPath;
  }

  throw new Error(
    `E2E_AUTH_STATE_MISSING: expected storage state at ${canonicalPath} for runMode=${RUN_MODE}. Hint: re-run Playwright global setup (npx playwright test --config=playwright.config.ts --project=chromium --workers=1) or ensure backend auth is available.`
  );
};

const STORAGE_STATE_PATH = resolveStorageStatePath();

type AuthHeaders = {
  Authorization: string;
  'x-run-mode': string;
};

type Fixtures = {
  authHeaders: AuthHeaders;
  request: APIRequestContext;
};

const getStorageState = () => {
  const state = JSON.parse(readFileSync(STORAGE_STATE_PATH, 'utf-8'));
  const origin = state.origins?.find((o: any) => /127\.0\.0\.1|localhost/.test(o.origin));
  const accessToken = origin?.localStorage?.find((entry: any) => entry.name === 'accessToken')?.value;
  const runMode = origin?.localStorage?.find((entry: any) => entry.name === 'mfai-run-mode')?.value;
  if (runMode !== RUN_MODE) {
    throw new Error(`RUN_MODE_GUARD_FAILED: expected "${RUN_MODE}" got "${runMode}"`);
  }
  if (!accessToken) {
    throw new Error('AUTH_GUARD_FAILED: missing accessToken in storage state');
  }
  return { accessToken };
};

export const test = base.extend<Fixtures>({
  // eslint-disable-next-line no-empty-pattern
  authHeaders: async ({ }, use) => {
    const { accessToken } = getStorageState();
    await use({
      Authorization: `Bearer ${accessToken}`,
      'x-run-mode': RUN_MODE,
    });
  },

  request: async ({ playwright }, use) => {
    const { accessToken } = getStorageState();
    const context = await playwright.request.newContext({
      baseURL: BACKEND_BASE_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${accessToken}`,
        'x-run-mode': RUN_MODE,
      },
    });

    await use(context);
    await context.dispose();
  },

  page: async ({ page }, use) => {
    // Lead9 Hard Mode: Route Tracking
    page.on('framenavigated', frame => {
      if (frame === page.mainFrame()) {
        const url = frame.url();
        if (!url.startsWith('data:') && !url.startsWith('about:')) {
          console.log(`ROUTE_VISIT: ${url}`);
        }
      }
    });

    await page.addInitScript(expectedRunMode => {
      try {
        window.localStorage.setItem('mfai-run-mode', expectedRunMode);
      } catch {
        // ignore storage errors
      }
    }, RUN_MODE);

    await use(page);

    // Restore run-mode to real after each test in case spec toggled modes intentionally
    try {
      await page.evaluate(expectedRunMode => {
        window.localStorage.setItem('mfai-run-mode', expectedRunMode);
      }, RUN_MODE);
    } catch {
      // Ignore failures when page already closed
    }
  },
});

export { expect };
