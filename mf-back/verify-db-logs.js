const mongoose = require('mongoose');
const AgentInteractionLog = require('./models/agentFeedbackLog');

const MONGO_URI = 'mongodb://127.0.0.1:27017/journey';

async function verifyLogs() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('connected to mongo');

        const count = await AgentInteractionLog.countDocuments({});
        console.log(`Total Logs: ${count}`);

        const logs = await AgentInteractionLog.find({}).sort({ timestamp: -1 }).limit(5);
        logs.forEach((log, i) => {
            console.log(`[${i}] Agent: ${log.agentName} | User: ${log.userId} | Payload keys: ${Object.keys(log.payload || {})}`);
        });

        if (count > 0) process.exit(0);
        else {
            console.error('No logs found!');
            process.exit(1);
        }
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

verifyLogs();
