/**
 * @file GrowthAgent.ts
 * @description Agent spécialisé dans la croissance communautaire et l'acquisition Web3.
 * 
 * @author Kimi Code CLI — Phase 3 — 2026-03-12
 */

import { routeWithFallback, buildMFAISystemMessage, LLMMessage } from '../services/llmRouter';
import { traceAgentRun } from '../services/observability';

export interface GrowthInput {
  projectStage: 'pre-launch' | 'launch' | 'growth' | 'mature';
  targetAudience: string[];
  currentCommunitySize: number;
  targetSize: number;
  budget?: string;
  channels?: string[];
}

export interface GrowthOutput {
  status: 'OK' | 'ERROR';
  summary: string;
  strategy: {
    phases: Array<{
      name: string;
      duration: string;
      tactics: string[];
      kpis: string[];
    }>;
  };
  campaigns: Array<{
    name: string;
    channel: string;
    budget: string;
    expectedReach: number;
    cta: string;
  }>;
  incentives: {
    token_rewards: boolean;
    referral_program: boolean;
    ambassador_program: boolean;
  };
  metrics: {
    target_daily_growth: number;
    retention_target: number;
    engagement_rate: number;
  };
}

export class GrowthAgent {
  name = 'GrowthAgent';

  async run(input: GrowthInput): Promise<GrowthOutput> {
    const startTime = Date.now();
    
    try {
      const messages: LLMMessage[] = [
        buildMFAISystemMessage(
          'Web3 Growth Strategist',
          `Design growth strategy from ${input.currentCommunitySize} to ${input.targetSize} members. Stage: ${input.projectStage}`
        ),
        {
          role: 'user' as const,
          content: JSON.stringify(input),
        },
      ];

      const response = await routeWithFallback(messages, {
        taskType: 'reasoning',
        maxTokens: 3000,
        temperature: 0.4,
      });

      if (!response) {
        throw new Error('All LLM providers failed');
      }

      const result: GrowthOutput = JSON.parse(response);
      
      traceAgentRun(
        { journeyId: 'growth-agent-run' },
        {
          agentName: 'GrowthAgent',
          model: 'gpt-4o',
          input,
          output: result,
          durationMs: Date.now() - startTime,
          success: true,
        }
      ).catch(() => {});

      return result;
    } catch (error) {
      traceAgentRun(
        { journeyId: 'growth-agent-run' },
        {
          agentName: 'GrowthAgent',
          model: 'unknown',
          input,
          output: null,
          durationMs: Date.now() - startTime,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      ).catch(() => {});

      return {
        status: 'ERROR',
        summary: 'Failed to generate growth strategy — using fallback',
        strategy: {
          phases: [
            {
              name: 'Foundation',
              duration: 'Month 1',
              tactics: ['Content marketing', 'Twitter presence', 'Discord setup'],
              kpis: ['1000 followers', '100 Discord members'],
            },
          ],
        },
        campaigns: [],
        incentives: {
          token_rewards: true,
          referral_program: false,
          ambassador_program: false,
        },
        metrics: {
          target_daily_growth: 10,
          retention_target: 0.3,
          engagement_rate: 0.05,
        },
      };
    }
  }
}

export default GrowthAgent;
