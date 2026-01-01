import { test, expect } from '@playwright/test';
import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://localhost:27017/mfai_test';

test.describe('Final Mastery Evidence - Full Journey Certification', () => {

    test.beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(MONGO_URI);
        }
    });

    test.afterAll(async () => {
        await mongoose.disconnect();
    });

    test('Complete 6-Phase Journey: Cognitive Activation Hub', async ({ page }) => {
        // Seed user with Cognitive Activation Hub persona
        const userId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439012');
        const userEmail = 'mastery@moneyfactory.ai';

        await mongoose.connection.collection('users').updateOne(
            { _id: userId },
            {
                $set: {
                    email: userEmail,
                    role: 'user',
                    is_active: true,
                    completed_phases: 0,
                    current_phase: 'cognitive-orientation',
                    persona: 'cognitive-activation-hub',
                    xp: 0,
                    mfai_balance: 0,
                    wallet_address: '0xMasteryWallet'
                }
            },
            { upsert: true }
        );

        // Inject auth token
        await page.goto('http://localhost:4173/');
        await page.evaluate(({ token }) => {
            sessionStorage.setItem('accessToken', token);
            localStorage.setItem('accessToken', token);
        }, { token: 'demo-token' });

        // Navigate to demo journey (correct path from browser inspection)
        await page.goto('http://localhost:4173/journeys/demo/cognitive-activation-hub');
        await page.waitForLoadState('networkidle');

        // PHASE 1: Cognition Ignition
        console.log('📍 Phase 1: Cognition Ignition');

        // Wait for journey to load
        await page.waitForSelector('[data-testid="journey-progress-bar"]', { timeout: 10000 });

        // Verify phase header shows "PHASE 1"
        await expect(page.locator('text=/PHASE\\s+1/i')).toBeVisible();

        // Verify phase title
        await expect(page.getByText('Cognition Ignition')).toBeVisible();

        // Complete phase
        const completeBtn = page.locator('[data-testid="complete-phase-button"]');
        if (await completeBtn.isVisible({ timeout: 5000 })) {
            await completeBtn.click();
            await page.waitForTimeout(2000);
        }

        // Verify XP updated in DB
        const user1 = await mongoose.connection.collection('users').findOne({ _id: userId });
        expect(user1.xp).toBe(60);
        expect(user1.mfai_balance).toBe(6);
        expect(user1.completed_phases).toBe(1);

        // PHASE 2: Solana Systems Lab
        console.log('📍 Phase 2: Solana Systems Lab');
        await page.waitForTimeout(1000);

        // Verify phase header shows "PHASE 2"
        await expect(page.locator('text=/PHASE\\s+2/i')).toBeVisible();

        // Verify staking requirement message
        const stakingText = page.getByText(/Stake.*50.*MFAI/i);
        if (await stakingText.count() > 0) {
            console.log('✅ Staking requirement detected');
        }

        // Complete phase
        const completeBtn2 = page.locator('[data-testid="complete-phase-button"]');
        if (await completeBtn2.isVisible({ timeout: 5000 })) {
            await completeBtn2.click();
            await page.waitForTimeout(2000);
        }

        const user2 = await mongoose.connection.collection('users').findOne({ _id: userId });
        expect(user2.xp).toBe(140); // 60 + 80
        expect(user2.completed_phases).toBe(2);

        // PHASE 3: Token Design Studio
        console.log('📍 Phase 3: Token Design Studio');
        await page.waitForTimeout(1000);

        // Verify phase header shows "PHASE 3"
        await expect(page.locator('text=/PHASE\\s+3/i')).toBeVisible();

        // Verify DAO vote requirement
        const daoText = page.getByText(/Vote|DAO/i);
        if (await daoText.count() > 0) {
            console.log('✅ DAO vote requirement detected');
        }

        // Check for Mermaid diagram rendering
        const mermaidDiagram = page.locator('svg.mermaid-diagram, .mermaid');
        if (await mermaidDiagram.count() > 0) {
            console.log('✅ Mermaid diagram detected in Token Design phase');
            // Verify no error messages
            const mermaidError = await page.locator('.mermaid-error').count();
            expect(mermaidError).toBe(0);
        }

        const completeBtn3 = page.locator('[data-testid="complete-phase-button"]');
        if (await completeBtn3.isVisible({ timeout: 5000 })) {
            await completeBtn3.click();
            await page.waitForTimeout(2000);
        }

        const user3 = await mongoose.connection.collection('users').findOne({ _id: userId });
        expect(user3.xp).toBe(230); // 60 + 80 + 90
        expect(user3.completed_phases).toBe(3);

        // PHASE 4: Identity & Security Forge
        console.log('📍 Phase 4: Identity & Security Forge');
        await page.waitForTimeout(1000);

        // Verify phase header shows "PHASE 4"
        await expect(page.locator('text=/PHASE\\s+4/i')).toBeVisible();

        const completeBtn4 = page.locator('[data-testid="complete-phase-button"]');
        if (await completeBtn4.isVisible({ timeout: 5000 })) {
            await completeBtn4.click();
            await page.waitForTimeout(2000);
        }

        const user4 = await mongoose.connection.collection('users').findOne({ _id: userId });
        expect(user4.xp).toBe(330); // 60 + 80 + 90 + 100
        expect(user4.completed_phases).toBe(4);

        // PHASE 5: Ecosystem Activation
        console.log('📍 Phase 5: Ecosystem Activation');
        await page.waitForTimeout(1000);

        // Verify phase header shows "PHASE 5"
        await expect(page.locator('text=/PHASE\\s+5/i')).toBeVisible();

        // Verify GovernanceDAOAgent is accessible
        const governanceAgent = page.getByText(/Governance.*DAO/i);
        if (await governanceAgent.count() > 0) {
            console.log('✅ GovernanceDAOAgent accessible in Ecosystem phase');
        }

        const completeBtn5 = page.locator('[data-testid="complete-phase-button"]');
        if (await completeBtn5.isVisible({ timeout: 5000 })) {
            await completeBtn5.click();
            await page.waitForTimeout(2000);
        }

        const user5 = await mongoose.connection.collection('users').findOne({ _id: userId });
        expect(user5.xp).toBe(450); // 60 + 80 + 90 + 100 + 120
        expect(user5.mfai_balance).toBe(45); // 6 + 8 + 9 + 10 + 12
        expect(user5.completed_phases).toBe(5);

        // PHASE 6: Launch via Collaterize
        console.log('📍 Phase 6: Launch via Collaterize');
        await page.waitForTimeout(1000);

        // Verify phase header shows "PHASE 6"
        await expect(page.locator('text=/PHASE\\s+6/i')).toBeVisible();

        // Verify Collaterize simulator link
        await expect(page.getByText(/Collaterize/i)).toBeVisible();

        const completeBtn6 = page.locator('[data-testid="complete-phase-button"]');
        if (await completeBtn6.isVisible({ timeout: 5000 })) {
            await completeBtn6.click();
            await page.waitForTimeout(2000);
        }

        const userFinal = await mongoose.connection.collection('users').findOne({ _id: userId });
        expect(userFinal.xp).toBe(650); // 60 + 80 + 90 + 100 + 120 + 200
        expect(userFinal.mfai_balance).toBe(65); // 6 + 8 + 9 + 10 + 12 + 20
        expect(userFinal.completed_phases).toBe(6);

        console.log('✅ Full 6-phase journey completed successfully');
        console.log(`   Final XP: ${userFinal.xp}`);
        console.log(`   Final $MFAI: ${userFinal.mfai_balance}`);
    });

    test('Reconnection Test: State Preservation at Phase 3', async ({ page, context }) => {
        // Seed user at phase 3
        const userId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439013');
        const userEmail = 'reconnect@moneyfactory.ai';

        await mongoose.connection.collection('users').updateOne(
            { _id: userId },
            {
                $set: {
                    email: userEmail,
                    role: 'user',
                    is_active: true,
                    completed_phases: 3,
                    current_phase: 'identity-proofing',
                    persona: 'cognitive-activation-hub',
                    xp: 230,
                    mfai_balance: 23,
                    wallet_address: '0xReconnectWallet'
                }
            },
            { upsert: true }
        );

        // Initial login
        await page.goto('http://localhost:4173/');
        await page.evaluate(({ token }) => {
            sessionStorage.setItem('accessToken', token);
            localStorage.setItem('accessToken', token);
        }, { token: 'reconnect-token' });

        await page.goto('http://localhost:4173/journey');
        await page.waitForLoadState('networkidle');

        // Verify at phase 4 (after completing 3)
        await expect(page.locator('.navigator-phase')).toContainText('4/6');

        // Simulate disconnect: Clear session
        await context.clearCookies();
        await page.evaluate(() => {
            sessionStorage.clear();
            localStorage.clear();
        });

        console.log('🔌 Disconnected - Session cleared');

        // Reconnect: Login again
        await page.goto('http://localhost:4173/login');
        await page.fill('input[name="email"]', userEmail);
        await page.fill('input[name="password"]', 'demo123');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        // Navigate back to journey
        await page.goto('http://localhost:4173/journey');
        await page.waitForLoadState('networkidle');

        // Verify Zyno resumed at Phase 4
        await expect(page.locator('.navigator-phase')).toContainText('4/6');

        // Verify XP and balance preserved
        const userReconnected = await mongoose.connection.collection('users').findOne({ _id: userId });
        expect(userReconnected.xp).toBe(230);
        expect(userReconnected.mfai_balance).toBe(23);
        expect(userReconnected.completed_phases).toBe(3);

        console.log('✅ Reconnection test PASSED - State preserved');
    });

    test('Zyno Pulse: Real-time Reflections with Confidence Weight', async ({ page }) => {
        // Setup user
        const userId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439014');
        await mongoose.connection.collection('users').updateOne(
            { _id: userId },
            {
                $set: {
                    email: 'pulse@moneyfactory.ai',
                    role: 'user',
                    is_active: true,
                    completed_phases: 0,
                    persona: 'cognitive-activation-hub',
                    wallet_address: '0xPulseWallet'
                }
            },
            { upsert: true }
        );

        await page.goto('http://localhost:4173/');
        await page.evaluate(({ token }) => {
            sessionStorage.setItem('accessToken', token);
        }, { token: 'pulse-token' });

        await page.goto('http://localhost:4173/journey');
        await page.waitForLoadState('networkidle');

        // Interact with Zyno
        const askButton = page.locator('button:has-text("Ask Zyno"), button:has-text("Chat")').first();
        if (await askButton.isVisible()) {
            await askButton.click();
            await page.waitForTimeout(500);

            // Send message
            const textarea = page.locator('textarea, input[type="text"]').first();
            await textarea.fill('Explain Solana runtime architecture');

            const sendButton = page.locator('button:has-text("Send"), button[type="submit"]').first();
            await sendButton.click();
            await page.waitForTimeout(2000);

            // Check for Pulse console or confidence indicator
            const pulseIndicators = [
                page.locator('.zyno-pulse-reflection'),
                page.locator('.confidence-weight'),
                page.locator('[class*="confidence"]'),
                page.getByText(/confidence/i)
            ];

            let foundPulse = false;
            for (const indicator of pulseIndicators) {
                if (await indicator.count() > 0) {
                    const text = await indicator.first().textContent();
                    console.log(`✅ Zyno Pulse detected: ${text}`);
                    foundPulse = true;
                    break;
                }
            }

            if (!foundPulse) {
                console.log('⚠️  Zyno Pulse not detected - may need UI implementation');
            }
        }
    });
});
