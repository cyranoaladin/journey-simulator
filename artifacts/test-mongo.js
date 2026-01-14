const mongoose = require('mongoose');
const mongoUri = 'mongodb://127.0.0.1:27018/mfai_test';

console.log(`Connecting to ${mongoUri}...`);
mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 })
    .then(() => {
        console.log('✅ MongoDB Connection Success!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Failed:', err.message);
        process.exit(1);
    });
