
import { test, expect } from '@playwright/test';
import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://localhost:27017/mfai_test';

test.describe('Supreme UI/UX Trinity Audit', () => {

    test.beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(MONGO_URI);
        }
    });

    test.afterAll(async () => {
        await mongoose.disconnect();
    });

    test('Handbook Integrity: Verify Authors and All 37 Agents', async ({ page }) => {
        // Setup authentication first
        const demoUserId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
        const demoEmail = 'demo@moneyfactory.ai';

        await mongoose.connection.collection('users').updateOne(
            { _id: demoUserId },
            {
                $set: {
                    email: demoEmail,
                    role: 'user',
                    is_active: true,
                    completed_phases: 0,
                    wallet_address: '0xDemoWallet'
                }
            },
            { upsert: true }
        );

        // Inject auth token
        const authToken = 'demo-token';
        await page.goto('http://localhost:4173/');
        await page.evaluate(({ token }) => {
            sessionStorage.setItem('accessToken', token);
            localStorage.setItem('accessToken', token);
        }, { token: authToken });

        // Navigate to guide page
        await page.goto('http://localhost:4173/guide');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // Allow React to        
        // Assert Authors in Footer (Core requirement) - target the GuidePage footer specifically
        const footerText = 'Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA';
        await expect(page.locator('footer').filter({ hasText: footerText })).toBeVisible();

        // Verify all 37 agents are present (36 active + 1 disabled)
        // GuidePage renders agent cards in a grid with specific class patterns
        const agentCards = page.locator('div[class*="rounded-xl"][class*="border"][class*="bg-white"]');
        const count = await agentCards.count();
        expect(count).toBe(37); // Must be exactly        
        // Verify RiskFraudAgent is shown as disabled - use exact match for badge
        await expect(page.getByText('RiskFraudAgent')).toBeVisible();
        await expect(page.getByText('Désactivé', { exact: true }).first()).toBeVisible();

        console.log('✅ Handbook Integrity: All 37 agents verified, authors confirmed');
    });

});
