const Journey = require('../models/Journeys');

/**
 * Get current journey state.
 * @param {string} journeyId 
 */
exports.getJourneyState = async (journeyId) => {
    const journey = await Journey.findById(journeyId);
    if (!journey) throw new Error('Journey not found');
    return {
        state: journey.state,
        currentStepId: journey.currentStepId,
        journey
    };
};

/**
 * Check if a step can be run.
 * @param {string} journeyId 
 * @param {string} stepId 
 */
exports.canRunStep = async (journeyId, stepId) => {
    const { state, currentStepId } = await exports.getJourneyState(journeyId);
    if (state === 'COMPLETED' || state === 'FAILED') return false;
    return currentStepId === stepId;
};

/**
 * Advance journey to next step.
 * @param {Object} params
 * @param {string} params.journeyId
 * @param {string} params.fromStepId
 * @param {string} params.toStepId
 * @param {string} [params.trigger]
 * @param {string} [params.agentRunId]
 * @param {string} [params.finalState]
 */
exports.advanceJourneyStep = async ({ journeyId, fromStepId, toStepId, trigger, agentRunId, finalState }) => {
    const journey = await Journey.findById(journeyId);
    if (!journey) throw new Error('Journey not found');

    if (journey.currentStepId !== fromStepId) {
        throw new Error(`Journey is not at step ${fromStepId} (current: ${journey.currentStepId})`);
    }

    journey.currentStepId = toStepId;
    
    if (finalState) {
        journey.state = finalState;
    }

    // Sync legacy field current_phase if toStepId matches "phase-N" pattern
    const phaseMatch = toStepId.match(/phase-(\d+)/);
    if (phaseMatch) {
        journey.current_phase = Number.parseInt(phaseMatch[1], 10);
    }

    // TODO: We could log transition metadata (trigger, agentRunId) to a separate collection here

    await journey.save();
    return journey;
};
