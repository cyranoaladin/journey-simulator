
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load env
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/journey';

const userSchema = new mongoose.Schema({
    email: String,
    userProgress: {
        interaction_logs: [{
            role: String,
            content: String,
            source: String,
            timestamp: Date
        }]
    }
}, { strict: false });

const User = mongoose.model('User', userSchema);

async function verifyLogs() {
    console.log('🔌 Connecting to Neural Core (MongoDB)...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected.');

    try {
        const user = await User.findOne({ email: 'test@mfai.app' });
        if (!user) {
            console.error('❌ Test user not found!');
            process.exit(1);
        }

        const logs = user.userProgress?.interaction_logs || [];
        console.log(`🔍 Found ${logs.length} interaction logs.`);

        if (logs.length > 0) {
            console.log('📝 Last 3 Log Entries:');
            logs.slice(-3).forEach(l => {
                console.log(`   [${l.source || 'SYSTEM'}] ${l.content}`);
            });
            console.log('✅ Neural Core Synchronization VERIFIED.');
        } else {
            console.error('❌ No interaction logs found. Sync FAILED.');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Error verifying logs:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

verifyLogs();
