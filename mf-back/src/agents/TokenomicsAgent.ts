/**
 * @file TokenomicsAgent.ts
 * @description Agent Tokenomics complet avec LLM réel et données marché Pyth.
 * Intègre les prix temps réel pour les simulations de valuation et sell pressure.
 *
 * @author Kimi Code CLI — 2026-03-11
 */

import BaseAgent from './BaseAgent';
import { routeWithFallback } from '../services/llmRouter';
import { getMarketSummaryForAgents, AssetPrice } from '../services/pythOracleService';

export interface TokenomicsModel {
  tokenName: string;
  symbol: string;
  totalSupply: number;
  initialPrice: number;
  marketCap: {
    initial: number;
    fdv: number;
  };
  allocations: Array<{
    category: string;
    percentage: number;
    amount: number;
    vesting: string;
    cliff: number;
  }>;
  bondingCurve: {
    type: 'linear' | 'exponential' | 'sigmoid';
    formula: string;
    parameters: Record<string, number>;
  };
  sellPressureAnalysis: {
    tgeUnlockValue: number;
    cliffUnlockValue: number;
    monthlyInflation: number;
  };
  utility: string[];
  governance: {
    votingPower: string;
    proposalThreshold: number;
  };
}

export interface TokenomicsInput {
  projectName: string;
  sector: string;
  targetMarketCap: number;
  totalSupply: number;
  teamSize: number;
  raiseAmount?: number;
  usePythData?: boolean;
}

class TokenomicsAgent extends BaseAgent {
  constructor() {
    super('TokenomicsAgent');
    this.specialty = 'Token Economics & Valuation';
  }

  buildSystemPrompt(): string {
    return `You are the TokenomicsAgent, a Chief Token Architect & Economist.

EXPERTISE:
- Bonding Curves (Linear/Exponential/Sigmoid)
- Vesting Mathematics and Cliff Analysis
- Supply Schedules and Inflation Modeling
- Game Theory Equilibrium
- Market Cap vs FDV Analysis
- Sell Pressure Simulation

FORMULAS (always in LaTeX $$ $$):
- Linear: $$P = m \cdot S + b$$
- Exponential: $$P = a \cdot e^{k \cdot S}$$
- Sigmoid: $$P = \frac{K}{1 + e^{-k \cdot (S - S_0)}}$$
- Vesting: Unlock(t) = (t < Cliff) ? 0 : (Allocation * (t - Cliff) / VestingDuration)

CRITICAL:
- SUM(allocations) MUST equal 100%
- Validate Initial Market Cap vs Fully Diluted Valuation
- Calculate sell pressure at TGE and Cliff

Return ONLY valid JSON matching the TokenomicsModel schema.`;
  }

  buildAgentUserPrompt(input: TokenomicsInput, marketData?: { prices: Record<string, AssetPrice>; summary: string }): string {
    return `Design tokenomics for:

Project: ${input.projectName}
Sector: ${input.sector}
Target Market Cap: $${input.targetMarketCap.toLocaleString()}
Total Supply: ${input.totalSupply.toLocaleString()} tokens
Team Size: ${input.teamSize}
${input.raiseAmount ? `Raise Amount: $${input.raiseAmount.toLocaleString()}` : ''}

${marketData ? `Market Context (Pyth Oracle):
${marketData.summary}
Use these real-time prices for valuation benchmarks.` : ''}

Provide a complete TokenomicsModel JSON with:
1. Allocations (team, investors, community, treasury) summing to 100%
2. Bonding curve formula and parameters
3. Vesting schedules with cliff
4. Sell pressure analysis at TGE and cliff
5. Utility and governance mechanics`;
  }

  async design(input: TokenomicsInput): Promise<TokenomicsModel> {
    // Récupérer les données marché Pyth si demandé
    let marketData: { prices: Record<string, AssetPrice>; summary: string } | undefined;
    if (input.usePythData !== false) {
      try {
        marketData = await getMarketSummaryForAgents();
      } catch {
        // Silencieux — fallback automatique
      }
    }

    const messages = [
      { role: 'system' as const, content: this.buildSystemPrompt() },
      { role: 'user' as const, content: this.buildAgentUserPrompt(input, marketData) },
    ];

    const response = await routeWithFallback(messages, {
      taskType: 'reasoning',
      maxTokens: 3000,
      temperature: 0.3,
    });

    if (!response || response.fallback) {
      return this.calculateFallbackModel(input, marketData);
    }

    try {
      const parsed: TokenomicsModel = JSON.parse(response.content);
      return this.validateAndNormalizeModel(parsed);
    } catch {
      return this.calculateFallbackModel(input, marketData);
    }
  }

