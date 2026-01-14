/**
 * Seed Master Admin User for Backdoor
 * Creates a user with ID 'master-admin' in MongoDB
 */

const mongoose = require('mongoose');
const User = require('./models/user');

// Use a fixed ObjectId for master-admin (deterministic)
const MASTER_ADMIN_ID = new mongoose.Types.ObjectId('507f1f77bcf86cd799439999');

async function seedMasterAdmin() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mfai';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Check if master-admin already exists
        const existing = await User.findById(MASTER_ADMIN_ID);
        if (existing) {
            console.log('⚠️  Master Admin already exists:', existing.email);
            await mongoose.connection.close();
            return;
        }

        // Create master-admin user
        const masterAdmin = new User({
            _id: MASTER_ADMIN_ID,
            name: 'Master Admin',
            email: 'master-admin@mfai.app',
            username: 'Master Admin',
            password: '$2a$10$dummyHashThatWillNeverBeUsedForLogin', // Dummy hash (never used)
            role: 'admin',
            wallet_address: '0x0000000000000000000000000000000000000000',
            persona: 'cognitive-activation-hub',
            total_xp: 9999,
            current_level: 99,
            completed_phases: 4,
            subscription: 'diamond',
            is_active: true,
        });

        await masterAdmin.save();
        console.log('✅ Master Admin user created successfully!');
        console.log('   ID:', masterAdmin._id);
        console.log('   Email:', masterAdmin.email);
        console.log('   Role:', masterAdmin.role);

        await mongoose.connection.close();
        console.log('✅ Database connection closed');
    } catch (error) {
        console.error('❌ Error seeding master admin:', error);
        process.exit(1);
    }
}

// Run the seed
seedMasterAdmin();
