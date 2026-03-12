/**
 * @file SecurityAuditAgent.ts
 * @description Agent spécialisé dans l'audit de sécurité des smart contracts et dApps.
 * 
 * ⚠️ LIMITATION : Cet agent fournit une analyse automatisée de premier niveau.
 * Il ne remplace PAS un audit professionnel avant tout déploiement mainnet.
 * 
 * @author Kimi Code CLI — Phase 3 — 2026-03-12
 */

import { routeWithFallback, buildMFAISystemMessage, LLMMessage } from '../services/llmRouter';
import { traceAgentRun } from '../services/observability';

export interface SecurityInput {
  code: string;
  language: 'rust' | 'typescript' | 'solidity';
  programType: 'anchor' | 'native' | 'solidity';
  linesOfCode?: number;
}

export interface SecurityOutput {
  status: 'OK' | 'WARNING' | 'CRITICAL';
  summary: string;
  score: number;
  vulnerabilities: Array<{
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
    title: string;
    description: string;
    line?: number;
    recommendation: string;
    reference?: string;
  }>;
  checks: {
    ownership_checks: boolean;
    signer_validation: boolean;
    account_validation: boolean;
    arithmetic_safety: boolean;
    reentrancy_protection: boolean;
  };
  recommendations: string[];
  professional_audit_required: boolean;
}

export class SecurityAuditAgent {
  name = 'SecurityAuditAgent';

  async run(input: SecurityInput): Promise<SecurityOutput> {
    const startTime = Date.now();
    
    if (input.code.length > 10000) {
      return {
        status: 'WARNING',
        summary: 'Code too large for automated analysis (>10k chars).',
        score: 0,
        vulnerabilities: [],
        checks: {
          ownership_checks: false,
          signer_validation: false,
          account_validation: false,
          arithmetic_safety: false,
          reentrancy_protection: false,
        },
        recommendations: ['Split code into smaller modules', 'Request professional audit'],
        professional_audit_required: true,
      };
    }

    try {
      const messages: LLMMessage[] = [
        buildMFAISystemMessage(
          'Smart Contract Security Auditor',
          `Audit ${input.programType} program written in ${input.language}. Focus on Solana/Anchor specific vulnerabilities.`
        ),
        {
          role: 'user' as const,
          content: `\`\`\`${input.language}\n${input.code}\n\`\`\``,        },
      ];

      const response = await routeWithFallback(messages, {
        taskType: 'code',
        maxTokens: 3000,
        temperature: 0.2,
      });

      if (!response) {
        throw new Error('All LLM providers failed');
      }

      const result: SecurityOutput = JSON.parse(response.content);
      
      if (result.vulnerabilities.some(v => v.severity === 'CRITICAL')) {
        result.professional_audit_required = true;
        result.status = 'CRITICAL';
      }

      traceAgentRun(
        { journeyId: 'security-audit-run' },
        {
          agentName: 'SecurityAuditAgent',
          model: 'gpt-4o',
          input: { ...input, code: '[truncated]' },
          output: result,
          durationMs: Date.now() - startTime,
          success: true,
        }
      ).catch(() => {});

      return result;
    } catch (error) {
      traceAgentRun(
        { journeyId: 'security-audit-run' },
        {
          agentName: 'SecurityAuditAgent',
          model: 'unknown',
          input: { ...input, code: '[truncated]' },
          output: null,
          durationMs: Date.now() - startTime,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      ).catch(() => {});

      return {
        status: 'WARNING',
        summary: 'Automated analysis failed — professional audit strongly recommended',
        score: 0,
        vulnerabilities: [],
        checks: {
          ownership_checks: false,
          signer_validation: false,
          account_validation: false,
          arithmetic_safety: false,
          reentrancy_protection: false,
        },
        recommendations: ['Request professional security audit before mainnet'],
        professional_audit_required: true,
      };
    }
  }
}

export default SecurityAuditAgent;
