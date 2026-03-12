/**
 * @file DAOAgent.ts
 * @description Agent spécialisé dans la gouvernance DAO et les outils communautaires.
 * 
 * Capacités :
 * - Architecture de gouvernance (Realms, Snapshot, Tally)
 * - Design des flux d'onboarding DAO
 * - Token gating et contrôle d'accès
 * - Structure des Working Groups/SubDAOs
 * 
 * @author Kimi Code CLI — Phase 3 — 2026-03-12
 */

import { BaseAgent } from './BaseAgent';
import { routeWithFallback, buildMFAISystemMessage } from '../services/llmRouter';

export interface DAOInput {
  projectType: string;
  communitySize: number;
  governanceGoals: string[];
  existingTools?: string[];
  budget?: string;
}

export interface DAOOutput {
  status: 'OK' | 'ERROR';
  summary: string;
  dao_structure: {
    stack: string[];
    roles: string[];
    voting_model: string;
  };
  resources: {
    diagram: string;
    data: {
      tool_costs: Record<string, string>;
      readiness: number;
    };
    documentation: string;
  };
  actions: string[];
}

export class DAOAgent extends BaseAgent {
  constructor() {
    super('DAOAgent', 'governance');
  }

  async run(input: DAOInput): Promise<DAOOutput> {
    const startTime = Date.now();
    
    try {
      const messages = [
        buildMFAISystemMessage(
          'DAO Tooling & Community Architect',
          `Design DAO governance for ${input.projectType} with ${input.communitySize} members. Goals: ${input.governanceGoals.join(', ')}`
        ),
        {
          role: 'user',
          content: JSON.stringify(input),
        },
      ];

      const response = await routeWithFallback(messages, {
        taskType: 'reasoning',
        maxTokens: 2500,
        temperature: 0.3,
      });

      if (!response) {
        throw new Error('All LLM providers failed');
      }

      const result: DAOOutput = JSON.parse(response);
      
      // Validation minimale
      if (!result.dao_structure || !result.resources) {
        throw new Error('Invalid response structure');
      }

      await this.traceRun({
        input,
        output: result,
        durationMs: Date.now() - startTime,
        success: true,
      });

      return result;
    } catch (error) {
      await this.traceRun({
        input,
        output: null,
        durationMs: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Fallback structure
      return {
        status: 'ERROR',
        summary: 'Failed to generate DAO structure — using fallback',
        dao_structure: {
          stack: ['Realms', 'Snapshot'],
          roles: ['Core Contributor', 'Community Member'],
          voting_model: 'Token-weighted with delegation',
        },
        resources: {
          diagram: 'graph TD; A[Core Team] --> B[Community];',
          data: {
            tool_costs: { realms: 'free', snapshot: 'free' },
            readiness: 50,
          },
          documentation: '# DAO Setup Guide\n\n1. Create Realm on Realms\n2. Configure Snapshot for off-chain votes',
        },
        actions: ['Setup Realms organization', 'Configure voting parameters'],
      };
    }
  }
}
