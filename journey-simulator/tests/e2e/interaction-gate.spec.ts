
import { test, expect } from '@playwright/test';

test.describe('Interaction Gate Enforcement', () => {
    test.beforeEach(async ({ page }) => {
        // 1. Force Demo Mode
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.clear();
            localStorage.setItem('mfai-run-mode', 'demo');
            localStorage.setItem('journey-storage', ''); // Wipe storage
        });
        await page.reload();
    });

    test('Simulation MUST PAUSE at Interactive Blocks until User Action', async ({ page }) => {
        // Start Journey (Hub - Phase 1 which uses Standard Phase)
        // Standard Phase Step 2 is a Mission Block (Interactive) -> "Cognitive Activation Execution"

        await page.locator('a[href="/journeys"]').click();
        await page.getByText('The Cognitive Activation Hub').click();
        await page.getByText('Start Simulation').click();

        // Step 1: Analysis (Non-Interactive, should auto-advance)
        console.log('Step 1: Waiting for auto-advance...');
        await expect(page.getByText('Cognitive Activation - Context Deep Dive')).toBeVisible();

        // Wait for transition to Step 2
        // Step 2 Title: "Cognitive Activation Execution"
        // It contains a Mission Block.
        await expect(page.getByText('Cognitive Activation Execution')).toBeVisible({ timeout: 15000 });

        // NOW: CHECK FOR PAUSE
        // The simulation should NOT advance past this step automatically.
        console.log('Step 2: Reached Interactive Block. Verifying PAUSE...');

        // We wait for a duration > typingDelay + reading time
        await page.waitForTimeout(5000);

        // Assert we are STILL on Step 2
        await expect(page.getByText('Cognitive Activation Execution')).toBeVisible();
        console.log('PAUSE CONFIRMED: Simulation did not auto-advance.');

        // INTERACT: Click "Submit" / "Complete"
        // Generic mission button
        const actionBtn = page.locator('button:has-text("Submit"), button:has-text("Complete")').first();
        await actionBtn.click();
        console.log('User Action Performed.');

        // Assert Advance
        // Should move to Phase Completion or Next Phase
        // Since Standard Phase has only 2 steps, it should go to "Phase Complete" or next phase.
        await expect(page.getByText('Phase Complete')).toBeVisible({ timeout: 10000 });
        console.log('GATE RELEASED: Simulation advanced after interaction.');
    });
});
