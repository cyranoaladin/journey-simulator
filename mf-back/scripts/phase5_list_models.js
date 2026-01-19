require('dotenv').config();
const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

(async () => {
    try {
        console.log('Discovering models...');
        const res = await client.models.list();
        const ids = res.data.map(m => m.id).sort();
        console.log(JSON.stringify({ count: ids.length, ids }, null, 2));
    } catch (err) {
        console.error('ERROR listing models:', err.message);
        process.exit(1);
    }
})();