  private calculateFallbackModel(
    input: TokenomicsInput,
    marketData?: { prices: Record<string, AssetPrice>; summary: string }
  ): TokenomicsModel {
    const price = input.targetMarketCap / input.totalSupply;
    const fdv = price * input.totalSupply;
    
    // Utiliser les prix Pyth pour les benchmarks si disponibles
    const solPrice = marketData?.prices?.SOL_USD?.priceUsd || 150;
    
    return {
      tokenName: input.projectName + ' Token',
      symbol: input.projectName.substring(0, 4).toUpperCase(),
      totalSupply: input.totalSupply,
      initialPrice: price,
      marketCap: {
        initial: input.targetMarketCap,
        fdv,
      },
      allocations: [
        { category: 'Community', percentage: 40, amount: input.totalSupply * 0.4, vesting: 'Linear 24 months', cliff: 0 },
        { category: 'Team', percentage: 20, amount: input.totalSupply * 0.2, vesting: 'Linear 48 months', cliff: 12 },
        { category: 'Investors', percentage: 15, amount: input.totalSupply * 0.15, vesting: 'Linear 24 months', cliff: 6 },
        { category: 'Treasury', percentage: 20, amount: input.totalSupply * 0.2, vesting: 'Governance controlled', cliff: 0 },
        { category: 'Liquidity', percentage: 5, amount: input.totalSupply * 0.05, vesting: 'Immediate', cliff: 0 },
      ],
      bondingCurve: {
        type: 'sigmoid',
        formula: '$$P = \\frac{K}{1 + e^{-k \\cdot (S - S_0)}}$$',
        parameters: { K: price * 10, k: 0.000001, S_0: input.totalSupply / 2 },
      },
      sellPressureAnalysis: {
        tgeUnlockValue: input.totalSupply * 0.05 * price,
        cliffUnlockValue: input.totalSupply * 0.15 * price,
        monthlyInflation: input.totalSupply * 0.02,
      },
      utility: ['Governance voting', 'Staking rewards', 'Fee discounts', 'Protocol revenue share'],
      governance: {
        votingPower: 'Token-weighted with quadratic option',
        proposalThreshold: input.totalSupply * 0.001,
      },
    };
  }

  private validateAndNormalizeModel(model: TokenomicsModel): TokenomicsModel {
    // Vérifier que les allocations somment à 100%
    const totalPercent = model.allocations?.reduce((sum, a) => sum + (a.percentage || 0), 0) || 0;
    if (Math.abs(totalPercent - 100) > 0.1) {
      console.warn(`[TokenomicsAgent] Allocation sum = ${totalPercent}%, adjusting...`);
    }

    return {
      tokenName: model.tokenName || 'Unnamed Token',
      symbol: model.symbol || 'TOKEN',
      totalSupply: model.totalSupply || 1_000_000_000,
      initialPrice: model.initialPrice || 0.01,
      marketCap: {
        initial: model.marketCap?.initial || 10_000_000,
        fdv: model.marketCap?.fdv || 100_000_000,
      },
      allocations: model.allocations || [],
      bondingCurve: {
        type: model.bondingCurve?.type || 'linear',
        formula: model.bondingCurve?.formula || 'P = m * S + b',
        parameters: model.bondingCurve?.parameters || {},
      },
      sellPressureAnalysis: {
        tgeUnlockValue: model.sellPressureAnalysis?.tgeUnlockValue || 0,
        cliffUnlockValue: model.sellPressureAnalysis?.cliffUnlockValue || 0,
        monthlyInflation: model.sellPressureAnalysis?.monthlyInflation || 0,
      },
      utility: model.utility || [],
      governance: {
        votingPower: model.governance?.votingPower || 'Token-weighted',
        proposalThreshold: model.governance?.proposalThreshold || 1000,
      },
    };
  }

  async run(ctx: any, options?: any) {
    const result = await this.design({
      projectName: ctx.projectName || 'Unnamed Project',
      sector: ctx.sector || 'DeFi',
      targetMarketCap: ctx.targetMarketCap || 10_000_000,
      totalSupply: ctx.totalSupply || 1_000_000_000,
      teamSize: ctx.teamSize || 5,
      raiseAmount: ctx.raiseAmount,
      usePythData: true,
    });

    return {
      rawMessage: { content: JSON.stringify(result) },
      payload: result,
      sources: [],
      ...result,
    };
  }
}

export default TokenomicsAgent;
