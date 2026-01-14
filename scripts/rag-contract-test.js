
async function testRagContract() {
    const baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:3002';
    console.log(`[RAG-CONTRACT] Testing endpoint: ${baseUrl}/resources/rag`);

    try {
        const res = await fetch(`${baseUrl}/resources/rag`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const docs = data.documents;

        if (!Array.isArray(docs)) {
            throw new Error('RAG response "documents" should be an array');
        }

        console.log(`[RAG-CONTRACT] Found ${docs.length} documents.`);

        // Check first doc if exists
        if (docs.length > 0) {
            const doc = docs[0];
            const requiredFields = ['name', 'path', 'url'];
            requiredFields.forEach(f => {
                if (!doc[f]) throw new Error(`Document missing field: ${f}`);
            });
            console.log('[RAG-CONTRACT] Document schema: VALID');
        }

        // Success
        process.exit(0);
    } catch (err) {
        console.error('[RAG-CONTRACT] FAILED:', err.message);
        process.exit(1);
    }
}

testRagContract();
