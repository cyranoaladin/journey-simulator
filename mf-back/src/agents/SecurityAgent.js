/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const { LLMClient } = require('../orchestration/llmClient');

class SecurityAgent {
    constructor() {
        this.id = 'SecurityAgent';
        this.llm = new LLMClient({});
    }

    buildPrompt({ input, ragChunks, journey }) {
        const citations = (ragChunks || [])
            .map((c, i) => `- [${i + 1}] ${c.title}: ${c.text.slice(0, 180)}...`)
            .join('\n');

        const phase = journey?.phaseId || 'unknown';

        return {
            system: [
                'You are the SecurityAgent, a world-class Solana security auditor and "Red Teamer".',
                'Your goal: Identify critical vulnerabilities before bad actors do.',
                '',
                'Deep Audit Specs:',
                '- Solana Specifics: Account validation, PDA seed derivation constraints, CPI signer checks, Overflow/Underflow (though rarely an issue in modern Rust).',
                '- Logical Flaws: Re-entrancy (yes, it happens in Solana via CPI), improper instruction ordering, front-running opportunities.',
                '- Access Control: Signer checks for admin functions, authority validation.',
                '',
                'Output Format: STRICT JSON: { "status": "OK", "risk_level": "CRITICAL|HIGH|MEDIUM|LOW", "summary": "...", "findings": [{ "title": "...", "severity": "...", "exploit_scenario": "...", "fix": "..." }], "actions": ["Run test X", "Fix line Y"] }.',
                'Be paranoid. Assume the user code is vulnerable until proven otherwise.'
            ].join('\n'),
            user: [
                `User Input: ${input}`,
                `Current Phase: ${phase}`,
                'RAG Context (Security Patterns):',
                citations || '- (no specific security docs found)',
                '',
                'Perform a Red Team analysis on this.'
            ].join('\n'),
        };
    }

    async run(request) {
        const { traceId, input, context = {}, rag = {}, constraints = {} } = request;
        const ragChunks = rag.chunks || (context.rag && context.rag.chunks) || [];

        const prompt = this.buildPrompt({
            input,
            ragChunks,
            journey: context.journey
        });

        const llmRes = await this.llm.generate({
            prompt,
            traceId,
            agentId: this.id,
            maxTokens: constraints.maxTokens || 1200,
            temperature: 0.1 // Precision is key
        });

        let parsed = { findings: [], actions: [], summary: "Security analysis failed to parse" };
        try {
            const jsonMatch = llmRes.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                parsed = JSON.parse(llmRes.text);
            }
        } catch (e) {
            parsed.details = llmRes.text;
            parsed.findings = [{ title: 'Parse Error', severity: 'medium', exploit_scenario: 'Output unparseable', fix: 'Manual review' }];
        }

        return {
            traceId,
            agentId: this.id,
            status: 'OK',
            summary: parsed.summary || 'Security review complete',
            details: parsed.details || llmRes.text,
            findings: parsed.findings || [],
            riskLevel: parsed.risk_level || "UNKNOWN",
            confidence: 0.95,
            assumptions: [`RAG hits: ${ragChunks.length}`],
            citations: ragChunks.map((c) => ({ id: c.id, title: c.title, source: c.source })),
            actions: parsed.actions || ['Run automated fuzzing'],
            metrics: { latencyMs: llmRes.latencyMs, tokens: llmRes.tokensUsed, ragHits: ragChunks.length },
            errors: [],
            mock: llmRes.mock || false,
        };
    }
}

module.exports = SecurityAgent;
