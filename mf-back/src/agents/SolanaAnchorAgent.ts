/**
 * @file SolanaAnchorAgent.ts
 * @description Agent de génération de code Solana/Anchor.
 * Génère du code Anchor fonctionnel basé sur les specs du projet utilisateur.
 *
 * @author Kimi Code CLI — 2026-03-11
 */

import BaseAgent from './BaseAgent';
import { routeWithFallback } from '../services/llmRouter';

export interface AnchorCodeResult {
  program_name: string;
  description: string;
  anchor_code: string; // Code Rust/Anchor complet et compilable
  client_code: string; // Code TypeScript client (tests + interactions)
  security_notes: string[]; // Vulnérabilités potentielles à surveiller
  deployment_commands: string[]; // Commandes anchor build/deploy
  estimated_cost_sol: number; // Coût de déploiement estimé en SOL
}

export interface SolanaAnchorInput {
  projectName: string;
  description: string;
  features: string[];
  tokenType?: 'none' | 'fungible' | 'nft';
  governance?: boolean;
  staking?: boolean;
}

/**
 * Agent de génération de code Solana/Anchor
 */
class SolanaAnchorAgent extends BaseAgent {
  constructor() {
    super('SolanaAnchorAgent');
    this.specialty = 'Solana/Anchor Code Generation';
  }

  buildSystemPrompt(): string {
    return `You are a senior Solana/Anchor smart contract developer with deep expertise in:
- Anchor framework (latest stable version)
- Solana account model and PDA design patterns
- SPL Token, Token-2022 extensions
- NFT standards (Metaplex Core, cNFTs via Light Protocol)
- Security best practices (ownership checks, signer validation, overflow prevention)

Generate production-quality Anchor code based on the user's project specifications.
Include comprehensive comments explaining each instruction and account constraint.
Flag any potential security vulnerabilities in security_notes.

The code must be:
- Compilable with anchor build
- Follow Anchor best practices
- Include proper error handling
- Use PDA patterns where appropriate

Return ONLY valid JSON matching the AnchorCodeResult schema.`;
  }

  buildUserPrompt(input: SolanaAnchorInput): string {
    return `Generate Anchor code for the following project:

Project Name: ${input.projectName}
Description: ${input.description}

Features required:
${input.features.map(f => `- ${f}`).join('\n')}

${input.tokenType && input.tokenType !== 'none' ? `Token Type: ${input.tokenType}` : ''}
${input.governance ? 'Include: DAO governance module' : ''}
${input.staking ? 'Include: Staking mechanism' : ''}

Provide complete, production-ready code with:
1. Program name and description
2. Complete lib.rs with all instructions
3. TypeScript client code for testing
4. Security considerations
5. Deployment commands
6. Estimated SOL cost for deployment`;
  }

  async generate(input: SolanaAnchorInput): Promise<AnchorCodeResult> {
    const messages = [
      { role: 'system' as const, content: this.buildSystemPrompt() },
      { role: 'user' as const, content: this.buildUserPrompt(input) },
    ];

    const response = await routeWithFallback(messages, {
      taskType: 'code',
      maxTokens: 4000,
      temperature: 0.2,
    });

    if (!response || response.fallback) {
      return this.calculateFallbackCode(input);
    }

    try {
      const parsed: AnchorCodeResult = JSON.parse(response.content);
      return this.validateAndNormalizeResult(parsed);
    } catch {
      return this.calculateFallbackCode(input);
    }
  }

  private calculateFallbackCode(input: SolanaAnchorInput): AnchorCodeResult {
    return {
      program_name: input.projectName.toLowerCase().replace(/\s+/g, '_'),
      description: `[FALLBACK] ${input.description}`,
      anchor_code: `use anchor_lang::prelude::*;

// [FALLBACK CODE] Please regenerate with LLM for production use
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod ${input.projectName.toLowerCase().replace(/\s+/g, '_')} {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}`,
      client_code: `// [FALLBACK] TypeScript client code placeholder
import * as anchor from "@coral-xyz/anchor";

// TODO: Add client implementation after regenerating with LLM`,
      security_notes: [
        '[FALLBACK] This is placeholder code - security audit required',
        'Do not use in production without proper review',
      ],
      deployment_commands: [
        'anchor build',
        'anchor deploy',
      ],
      estimated_cost_sol: 0.01,
    };
  }

  private validateAndNormalizeResult(result: AnchorCodeResult): AnchorCodeResult {
    return {
      program_name: result.program_name || 'unnamed_program',
      description: result.description || 'Anchor program',
      anchor_code: result.anchor_code || '// Code generation failed',
      client_code: result.client_code || '// Client code generation failed',
      security_notes: result.security_notes || [],
      deployment_commands: result.deployment_commands || ['anchor build', 'anchor deploy'],
      estimated_cost_sol: Math.max(0, result.estimated_cost_sol || 0.01),
    };
  }

  async run(ctx: any, options?: any) {
    const result = await this.generate({
      projectName: ctx.projectName || 'MyProject',
      description: ctx.submission || ctx.description || '',
      features: ctx.features || [],
      tokenType: ctx.tokenType,
      governance: ctx.governance,
      staking: ctx.staking,
    });

    return {
      rawMessage: { content: JSON.stringify(result) },
      payload: result,
      sources: [],
      ...result,
    };
  }
}

export default SolanaAnchorAgent;
