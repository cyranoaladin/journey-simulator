/**
 * Phase 3 — Persona Onboarding Test
 * Validates each persona can onboard and access journey workspace
 */

import { test, expect } from '../fixtures/realModeTest';
import { navigateToHome } from '../utils/navigation-helpers';
import { waitForAppReady } from '../helpers/hardening';
import * as path from 'path';
import * as fs from 'fs';

const DEFAULT_EMAIL = process.env.E2E_EMAIL || 'test@mfai.app';
const DEFAULT_PASSWORD = process.env.E2E_PASSWORD || 'MFAITest2026!';
const STORAGE_STATE_PATH = path.resolve(process.cwd(), 'test-results/.auth/user.json');

function readStoredToken(): string | null {
    if (!fs.existsSync(STORAGE_STATE_PATH)) return null;
    try {
        const state = JSON.parse(fs.readFileSync(STORAGE_STATE_PATH, 'utf-8'));
        const origin = state.origins?.find((o: any) => o.localStorage?.some((item: any) => item.name === 'accessToken' || item.name === 'mfai_token'));
        if (!origin) return null;
        const token =
            origin.localStorage.find((i: any) => i.name === 'accessToken')?.value ||
            origin.localStorage.find((i: any) => i.name === 'mfai_token')?.value;
        return token || null;
    } catch {
        return null;
    }
}

async function applyAuthState(page: any) {
    const token = readStoredToken();
    if (!token) return;
    await page.addInitScript((value: string) => {
        try {
            window.localStorage.setItem('accessToken', value);
            window.sessionStorage.setItem('accessToken', value);
            window.localStorage.setItem('mfai-run-mode', 'real');
            window.sessionStorage.setItem('mfai-run-mode', 'real');
        } catch {
            // ignore storage errors
        }
    }, token);
}

async function loginIfNeeded(page: any) {
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();
    if (currentUrl.includes('/journeys')) {
        console.log('✅ Déjà connecté via Injection Token - Skip UI Login');
        return;
    }

    const onLoginPage = currentUrl.includes('/login');
    if (!onLoginPage) return;

    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();

    await emailInput.waitFor({ state: 'visible', timeout: 30000 });
    await passwordInput.waitFor({ state: 'visible', timeout: 30000 });
    await submitButton.waitFor({ state: 'visible', timeout: 30000 });

    await emailInput.fill(DEFAULT_EMAIL);
    await passwordInput.fill(DEFAULT_PASSWORD);
    await submitButton.click({ timeout: 20000 });
    await page.waitForLoadState('networkidle');
    await waitForAppReady(page);
}

test.describe('Phase 3: Persona Onboarding', () => {
    test.beforeEach(async ({ page }) => {
        await applyAuthState(page);
        await navigateToHome(page);
    });

    test('Persona can onboard and access journey workspace', async ({ page }) => {
        // Mock critical profile request to avoid auth flakiness
        await page.route('**/user/profile', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    id: 'test-user',
                    name: 'Test User',
                    email: 'test@mfai.app',
                    role: 'admin',
                    wallet_address: 'wallet',
                    persona: 'cognitive-activation-hub',
                    total_xp: 0,
                    current_level: 1,
                    completed_phases: 0,
                    subscription: false,
                    is_active: true
                })
            });
        });

        // Start from login to ensure fresh session and avoid guard loops
        await page.goto('/login');
        await loginIfNeeded(page);

        // Navigate to journeys page
        await page.goto('/journeys');
        await waitForAppReady(page);

        // Select first available persona (robust selector)
        const personaCard = page.locator('[data-testid="journey-card"]').first();
        await personaCard.waitFor({ state: 'visible', timeout: 30000 });
        await personaCard.scrollIntoViewIfNeeded();

        // Launch journey with persona
        const launchButton = personaCard.getByRole('button', { name: /Launch with Zyno/i });
        await expect(launchButton).toBeVisible({ timeout: 15000 });
        await launchButton.click();

        // Wait for journey workspace to load
        await page.waitForURL(/\/journeys\/.*/, { timeout: 20000 });

        // Verify workspace is accessible
        const workspace = page.locator('main').first();
        await expect(workspace).toBeVisible();

        // Capture onboarding screenshot
        const screenshotDir = path.join(process.cwd(), '..', 'artifacts', 'screenshots', 'phase3', 'onboarding');
        fs.mkdirSync(screenshotDir, { recursive: true });

        await page.screenshot({
            path: path.join(screenshotDir, 'persona-onboarding.png'),
            fullPage: false,
        });

        // Console errors would be tracked in console-guard.spec.ts
        // This test focuses on onboarding flow completion
    });
});
