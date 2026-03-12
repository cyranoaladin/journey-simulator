/**
 * @file LaunchpadAgent.ts
 * @description Agent Launchpad - Guide le projet utilisateur vers le lancement public.
 * Prépare la checklist de launch, le plan de liquidité, la stratégie communautaire.
 *
 * @author Kimi Code CLI — 2026-03-11
 */

import BaseAgent from './BaseAgent';
import { routeWithFallback } from '../services/llmRouter';

export interface LaunchpadResult {
  readiness_score: number; // 0-100
  launch_date_estimate: string; // Date estimée de launch
  checklist: Array<{
    category: string;
    item: string;
    status: 'done' | 'in_progress' | 'todo';
    critical: boolean;
  }>;
  tokenomics_validation: {
    is_valid: boolean;
    warnings: string[];
    suggestions: string[];
  };
  liquidity_plan: {
    initial_sol_needed: number;
    recommended_pools: string[];
    vesting_schedule: string;
  };
  community_strategy: string;
  risks: string[];
}

export interface LaunchpadInput {
  projectName: string;
  currentPhase: string;
  tokenomics?: {
    totalSupply: number;
    teamAllocation: number;
    communityAllocation: number;
    liquidityAllocation: number;
    vestingPeriods: number;
  };
  technicalStatus: {
    contractDeployed: boolean;
    audited: boolean;
    testnetLive: boolean;
  };
  communityMetrics: {
    twitterFollowers: number;
    discordMembers: number;
    betaUsers: number;
  };
  budget: {
    totalSol: number;
    availableForLiquidity: number;
  };
}

/**
 * Agent Launchpad pour la phase de lancement
 */
class LaunchpadAgent extends BaseAgent {
  constructor() {
    super('LaunchpadAgent');
    this.specialty = 'Web3 Launch Strategy';
  }

  buildSystemPrompt(_ctx: any): string {
    return `You are a Web3 launch strategist with experience in successful Solana project launches.

Your role is to guide projects from pre-launch to mainnet deployment and beyond.

Readiness scoring:
- 90-100: Fully ready for launch - all systems go
- 80-89: Minor items remaining - can launch with monitoring
- 70-79: Important items missing - recommend 2-4 weeks delay
- 60-69: Significant gaps - 1-2 months additional prep needed
- <60: Not ready - fundamental work required

Key launch components to evaluate:
1. Technical readiness (contracts, audits, security)
2. Tokenomics soundness (distribution, vesting, sustainability)
3. Community strength (engagement, size, quality)
4. Liquidity planning (initial pools, market making)
5. Marketing preparation (content, KOLs, PR)

Return ONLY valid JSON matching the LaunchpadResult schema.`;
  }

  buildUserPrompt(ctx: any): string {
    const input = ctx as LaunchpadInput;
    return `Analyze this project for launch readiness:

Project: ${input.projectName}
Current Phase: ${input.currentPhase}

Technical Status:
- Contract Deployed: ${input.technicalStatus.contractDeployed ? 'Yes' : 'No'}
- Audited: ${input.technicalStatus.audited ? 'Yes' : 'No'}
- Testnet Live: ${input.technicalStatus.testnetLive ? 'Yes' : 'No'}

${input.tokenomics ? `Tokenomics:
- Total Supply: ${input.tokenomics.totalSupply.toLocaleString()}
- Team: ${input.tokenomics.teamAllocation}%
- Community: ${input.tokenomics.communityAllocation}%
- Liquidity: ${input.tokenomics.liquidityAllocation}%
- Vesting: ${input.tokenomics.vestingPeriods} months` : ''}

Community Metrics:
- Twitter: ${input.communityMetrics.twitterFollowers.toLocaleString()} followers
- Discord: ${input.communityMetrics.discordMembers.toLocaleString()} members
- Beta Users: ${input.communityMetrics.betaUsers.toLocaleString()}

Budget:
- Total: ${input.budget.totalSol} SOL
- For Liquidity: ${input.budget.availableForLiquidity} SOL

Provide launch readiness assessment with checklist and recommendations.`;
  }

