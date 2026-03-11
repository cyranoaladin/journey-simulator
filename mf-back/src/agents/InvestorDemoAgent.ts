/**
 * @file InvestorDemoAgent.ts
 * @description Agent d'analyse pour démo investisseurs avec scoring réel (0-100).
 * Évalue l'investment readiness d'un projet Web3/Solana.
 *
 * @author Kimi Code CLI — 2026-03-11
 */

import BaseAgent from './BaseAgent';
import { routeWithFallback } from '../services/llmRouter';

export interface InvestorAnalysis {
  overall_score: number; // 0-100
  investment_readiness: 'not_ready' | 'early' | 'seed_ready' | 'series_a_ready';
  strengths: Array<{ area: string; description: string; score: number }>;
  risks: Array<{ area: string; description: string; severity: 'low' | 'medium' | 'high' }>;
  recommendations: Array<{ priority: number; action: string; timeline: string }>;
  pitch_score: number; // 0-100
  team_score: number; // 0-100
  market_score: number; // 0-100
  traction_score: number; // 0-100
  summary: string;
}

export interface InvestorDemoInput {
  projectName: string;
  pitch: string;
  team?: {
    size: number;
    experience: string;
    previousExits?: boolean;
  };
  market?: {
    size: string;
    growth: string;
    competition: string;
  };
  traction?: {
    users: number;
    revenue: number;
    partnerships: string[];
  };
  tokenomics?: {
    tokenUtility: string;
    distribution: string;
    vesting: string;
  };
  technical?: {
    blockchain: string;
    stage: 'concept' | 'mvp' | 'beta' | 'live';
    audits: boolean;
  };
}

/**
 * Agent d'analyse investisseur avec intégration LLM réelle
 */
class InvestorDemoAgent extends BaseAgent {
  constructor() {
    super('InvestorDemoAgent');
    this.specialty = 'Web3 Investment Analysis';
  }

  buildSystemPrompt(): string {
    return `You are an expert Web3/Solana venture capital analyst with 10+ years experience evaluating blockchain projects.

Your role is to analyze project data and return a structured investment readiness assessment.

Focus areas:
- Team credentials and track record
- Market size and growth potential
- Tokenomics soundness and sustainability
- Technical feasibility and security
- Traction metrics and user adoption

Scoring criteria (0-100):
- overall_score: Weighted average of all dimensions
- pitch_score: Clarity, compelling narrative, problem-solution fit
- team_score: Experience, complementarity, previous success
- market_score: TAM/SAM/SOM, growth rate, timing
- traction_score: Users, revenue, partnerships, momentum

Investment readiness levels:
- not_ready: Major gaps in team/product/market
- early: Promising but needs significant development
- seed_ready: Strong foundation, ready for seed funding
- series_a_ready: Product-market fit, scaling traction

Be rigorous and objective — investors rely on your analysis for due diligence.
Return ONLY valid JSON matching the InvestorAnalysis schema. No markdown, no explanations outside JSON.`;
  }

  buildUserPrompt(input: InvestorDemoInput): string {
    return `Analyze the following Web3 project for investment readiness:

Project Name: ${input.projectName}

Pitch:
${input.pitch}

${input.team ? `Team:
- Size: ${input.team.size}
- Experience: ${input.team.experience}
- Previous Exits: ${input.team.previousExits ? 'Yes' : 'No'}` : ''}

${input.market ? `Market:
- Size: ${input.market.size}
- Growth: ${input.market.growth}
- Competition: ${input.market.competition}` : ''}

${input.traction ? `Traction:
- Users: ${input.traction.users}
- Revenue: $${input.traction.revenue}
- Partnerships: ${input.traction.partnerships.join(', ')}` : ''}

${input.tokenomics ? `Tokenomics:
- Utility: ${input.tokenomics.tokenUtility}
- Distribution: ${input.tokenomics.distribution}
- Vesting: ${input.tokenomics.vesting}` : ''}

${input.technical ? `Technical:
- Blockchain: ${input.technical.blockchain}
- Stage: ${input.technical.stage}
- Audits: ${input.technical.audits ? 'Yes' : 'No'}` : ''}

Provide a complete InvestorAnalysis JSON with objective scoring.`;
  }

  /**
   * Analyse un projet pour démo investisseur avec scoring réel
   */
  async analyze(input: InvestorDemoInput): Promise<InvestorAnalysis> {
    const messages = [
      { role: 'system' as const, content: this.buildSystemPrompt() },
      { role: 'user' as const, content: this.buildUserPrompt(input) },
    ];

    const response = await routeWithFallback(messages, {
      taskType: 'reasoning',
      maxTokens: 2000,
      temperature: 0.2, // Très conservateur pour l'analyse investisseur
    });

    if (!response || response.fallback) {
      return this.calculateFallbackAnalysis(input);
    }

    try {
      const parsed: InvestorAnalysis = JSON.parse(response.content);
      return this.validateAndNormalizeAnalysis(parsed);
    } catch {
      return this.extractAnalysisFromText(response.content, input);
    }
  }

