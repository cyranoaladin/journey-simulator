const { LLMClient } = require('../orchestration/llmClient');

class EducationAgent {
    constructor() {
        this.id = 'EducationAgent';
        this.llm = new LLMClient({});
    }

    buildPrompt({ input, ragChunks, journey, orchestrationMode }) {
        const citations = (ragChunks || [])
            .map((c, i) => `- [${i + 1}] ${c.title}: ${c.text.slice(0, 180)}...`)
            .join('\n');

        const phase = journey?.phaseId || 'unknown';
        const isCollaborative = orchestrationMode === 'AECO';

        const tone = isCollaborative
            ? 'Pedagogical, bridging gaps between technical agents and user.'
            : 'Socratic, patient, "Professor".';

        return {
            system: [
                '**IDENTITY**: Web3 Educator & Concept Simplifier.',
                '**EXPERTISE**: Active Pedagogy, Socratic Method, Technical Analogy (e.g. "Rent is parking fees"), Curriculum Design.',
                '**WORKFLOW**:',
                '1. Assess user understanding level.',
                '2. Explain concepts using analogies.',
                '3. Propose a mini-quiz or active recall exercise.',
                '4. Link to deeper resources.',
                '',
                `**TONE**: ${tone}`,
                '**OUTPUT FORMAT**: STRICT JSON: {',
                '  "status": "OK",',
                '  "summary": "...",',
                '  "educational_content": { "concept": "...", "analogy": "...", "quiz": ["..."] },',
                '  "resources": {',
                '     "diagram": "Mermaid diagram string (graph TD... for concept map)",',
                '     "data": { "difficulty": "Easy|Medium|Hard", "tags": ["..."] },',
                '     "documentation": "Markdown detailed lesson"',
                '  },',
                '  "actions": ["..."]',
                '}',
                '**RESOURCES**: Must output valid simple diagrams for concepts.'
            ].join('\n'),
            user: [
                `User Input: ${input}`,
                `Current Phase: ${phase}`,
                `Mode: ${orchestrationMode}`,
                'RAG Context:',
                citations || '- (no specific education docs found)',
                '',
                'Explain and educate.'
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
            maxTokens: constraints.maxTokens || 1200,
            temperature: 0.5
        });

        let parsed = { educational_content: {}, resources: {}, actions: [], summary: "Education analysis failed to parse" };
        try {
            const jsonMatch = llmRes.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                parsed = JSON.parse(llmRes.text);
            }
        } catch (e) {
            parsed.details = llmRes.text;
            parsed.resources = { documentation: '### Error\nCould not parse Education JSON.' };
        }

        return {
            traceId,
            agentId: this.id,
            status: 'OK',
            summary: parsed.summary || 'Educational content generated',
            details: parsed.educational_content || {},
            resources: parsed.resources || {},
            confidence: 0.95,
            assumptions: [`RAG hits: ${ragChunks.length}`],
            citations: ragChunks.map((c) => ({ id: c.id, title: c.title, source: c.source })),
            actions: parsed.actions || ['Take the quiz'],
            metrics: { latencyMs: llmRes.latencyMs, tokens: llmRes.tokensUsed, ragHits: ragChunks.length },
            errors: [],
            mock: llmRes.mock || false,
        };
    }
}

module.exports = EducationAgent;
