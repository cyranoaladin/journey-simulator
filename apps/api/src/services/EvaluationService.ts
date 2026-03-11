/**
 * Project: Money Factory AI (MFAI)
 * Evaluation Service - Safe Zyno Integration
 * Status: Production Ready - 2026
 */

import ZynoAgent from '../agents/ZynoAgent';
import { prisma } from '../config/database';
import { sanitizeInput } from '../utils/sanitizer';

export interface EvaluationRequest {
    userId: string;
    personaId: string;
    phaseId: string | number;
    userInput?: string;
    journeyContext?: any;
}

export interface EvaluationResult {
    score: number; // 0-100
    decision: 'VALIDATED' | 'REJECTED';
    feedback: string;
    isDeterministic: boolean;
    metrics: any;
}

export class EvaluationService {
    /**
     * Evaluates a user submission via Zyno Agent or Deterministic Fallback.
     * "Safe Failover": If Zyno fails/crashes, we fallback to logic-based eval.
     */
    static async evaluate(request: EvaluationRequest): Promise<EvaluationResult> {
        const ENABLE_ZYNO = process.env.ENABLE_ZYNO_EVAL === 'true';

        // Sanitize Input before processing
        const safeInput = sanitizeInput(request.userInput);

        if (ENABLE_ZYNO) {
            try {
                console.log(`[EvaluationService] Invoking Zyno for user ${request.userId}...`);

                // Prepare context for Zyno
                const zynoContext = {
                    userProfile: { persona: request.personaId },
                    phaseId: request.phaseId,
                    userInput: safeInput, // Sanitized
                    journeyState: request.journeyContext,
                    // Force Zyno to produce an evaluation block
                    activityType: 'evaluation'
                };

                const agent = new ZynoAgent();
                const result = await agent.run(zynoContext);

                // Parse Zyno response to extract score/decision
                // We look for 'evaluation_block' in ui_blocks
                const evalBlock = result.payload.ui_blocks?.find((b: any) => b.kind === 'evaluation_block');

                if (evalBlock) {
                    const score = evalBlock.global_score || 0;
                    return {
                        score: score,
                        decision: score >= 50 ? 'VALIDATED' : 'REJECTED',
                        feedback: evalBlock.feedback || 'Evaluated by Zyno.',
                        isDeterministic: false,
                        metrics: {
                            zyno_latency: result.metadata?.tokens_used || 0
                        }
                    };
                } else {
                    console.warn('[EvaluationService] Zyno ran but returned no evaluation_block. Falling back.');
                }

            } catch (error) {
                console.error('[EvaluationService] Zyno Error (Safe Failover triggered):', error);
                // Fallback proceeds below
            }
        }

        // --- DETERMINISTIC FALLBACK (Safe Mode) ---
        // If submission exists (non-empty), we consider it "Effort Provided" -> PASS
        // This is the S2.3 logic to ensure no-blocking.
        console.log(`[EvaluationService] Using Deterministic Fallback for user ${request.userId}`);

        const isValid = !!safeInput && safeInput.length > 5;

        return {
            score: isValid ? 100 : 0,
            decision: isValid ? 'VALIDATED' : 'REJECTED',
            feedback: isValid ? 'Submission received (Deterministic Mode).' : 'Submission too short.',
            isDeterministic: true,
            metrics: { mode: 'fallback' }
        };
    }
}
