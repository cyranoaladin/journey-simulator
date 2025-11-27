require('dotenv').config();
const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const SIMPLE_SCHEMA = {
    type: "object",
    properties: {
        message: { type: "string" }
    },
    required: ["message"],
    additionalProperties: false
};

async function testGpt5() {
    console.log("🚀 Testing GPT-5.1 Responses API...");

    // Test 3: Structure aplatie avec 'schema' direct
    console.log("\n--- Test 3: Flattened with 'schema' property ---");
    try {
        const response = await openai.responses.create({
            model: "gpt-5.1",
            input: "Say hello in JSON",
            text: {
                verbosity: "medium",
                format: {
                    type: "json_schema",
                    name: "TestResponse",
                    schema: SIMPLE_SCHEMA, // Schema direct ici
                    strict: true
                }
            }
        });
        console.log("✅ Success!", response.output_text);
    } catch (e) {
        console.error("❌ Failed:", e.message);
        if (e.error) console.error("Error details:", JSON.stringify(e.error, null, 2));
    }

    // Test 4: Sans 'strict'
    console.log("\n--- Test 4: Flattened without strict ---");
    try {
        const response = await openai.responses.create({
            model: "gpt-5.1",
            input: "Say hello in JSON",
            text: {
                verbosity: "medium",
                format: {
                    type: "json_schema",
                    name: "TestResponse",
                    schema: SIMPLE_SCHEMA
                }
            }
        });
        console.log("✅ Success!", response.output_text);
    } catch (e) {
        console.error("❌ Failed:", e.message);
    }
}

testGpt5();
