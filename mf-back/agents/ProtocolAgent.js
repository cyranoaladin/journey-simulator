const { LLMClient } = require('../orchestration/llmClient');

class ProtocolAgent {
    constructor() {
        this.id = 'ProtocolAgent';
        this.llm = new LLMClient({});
    }

    buildPrompt({ input, ragChunks, journey, orchestrationMode }) {
        const citations = (ragChunks || [])
            .map((c, i) => `- [${i + 1}] ${c.title}: ${c.text.slice(0, 180)}...`)
            .join('\n');

        const phase = journey?.phaseId || 'unknown';
        const isCollaborative = orchestrationMode === 'AECO';

        const tone = isCollaborative
            ? 'Constructive, referencing TokenomicsAgent for incentive compatibility.'
            : 'Technical, precise, engineering-focused.';

        return {
            system: [
                '**IDENTITY**: Senior Systems Architect & Protocol Standardizer.',
                '**EXPERTISE**: Token Extensions (Token-2022), Interoperability Standards (Meteora, Raydium, Wormhole), State Compression, DePIN architectures.',
                '**WORKFLOW**:',
                '1. Ensure compliance with SPL Standards (e.g. Transfer Hook, Metadata Pointer).',
                '2. Analyze scalability bottlenecks (Merkle Trees vs Account packing).',
                '3. Design the protocol interaction flow.',
                '',
                `**TONE**: ${tone}`,
                '**OUTPUT FORMAT**: STRICT JSON: {',
                '  "status": "OK",',
                '  "summary": "...",',
                '  "protocol_specs": { "standards": ["..."], "optimizations": ["..."] },',
                '  "resources": {',
                '     "diagram": "Mermaid diagram string (sequenceDiagram...)",',
                '     "data": { "tps_estimate": 0, "compute_units": 0 },',
                '     "documentation": "Markdown protocol spec"',
                '  },',
                '  "actions": ["..."]',
                '}',
                '**RESOURCES**: Must output valid Mermaid.js diagrams for protocol flow.'
            ].join('\n'),
            user: [
                `User Input: ${input}`,
                `Current Phase: ${phase}`,
                `Mode: ${orchestrationMode}`,
                'RAG Context:',
                citations || '- (no specific protocol docs found)',
                '',
                'Standardize and optimize the protocol architecture.'
            ].join('\n'),
        };
    }

    async run(request) {
        const { traceId, input, context = {}, rag = {}, constraints = {} } = request;
        const ragChunks = rag.chunks || (context.rag && context.rag.chunks) || [];

        const prompt = this.buildPrompt({
            input,
            ragChunks,
            journey: context.journey,
            orchestrationMode: context.orchestrationMode || 'AEPO'
        });

        const llmRes = await this.llm.generate({
            prompt,
            traceId,
            agentId: this.id,
            maxTokens: constraints.maxTokens || 1500,
            temperature: 0.2
        });

        let parsed = { protocol_specs: {}, resources: {}, actions: [], summary: "Protocol analysis failed to parse" };
        try {
            const jsonMatch = llmRes.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                parsed = JSON.parse(llmRes.text);
            }
        } catch (e) {
            parsed.details = llmRes.text;
            parsed.resources = { documentation: '### Error\nCould not parse Protocol JSON.' };
        }

        return {
            traceId,
            agentId: this.id,
            status: 'OK',
            summary: parsed.summary || 'Protocol standardization complete',
            details: parsed.protocol_specs || {},
            resources: parsed.resources || {},
            confidence: 0.9,
            assumptions: [`RAG hits: ${ragChunks.length}`],
            citations: ragChunks.map((c) => ({ id: c.id, title: c.title, source: c.source })),
            actions: parsed.actions || ['Implement Token-2022 extensions'],
            metrics: { latencyMs: llmRes.latencyMs, tokens: llmRes.tokensUsed, ragHits: ragChunks.length },
            errors: [],
            mock: llmRes.mock || false,
        };
    }
}

module.exports = ProtocolAgent;
