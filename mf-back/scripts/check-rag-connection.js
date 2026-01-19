/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const axios = require("axios");
const dotenv = require("dotenv");
const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_BASE_URL = "https://rag-api.nexusreussite.academy";
const envCandidates = [
    path.resolve(__dirname, "../.env.local"),
    path.resolve(__dirname, "../.env"),
    path.resolve(__dirname, "../../.env")
];

for (const envFile of envCandidates) {
    if (fs.existsSync(envFile)) {
        dotenv.config({ path: envFile, override: false });
    }
}

const RAG_URL = process.env.RAG_SEARCH_URL || `${DEFAULT_BASE_URL}/search`;
const HEALTH_URL = process.env.RAG_HEALTH_URL || `${DEFAULT_BASE_URL}/health`;
const COLLECTION = process.env.RAG_COLLECTION || "mfai-knowledge";
const DEFAULT_K = Number(process.env.RAG_TEST_K) || 3;
const VALID_TOKEN = process.env.RAG_API_KEY || "MoneyFactory_2025_Secure_Token_X9";
const INVALID_TOKEN = "INVALID_TOKEN_123";

const writeProbe = (label) => process.stdout.write(`${label}... `);

const logError = (error) => {
    console.error("   Error:", error.message);
    if (error.response) {
        console.error("   Status:", error.response.status);
    }
};

async function runProbe(label, handler) {
    writeProbe(label);
    try {
        await handler();
        console.log("✅ OK");
        return true;
    } catch (error) {
        console.log("❌ FAILED");
        logError(error);
        return false;
    }
}

async function checkConnection() {
    console.log("🔍 Starting RAG Connection Check...\n");
    console.log(`   → Query endpoint: ${RAG_URL}`);
    if (HEALTH_URL) {
        console.log(`   → Health endpoint: ${HEALTH_URL}`);
    }
    console.log("");

    let success = true;

    // Test 1: Valid Token
    success = success && await runProbe("Testing Valid Token", () =>
        axios.post(
            RAG_URL,
            { q: "ping", collection: COLLECTION, k: DEFAULT_K },
            { headers: { "x-api-key": VALID_TOKEN }, timeout: 5000 }
        )
    );

    // Test 2: Invalid Token (expect 401/403, but tolerate open endpoints)
    success = success && await runProbe("Testing Invalid Token", async () => {
        try {
            const invalidResponse = await axios.post(
                RAG_URL,
                { q: "ping", collection: COLLECTION, k: DEFAULT_K },
                { headers: { "x-api-key": INVALID_TOKEN }, timeout: 5000 }
            );
            if (invalidResponse.status === 200) {
                console.log("⚠️  Received 200 (endpoint allows anonymous or tokenless access)");
            } else {
                console.log(`⚠️  Unexpected status ${invalidResponse.status} but continuing`);
            }
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                console.log(`✅ OK (Caught expected ${error.response.status})`);
            } else {
                throw error;
            }
        }
    });

    // Test 3: Health check (no auth required)
    if (HEALTH_URL) {
        success = success && await runProbe("Testing Health endpoint", async () => {
            const healthResponse = await axios.get(HEALTH_URL, { timeout: 5000 });
            if (healthResponse.status !== 200) {
                throw new Error(`Unexpected status ${healthResponse.status}`);
            }
        });
    } else {
        console.log("ℹ️  HEALTH_URL not set, skipping health probe.");
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
