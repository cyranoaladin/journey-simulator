import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export async function dismissWalletModalIfPresent(page: Page) {
  // Wallet-adapter modal occasionally appears in Firefox and can steal clicks/focus.
  // Best-effort: close it if present.
  try {
    const closeBtn = page.locator('.wallet-adapter-modal-button-close');
    if (await closeBtn.isVisible({ timeout: 250 })) {
      await closeBtn.click({ force: true });
    }
  } catch { /* ignore */ }

  try {
    const dismiss = page.getByRole('button', { name: /dismiss/i });
    if (await dismiss.isVisible({ timeout: 250 })) {
      await dismiss.click({ force: true });
    }
  } catch { /* ignore */ }
}

export async function clickRunSimulation(page: Page) {
  const runBtn = page.getByTestId('run-simulation').first();
  await expect(runBtn).toBeVisible({ timeout: 15000 });
  await expect(runBtn).toBeEnabled({ timeout: 15000 });

  // Firefox can be extra sensitive to fast rerenders; avoid scrollIntoView (it waits for stability).
  try {
    await runBtn.click({ timeout: 15000, force: true });
    return;
  } catch {
    // ignore and fallback
  }

  await page.waitForFunction(() => {
    const btn = document.querySelector('[data-testid="run-simulation"]');
    if (!btn) return false;
    const r = btn.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }, { timeout: 15000 });

  await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="run-simulation"]') as HTMLButtonElement | null;
    btn?.click();
  });
}

export async function clickMintNft(page: Page) {
  let btn = page.getByTestId('mint-nft').first();
  // Fallback if the phase does not expose an NFT CTA (some phases may only show "Complete Phase")
  if (!(await btn.isVisible().catch(() => false))) {
    btn = page.getByTestId('complete-phase').first();
  }

  await expect(btn).toBeVisible({ timeout: 15000 });
  await expect(btn).toBeEnabled({ timeout: 15000 });

  try {
    await btn.click({ timeout: 15000, force: true });
    return;
  } catch {
    // ignore and fallback
  }

  await page.evaluate(() => {
    const el = (document.querySelector('[data-testid="mint-nft"], [data-testid="complete-phase"]') as HTMLButtonElement | null);
    el?.click();
  });
}
