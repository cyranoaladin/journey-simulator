/**
 * @file SecurityAuditAgent.ts
 * @description Agent spécialisé dans l'audit de sécurité des smart contracts et dApps.
 * 
 * Capacités :
 * - Analyse statique de code Rust/Anchor
 * - Détection de vulnérabilités communes (reentrancy, overflow, etc.)
 * - Recommandations de sécurité
 * - Checklist de déploiement sécurisé
 * 
 * ⚠️ LIMITATION : Cet agent fournit une analyse automatisée de premier niveau.
 * Il ne remplace PAS un audit professionnel par une équipe de sécurité (OtterSec, Neodyme, etc.)
 * avant tout déploiement mainnet.
 * 
 * @author Kimi Code CLI — Phase 3 — 2026-03-12
 */

import { BaseAgent } from './BaseAgent';
import { routeWithFallback, buildMFAISystemMessage } from '../services/llmRouter';

export interface SecurityInput {
  code: string;
  language: 'rust' | 'typescript' | 'solidity';
  programType: 'anchor' | 'native' | 'solidity';
  linesOfCode?: number;
}

export interface SecurityOutput {
  status: 'OK' | 'WARNING' | 'CRITICAL';
  summary: string;
  score: number; // 0-100
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

export class SecurityAuditAgent extends BaseAgent {
  constructor() {
    super('SecurityAuditAgent', 'code');
  }

  async run(input: SecurityInput): Promise<SecurityOutput> {
    const startTime = Date.now();
    
    // Validation
    if (input.code.length > 10000) {
      return {
        status: 'WARNING',
        summary: 'Code too large for automated analysis (>10k chars). Please submit in chunks or request professional audit.',
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
      const messages = [
        buildMFAISystemMessage(
          'Smart Contract Security Auditor',
          `Audit ${input.programType} program written in ${input.language}. Focus on Solana/Anchor specific vulnerabilities.`
        ),
        {
          role: 'user',
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

      const result: SecurityOutput = JSON.parse(response);
      
      // Force professional audit flag if critical vulnerabilities found
      if (result.vulnerabilities.some(v => v.severity === 'CRITICAL')) {
        result.professional_audit_required = true;
        result.status = 'CRITICAL';
      }

      await this.traceRun({
        input: { ...input, code: '[truncated]' },
        output: result,
        durationMs: Date.now() - startTime,
        success: true,
      });

      return result;
    } catch (error) {
      await this.traceRun({
        input: { ...input, code: '[truncated]' },
        output: null,
        durationMs: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

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
