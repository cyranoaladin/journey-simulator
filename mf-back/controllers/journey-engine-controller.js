/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const JourneyEngine = require('../services/JourneyEngine');
const JourneyRun = require('../models/JourneyRun'); // For specific lookups if needed

exports.startJourney = async (req, res) => {
    try {
        const { journeyDefinitionId } = req.body;
        if (!journeyDefinitionId) return res.status(400).json({ error: 'Missing journeyDefinitionId' });

        const result = await JourneyEngine.startJourney(req.user.id, journeyDefinitionId);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        res.status(409).json({ success: false, message: errorMsg });
    }
};

exports.submitPhase = async (req, res) => {
    try {
        const { runId, phaseId, stepId, payload } = req.body;
        if (!runId || !phaseId || !stepId || !payload) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await JourneyEngine.submitPhase(req.user.id, runId, phaseId, stepId, payload);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        res.status(400).json({ success: false, message: errorMsg });
    }
};

exports.getState = async (req, res) => {
    try {
        const { id } = req.params; // runId
        const result = await JourneyEngine.getState(req.user.id, id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

// DEV ONLY: Endpoint to trigger mock evaluation (since Zyno is off)
// In production this would be an internal zyno callback or not exposed
exports.devAdvance = async (req, res) => {
    try {
        // Check for admin role or dev env? For S2.3 local, we allow it.
        const { submissionId, decision, score } = req.body;
        const result = await JourneyEngine.mockEvaluate(submissionId, decision, score);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        res.status(400).json({ success: false, message: errorMsg });
    }
};
