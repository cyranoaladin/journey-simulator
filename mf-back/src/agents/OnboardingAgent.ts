/**
 * @file OnboardingAgent.ts
 * @description Agent d'onboarding J1 - Premier contact utilisateur avec Zyno.
 * Détecte le profil, propose un parcours personnalisé, crée les premières missions.
 *
 * @author Kimi Code CLI — 2026-03-11
 */

import BaseAgent from './BaseAgent';
import { routeWithFallback } from '../services/llmRouter';

export interface OnboardingResult {
  detected_persona: string; // ex: 'developer', 'entrepreneur', 'student'
  confidence: number; // 0-1
  recommended_journey: string; // ID du parcours recommandé
  first_missions: Array<{
    id: string;
    title: string;
    description: string;
    estimated_duration: string;
    xp_reward: number;
  }>;
  welcome_message: string; // Message personnalisé en langage naturel
  initial_aepo_baseline: number; // Score AEPO initial basé sur le profil
}

export interface OnboardingInput {
  userId: string;
  answers: {
    background: string;
    experience_level: 'beginner' | 'intermediate' | 'advanced';
    goals: string;
    time_commitment: string;
  };
  walletAddress?: string;
}

/**
 * Agent d'onboarding avec détection de profil LLM
 */
class OnboardingAgent extends BaseAgent {
  constructor() {
    super('OnboardingAgent');
    this.specialty = 'User Onboarding & Profiling';
  }

  buildSystemPrompt(): string {
    return `You are the Onboarding Agent for Money Factory AI (MFAI).

Your role is to analyze a new user's background and create a personalized onboarding experience.

Persona detection guidelines:
- developer: Has coding experience, wants to build on Solana
- entrepreneur: Business background, wants to launch a Web3 project
- student: Learning Web3/Solana, building skills for career
- investor: Wants to understand Web3 investment opportunities
- creator: Content creator, community builder, NFT artist

Journey recommendations:
- learn-track: For beginners, fundamentals of Web3/Solana
- build-track: For developers, hands-on coding projects
- launch-track: For entrepreneurs, from idea to mainnet
- defi-track: For advanced users, DeFi protocols and strategies

Return ONLY valid JSON matching the OnboardingResult schema.`;
  }

  buildUserPrompt(input: OnboardingInput): string {
    return `Analyze this new user and create their onboarding profile:

User Background: ${input.answers.background}
Experience Level: ${input.answers.experience_level}
Goals: ${input.answers.goals}
Time Commitment: ${input.answers.time_commitment}
${input.walletAddress ? `Wallet: ${input.walletAddress}` : ''}

Provide:
1. Detected persona (developer, entrepreneur, student, investor, or creator)
2. Confidence score (0-1)
3. Recommended journey ID
4. 3 first missions with XP rewards
5. Personalized welcome message
6. Initial AEPO baseline score (50-70 for beginners, 60-80 for intermediate, 70-90 for advanced)`;
  }

  async onboard(input: OnboardingInput): Promise<OnboardingResult> {
    const messages = [
      { role: 'system' as const, content: this.buildSystemPrompt() },
      { role: 'user' as const, content: this.buildUserPrompt(input) },
    ];

    const response = await routeWithFallback(messages, {
      taskType: 'agent',
      maxTokens: 1500,
      temperature: 0.5,
    });

    if (!response || response.fallback) {
      return this.calculateFallbackOnboarding(input);
    }

    try {
      const parsed: OnboardingResult = JSON.parse(response.content);
      return this.validateAndNormalizeResult(parsed);
    } catch {
      return this.calculateFallbackOnboarding(input);
    }
  }

  private calculateFallbackOnboarding(input: OnboardingInput): OnboardingResult {
    const level = input.answers.experience_level;
    const baseline = level === 'advanced' ? 75 : level === 'intermediate' ? 65 : 55;
    
    const journeyMap: Record<string, string> = {
      beginner: 'learn-track',
      intermediate: 'build-track',
      advanced: 'launch-track',
    };

    return {
      detected_persona: 'student',
      confidence: 0.6,
      recommended_journey: journeyMap[level] || 'learn-track',
      first_missions: [
        { id: 'mission-1', title: 'Complete your profile', description: 'Add your skills and interests', estimated_duration: '5 min', xp_reward: 50 },
        { id: 'mission-2', title: 'Connect your wallet', description: 'Link your Solana wallet', estimated_duration: '2 min', xp_reward: 100 },
        { id: 'mission-3', title: 'Start your first lesson', description: 'Introduction to Web3', estimated_duration: '15 min', xp_reward: 150 },
      ],
      welcome_message: `[FALLBACK] Welcome to MFAI! We've prepared a personalized journey for ${level} users. Let's start building!`,
      initial_aepo_baseline: baseline,
    };
  }

  private validateAndNormalizeResult(result: OnboardingResult): OnboardingResult {
    return {
      detected_persona: result.detected_persona || 'student',
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      recommended_journey: result.recommended_journey || 'learn-track',
      first_missions: result.first_missions || [],
      welcome_message: result.welcome_message || 'Welcome to MFAI!',
      initial_aepo_baseline: Math.max(0, Math.min(100, result.initial_aepo_baseline || 60)),
    };
  }

  async run(ctx: any, options?: any) {
    const result = await this.onboard({
      userId: ctx.userId,
      answers: {
        background: ctx.submission || '',
        experience_level: ctx.userProfile?.experience_level || 'beginner',
        goals: ctx.userProfile?.goals || '',
        time_commitment: ctx.userProfile?.time_commitment || '',
      },
      walletAddress: ctx.userProfile?.walletAddress,
    });

    return {
      rawMessage: { content: JSON.stringify(result) },
      payload: result,
      sources: [],
      ...result,
    };
  }
}

export default OnboardingAgent;
