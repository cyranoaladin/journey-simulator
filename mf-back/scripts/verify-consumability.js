process.env.LLM_MODEL_NAME = 'gpt-4o';
require('dotenv').config({ path: '../.env' });
const NFTAgent = require('../agents/NFTAgent');

async function verifyConsumability() {
    console.log('--- STARTING CONSUMABILITY AUDIT: NFTAgent ---');

    const agent = new NFTAgent();
    const iterations = 5;
    const inputs = [
        "Collection de 100 NFTs Pixel Art",
        "Collection de 5000 NFTs PFP Animals",
        "Collection de 333 Access Pass pour DAO",
        "Collection de 10 NFTs 1/1 Art",
        "Collection de 8888 Gaming Items"
    ];

    let successCount = 0;

    for (let i = 0; i < iterations; i++) {
        console.log(`\n[Iteration ${i + 1}/${iterations}] Input: "${inputs[i]}"`);

        try {
            const response = await agent.run({
                traceId: `consumability-test-${i}`,
                input: inputs[i],
                context: { journey: { phaseId: 'design' }, orchestrationMode: 'AEPO' }
            });

            // 1. EXTRACT DIAGRAM
            const resourceDiagram = response.resources?.diagram;
            if (!resourceDiagram) {
                console.error('❌ Diagram Resource MISSING');
                continue;
            }

            // 2. CHECK UI_HINT
            if (resourceDiagram.ui_hint !== 'diagram') {
                console.error(`❌ Invalid ui_hint for diagram: ${resourceDiagram.ui_hint}`);
                continue;
            }

            // 3. VALIDATE MERMAID SYNTAX (Basic)
            const mermaid = resourceDiagram.content;
            const validStart = mermaid.trim().startsWith('graph TD') || mermaid.trim().startsWith('graph LR');
            const validArrow = mermaid.includes('-->') || mermaid.includes('---');
            const brokenChars = mermaid.includes('("') && !mermaid.includes('")'); // unclosed quotes checks roughly

            if (validStart && validArrow && !brokenChars) {
                console.log('✅ Mermaid Syntax Validated (Start node & Arrows found).');
            } else {
                console.error('❌ Mermaid Syntax BROKEN:', mermaid);
                continue;
            }

            // 4. CHECK JSON SCHEMA for Data
            const resourceData = response.resources?.data;
            if (resourceData.ui_hint !== 'table') {
                console.error(`❌ Invalid ui_hint for data: ${resourceData.ui_hint}`);
                continue;
            }

            // 5. CHECK ACTIONS ARRAY
            if (!Array.isArray(response.actions)) {
                console.error('❌ Actions is NOT an array');
                continue;
            }

            console.log('✅ Resource Structure & Consumability VERIFIED.');
            successCount++;

        } catch (e) {
            console.error('❌ Execution Error:', e);
        }
    }

    console.log(`\n--- AUDIT RESULTS: ${successCount}/${iterations} Valid ---`);
}

verifyConsumability();