  /**
   * Analyse de fallback si le LLM échoue
   */
  private calculateFallbackAnalysis(input: InvestorDemoInput): InvestorAnalysis {
    const pitchLength = input.pitch?.length || 0;
    const hasTeam = input.team && input.team.size > 0;
    const hasTraction = input.traction && input.traction.users > 0;
    const hasTokenomics = !!input.tokenomics;
    const hasTechnical = !!input.technical;

    // Heuristiques simples
    let baseScore = 30;
    if (pitchLength > 200) baseScore += 15;
    if (hasTeam) baseScore += 15;
    if (hasTraction) baseScore += 20;
    if (hasTokenomics) baseScore += 10;
    if (hasTechnical) baseScore += 10;

    const overallScore = Math.min(100, baseScore);

    let readiness: InvestorAnalysis['investment_readiness'] = 'not_ready';
    if (overallScore >= 80) readiness = 'series_a_ready';
    else if (overallScore >= 65) readiness = 'seed_ready';
    else if (overallScore >= 45) readiness = 'early';

    return {
      overall_score: overallScore,
      investment_readiness: readiness,
      strengths: [
        { area: 'Documentation', description: 'Project pitch provided', score: pitchLength > 100 ? 70 : 50 },
      ],
      risks: [
        { area: 'Validation', description: '[FALLBACK] Automated analysis only - expert review recommended', severity: 'medium' },
      ],
      recommendations: [
        { priority: 1, action: 'Provide more detailed project information', timeline: 'Immediate' },
      ],
      pitch_score: Math.min(100, pitchLength / 10),
      team_score: hasTeam ? 60 : 30,
      market_score: input.market ? 60 : 40,
      traction_score: hasTraction ? 70 : 30,
      summary: `[FALLBACK ANALYSIS] ${input.projectName}: Score ${overallScore}/100. Automated analysis due to LLM unavailability. Please review manually.`,
    };
  }

  /**
   * Valide et normalise une analyse investisseur
   */
  private validateAndNormalizeAnalysis(analysis: InvestorAnalysis): InvestorAnalysis {
    const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
    
    const validReadiness = ['not_ready', 'early', 'seed_ready', 'series_a_ready'];
    let readiness = analysis.investment_readiness;
    if (!validReadiness.includes(readiness)) {
      readiness = analysis.overall_score >= 80 ? 'series_a_ready' :
                  analysis.overall_score >= 65 ? 'seed_ready' :
                  analysis.overall_score >= 45 ? 'early' : 'not_ready';
    }

    return {
      overall_score: clamp(analysis.overall_score),
      investment_readiness: readiness as InvestorAnalysis['investment_readiness'],
      strengths: analysis.strengths || [],
      risks: analysis.risks || [],
      recommendations: analysis.recommendations || [],
      pitch_score: clamp(analysis.pitch_score),
      team_score: clamp(analysis.team_score),
      market_score: clamp(analysis.market_score),
      traction_score: clamp(analysis.traction_score),
      summary: analysis.summary || 'Investment analysis completed.',
    };
  }

  /**
   * Tente d'extraire une analyse valide d'un texte non-JSON
   */
  private extractAnalysisFromText(text: string, input: InvestorDemoInput): InvestorAnalysis {
    const scoreMatch = text.match(/(?:overall_score|score)["\s:]+(\d+)/i);
    const overallScore = scoreMatch ? parseInt(scoreMatch[1], 10) : 50;

    return this.validateAndNormalizeAnalysis({
      overall_score: overallScore,
      investment_readiness: overallScore >= 80 ? 'series_a_ready' :
                           overallScore >= 65 ? 'seed_ready' :
                           overallScore >= 45 ? 'early' : 'not_ready',
      strengths: [],
      risks: [{ area: 'Parsing', description: 'Could not parse structured analysis', severity: 'low' }],
      recommendations: [],
      pitch_score: overallScore,
      team_score: overallScore,
      market_score: overallScore,
      traction_score: overallScore,
      summary: 'Analysis extracted from text format.',
    });
  }

  // Legacy support for agent runner
  async run(ctx: any, options?: any) {
    const result = await this.analyze({
      projectName: ctx.projectName || 'Unnamed Project',
      pitch: ctx.submission || ctx.input || '',
      team: ctx.userProfile?.team,
      market: ctx.userProfile?.market,
      traction: ctx.userProfile?.traction,
      tokenomics: ctx.userProfile?.tokenomics,
      technical: ctx.userProfile?.technical,
    });

    return {
      rawMessage: { content: JSON.stringify(result) },
      payload: result,
      sources: [],
      ...result,
    };
  }
}

export default InvestorDemoAgent;
