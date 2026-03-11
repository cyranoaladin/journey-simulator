/**
 * @file EvaluationAgent.ts
 * @description Agent d'évaluation AEPO (AI-Enhanced Pathway Orchestration) avec scoring réel.
 * Calcule le score central du produit basé sur les livrables utilisateur.
 *
 * @author Kimi Code CLI — 2026-03-11
 */

import BaseAgent from './BaseAgent';
import { routeWithFallback, buildMFAISystemMessage } from '../services/llmRouter';

export interface AEPOScore {
  global_score: number; // 0-100 — affiché dans l'UI dashboard
  dimensions: {
    execution_quality: number; // Qualité des livrables produits
    learning_velocity: number; // Vitesse d'assimilation
    collaboration: number; // Interactions DAO et communauté
    innovation: number; // Originalité des solutions proposées
    web3_fluency: number; // Maîtrise de l'écosystème Solana/Web3
  };
  feedback: string; // Feedback personnalisé en langage naturel
  next_milestone: string; // Prochain objectif recommandé
  proof_of_skill_eligible: boolean; // Éligibilité au mint du Proof-of-Skill™ cNFT
  recommended_agents: string[]; // Agents recommandés pour la prochaine étape
}

export interface EvaluationInput {
  userId: string;
  journeyId: string;
  phaseId: string;
  submission: string;
  artifacts?: string[];
  previousScores?: AEPOScore[];
  trackId?: string;
}

/**
 * Agent d'évaluation AEPO avec intégration LLM réelle
 */
class EvaluationAgent extends BaseAgent {
  constructor() {
    super('EvaluationAgent');
    this.specialty = 'AEPO Scoring Engine';
  }

  buildSystemPrompt(): string {
    return `You are the AEPO (AI-Enhanced Pathway Orchestration) scoring engine of Money Factory AI.

Your role is to evaluate a user's journey progress and calculate a multidimensional competency score.

Evaluation dimensions (0-100 scale):
1. execution_quality: Quality of deliverables produced, code cleanliness, documentation
2. learning_velocity: Speed of assimilation, time to complete milestones
3. collaboration: DAO interactions, community engagement, peer reviews
4. innovation: Originality of proposed solutions, creative problem-solving
5. web3_fluency: Understanding of Solana/Web3 concepts, best practices

Scoring guidelines:
- 90-100: Exceptional - Ready for advanced tracks and mentorship roles
- 80-89: Proficient - Strong understanding, minor gaps to address
- 70-79: Competent - Solid foundation, needs targeted improvement
- 60-69: Developing - Basic understanding, more practice needed
- <60: Novice - Requires additional learning and support

proof_of_skill_eligible: true if global_score >= 70 AND execution_quality >= 65

Return ONLY valid JSON matching the AEPOScore schema. No markdown, no explanations outside JSON.`;
  }

  buildUserPrompt(ctx: any): string {
    const { submission, phaseId, trackId, artifacts } = ctx;
    return `Evaluate the following submission for phase "${phaseId}"${trackId ? ` in track "${trackId}"` : ''}.

User Submission:
${submission || 'No submission provided'}

${artifacts?.length ? `Artifacts submitted:\n${artifacts.map((a: string) => `- ${a}`).join('\n')}` : 'No artifacts attached'}

Provide a complete AEPOScore JSON with all dimensions scored objectively.`;
  }

  /**
   * Évalue une soumission avec scoring AEPO réel via LLM
   */
  async evaluate(input: EvaluationInput): Promise<AEPOScore> {
    const messages = [
      { role: 'system' as const, content: this.buildSystemPrompt() },
      { role: 'user' as const, content: this.buildUserPrompt(input) },
    ];

    const response = await routeWithFallback(messages, {
      taskType: 'reasoning',
      maxTokens: 1500,
      temperature: 0.3, // Plus conservateur pour l'évaluation
    });

    if (!response || response.fallback) {
      // Fallback déterministe si LLM échoue
      return this.calculateFallbackScore(input);
    }

    try {
      const parsed: AEPOScore = JSON.parse(response.content);
      return this.validateAndNormalizeScore(parsed);
    } catch {
      // Si le parsing échoue, extraire les scores ou utiliser fallback
      return this.extractScoreFromText(response.content, input);
    }
  }

