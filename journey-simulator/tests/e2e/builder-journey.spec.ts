// tests/e2e/builder-journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('E2E Builder Journey', () => {
  test('should allow a user to complete the builder journey and generate artifacts', async ({ page }) => {
    // Mock wallet connection
    await page.addInitScript(() => {
      window.localStorage.setItem('wallet-adapter-mock', 'true');
    });

    // Go to the home page
    await page.goto('http://localhost:3000');

    // 1. Select the Builder Persona
    await page.click('text=Web3 Builder');
    await expect(page).toHaveURL(/.*\/journey\/phase\/0/);

    // 2. Interact with Zyno to complete phase 1
    await page.fill('textarea[placeholder*="your thoughts"]', 'My idea is to build a decentralized social network.');
    await page.click('button:has-text("Start / Continue")');

    // Mock the API response for the step
    await page.route('**/api/journey/**', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          ui_blocks: [{ type: 'text', content: 'Great idea! Here is your business model canvas.' }],
        }),
      });
    });

    // Wait for the response and UI update
    await page.waitForResponse('**/api/journey/**');

    // 3. Verify Phase 2 is unlocked
    await expect(page.locator('text=Phase 2')).toHaveClass(/active/);

    // 4. Trigger Artifact Generation
    // In the test, we assume completing the step automatically triggers the artifact generation logic
    
    // 5. Verify Neural Swarm Overlay
    await expect(page.locator('text=Neural Swarm Active')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Architect Agent is working...')).toBeVisible();
    
    // Wait for the overlay to disappear
    await expect(page.locator('text=Neural Swarm Active')).not.toBeVisible({ timeout: 5000 });

    // 6. Verify Artifact Modal
    await expect(page.locator('h3:has-text("Tokenomics Architecture")')).toBeVisible();
    const iframe = page.frameLocator('iframe[title="Artifact Viewer"]');
    await expect(iframe.locator('h1')).toHaveText('Tokenomics Simulation');

    // Close the modal
    await page.click('button[aria-label="Close modal"]');
    await expect(page.locator('h3:has-text("Tokenomics Architecture")')).not.toBeVisible();
  });
});