  async analyze(input: LaunchpadInput): Promise<LaunchpadResult> {
    const messages = [
      { role: 'system' as const, content: this.buildSystemPrompt({} as any) },
      { role: 'user' as const, content: this.buildUserPrompt(input) },
    ];

    const response = await routeWithFallback(messages, {
      taskType: 'reasoning',
      maxTokens: 2500,
      temperature: 0.3,
    });

    if (!response || response.fallback) {
      return this.calculateFallbackAnalysis(input);
    }

    try {
      const parsed: LaunchpadResult = JSON.parse(response.content);
      return this.validateAndNormalizeResult(parsed);
    } catch {
      return this.calculateFallbackAnalysis(input);
    }
  }

  private calculateFallbackAnalysis(input: LaunchpadInput): LaunchpadResult {
    let score = 30;
    if (input.technicalStatus.contractDeployed) score += 20;
    if (input.technicalStatus.audited) score += 15;
    if (input.technicalStatus.testnetLive) score += 10;
    if (input.communityMetrics.twitterFollowers > 1000) score += 10;
    if (input.communityMetrics.discordMembers > 500) score += 10;
    if (input.budget.availableForLiquidity > 10) score += 5;

    return {
      readiness_score: Math.min(100, score),
      launch_date_estimate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      checklist: [
        { category: 'Technical', item: 'Smart contract deployment', status: input.technicalStatus.contractDeployed ? 'done' : 'todo', critical: true },
        { category: 'Technical', item: 'Security audit', status: input.technicalStatus.audited ? 'done' : 'todo', critical: true },
        { category: 'Community', item: 'Build Twitter presence', status: input.communityMetrics.twitterFollowers > 1000 ? 'in_progress' : 'todo', critical: false },
        { category: 'Launch', item: 'Prepare liquidity pools', status: 'todo', critical: true },
      ],
      tokenomics_validation: {
        is_valid: !!input.tokenomics,
        warnings: input.tokenomics ? [] : ['Tokenomics not defined'],
        suggestions: ['Consider adding vesting for team tokens', 'Ensure sufficient liquidity allocation'],
      },
      liquidity_plan: {
        initial_sol_needed: Math.max(5, input.budget.availableForLiquidity * 0.8),
        recommended_pools: ['Raydium', 'Orca'],
        vesting_schedule: 'Team: 12 months vesting, 6 months cliff. Community: Immediate or gradual release.',
      },
      community_strategy: '[FALLBACK] Build Twitter presence, engage Discord community, create educational content, partner with KOLs.',
      risks: input.technicalStatus.audited ? [] : ['No security audit completed'],
    };
  }

  private validateAndNormalizeResult(result: LaunchpadResult): LaunchpadResult {
    return {
      readiness_score: Math.max(0, Math.min(100, result.readiness_score || 0)),
      launch_date_estimate: result.launch_date_estimate || new Date().toISOString(),
      checklist: result.checklist || [],
      tokenomics_validation: {
        is_valid: result.tokenomics_validation?.is_valid ?? false,
        warnings: result.tokenomics_validation?.warnings || [],
        suggestions: result.tokenomics_validation?.suggestions || [],
      },
      liquidity_plan: {
        initial_sol_needed: result.liquidity_plan?.initial_sol_needed || 0,
        recommended_pools: result.liquidity_plan?.recommended_pools || [],
        vesting_schedule: result.liquidity_plan?.vesting_schedule || '',
      },
      community_strategy: result.community_strategy || '',
      risks: result.risks || [],
    };
  }

  async run(ctx: any, options?: any) {
    const result = await this.analyze({
      projectName: ctx.projectName || 'Unnamed Project',
      currentPhase: ctx.phaseId || 'pre-launch',
      technicalStatus: ctx.technicalStatus || { contractDeployed: false, audited: false, testnetLive: false },
      communityMetrics: ctx.communityMetrics || { twitterFollowers: 0, discordMembers: 0, betaUsers: 0 },
      budget: ctx.budget || { totalSol: 0, availableForLiquidity: 0 },
    });

    return {
      rawMessage: { content: JSON.stringify(result) },
      payload: result,
      sources: [],
      ...result,
    };
  }
}

export default LaunchpadAgent;
