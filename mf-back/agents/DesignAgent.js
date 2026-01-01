const { LLMClient } = require('../orchestration/llmClient');

class DesignAgent {
    constructor() {
        this.id = 'DesignAgent';
        this.llm = new LLMClient({});
    }

    buildPrompt({ input, ragChunks, journey, orchestrationMode }) {
        const citations = (ragChunks || [])
            .map((c, i) => `- [${i + 1}] ${c.title}: ${c.text.slice(0, 180)}...`)
            .join('\n');

        const phase = journey?.phaseId || 'unknown';
        const isCollaborative = orchestrationMode === 'AECO';

        const tone = isCollaborative
            ? 'Creative, visual, referencing NFTAgent for specs and MarketplaceAgent for listings.'
            : 'Visionary, aesthetic-focused, "Vibe Curation".';

        return {
            system: [
                '**IDENTITY**: Creative Director & UX/UI Specialist for Web3.',
                '**EXPERTISE**: Visual Identity, NFT Art Direction, User Flow Optimization (Wallet friction reduction), Gamification Mechanics.',
                '**WORKFLOW**:',
                '1. Define the Visual Language (Color Palette, Typography, "Vibe").',
                '2. Map the UX Flow (Connect Wallet -> Sign -> Approve).',
                '3. Design the Gamification Loop (Badges, Leaderboards, Reveal mechanics).',
                '',
                `**TONE**: ${tone}`,
                '**OUTPUT FORMAT**: STRICT JSON: {',
                '  "status": "OK",',
                '  "summary": "...",',
                '  "design_specs": { "theme": "...", "ux_improvements": ["..."] },',
                '  "resources": {',
                '     "diagram": "Mermaid diagram string (graph LR... for user flow)",',
                '     "data": { "color_palette": ["#..."], "assets_needed": ["..."] },',
                '     "documentation": "Markdown design brief"',
                '  },',
                '  "actions": ["..."]',
                '}',
                '**RESOURCES**: Must output valid Mermaid.js diagrams for user flow.'
            ].join('\n'),
            user: [
                `User Input: ${input}`,
                `Current Phase: ${phase}`,
                `Mode: ${orchestrationMode}`,
                'RAG Context:',
                citations || '- (no specific design docs found)',
                '',
                'Create the visual and UX strategy.'
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
            temperature: 0.6 // Creativity needed
        });

        let parsed = { design_specs: {}, resources: {}, actions: [], summary: "Design analysis failed to parse" };
        try {
            const jsonMatch = llmRes.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                parsed = JSON.parse(llmRes.text);
            }
        } catch (e) {
            parsed.details = llmRes.text;
            parsed.resources = { documentation: '### Error\nCould not parse Design JSON.' };
        }

        return {
            traceId,
            agentId: this.id,
            status: 'OK',
            summary: parsed.summary || 'Design strategy created',
            details: parsed.design_specs || {},
            resources: parsed.resources || {},
            confidence: 0.85,
            assumptions: [`RAG hits: ${ragChunks.length}`],
            citations: ragChunks.map((c) => ({ id: c.id, title: c.title, source: c.source })),
            actions: parsed.actions || ['Create Figma mockups'],
            metrics: { latencyMs: llmRes.latencyMs, tokens: llmRes.tokensUsed, ragHits: ragChunks.length },
            errors: [],
            mock: llmRes.mock || false,
        };
    }
}

module.exports = DesignAgent;
