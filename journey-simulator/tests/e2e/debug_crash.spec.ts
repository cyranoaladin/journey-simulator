import { test } from './helpers/hardening';

test('Debug White Screen Crash', async ({ page }) => {
    // Listen to all console events
    page.on('console', msg => console.log(`BROWSER_${msg.type().toUpperCase()}: ${msg.text()}`));
    page.on('pageerror', err => console.log(`BROWSER_PAGE_ERROR: ${err.message}`));
    page.on('response', resp => {
        if (resp.status() >= 400) {
            console.log(`BROWSER_NETWORK_ERROR: ${resp.status()} ${resp.url()}`);
        }
    });

    // Sabotage WebSocket to prevent HMR loop
    await page.addInitScript(() => {
        // @ts-expect-error - Testing crash by re-assigning read-only property
        window.WebSocket = class {
            constructor() { throw new Error('WebSocket blocked by Test'); }
            close() { }
            send() { }
        };
    });

    console.log('Navigating to / ...');
    // Initial load
    try {
        await page.goto('http://127.0.0.1:3000/', { waitUntil: 'domcontentloaded', timeout: 10000 });
    } catch (e: any) {
        console.log('Navigation timeout or error:', e.message);
    }

    // Dump body
    const body = await page.innerHTML('body');
    console.log('BODY_HTML_LENGTH:', body.length);
    console.log('BODY_CONTENT_PREVIEW:', body.substring(0, 500));

    await page.waitForTimeout(2000);
});
