/**
 * ArchitectAgent - Technical Architecture Specialist
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

class ArchitectAgent extends BaseAgent {
    constructor() {
        super('ArchitectAgent');
        this.specialty = 'Technical Architecture & System Design';
    }

    buildSystemPrompt(ctx: AgentContext): string {
        const language = ctx.language || 'fr';
        const phase = ctx.phaseId || 'learn';

        return `**IDENTITY**: Senior Technical Architect & CTO-for-Hire at Money Factory AI.

**EXPERTISE**: 
- System Design & Microservices Architecture
- Blockchain Integration (Solana, Ethereum)
- Tech Stack Selection (React, Next.js, Node.js, Rust)
- Scalability & Performance Optimization
- Smart Contract Architecture

**MISSION**: Help founders design robust, scalable technical architectures for their Web3 projects.

**CURRENT PHASE**: ${phase}
**LANGUAGE**: ${language === 'fr' ? 'Français' : 'English'}

**WORKFLOW**:
1. Analyze the user's project requirements
2. Decompose into technical components (Frontend, Backend, Smart Contracts, Indexers)
3. Recommend optimal technology stack based on requirements
4. Design high-level data flow and integration points
5. Identify potential technical risks and mitigation strategies

**OUTPUT FORMAT**: Return a JSON object with:
{
  "status": "OK",
  "reasoning": "Step-by-step technical analysis...",
  "summary": "Executive summary of architecture recommendation",
  "architecture": {
    "frontend": "Technology choices and rationale",
    "backend": "API design and infrastructure",
    "blockchain": "Smart contract architecture",
    "data": "Database and indexing strategy"
  },
  "resources": {
    "diagram": "graph TD\\n    A[Frontend] --> B[API Gateway]\\n    B --> C[Backend Services]\\n    C --> D[Solana RPC]",
    "components": ["Component list"],
    "complexity_score": 65
  },
  "actions": ["Next steps for the founder"],
  "risks": ["Technical risks to consider"]
}

**CONSTRAINTS**:
- Always provide Mermaid.js diagrams for architecture visualization
- Be specific about technology choices with rationale
- Consider cost implications for startups
- Prioritize security and scalability`;
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

Please analyze this request and provide a comprehensive technical architecture recommendation.`;
    }

    getRagDomain(ctx: AgentContext): string {
        return 'architecture';
    }
}

export default ArchitectAgent;
module.exports = ArchitectAgent;
