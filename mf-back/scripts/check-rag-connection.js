const axios = require("axios");

const RAG_URL = "https://rag-api.nexusreussite.academy/rag/query";
const VALID_TOKEN = "MoneyFactory_2025_Secure_Token_X9";
const INVALID_TOKEN = "INVALID_TOKEN_123";

async function checkConnection() {
    console.log("🔍 Starting RAG Connection Check...\n");
    let success = true;

    // Test 1: Valid Token
    try {
        process.stdout.write("Testing Valid Token... ");
        await axios.post(
            RAG_URL,
            { query: "ping", top_k: 1, filters: { domain: "mfai_web3" } },
            { headers: { Authorization: `Bearer ${VALID_TOKEN}` }, timeout: 5000 }
        );
        console.log("✅ OK (200)");
    } catch (error) {
        console.log("❌ FAILED");
        console.error("   Error:", error.message);
        if (error.response) console.error("   Status:", error.response.status);
        success = false;
    }

    // Test 2: Invalid Token (Expect 401/403)
    try {
        process.stdout.write("Testing Invalid Token... ");
        await axios.post(
            RAG_URL,
            { query: "ping", top_k: 1, filters: { domain: "mfai_web3" } },
            { headers: { Authorization: `Bearer ${INVALID_TOKEN}` }, timeout: 5000 }
        );
        console.log("❌ FAILED (Expected 401/403 but got 200)");
        success = false;
    } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.log(`✅ OK (Caught expected ${error.response.status})`);
        } else {
            console.log("❌ FAILED (Unexpected error)");
            console.error("   Error:", error.message);
            if (error.response) console.error("   Status:", error.response.status);
            success = false;
        }
    }

    console.log("\n----------------------------------------");
    if (success) {
        console.log("🚀 RAG Connection Verified Successfully!");
        process.exit(0);
    } else {
        console.log("⚠️  RAG Connection Issues Detected.");
        process.exit(1);
    }
}

checkConnection();
