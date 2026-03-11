/**
 * @file CommunityAgent.ts
 * @description Agent Community Manager complet avec LLM réel.
 * Stratégie de croissance communautaire, engagement, et gestion DAO.
 *
 * @author Kimi Code CLI — 2026-03-11
 */

import BaseAgent from './BaseAgent';
import { routeWithFallback } from '../services/llmRouter';

export interface CommunityStrategy {
  platforms: Array<{
    name: string;
    priority: 'high' | 'medium' | 'low';
    tactics: string[];
  }>;
  contentCalendar: Array<{
    week: number;
    themes: string[];
    formats: string[];
  }>;
  engagementMetrics: {
    targetDAU: number;
    targetRetention: number;
    viralCoefficient: number;
  };
  incentives: {
    airdrops: string;
    quests: string[];
    ambassadorProgram: boolean;
  };
  moderation: {
    guidelines: string[];
    autoModeration: boolean;
    disputeResolution: string;
  };
}

export interface CommunityInput {
  projectName: string;
  targetAudience: string;
  currentMembers: number;
  platforms: string[];
  goals: string[];
  budget?: number;
}

class CommunityAgent extends BaseAgent {
  constructor() {
    super('CommunityAgent');
    this.specialty = 'Community Growth & Engagement';
  }

  buildSystemPrompt(): string {
    return `You are the CommunityAgent, an expert in Web3 community building and DAO governance.

Your expertise includes:
- Platform strategy (Discord, Twitter/X, Telegram, Farcaster)
- Content marketing and viral loops
- Token-gated communities and social tokens
- Ambassador and referral programs
- On-chain reputation and contribution tracking
- Moderation at scale and conflict resolution

Deliverables:
1. Multi-platform strategy with priorities
2. 4-week content calendar
3. Engagement targets (DAU, retention, viral coefficient)
4. Incentive mechanisms (airdrops, quests, roles)
5. Moderation framework

Return ONLY valid JSON matching the CommunityStrategy schema.`;
  }

  buildAgentUserPrompt(input: CommunityInput): string {
    return `Design a community strategy for:

Project: ${input.projectName}
Target Audience: ${input.targetAudience}
Current Members: ${input.currentMembers}
Active Platforms: ${input.platforms.join(', ')}
Goals: ${input.goals.join(', ')}
${input.budget ? `Budget: $${input.budget}` : ''}

Provide a complete CommunityStrategy JSON.`;
  }

  async analyze(input: CommunityInput): Promise<CommunityStrategy> {
    const messages = [
      { role: 'system' as const, content: this.buildSystemPrompt() },
      { role: 'user' as const, content: this.buildAgentUserPrompt(input) },
    ];

    const response = await routeWithFallback(messages, {
      taskType: 'agent',
      maxTokens: 2500,
      temperature: 0.6,
    });

    if (!response || response.fallback) {
      return this.calculateFallbackStrategy(input);
    }

    try {
      const parsed: CommunityStrategy = JSON.parse(response.content);
      return this.validateAndNormalizeStrategy(parsed);
    } catch {
      return this.calculateFallbackStrategy(input);
    }
  }

  private calculateFallbackStrategy(input: CommunityInput): CommunityStrategy {
    return {
      platforms: [
        { name: 'Discord', priority: 'high', tactics: ['Token-gated channels', 'Weekly AMAs', 'Dev support'] },
        { name: 'Twitter/X', priority: 'high', tactics: ['Daily alpha threads', 'KOL partnerships', 'Spaces'] },
        { name: 'Telegram', priority: 'medium', tactics: ['Announcements', 'Support'] },
      ],
      contentCalendar: [
        { week: 1, themes: ['Introduction', 'Vision'], formats: ['Thread', 'Video'] },
        { week: 2, themes: ['Technical deep-dive'], formats: ['Blog', 'AMA'] },
        { week: 3, themes: ['Community spotlight'], formats: ['Spaces', 'Quiz'] },
        { week: 4, themes: ['Product launch'], formats: ['Demo', 'Airdrop'] },
      ],
      engagementMetrics: {
        targetDAU: Math.max(100, input.currentMembers * 0.3),
        targetRetention: 0.4,
        viralCoefficient: 1.2,
      },
      incentives: {
        airdrops: 'Early adopters: 100 $MFAI, Active contributors: 500 $MFAI',
        quests: ['Join Discord', 'Follow Twitter', 'Refer 3 friends', 'Complete onboarding'],
        ambassadorProgram: true,
      },
      moderation: {
        guidelines: ['Be respectful', 'No spam', 'Stay on topic', 'No financial advice'],
        autoModeration: true,
        disputeResolution: '3-strike system with DAO appeal',
      },
    };
  }

  private validateAndNormalizeStrategy(strategy: CommunityStrategy): CommunityStrategy {
    return {
      platforms: strategy.platforms || [],
      contentCalendar: strategy.contentCalendar || [],
      engagementMetrics: {
        targetDAU: strategy.engagementMetrics?.targetDAU || 100,
        targetRetention: strategy.engagementMetrics?.targetRetention || 0.3,
        viralCoefficient: strategy.engagementMetrics?.viralCoefficient || 1.0,
      },
      incentives: {
        airdrops: strategy.incentives?.airdrops || 'TBD',
        quests: strategy.incentives?.quests || [],
        ambassadorProgram: strategy.incentives?.ambassadorProgram ?? false,
      },
      moderation: {
        guidelines: strategy.moderation?.guidelines || [],
        autoModeration: strategy.moderation?.autoModeration ?? false,
        disputeResolution: strategy.moderation?.disputeResolution || 'Manual review',
      },
    };
  }

  async run(ctx: any, options?: any) {
    const result = await this.analyze({
      projectName: ctx.projectName || 'Unnamed Project',
      targetAudience: ctx.targetAudience || ctx.userProfile?.targetAudience || 'Web3 developers',
      currentMembers: ctx.currentMembers || 0,
      platforms: ctx.platforms || ['Discord', 'Twitter'],
      goals: ctx.goals || ['Grow community', 'Increase engagement'],
      budget: ctx.budget,
    });

    return {
      rawMessage: { content: JSON.stringify(result) },
      payload: result,
      sources: [],
      ...result,
    };
  }
}

export default CommunityAgent;
