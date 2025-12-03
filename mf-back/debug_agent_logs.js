const mongoose = require('mongoose');
const AgentLog = require('./models/agentFeedbackLog');

const MONGO_URI = 'mongodb://127.0.0.1:27017/mfai';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');
        try {
            const logs = await AgentLog.find({}).limit(10);
            console.log('Logs found:', logs.length);
            console.log(logs);
        } catch (err) {
            console.error('Error fetching logs:', err);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => {
        console.error('Connection error:', err);
    });
