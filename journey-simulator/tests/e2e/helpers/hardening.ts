import { test as base } from '@playwright/test';
import { attachRouteTracker } from '../_support/route-tracker';

export const test = base.extend({
  page: async ({ page }, use) => {
    // 1. Font Blocking (R1.3 Policy) - Fulfill with empty body to prevent Console Errors
    const sampleFont = (route: any) => route.fulfill({ status: 200, contentType: 'font/woff2', body: Buffer.from('') });
    await page.route('**/*.{woff,woff2,ttf,otf}', sampleFont);
    await page.route('**/fonts.googleapis.com/**', sampleFont);
    await page.route('**/fonts.gstatic.com/**', sampleFont);

    // 2. Animation Disabling (R1.3 Layout Stability)
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          transition: none !important;
          animation: none !important;
          caret-color: transparent !important; 
        }
      `
    });

    // 3. Global Route Tracker (R1.3 Audit Requirement)
    // Delegated to helper for consistent file output (fs in Node context)
    attachRouteTracker(page);

    await use(page);
  },
});

// Automatic PROOF capture on failure
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== 'passed' && testInfo.status !== 'skipped') {
    console.log(`[PROOF CAPTURE] Test failed: ${testInfo.title}`);
    try {
      const url = page.url();
      const title = await page.title().catch(() => 'Unknown Title');
      const appState = await page.evaluate(() => {
        return {
          shell: !!document.querySelector('[data-testid="app-shell"]'),
          loading: !!document.querySelector('[data-testid="app-loading"]'),
          ready: !!document.querySelector('[data-testid~="app-ready"]'),
          error: !!document.querySelector('[data-testid="app-error"]'),
          errorText: document.querySelector('[data-testid="app-error"]')?.textContent,
        };
      }).catch(() => null);

      console.log(`[FAILURE CONTEXT] URL: ${url}`);
      console.log(`[FAILURE CONTEXT] Title: ${title}`);
      console.log(`[FAILURE CONTEXT] App Boot State:`, JSON.stringify(appState));

      const screenshotPath = `test-results/failure-proofs/${testInfo.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => { });
      console.log(`[FAILURE PROOF] Screenshot saved: ${screenshotPath}`);
    } catch (e) {
      console.error('[PROOF CAPTURE] Failed to capture proof:', e);
    }
  }
});

// Helper to wait for the application to be fully ready
// Eliminates generic timeouts by ensuring React is mounted
export async function waitForAppReady(page: any) {
  try {
    // Race: App Shell (Success path) vs App Error (Crash path)
    // using waitForSelector with comma logic (Playwright standard)
    const marker = await page.waitForSelector('[data-testid="app-shell"], [data-testid="app-error"]', { state: 'visible', timeout: 30000 });
    const testId = await marker.getAttribute('data-testid');

    if (testId === 'app-error') {
      const errorText = await marker.textContent();
      throw new Error(`Application crashed with ErrorBoundary: ${errorText}`);
    }

    // Check if we are stuck in loading
    const isLoading = await page.locator('[data-testid="app-loading"]').isVisible();
    if (isLoading) {
      console.log('[App Ready] App is loading... waiting for ready state.');
    }

    // Wait for the main layout ready marker
    await page.locator('[data-testid~="app-ready"]').waitFor({ state: 'visible', timeout: 60000 });

    // Final check for error just in case it crashed during loading
    const isError = await page.locator('[data-testid="app-error"]').isVisible();
    if (isError) {
      const errorText = await page.locator('[data-testid="app-error"]').textContent();
      throw new Error(`Application crashed with ErrorBoundary: ${errorText}`);
    }

    console.log(`[App Ready] Verified on ${page.url()}`);
  } catch (error: any) {
    console.error(`[App Ready] Failed on ${page.url()}: ${error.message}`);
    console.error(`[App Ready] Title: ${await page.title()}`);
    // Check for error state again in case of timeout
    const isError = await page.locator('[data-testid="app-error"]').isVisible().catch(() => false);
    if (isError) {
      const errorText = await page.locator('[data-testid="app-error"]').textContent().catch(() => 'Unknown Error');
      console.error(`[App Ready] CRASH DETECTED: ${errorText}`);
      throw new Error(`Application crashed: ${errorText}`);
    }
    throw error;
  }
}

export { expect } from '@playwright/test';
