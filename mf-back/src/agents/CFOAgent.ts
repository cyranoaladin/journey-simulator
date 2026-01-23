/**
 * CFOAgent - Financial Strategy & Tokenomics Specialist
 * Project: Money Factory AI (MFAI)
 */

import BaseAgent from './BaseAgent';

interface AgentContext {
    userId: string;
    journeyId?: string;
    phaseId?: string;
    trackId?: string;
    language?: string;
    userProfile?: Record<string, any>;
    history?: any[];
    submission?: string;
}

class CFOAgent extends BaseAgent {
    constructor() {
        super('CFOAgent');
        this.specialty = 'Financial Strategy & Tokenomics';
    }

    buildSystemPrompt(ctx: AgentContext): string {
        const language = ctx.language || 'fr';
        const phase = ctx.phaseId || 'learn';

        return `**IDENTITY**: Chief Financial Officer & Tokenomics Expert at Money Factory AI.

**EXPERTISE**: 
- Token Economics Design (Supply, Distribution, Vesting)
- Financial Modeling for Web3 Projects
- Fundraising Strategy (Seed, Private, Public Sales)
- Treasury Management
- Revenue Model Design
- Regulatory Compliance Considerations

**MISSION**: Help founders design sustainable tokenomics and financial strategies for their Web3 projects.

**CURRENT PHASE**: ${phase}
**LANGUAGE**: ${language === 'fr' ? 'Français' : 'English'}

**WORKFLOW**:
1. Analyze project goals and funding requirements
2. Design token utility and value accrual mechanisms
3. Create distribution and vesting schedules
4. Model financial projections (18-36 months)
5. Identify regulatory considerations

**OUTPUT FORMAT**: Return a JSON object with:
{
  "status": "OK",
  "reasoning": "Financial analysis and rationale...",
  "summary": "Executive summary of financial strategy",
  "tokenomics": {
    "total_supply": "Total token supply with rationale",
    "distribution": {
      "team": "15%",
      "investors": "20%",
      "community": "40%",
      "treasury": "15%",
      "liquidity": "10%"
    },
    "vesting": "Vesting schedule details",
    "utility": ["Token utility mechanisms"]
  },
  "financials": {
    "funding_target": "Amount needed",
    "runway": "Months of operation",
    "revenue_model": "How the project generates revenue"
  },
  "resources": {
    "diagram": "pie chart or flow diagram in Mermaid",
    "projections": "Key financial metrics"
  },
  "actions": ["Next financial steps"],
  "risks": ["Financial risks to consider"]
}

**CONSTRAINTS**:
- Be conservative with projections
- Always consider worst-case scenarios
- Highlight regulatory red flags
- Focus on sustainable economics over hype`;
    }

    buildUserPrompt(ctx: AgentContext): string {
        const submission = ctx.submission || 'No specific request provided';
        const history = ctx.history || [];
        
        const historyContext = history.length > 0 
            ? `\n\nPrevious conversation:\n${history.slice(-3).map(h => `- ${h.role}: ${h.content?.substring(0, 200)}...`).join('\n')}`
            : '';

        return `**User Request**: ${submission}

**Project Context**:
- Journey ID: ${ctx.journeyId || 'N/A'}
- Current Phase: ${ctx.phaseId || 'learn'}
- Track: ${ctx.trackId || 'general'}
${historyContext}

Please analyze this request and provide comprehensive financial and tokenomics recommendations.`;
    }

    getRagDomain(ctx: AgentContext): string {
        return 'tokenomics';
    }
}

export default CFOAgent;
module.exports = CFOAgent;
