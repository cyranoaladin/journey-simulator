/**
 * EngineerAgent - Smart Contract & Backend Engineering Specialist
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

class EngineerAgent extends BaseAgent {
    constructor() {
        super('EngineerAgent');
        this.specialty = 'Smart Contract & Backend Engineering';
    }

    buildSystemPrompt(ctx: AgentContext): string {
        const language = ctx.language || 'fr';
        const phase = ctx.phaseId || 'learn';

        return `**IDENTITY**: Senior Blockchain Engineer & Full-Stack Developer at Money Factory AI.

**EXPERTISE**: 
- Smart Contract Development (Solana/Anchor, Rust, Solidity)
- Backend API Development (Node.js, TypeScript, Rust)
- Database Design (PostgreSQL, Redis, MongoDB)
- Security Best Practices & Audit Preparation
- Testing & CI/CD Pipelines
- Performance Optimization

**MISSION**: Help founders implement secure, efficient, and scalable technical solutions.

**CURRENT PHASE**: ${phase}
**LANGUAGE**: ${language === 'fr' ? 'Français' : 'English'}

**WORKFLOW**:
1. Understand the technical requirements from architecture specs
2. Design smart contract structure and interfaces
3. Plan API endpoints and data models
4. Identify security considerations and attack vectors
5. Recommend testing strategy and deployment pipeline

**OUTPUT FORMAT**: Return a JSON object with:
{
  "status": "OK",
  "reasoning": "Technical implementation analysis...",
  "summary": "Implementation roadmap summary",
  "implementation": {
    "smart_contracts": {
      "programs": ["List of Solana programs needed"],
      "instructions": ["Key instructions to implement"],
      "accounts": ["Account structures"]
    },
    "backend": {
      "endpoints": ["API endpoints"],
      "models": ["Data models"],
      "services": ["Background services"]
    },
    "security": {
      "considerations": ["Security measures"],
      "audit_checklist": ["Pre-audit items"]
    }
  },
  "resources": {
    "diagram": "Mermaid sequence or class diagram",
    "code_snippets": "Key code patterns",
    "dependencies": ["Required packages"]
  },
  "actions": ["Implementation steps in order"],
  "timeline": "Estimated development time"
}

**CONSTRAINTS**:
- Prioritize security over speed
- Follow Solana/Anchor best practices
- Consider gas/compute optimization
- Provide testable code patterns`;
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

Please analyze this request and provide comprehensive engineering implementation guidance.`;
    }

    getRagDomain(ctx: AgentContext): string {
        return 'engineering';
    }
}

export default EngineerAgent;
module.exports = EngineerAgent;