  /**
   * Calcule un score de fallback si le LLM échoue
   */
  private calculateFallbackScore(input: EvaluationInput): AEPOScore {
    const submissionLength = input.submission?.length || 0;
    const hasArtifacts = (input.artifacts?.length || 0) > 0;
    
    // Heuristiques simples basées sur la longueur et la présence d'artifacts
    const baseScore = Math.min(100, 40 + submissionLength / 20);
    const artifactBonus = hasArtifacts ? 10 : 0;
    const globalScore = Math.min(100, Math.round(baseScore + artifactBonus));

    return {
      global_score: globalScore,
      dimensions: {
        execution_quality: Math.min(100, globalScore + 5),
        learning_velocity: Math.min(100, globalScore + 10),
        collaboration: Math.min(100, globalScore - 10),
        innovation: Math.min(100, globalScore),
        web3_fluency: Math.min(100, globalScore - 5),
      },
      feedback: `[FALLBACK] Score provisoire calculé automatiquement. Soumission analysée sur ${submissionLength} caractères.`,
      next_milestone: 'Complete the next phase submission for a more accurate assessment.',
      proof_of_skill_eligible: globalScore >= 70,
      recommended_agents: ['LearningAgent', 'CoachAgent'],
    };
  }

  /**
   * Valide et normalise un score AEPO
   */
  private validateAndNormalizeScore(score: AEPOScore): AEPOScore {
    const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
    
    return {
      global_score: clamp(score.global_score),
      dimensions: {
        execution_quality: clamp(score.dimensions?.execution_quality || 50),
        learning_velocity: clamp(score.dimensions?.learning_velocity || 50),
        collaboration: clamp(score.dimensions?.collaboration || 50),
        innovation: clamp(score.dimensions?.innovation || 50),
        web3_fluency: clamp(score.dimensions?.web3_fluency || 50),
      },
      feedback: score.feedback || 'Evaluation completed.',
      next_milestone: score.next_milestone || 'Proceed to next phase.',
      proof_of_skill_eligible: score.proof_of_skill_eligible ?? score.global_score >= 70,
      recommended_agents: score.recommended_agents || [],
    };
  }

  /**
   * Tente d'extraire un score valide d'un texte non-JSON
   */
  private extractScoreFromText(text: string, input: EvaluationInput): AEPOScore {
    // Recherche de patterns comme "global_score": 85 ou Score: 85
    const globalMatch = text.match(/(?:global_score|score)["\s:]+(\d+)/i);
    const globalScore = globalMatch ? parseInt(globalMatch[1], 10) : 50;

    return this.validateAndNormalizeScore({
      global_score: globalScore,
      dimensions: {
        execution_quality: globalScore,
        learning_velocity: globalScore,
        collaboration: globalScore,
        innovation: globalScore,
        web3_fluency: globalScore,
      },
      feedback: 'Score extracted from non-JSON response. Review recommended.',
      next_milestone: 'Proceed to next phase.',
      proof_of_skill_eligible: globalScore >= 70,
      recommended_agents: [],
    });
  }

  // Legacy support for agent runner
  async run(ctx: any, options?: any) {
    const result = await this.evaluate({
      userId: ctx.userId,
      journeyId: ctx.journeyId,
      phaseId: ctx.phaseId,
      submission: ctx.submission,
      artifacts: ctx.artifacts,
      trackId: ctx.trackId,
    });

    return {
      rawMessage: { content: JSON.stringify(result) },
      payload: result,
      sources: [],
      ...result,
    };
  }
}

export default EvaluationAgent;
