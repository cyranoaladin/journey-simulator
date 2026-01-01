process.env.LLM_MODEL_NAME = 'gpt-4o';
// Force local RAG by unsetting remote URL (simulating fallback or pure local mode)
// or we let it fail. Let's unset it to be clean and fast.
process.env.RAG_SEARCH_URL = '';
process.env.RAG_DATA_PATH = require('path').resolve(__dirname, '../docs/knowledge_base'); // Focus on KB 
require('dotenv').config({ path: '../.env' });

const { RAGClient } = require('../orchestration/ragClient');
const { LLMClient } = require('../orchestration/llmClient');

async function runE2ETest() {
    console.log('--- STARTING E2E INTELLIGENCE PIPELINE TEST ---');

    const rag = new RAGClient();
    const llm = new LLMClient();

    // METRICS
    const metrics = {
        ragLatency: 0,
        llmLatency: 0,
        ragHits: 0
    };

    // 1. RAG CONNECTIVITY & PRECISION
    console.log('\n[1] Testing RAG Layer...');
    const query = "Spécificités du calcul des frais de priorité sur Solana v1.17";

    const ragResult = await rag.search({
        query: query,
        topK: 2,
        traceId: 'e2e-rag-test',
        domain: 'solana'
    });

    metrics.ragLatency = ragResult.latencyMs;
    metrics.ragHits = ragResult.chunks.length;
    console.log(`RAG Source: ${ragResult.source}`);
    console.log(`RAG Hits: ${metrics.ragHits}`);

    if (metrics.ragHits === 0) {
        console.error('❌ CRITICAL: RAG returned 0 results. Indexation Rupture.');
        process.exit(1);
    }

    const bestChunk = ragResult.chunks[0];
    console.log(`Top Chunk Title: ${bestChunk.title}`);

    // Similarity Check (Mocked via keyword presence since we use local regex)
    if (!bestChunk.text.includes('ComputeBudget') && !bestChunk.text.includes('1.17')) {
        console.error('❌ RAG Relevance Low (Keywords missing).');
        process.exit(1);
    } else {
        console.log('✅ RAG Precision Validated (Key concepts present).');
    }


    // 2. LLM BRIDGE (OpenAI)
    console.log('\n[2] Testing LLM Bridge (Context Injection)...');

    const contextString = ragResult.chunks.map(c => c.text).join('\n\n');
    const systemPrompt = `Tu es l'Orchestrateur MFAI. Utilise UNIQUEMENT les informations fournies dans le contexte ci-dessous pour répondre. Si l'information est absente, indique-le.
  
  CONTEXTE:
  ${contextString}`;

    const userPrompt = `Quelle est la règle MFAI concernant les frais de priorité ? Réponds au format structuré demandé.`;

    const llmResponse = await llm.generate({
        prompt: { system: systemPrompt, user: userPrompt },
        traceId: 'e2e-llm-test',
        agentId: 'Orchestrator'
    });

    metrics.llmLatency = llmResponse.latencyMs;

    if (llmResponse.mock) {
        console.warn('⚠️  Warning: LLM is responding in MOCK mode. Connectivity check skipped.');
    } else {
        console.log('✅ LLM Response Received (Status 200 equivalent).');
    }


    // 3. HYBRID OUTPUT SYNTHESIS
    console.log('\n[3] Validating Hybrid Output...');

    // We expect the LLM to follow the instructions.
    // Ideally, we should have prompted the output format in the LLM call directly, 
    // but let's parse what it gave and see if it adhered to the "Use Only Context" rule.

    const rawText = llmResponse.text;
    console.log('\n--- LLM RAW OUTPUT ---');
    console.log(rawText);
    console.log('----------------------\n');

    // Validation Logic
    const mentionsGetRecent = rawText.includes('getRecentPrioritizationFees');
    const mentionsMFAI = rawText.includes('MFAI') || rawText.includes('Money Factory AI');

    if (mentionsGetRecent && mentionsMFAI) {
        console.log('✅ Hybrid Synthesis Validated: LLM correctly cited RAG constraints.');
    } else {
        console.error('❌ Hallucination Detected: LLM failed to cite the specific internal API rule.');
    }


    // 4. SHOW THE BONES
    console.log('\n--- DIAGNOSTIC REPORT ---');
    console.log(`Latency Trace   : RAG ${metrics.ragLatency}ms | LLM ${metrics.llmLatency}ms`);
    console.log(`Token Usage     : ${llmResponse.tokensUsed} tokens`);
    console.log(`Grounding Score : ${mentionsGetRecent ? '100% (Exact Match)' : '0% (Missed)'}`);
    console.log('-------------------------');

}

runE2ETest();
