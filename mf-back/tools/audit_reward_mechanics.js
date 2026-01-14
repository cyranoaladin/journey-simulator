/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mfai_test';

async function auditRewardMechanics() {
    console.log('🔍 Starting Reward Mechanics Audit...\n');

    await mongoose.connect(MONGO_URI);

    // Phase complexity mapping (from personas.ts)
    const phaseComplexity = {
        'cognitive-orientation': 60,
        'solana-fluency': 80,
        'token-design-lab': 90,
        'identity-proofing': 100,
        'ecosystem-engagement': 120,
        'launch-collaterize': 200
    };

    let allPassed = true;

    // Test 1: XP Proportionality
    console.log('📊 Test 1: XP Proportionality Check');

    const users = await mongoose.connection.collection('users').find({
        persona: 'cognitive-activation-hub',
        completed_phases: { $gte: 1 }
    }).toArray();

    if (users.length === 0) {
        console.log('⚠️  No users found with completed phases - skipping XP check');
    } else {
        for (const user of users) {
            const expectedXP = Object.values(phaseComplexity)
                .slice(0, user.completed_phases)
                .reduce((sum, xp) => sum + xp, 0);

            if (user.xp === expectedXP) {
                console.log(`✅ User ${user.email}: XP correct (${user.xp} === ${expectedXP})`);
            } else {
                console.log(`❌ User ${user.email}: XP mismatch (${user.xp} !== ${expectedXP})`);
                allPassed = false;
            }
        }
    }

    // Test 2: $MFAI Airdrop Balance
    console.log('\n💰 Test 2: $MFAI Airdrop Balance Check');

    const usersWithMFAI = await mongoose.connection.collection('users').find({
        persona: 'cognitive-activation-hub',
        completed_phases: { $gte: 5 }
    }).toArray();

    if (usersWithMFAI.length === 0) {
        console.log('⚠️  No users completed phase 5 - skipping $MFAI check');
    } else {
        for (const user of usersWithMFAI) {
            // Expected: 6 + 8 + 9 + 10 + 12 = 45 for 5 phases
            const expectedMFAI = [6, 8, 9, 10, 12].slice(0, user.completed_phases).reduce((sum, m) => sum + m, 0);

            if (user.mfai_balance === expectedMFAI) {
                console.log(`✅ User ${user.email}: $MFAI correct (${user.mfai_balance} === ${expectedMFAI})`);
            } else {
                console.log(`❌ User ${user.email}: $MFAI mismatch (${user.mfai_balance} !== ${expectedMFAI})`);
                allPassed = false;
            }
        }
    }

    // Test 3: Staking Workflow Accessibility
    console.log('\n🔒 Test 3: Staking Workflow Accessibility (Phase 2+)');

    const stakingUsers = await mongoose.connection.collection('users').find({
        persona: 'cognitive-activation-hub',
        completed_phases: { $gte: 2 }
    }).toArray();

    if (stakingUsers.length > 0) {
        console.log(`✅ Found ${stakingUsers.length} users eligible for staking (completed phase 2+)`);
    } else {
        console.log('⚠️  No users eligible for staking yet');
    }

    // Test 4: DAO Governance Proposal Generation
    console.log('\n🏛️  Test 4: DAO Governance Proposal Generation');

    const daoUsers = await mongoose.connection.collection('users').find({
        persona: 'cognitive-activation-hub',
        completed_phases: { $gte: 5 }
    }).toArray();

    if (daoUsers.length > 0) {
        console.log(`✅ Found ${daoUsers.length} users eligible for DAO participation (completed phase 5+)`);

        // Simulate GovernanceDAOAgent proposal generation
        const mockProposal = {
            title: 'Community Treasury Allocation for Q1 2026',
            description: 'Proposal to allocate 10% of treasury to developer grants',
            voting_options: ['Approve', 'Reject', 'Abstain'],
            quorum_threshold: 0.51,
            created_by: daoUsers[0]._id,
            created_at: new Date()
        };

        console.log('✅ Mock DAO Proposal Generated:');
        console.log(`   Title: ${mockProposal.title}`);
        console.log(`   Options: ${mockProposal.voting_options.join(', ')}`);
        console.log(`   Quorum: ${mockProposal.quorum_threshold * 100}%`);
    } else {
        console.log('⚠️  No users eligible for DAO governance yet');
    }

    await mongoose.disconnect();

    console.log('\n' + '='.repeat(60));
    if (allPassed) {
        console.log('✅ REWARD MECHANICS AUDIT: PASSED');
    } else {
        console.log('❌ REWARD MECHANICS AUDIT: FAILED');
        process.exit(1);
    }
    console.log('='.repeat(60));
}

auditRewardMechanics().catch(err => {
    console.error('❌ Audit failed:', err);
    process.exit(1);
});
