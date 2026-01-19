import { test, expect } from '@playwright/test';
// import { authStates } from './helpers/authStates';

test.describe('Forensic Demo Mode Analysis', () => {
    test('Demo Flow Timing & Visibility Check', async ({ page }) => {
        // 1. Initialize Forensic Logging
        const logs: string[] = [];
        page.on('console', msg => {
            const text = msg.text();
            // Capture store tracers we will add, or existing ones
            if (text.includes('[Demo]') || text.includes('Phase')) {
                logs.push(`${Date.now()}: ${text}`);
                console.log(`[BROWSER] ${text}`);
            }
        });

        // 2. Start Demo Mode
        await page.goto('http://localhost:5173/demo');
        await page.getByText('Start Demo').click();

        const startTime = Date.now();

        // 3. Verify Phase 1 Intro Persistence
        // Should see the "Live Sync" or similar chat UI
        await expect(page.locator('[data-testid="zyno-chat-thread"]')).toBeVisible({ timeout: 5000 });

        // 4. Measure Phase 1 Duration
        // Wait for Phase 2 transition signal or visual change
        // For now, let's look for the Phase 2 Bonding Curve element
        try {
            await expect(page.getByText('Bonding Curve Simulation')).toBeVisible({ timeout: 10000 });
        } catch (e) {
            console.log("Phase 2 Bonding Curve not found in time - fast skip suspected?");
        }

        const phase2Time = Date.now();
        const duration = phase2Time - startTime;
        console.log(`Phase 1 -> Phase 2 Gap: ${duration}ms`);

        // 5. Visibility Checks (The "Blind Loop" Detector)
        // If the duration is < 2000ms, it's suspiciously fast for a "demo".
        if (duration < 2000) {
            console.warn('CRITICAL: Phase 1 skipped too fast!');
        }

        // Check for interactive elements that MUST be visible
        const bondingCurve = page.locator('canvas').first(); // Adjust selector if needed for Recharts/ChartJS
        await expect(bondingCurve).toBeVisible();

        // 6. Interaction Check
        // The demo should PAUSE here. 
        // If it auto-completes Phase 2 without us doing anything, that's a failure.
        // We wait 3 seconds to see if it stays.
        await page.waitForTimeout(3000);

        // Check if we are still on Phase 2 (Bonding Curve visible)
        await expect(page.getByText('Bonding Curve Simulation')).toBeVisible();

        // 7. Trigger manual completion if we are paused (Good case)
        // await page.getByRole('button', { name: 'Complete Phase' }).click();

        // 8. Mint Modal Check
        // await expect(page.getByText('Mint NFT')).toBeVisible();
    });
});
