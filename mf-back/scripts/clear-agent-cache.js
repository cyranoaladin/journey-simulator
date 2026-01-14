#!/usr/bin/env node
/**
 * Clear AgentRun cache to test new idempotency key logic
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mfai_db';

async function clearCache() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const AgentRun = mongoose.model('AgentRun', new mongoose.Schema({}, { strict: false, collection: 'agentruns' }));

        const result = await AgentRun.deleteMany({});
        console.log(`Deleted ${result.deletedCount} AgentRun entries`);

        await mongoose.disconnect();
        console.log('Cache cleared successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error clearing cache:', error.message);
        process.exit(1);
    }
}

clearCache();
