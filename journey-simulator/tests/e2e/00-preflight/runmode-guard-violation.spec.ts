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
        let pageError: Error | undefined;
        page.on('pageerror', err => {
            pageError = err;
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

        // Wait for guard to trigger
        await page.waitForTimeout(2000);

        // Check for violation
        const violationDetected =
            consoleMessages.some(msg => msg.includes('E2E_RUN_MODE_GUARD_REAL_VIOLATION')) ||
            pageError?.message?.includes('E2E_RUN_MODE_GUARD_REAL_VIOLATION') === true;

        console.log('[GUARD TEST] Total console messages:', consoleMessages.length);
        console.log('[GUARD TEST] Violation detected:', violationDetected);
        console.log('[GUARD TEST] Orchestration calls:', orchestrationCalls);

        // PASS criteria
        expect(violationDetected, 'Guard violation should be detected').toBe(true);
        expect(orchestrationCalls, 'No orchestration calls should occur').toBe(0);
    });
});
