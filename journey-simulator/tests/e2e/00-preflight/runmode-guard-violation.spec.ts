/**
 * Preuve C: Fail-Fast Guard Violation Test
 * 
 * This test verifies that the E2E guard correctly crashes when:
 * - __E2E_RUN_MODE_GUARD__ = 'real' (set by addInitScript)
 * - localStorage 'mfai-run-mode' = 'simulation' (forced via addInitScript AFTER auth)
 * 
 * Expected: Immediate crash with E2E_RUN_MODE_GUARD_REAL_VIOLATION when ZynoConsole mounts
 */

import { test, expect } from '../_support/fixtures';

test.describe('RunMode Guard Violation', () => {
    test.setTimeout(15000);

    test.use({ storageState: '/home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/test-results/.auth/user.json' });

    test('should crash immediately when runMode=simulation but guard expects real', async ({ page }) => {
        // Force simulation mode BEFORE navigation (will be read by getInitialRunMode)
        await page.addInitScript(() => {
            try {
                window.localStorage.setItem('mfai-run-mode', 'simulation');
                (window as any).__E2E_RUN_MODE_GUARD__ = 'real';
                console.log('[GUARD TEST] Init script executed: Forced simulation mode');
            } catch (e) {
                console.error('[GUARD TEST] Init script failed', e);
            }
        });

        // Track orchestration calls (should be 0)
        let orchestrationCalls = 0;
        page.on('request', req => {
            if (req.url().includes('/orchestration')) {
                orchestrationCalls++;
                console.log('[GUARD TEST] UNEXPECTED: orchestration call detected!');
            }
        });

        // Capture console messages
        const consoleMessages: string[] = [];
        page.on('console', msg => {
            const text = msg.text();
            consoleMessages.push(text);
            if (text.includes('E2E_RUN_MODE_GUARD_REAL_VIOLATION')) {
                console.log('[GUARD TEST] ✅ VIOLATION DETECTED:', text);
            }
        });

        // Capture page errors
        page.on('pageerror', err => {
            console.log('[GUARD TEST] Page error:', err.message);
        });

        // Navigate to /zyno (which mounts ZynoConsole and triggers guard)
        try {
            await page.goto('/zyno', { waitUntil: 'domcontentloaded', timeout: 5000 });
        } catch (e) {
            // May timeout if guard crashes early
        }

        // Verify we're on Zyno page (proves component should be mounted)
        // If guard works, this may fail because page crashes
        try {
            await expect(page).toHaveURL(/\/zyno/, { timeout: 2000 });
        } catch {
            // Expected if guard crashes
        }

        // Wait for guard violation flag
        await page.waitForTimeout(1000);
        const violation = await page.evaluate(() => (window as any).__GUARD_VIOLATION__);
        expect(violation, 'Guard violation flag should be set').toBe(1);

        // Wait for guard banner to appear (optional visual check)
        const guardBanner = page.getByTestId('guard-violation-detected');
        await guardBanner.waitFor({ state: 'visible', timeout: 5000 });

        const bannerText = await guardBanner.textContent();
        console.log('[GUARD TEST] Banner text:', bannerText);
        console.log('[GUARD TEST] Console messages:', consoleMessages.length);
        console.log('[GUARD TEST] Orchestration calls:', orchestrationCalls);

        // PASS criteria
        expect(bannerText).toContain('RunMode Guard Violation');
        expect(orchestrationCalls, 'No orchestration calls should occur').toBe(0);
    });
});
