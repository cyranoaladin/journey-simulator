/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 * 
 * UPDATED 2026-03-11: Real LLM integration with GPT-4o for investor demo analysis
 */

const { mkFinding, mkAction, estimateConfidence } = require('./agentUtils');
const { callLLM } = require('../llm/OpenAIClient');
const logger = require('../utils/logger');

class InvestorDemoAgent {
  constructor() {
    this.id = 'InvestorDemoAgent';
    this.model = process.env.LLM_MODEL_NAME || 'gpt-4o';
  }

  async run(request = {}) {
    const { traceId, input = '', context = {} } = request;
    const journey = context?.journey || {};
    const inputPresent = Boolean(input && input.trim());

    const startTime = Date.now();

    try {
      // If no input, return quick stub response
      if (!inputPresent) {
        return this._getStubResponse(traceId, journey);
      }

      // Build prompt for LLM
      const prompt = this._buildPrompt(input, context);

      // Call LLM
      const llmResponse = await callLLM({
        messages: [
          { role: 'system', content: this._getSystemPrompt() },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        maxTokens: 2000,
      });

      // Parse LLM response
      const parsed = this._parseLLMResponse(llmResponse.content || llmResponse);

      const latencyMs = Date.now() - startTime;

      return {
        status: parsed.status || 'OK',
        summary: parsed.summary || 'Investor pitch analysis completed',
        findings: parsed.findings || [],
        actions: parsed.actions || [],
        confidence: parsed.confidence || 0.85,
        assumptions: parsed.assumptions || [],
        limits: ['Analysis based on provided input only', 'Financial projections not verified'],
        citations: [],
        metrics: { 
          ragHits: 0, 
          latencyMs,
          model: this.model,
          tokensUsed: llmResponse.usage?.totalTokens || 0
        },
        traceId,
        details: {
          journeyType: journey?.journeyType || 'investor_demo',
          phaseId: journey?.phaseId || 'pitch',
          inputLength: input.length,
          mock: false,
        },
      };

    } catch (error) {
      logger.error('InvestorDemoAgent LLM error', { error: error.message, traceId });
      
      // Fallback to stub response on error
      return this._getStubResponse(traceId, journey, error.message);
    }
  }

  _getSystemPrompt() {
    return `You are InvestorDemoAgent, an AI expert in startup pitching and investor relations.

Your role is to analyze startup pitch materials and provide structured feedback for demo presentations.

RESPONSE FORMAT (JSON):
{
  "status": "OK" | "WARN",
  "summary": "One-line executive summary",
  "findings": [
    { "id": "value_prop", "status": "ok|warn|error", "priority": "high|medium|low", "description": "..." }
  ],
  "actions": [
    { "id": "action_1", "description": "Specific actionable step", "priority": "high|medium|low" }
  ],
  "confidence": 0.0-1.0,
  "assumptions": ["List any assumptions made"],
  "investorReadiness": {
    "score": 0-100,
    "strengths": ["..."],
    "weaknesses": ["..."],
    "missing": ["..."]
  }
}

EVALUATION CRITERIA:
- Value proposition clarity (10 points)
- Market size & ICP definition (15 points)
- Traction metrics (25 points)
- Business model clarity (15 points)
- Competitive advantage (10 points)
- Team credibility (10 points)
- Financial projections (10 points)
- Ask clarity (5 points)`;
  }

  _buildPrompt(input, context) {
    const journeyContext = context?.journey || {};
    
    return `Analyze the following startup pitch material for an investor demo:

INPUT:
"""${input}"""

CONTEXT:
- Journey Type: ${journeyContext.journeyType || 'investor_demo'}
- Phase: ${journeyContext.phaseId || 'pitch'}
- Persona: ${journeyContext.personaId || 'founder'}

Provide detailed analysis following the JSON format. Include:
1. Key findings across all evaluation criteria
2. Specific actionable recommendations
3. Investor readiness score (0-100)
4. Confidence level in your analysis`;
  }

  _parseLLMResponse(content) {
    try {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Convert to standard format
        return {
          status: parsed.status || 'OK',
          summary: parsed.summary || 'Analysis completed',
          findings: parsed.findings || parsed.investorReadiness?.weaknesses?.map(w => ({
            id: 'finding_' + Math.random().toString(36).substr(2, 9),
            status: 'warn',
            priority: 'medium',
            description: w
          })) || [],
          actions: parsed.actions || [],
          confidence: parsed.confidence || parsed.investorReadiness?.score / 100 || 0.8,
          assumptions: parsed.assumptions || [],
        };
      }
    } catch (e) {
      logger.warn('Failed to parse LLM JSON response, using text fallback', { error: e.message });
    }

    // Fallback: treat as text and create generic response
    return {
      status: 'OK',
      summary: content.substring(0, 200) + '...',
      findings: [
        mkFinding('llm_response', 'ok', 'medium', 'LLM analysis completed'),
        mkFinding('parse_warning', 'warn', 'low', 'Response parsing used fallback'),
      ],
      actions: [
        mkAction('Review full LLM response for detailed insights'),
      ],
      confidence: 0.7,
      assumptions: ['Response format may need refinement'],
    };
  }

  _getStubResponse(traceId, journey, errorMessage = null) {
    const findings = [
      mkFinding('value_prop', 'ok', 'medium', 'Clarified value proposition for target segment'),
      mkFinding('market', 'ok', 'medium', 'Market size and ICP identified'),
      mkFinding('traction', 'warn', 'medium', 'Need concrete metrics (MRR, growth, retention)'),
      mkFinding('risks', 'warn', 'high', 'Key risks documented (product, go-to-market, compliance)'),
      mkFinding('ask', 'ok', 'low', 'Funding ask and runway assumptions outlined'),
    ];

    if (errorMessage) {
      findings.push(mkFinding('llm_error', 'error', 'high', `LLM call failed: ${errorMessage}`));
    }

    const actions = [
      mkAction('Draft one-slide pitch with value prop and ICP'),
      mkAction('Define KPI dashboard (MRR, CAC, retention)'),
      mkAction('List top 5 risks with mitigations'),
      mkAction('Prepare investor FAQ and objections handling'),
      mkAction('Outline 3 milestones for next 90 days'),
    ];

    return {
      status: errorMessage ? 'WARN' : 'OK',
      summary: errorMessage 
        ? 'Investor demo analysis (fallback mode due to LLM error)'
        : 'Investor pitch pack drafted',
      findings,
      actions,
      confidence: estimateConfidence({
        inputPresent: false,
        ragHits: 0,
        hasFindings: findings.length > 0,
      }),
      assumptions: errorMessage ? ['LLM integration failed, using rule-based fallback'] : [],
      limits: ['Simulation only, no real dispatch', 'Financial data unverified'],
      citations: [],
      metrics: { ragHits: 0, mock: true },
      traceId,
      details: {
        journeyType: journey?.journeyType || 'generic',
        phaseId: journey?.phaseId || journey?.phases?.[0] || 'pitch',
        inputLength: 0,
        mock: true,
        error: errorMessage,
      },
    };
  }
}

module.exports = InvestorDemoAgent;
