require('dotenv').config();
const OpenAI = require('openai');
const fs = require('fs');

async function runRealLLM() {
    console.log('=== PHASE 5.2: LLM REAL CALL ===');
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.includes('mock')) {
        console.error('FAIL: No valid OPENAI_API_KEY found.');
        process.exit(1);
    }

    // Force real mode despite SKIP_OPENAI in env for this specific proof
    const openai = new OpenAI({ apiKey });
    const model = process.env.MFAI_OPENAI_MODEL || 'gpt-4.1-mini-2025-04-14';

    console.log(`Model: ${model}`);
    console.log(`Temperature: 0`);

    const start = Date.now();
    try {
        const completion = await openai.chat.completions.create({
            model: model,
            messages: [{ role: 'user', content: 'Return exactly: OK.' }],
            temperature: 0,
            max_tokens: 5
        });

        const duration = Date.now() - start;
        const content = completion.choices[0].message.content;
        console.log(`Response: "${content}"`);
        console.log(`Duration: ${duration}ms`);

        if (content.trim() !== 'OK.') {
            console.error('FAIL: Deterministic check failed. Expected "OK.", got "' + content + '"');
            process.exit(1);
        }

        const proof = {
            LLM_REAL_STATUS: 'OK',
            model: model,
            temperature: 0,
            max_tokens: 5,
            latency: duration,
            prompt_hash: 'manual_ping_check',
            timestamp: new Date().toISOString()
        };

        fs.writeFileSync('../artifacts/proof/phase5_llm_real_proof.json', JSON.stringify(proof, null, 2));
        console.log('Proof written to artifacts/proof/phase5_llm_real_proof.json');
        console.log('LLM_REAL_STATUS=OK');

    } catch (error) {
        console.error('FAIL: API Call Error:', error.message);
        process.exit(1);
    }
}

runRealLLM();
