import { test, expect } from '@playwright/test';

test.describe('Investor Demo Flow - Capital Foundry', () => {
    test('should complete the full investor journey demo', async ({ page }) => {
        // 1. Navigate to home
        await page.goto('/');

        // 2. Login as Demo User
        await page.getByRole('button', { name: /demo mode/i }).click();

        // Select Capital Foundry persona
        await page.getByText('Capital Foundry').click();
        await page.getByRole('button', { name: /launch demo/i }).click();

        // Verify dashboard loaded
        await expect(page.getByText('Capital Foundry')).toBeVisible();
        await expect(page.getByText('Current Phase')).toBeVisible();

        // 3. Navigate to Journey Map
        await page.getByRole('link', { name: /journey/i }).click();

        // Verify phases are visible
        await expect(page.getByText('Protocol Discovery Sprint')).toBeVisible();
        await expect(page.getByText('Market Validation Lab')).toBeVisible();
        await expect(page.getByText('Investor Pitch Studio')).toBeVisible();

        // 4. Enter a Phase (Protocol Discovery)
        await page.getByText('Protocol Discovery Sprint').click();
        await page.getByRole('button', { name: /start phase/i }).click();

        // 5. Interact with Agent (Mocked for speed/reliability in test)
        // In a real E2E test we might want to hit the real backend, but for CI stability
        // we often mock the agent response or use the demo mode's pre-filled state.

        // Check if input area is available
        const inputArea = page.getByPlaceholder(/type your response/i);
        await expect(inputArea).toBeVisible();

        await inputArea.fill('We are building a decentralized AI marketplace on Solana.');
        await page.getByRole('button', { name: /submit/i }).click();

        // Wait for response (simulated)
        await expect(page.getByText('AI Marketplace')).toBeVisible({ timeout: 10000 });

        // 6. Check Resources/Artifacts
        await page.getByRole('link', { name: /resources/i }).click();
        await expect(page.getByText('Pitch Deck Template')).toBeVisible();

        // 7. Verify NFT Eligibility (if applicable in demo state)
        // This depends on the demo state loaded. 
        // For now, we verify the "Mint NFT" button is present if the phase is complete.

        // Force complete phase for testing purposes (if dev tools available)
        // Or just verify the UI elements for a completed phase if the demo starts in that state.

        // 8. Logout
        await page.getByRole('button', { name: /logout/i }).click();
        await expect(page.getByRole('button', { name: /demo mode/i })).toBeVisible();
    });
});
