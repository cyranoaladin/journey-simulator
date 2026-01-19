/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { test, expect } from '../fixtures/realModeTest';

test.describe('Supreme Web3: NFT Minting', () => {
    test.use({ storageState: 'test-results/.auth/user.json' });

    test.beforeEach(async ({ page }) => {
        const sampleSignature = 'sandboxMintSignature123';

        await page.route('**/solana/mint/simulate', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    ok: true,
                    sim: {
                        ok: true,
                        estFeeLamports: 4200,
                        riskScore: 0.12,
                        network: 'devnet'
                    }
                })
            });
        });

        await page.route('**/solana/mint/execute', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    ok: true,
                    tx: {
                        txSig: sampleSignature
                    }
                })
            });
        });

        await page.goto('/debug/mint');
        await expect(page.getByRole('heading', { name: /Debug Mint/i })).toBeVisible();
    });

    test('NFT Certificate Minting Flow', async ({ page }) => {
        test.setTimeout(240000); // Real-mode mint can take time

        const modal = page.getByRole('dialog', { name: /Mint Proof-of-Skill/i });
        await expect(modal).toBeVisible();

        const mintButton = modal.getByRole('button', { name: /Mint Proof-of-Skill/i });
        await expect(mintButton).toBeEnabled();

        // Contract proof: capture mint execution (simulate + execute)
        const simulateRequestPromise = page.waitForRequest(req =>
            req.method() === 'POST' && req.url().includes('/solana/mint/simulate')
        );
        const executeRequestPromise = page.waitForRequest(req =>
            req.method() === 'POST' && req.url().includes('/solana/mint/execute')
        );
        const executeResponsePromise = page.waitForResponse(res =>
            res.request().method() === 'POST' &&
            res.url().includes('/solana/mint/execute') &&
            res.status() === 200
        );

        await mintButton.scrollIntoViewIfNeeded();
        await mintButton.click();

        // Proof: requests actually fired
        await simulateRequestPromise;
        await executeRequestPromise;
        await executeResponsePromise;

        // Terminal state: signature visible (proof of completion)
        const signatureLocator = modal.getByTestId('mint-tx-signature');
        await expect(signatureLocator).toHaveText(/sandboxMintSignature123/, { timeout: 120000 });

        // Success state visible (scoped to avoid strict-mode violation)
        await expect(page.getByText('Proof-of-Skill™ Minted!')).toBeVisible();

        // Mobile fix: use .first() to avoid strict-mode violation (2 elements match)
        const mintedText = page.getByText('Proof-of-Skill™ minted');
        await expect(mintedText.first()).toBeVisible();

        const closeButton = modal.getByRole('button', { name: 'Close' });
        await closeButton.first().click();

        await expect(modal).not.toBeVisible();
    });
});
