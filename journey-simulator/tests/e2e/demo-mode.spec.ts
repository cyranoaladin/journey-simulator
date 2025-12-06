import { test, expect } from '@playwright/test';
import { setupJourneyMocks } from './utils/journeyMocks';

test.describe('Demo Mode Workflow', () => {
    test.beforeEach(async ({ page }) => {
        await setupJourneyMocks(page, { personaId: 'cognitive-activation-hub', mockMint: true });
    });

    test('lets demo users preview critical journey interactions', async ({ page }) => {
        test.setTimeout(90000);
        await page.goto('/login');
        await page.getByRole('button', { name: 'Try Demo Mode' }).click();
        await page.waitForURL('**/journeys');

        const cognitiveCard = page.locator('article').filter({ has: page.getByRole('heading', { name: 'The Cognitive Activation Hub' }) }).first();
        await cognitiveCard.getByRole('button', { name: 'Launch with Zyno' }).click();

        await expect(page).toHaveURL(/\/journeys\/cognitive-activation-hub$/);
        await expect(page.getByRole('heading', { name: 'The Cognitive Activation Hub' })).toBeVisible();

        const currentPhasePanel = page.locator('section').filter({
            has: page.getByRole('heading', { name: 'Current Phase', level: 2 })
        }).first();

        const runPhase = async (phaseTitle: string) => {
            const phaseHeading = currentPhasePanel.getByRole('heading', { name: phaseTitle, level: 3 });
            await expect(phaseHeading).toBeVisible();
            
            // Ensure overlay/artifact is gone before clicking start
            await expect(page.getByTestId('neural-overlay')).not.toBeVisible({ timeout: 20000 });
            const closeArtifact = page.getByRole('button', { name: 'Close artifact viewer' });
            if (await closeArtifact.isVisible()) {
                await closeArtifact.click();
            }

            await currentPhasePanel.getByRole('button', { name: 'Start / Continue' }).click();
            await expect(page.getByText('Mocked Mission Guidance')).toBeVisible();
        };

        const closeProofModal = async () => {
            const proofModal = page.getByTestId('proof-modal');
            await expect(proofModal).toBeVisible({ timeout: 15000 });
            await proofModal.getByLabel('Close').click();
        };

        await runPhase('Cognition Ignition');

        // Wait for Neural Overlay to disappear if present
        await expect(page.getByTestId('neural-overlay')).not.toBeVisible({ timeout: 30000 });

        // Close any auto-opened artifact (e.g. Litepaper Sim)
        const closeArtifactBtn = page.getByRole('button', { name: 'Close artifact viewer' });
        if (await closeArtifactBtn.isVisible()) {
            await closeArtifactBtn.click();
        }

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

        await expect(page.getByRole('heading', { level: 3, name: 'Identity & Security Forge' })).toBeVisible();
    });
});
