const mongoose = require('mongoose');
// const path = require('path');
// require('dotenv').config(); // Optional in container as Env vars are injected

console.log('🌱 Seeding VETERAN State (Sovereign Mode)...');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/journey';

const seed = async () => {
    try {
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');

        const UserSchema = new mongoose.Schema({}, { strict: false });
        const User = mongoose.model('User', UserSchema);

        // Clear existing test users
        await User.deleteMany({ email: 'veteran@mfai.app' });

        const veteran = {
            email: 'veteran@mfai.app',
            passwordHash: '$2b$10$EpRnTzVlqHNP0.fQUX9ky.1cnwX3H5.0/2/3.4/5.6', // Placeholder hash
            role: 'user',
            profile: {
                level: 5,
                xp: 15000,
                rank: 'S_RANK',
                badges: ['GENESIS_HOLDER', 'CAPITAL_FOUNDRY_MASTER', 'RESILIENCE_VETERAN'],
                votingPower: 5000
            },
            journeyState: {
                currentPhase: 5,
                unlockedOne: true,
                completedMissions: ['hub_activation', 'bonding_curve', 'node_sim', 'cnft_mint', 'governance_vote']
            },
            wallet: {
                address: '7XwS...Veteran',
                balance: 1000 // $MFAI
            },
            createdAt: new Date()
        };

        await User.create(veteran);
        console.log('✅ Veteran User Created: veteran@mfai.app (Level 5, S_RANK)');

        console.log('🌱 Seeding Complete.');
        process.exit(0);

    } catch (e) {
        console.error('❌ Seeding Failed:', e);
        process.exit(1);
    }
};

seed();
