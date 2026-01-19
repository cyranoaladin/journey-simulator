const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://127.0.0.1:27018/journey'; // Hardcoded based on findings

async function stressTest() {
    try {
        console.log(`🔌 Connecting to ${MONGO_URI}...`);
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ Connected');

        const TestSchema = new mongoose.Schema({ content: String, date: Date });
        const TestModel = mongoose.model('ConnectionTest', TestSchema);

        console.log('🚀 Starting 100 rapid writes...');
        const start = Date.now();
        const ops = [];
        for (let i = 0; i < 100; i++) {
            ops.push(TestModel.create({ content: `test-${i}`, date: new Date() }));
        }
        await Promise.all(ops);
        console.log(`✅ Writes completed in ${Date.now() - start}ms`);

        console.log('🧹 Cleaning up...');
        await TestModel.deleteMany({});

        await mongoose.disconnect();
        console.log('✅ Connection close clean. DATABASE IS STABLE.');
        process.exit(0);
    } catch (err) {
        console.error('❌ DB STRESS TEST FAILED:', err);
        process.exit(1);
    }
}

stressTest();
