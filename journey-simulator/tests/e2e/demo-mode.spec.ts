import { test, expect } from '@playwright/test';

test.describe('Demo Mode Workflow', () => {
    test.beforeEach(async ({ page }) => {
        // Go to home page
        page.on('console', msg => console.log(`[BROWSER] ${msg.text()}`));
        await page.goto('/');
        // Wait for app to load
        await expect(page.locator('h1')).toContainText('Launch Like a Protocol');
    });

    test('should complete the full demo journey', async ({ page }) => {
        test.setTimeout(120000);
        // 1. Enter Demo Mode
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());

        await page.getByRole('link', { name: /Authenticate/i }).click();

        // Verify we are on login page
        await expect(page.getByText('Sign In', { exact: true })).toBeVisible();

        const demoButton = page.getByRole('button', { name: /Try Demo Mode/i });
        await expect(demoButton).toBeVisible();
        await demoButton.click();

        // Verify redirection to journey workspace
        await expect(page).toHaveURL(/\/journey/);
        await expect(page.getByRole('heading', { name: 'The Cognitive Activation Hub Journey' })).toBeVisible();

        // --- PHASE 1: Cognition Ignition ---
        await expect(page.getByRole('heading', { name: 'Cognition Ignition', level: 2 })).toBeVisible();
        await expect(page.getByText('Establish the Web3 mindset').first()).toBeVisible();

        // Complete Phase 1 (Mint NFT)
        // Click the bottom button (main CTA)
        const validateButton = page.getByRole('button', { name: /Validate & Mint NFT/i }).nth(1);
        await expect(validateButton).toBeVisible();
        await page.waitForTimeout(1000);
        await validateButton.dispatchEvent('click');

        // Verify NFT Modal
        await expect(page.getByText('Proof-of-Skill™: Web3 Orientation')).toBeVisible();
        await page.getByRole('button', { name: /Close/i }).click();

        // --- PHASE 2: Solana Systems Lab ---
        await expect(page.getByRole('heading', { name: 'Solana Systems Lab', level: 2 })).toBeVisible();
        await expect(page.getByText('Dive into Solana’s execution model').first()).toBeVisible();

        // Complete Phase 2 (Stake)
        const validateButton2 = page.getByRole('button', { name: /Validate & Stake/i }).nth(0);
        await expect(validateButton2).toBeVisible();
        await page.waitForTimeout(500);
        await validateButton2.dispatchEvent('click');

        // Handle Staking Modal
        await expect(page.getByText('Cognitive Lock™')).toBeVisible();
        await page.getByPlaceholder('0.00').fill('50');
        await page.getByRole('button', { name: /Stake 50/i }).click();

        // Verify NFT Modal
        await expect(page.getByText('Solana Fluency Patch')).toBeVisible();
        await page.getByRole('button', { name: /Close/i }).click();

        // --- PHASE 3: Token Design Studio ---
        await expect(page.getByRole('heading', { name: 'Token Design Studio', level: 2 })).toBeVisible();
        await expect(page.getByText('Architect tokenized incentives').first()).toBeVisible();

        // Complete Phase 3 (Vote)
        const validateButton3 = page.getByRole('button', { name: /Validate & Vote/i }).nth(0);
        await expect(validateButton3).toBeVisible();
        await page.waitForTimeout(500);
        await validateButton3.dispatchEvent('click');

        // Handle Voting Modal
        await expect(page.getByText('DAO Vote')).toBeVisible();
        await page.getByRole('button', { name: /Approve/i }).click();

        // Verify NFT Modal
        await expect(page.getByText('Tokenomics Architect Badge')).toBeVisible();
        await page.getByRole('button', { name: /Close/i }).click();

        // --- PHASE 4: Identity & Security Forge ---
        await expect(page.getByRole('heading', { name: 'Identity & Security Forge', level: 2 })).toBeVisible();
        await expect(page.getByText('Internalize wallet security').first()).toBeVisible();

        // Complete Phase 4 (Mint NFT)
        const validateButton4 = page.getByRole('button', { name: /Validate & Mint NFT/i }).nth(1);
        await expect(validateButton4).toBeVisible();
        await page.waitForTimeout(500);
        await validateButton4.dispatchEvent('click');

        // Verify NFT Modal
        await expect(page.getByText('Sovereign Identity Seal')).toBeVisible();
        await page.getByRole('button', { name: /Close/i }).click();

        // --- PHASE 5: Ecosystem Activation ---
        await expect(page.getByRole('heading', { name: 'Ecosystem Activation', level: 2 })).toBeVisible();
        await expect(page.getByText('Convert insight into action').first()).toBeVisible();

        // Complete Phase 5 (Mint NFT)
        const validateButton5 = page.getByRole('button', { name: /Validate & Mint NFT/i }).nth(1);
        await expect(validateButton5).toBeVisible();
        await page.waitForTimeout(500);
        await validateButton5.dispatchEvent('click');

        // Verify NFT Modal
        await expect(page.getByText('Proof-of-Skill™: Activation').first()).toBeVisible();

        // Phase 5 is the last one, so we expect completion UI
        // The workspace might not redirect, but show completion inline
        // await expect(page).toHaveURL(/\/journey\/completed/, { timeout: 10000 });

        // Verify Final State
        await expect(page.getByText('Journey Completed')).toBeVisible();
    });
});
