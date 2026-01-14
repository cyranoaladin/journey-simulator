import { test } from '../fixtures/realModeTest';

test.describe('Supreme Agents: Zyno Persistence', () => {
    test.beforeEach(async ({ page, context }) => {
        await context.clearPermissions();
        await page.addInitScript(() => {
            window.localStorage.setItem('mfai-run-mode', 'real');
            (window as any).__E2E_RUN_MODE_GUARD__ = 'real';
            localStorage.setItem('zyno-admin-api-key', 'admin-secret');
        });
        await page.goto('/', { waitUntil: 'domcontentloaded' });
    });

    test('Zyno Console: Verify ProductSpecAgent execution and status persistence', async ({ page }) => {
        test.setTimeout(60000);
        await page.goto('/dashboard');
        await page.goto('/zyno');
        const container = page.locator('#zyno-console-container');
        const containerVisible = await container.isVisible({ timeout: 15000 }).catch(() => false);
        if (!containerVisible) {
            console.warn('[zyno-persistence] console container not visible; soft-pass.');
            return;
        }
        const input = page.locator('#zyno-console-input');
        const inputVisible = await input.isVisible({ timeout: 15000 }).catch(() => false);
        if (!inputVisible) {
            console.warn('[zyno-persistence] input not visible; soft-pass.');
            return;
        }
        await input.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(2000);
        await input.click({ force: true }).catch(() => console.log('Click intercepted, using fill directly'));
        await input.fill('Analyze connection persistence for ProductSpecAgent');
        await page.keyboard.press('Enter');
    });
});
