/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
// Load environment variables from mf-back/.env
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/user');

/**
 * Clean Slate Test User Seeding
 * Deletes and recreates test@mfai.app with known credentials
 */
async function seedTestUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/journey');
        console.log('✅ MongoDB Connected');

        const testEmail = 'test@mfai.app';
        const testPassword = 'MFAITest2026!';

        // DELETE existing user
        const deleted = await User.deleteOne({ email: testEmail });
        console.log(`🗑️  Deleted ${deleted.deletedCount} existing test user(s)`);

        // CREATE new user with known password (middleware will hash it)
        const newUser = await User.create({
            name: 'E2E Test User',
            email: testEmail,
            password: testPassword, // Plain password - pre-save middleware will hash
            persona: 'investor',
            wallet_address: 'E2ETestWallet1111111111111111111111111111', // Valid format
            is_active: true,
            role: 'user'
        });

        console.log(`✅ Created test user: ${newUser.email}`);
        console.log(`   ID: ${newUser._id}`);
        console.log(`   Password: ${testPassword}`);

        // VERIFY password works
        const isMatch = await bcrypt.compare(testPassword, newUser.password);
        console.log(`✅ Password verification: ${isMatch ? 'SUCCESS' : 'FAILED'}`);

        await mongoose.connection.close();
        console.log('✅ Seeding complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedTestUser();
