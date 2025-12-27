const User = require('../models/user');
const Journey = require('../models/Journeys');
const journeyStateService = require('./journey-state-service');
const { generateIdempotencyKey } = require('../utils/agent-idempotence');
const AgentFactory = require('../agents/AgentFactory');

/**
 * Service de gestion des journeys
 * Extrait la logique métier des controllers pour réduire la complexité cognitive
 */
class JourneyService {
  /**
   * Parse et résout le numéro de phase
   */
  static parsePhaseNumber(candidate) {
    const parsed = Number(candidate);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  /**
   * Résout le numéro de phase à partir de plusieurs sources
   */
  static resolvePhaseNumber(phaseNumber, legacyPhaseNumber, journeyState) {
    return this.parsePhaseNumber(phaseNumber)
      ?? this.parsePhaseNumber(legacyPhaseNumber)
      ?? this.parsePhaseNumber(journeyState?.currentPhase)
      ?? 1;
  }

  /**
   * Calcule le delta XP à partir du score
   */
  static calculateXpDelta(evaluationPayload) {
    const rawScore = Number(evaluationPayload.global_score);
    return Number.isFinite(rawScore) ? Math.max(0, Math.round(rawScore * 10)) : 0;
  }

  /**
   * Prépare le payload de progression pour un utilisateur
   */
  static prepareProgressPayload(user) {
    return {
      total_xp: user.total_xp,
      completed_phases: user.completed_phases,
      nft_certificates: user.nft_certificates
    };
  }

  /**
   * Prépare le payload de progression pour le mode demo
   */
  static prepareDemoProgressPayload(journeyState, xpDelta) {
    const baseXp = Number(journeyState?.xp ?? journeyState?.totalXP ?? 0);
    const completedCount = Array.isArray(journeyState?.completed)
      ? journeyState.completed.length
      : Number(journeyState?.completedCount ?? 0);
    const nftCertificates = Array.isArray(journeyState?.nfts)
      ? journeyState.nfts
      : [];

    return {
      total_xp: baseXp + xpDelta,
      completed_phases: completedCount,
      nft_certificates: nftCertificates
    };
  }

  /**
   * Met à jour la progression utilisateur après soumission
   */
  static async updateUserProgress(userId, xpDelta, missionId, phaseId, trackId, journeyId, resolvedPhaseNumber) {
    const updateOps = {};

    if (xpDelta > 0) {
      updateOps.$inc = { total_xp: xpDelta };
    }

    updateOps.$set = {
      last_ai_submission: {
        missionId,
        phaseId,
        trackId,
        journeyId,
        score: Number.isFinite(Number(xpDelta / 10)) ? xpDelta / 10 : null,
        xp_awarded: xpDelta,
        phase_number: resolvedPhaseNumber,
        submitted_at: new Date()
      }
    };

    const updatedUser = await User.findByIdAndUpdate(userId, updateOps, { new: true }).select('-password');
    return updatedUser;
  }

  /**
   * Synchronise l'état du journey après soumission
   */
  static async syncJourneyState(userId, resolvedPhaseNumber) {
    try {
      const journey = await Journey.findOne({ user_id: userId }).sort({ start_date: -1 });
      if (!journey || !Number.isInteger(resolvedPhaseNumber)) {
        return;
      }

      const currentPhaseStep = `phase-${resolvedPhaseNumber}`;
      const nextPhaseStep = `phase-${resolvedPhaseNumber + 1}`;

      if (journey.currentStepId === currentPhaseStep) {
        await journeyStateService.advanceJourneyStep({
          journeyId: journey._id,
          fromStepId: currentPhaseStep,
          toStepId: nextPhaseStep,
          trigger: 'PHASE_COMPLETION'
        });
      } else {
        journey.currentStepId = nextPhaseStep;
        journey.current_phase = resolvedPhaseNumber + 1;
        await journey.save();
      }
    } catch (stateError) {
      console.warn('Failed to sync journey state:', stateError.message);
    }
  }

  /**
   * Prépare le contexte pour l'exécution d'un agent
   */
  static prepareAgentContext(req, journeyId, phaseId, trackId, submission, inputType, language, mode, tone, journeyState) {
    return {
      userId: req.user ? req.user.id : 'anonymous',
      journeyId,
      phaseId,
      trackId,
      submission,
      lastInput: submission,
      inputType,
      language: language || 'en',
      mode: mode || 'discovery',
      tone: tone || 'pedagogical',
      journeyState
    };
  }

  /**
   * Exécute un agent pour une soumission
   */
  static async executeAgentSubmission(ctx, trackId, phaseId, missionId, journeyId) {
    const agent = AgentFactory.getAgentForContext({ trackId, phaseId, missionId });
    console.log(`[Submit] Selected agent ${agent.name} for track ${trackId}, phase ${phaseId}`);

    const idempotencyKey = generateIdempotencyKey(journeyId, phaseId, agent.name, { submission: ctx.submission });
    const result = await agent.run(ctx, { idempotencyKey });

    return { agent, result };
  }
}

module.exports = JourneyService;

