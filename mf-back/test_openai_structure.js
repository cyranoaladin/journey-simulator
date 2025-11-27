require('dotenv').config();
const OpenAI = require('openai');

const apiKey = process.env.OPENAI_API_KEY;
console.log('API Key exists:', !!apiKey);

const openai = new OpenAI({ apiKey });

console.log('OpenAI Object Keys:', Object.keys(openai));
if (openai.beta) {
    console.log('openai.beta Keys:', Object.keys(openai.beta));
    if (openai.beta.chat) {
        console.log('openai.beta.chat Keys:', Object.keys(openai.beta.chat));
        if (openai.beta.chat.completions) {
            console.log('openai.beta.chat.completions Keys:', Object.keys(openai.beta.chat.completions));
        }
    }
} else {
    console.log('openai.beta is UNDEFINED');
}

if (openai.chat) {
    console.log('openai.chat Keys:', Object.keys(openai.chat));
    if (openai.chat.completions) {
        console.log('openai.chat.completions Keys:', Object.keys(openai.chat.completions));
        console.log('Has parse method?', typeof openai.chat.completions.parse);
        console.log('Has create method?', typeof openai.chat.completions.create);
    }
}
