/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'https://journey.mfai.app/api';
const EMAIL = `verify_${Date.now()}@example.com`;
const PASSWORD = 'password123';

async function runVerification() {
    console.log('Starting Deep Verification of Journey Flow...');

    try {
        // 1. Register
        console.log(`\n1. Registering user: ${EMAIL}`);
        await axios.post(`${BASE_URL}/user/register`, {
            name: 'Verification User',
            email: EMAIL,
            password: PASSWORD,
            wallet_address: `0x${Date.now()}`,
            persona: 'cognitive-activation-hub'
        });
        console.log('   Registration successful.');

        // 2. Login
        console.log('\n2. Logging in...');
        const loginRes = await axios.post(`${BASE_URL}/user/login`, {
            email: EMAIL,
            password: PASSWORD
        });
        const token = loginRes.data.accessToken;
        console.log('   Login successful. Token received.');

        const headers = { Authorization: `Bearer ${token}` };

        // Helper to get progress
        const getProgress = async () => {
            const res = await axios.get(`${BASE_URL}/journey/user-progress`, { headers });
            return res.data.progress;
        };

        // Initial Check
        let progress = await getProgress();
        console.log('\n   Initial State:', { xp: progress.total_xp, mfai: progress.token_transactions?.mfai_tokens });
        if (progress.total_xp !== 0 || (progress.token_transactions?.mfai_tokens || 0) !== 0) {
            throw new Error('Initial state is not clean!');
        }

        // 3. Phase 1 (Mint)
        console.log('\n3. Completing Phase 1 (Mint)...');
        await axios.post(`${BASE_URL}/journey/complete-phase`, {
            phase_number: 1,
            score: 100,
            nft_address: '0xMint1',
            xp_reward: 60,
            mfai_reward: 6
        }, { headers });

        progress = await getProgress();
        console.log('   State after Phase 1:', { xp: progress.total_xp, mfai: progress.token_transactions?.mfai_tokens });

        if (progress.total_xp !== 60) throw new Error(`Phase 1 XP mismatch. Expected 60, got ${progress.total_xp}`);
        if (progress.token_transactions.mfai_tokens !== 6) throw new Error(`Phase 1 MFAI mismatch. Expected 6, got ${progress.token_transactions.mfai_tokens}`);
        console.log('   Phase 1 Verification PASSED.');

        // 4. Phase 2 (Stake)
        console.log('\n4. Completing Phase 2 (Stake)...');
        await axios.post(`${BASE_URL}/journey/complete-phase`, {
            phase_number: 2,
            score: 100,
            nft_address: '0xStake2',
            xp_reward: 80,
            mfai_reward: 8
        }, { headers });

        progress = await getProgress();
        console.log('   State after Phase 2:', { xp: progress.total_xp, mfai: progress.token_transactions?.mfai_tokens });

        if (progress.total_xp !== 140) throw new Error(`Phase 2 XP mismatch. Expected 140 (60+80), got ${progress.total_xp}`);
        if (progress.token_transactions.mfai_tokens !== 14) throw new Error(`Phase 2 MFAI mismatch. Expected 14 (6+8), got ${progress.token_transactions.mfai_tokens}`);
        console.log('   Phase 2 Verification PASSED.');

        // 5. Phase 3 (Vote)
        console.log('\n5. Completing Phase 3 (Vote)...');
        await axios.post(`${BASE_URL}/journey/complete-phase`, {
            phase_number: 3,
            score: 100,
            nft_address: '0xVote3',
            xp_reward: 90,
            mfai_reward: 9
        }, { headers });

        progress = await getProgress();
        console.log('   State after Phase 3:', { xp: progress.total_xp, mfai: progress.token_transactions?.mfai_tokens });

        if (progress.total_xp !== 230) throw new Error(`Phase 3 XP mismatch. Expected 230 (140+90), got ${progress.total_xp}`);
        if (progress.token_transactions.mfai_tokens !== 23) throw new Error(`Phase 3 MFAI mismatch. Expected 23 (14+9), got ${progress.token_transactions.mfai_tokens}`);
        console.log('   Phase 3 Verification PASSED.');

        console.log('\n✅ ALL VERIFICATIONS PASSED SUCCESSFULLY');

    } catch (error) {
        console.error('\n❌ VERIFICATION FAILED');
        if (error.response) {
            console.error('API Error:', error.response.status, error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        process.exit(1);
    }
}

runVerification();
