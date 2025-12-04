import { test, expect } from '@playwright/test';
import { setupJourneyMocks } from './utils/journeyMocks';

test.describe('Demo Mode Workflow', () => {
    test.beforeEach(async ({ page }) => {
        await setupJourneyMocks(page, { personaId: 'cognitive-activation-hub', mockMint: true });
    });

    test('lets demo users preview critical journey interactions', async ({ page }) => {
        await page.goto('/login');
        await page.getByRole('button', { name: 'Try Demo Mode' }).click();
        await page.waitForURL('**/journeys');

        const cognitiveCard = page.locator('article').filter({ has: page.getByRole('heading', { name: 'The Cognitive Activation Hub' }) }).first();
        await cognitiveCard.getByRole('button', { name: 'Launch with Zyno' }).click();

        await page.waitForURL('**/journeys/cognitive-activation-hub');
        await expect(page.getByRole('heading', { name: 'The Cognitive Activation Hub' })).toBeVisible();

        const runPhase = async (phaseTitle: string) => {
            await expect(page.getByRole('heading', { name: phaseTitle })).toBeVisible();
            await page.getByRole('button', { name: 'Start / Continue' }).click();
            await expect(page.getByText('Mocked Mission Guidance')).toBeVisible();
        };

        const closeProofModal = async () => {
            await expect(page.getByText(/Proof-of-/i)).toBeVisible();
            await page.getByLabel('Close').first().click();
        };

        await runPhase('Cognition Ignition');
        await page.getByRole('button', { name: 'Validate & Mint NFT' }).first().click();
        await closeProofModal();

        await runPhase('Solana Systems Lab');
        await page.getByRole('button', { name: 'Validate & Stake' }).first().click();
        await expect(page.getByRole('heading', { name: 'Cognitive Lock™' })).toBeVisible();
        await page.getByPlaceholder('0.00').fill('50');
        await page.getByRole('button', { name: /Stake 50/i }).click();
        await closeProofModal();

        await runPhase('Token Design Studio');
        await page.getByRole('button', { name: 'Validate & Vote' }).first().click();
        await expect(page.getByRole('heading', { name: 'DAO Vote' })).toBeVisible();
        await page.getByRole('button', { name: 'Approve' }).click();
        await closeProofModal();

        await expect(page.getByRole('heading', { name: 'Identity & Security Forge' })).toBeVisible();
    });
});
