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

export { expect } from '@playwright/test';
