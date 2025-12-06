// Stub for demo mode route to fix test errors
const path = require('path');
const fs = require('fs/promises');

const Journey = require('../models/Journeys');
const User = require('../models/user');
const journeyStateService = require('../services/journey-state-service');
const { generateIdempotencyKey } = require('../utils/agent-idempotence');

const DEMO_STATES_DIR = path.join(__dirname, '..', 'data', 'demo-states');
const SAFE_PERSONA_ID = /^[a-z0-9-]+$/i;

const normalizePersonaId = (candidate) => {
    if (typeof candidate !== 'string') {
        return null;
    }

    const trimmed = candidate.trim().toLowerCase();
    return SAFE_PERSONA_ID.test(trimmed) ? trimmed : null;
};

const mapCompletedPhases = (rawPhases) => {
    if (!Array.isArray(rawPhases)) {
        return [];
    }

    return rawPhases
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value >= 0)
        .sort((a, b) => a - b);
};

const inferTokenBalance = (demoState) => {
    if (typeof demoState?.mfai_tokens === 'number') {
        return demoState.mfai_tokens;
    }

    if (typeof demoState?.token_transactions?.mfai_tokens === 'number') {
        return demoState.token_transactions.mfai_tokens;
    }

    const xp = Number(demoState?.total_xp) || 0;
    return Math.max(0, Math.floor(xp / 10));
};

const buildDemoModeState = (personaId, completedPhaseIndexes) => ({
    enabled: true,
    persona_id: personaId,
    last_loaded_at: new Date(),
    completed_phase_indexes: completedPhaseIndexes,
});

const getDisabledDemoModeState = () => ({
    enabled: false,
    persona_id: null,
    last_loaded_at: null,
    completed_phase_indexes: [],
});

exports.getJourneySchema = async (req, res) => {
    // MVP stub: return empty schema
    res.status(200).json({ success: true, schema: {} });
};

exports.getUserArtifacts = async (req, res) => {
    // MVP stub: return empty artifacts
    res.status(200).json({ success: true, artifacts: [] });
};

exports.loadDemoState = async (req, res) => {
    try {
        const personaId = normalizePersonaId(req.body?.personaId || req.body?.persona || req.body?.id);

        if (!personaId) {
            return res.status(400).json({
                success: false,
                message: 'Missing or invalid personaId'
            });
        }

        const filePath = path.join(DEMO_STATES_DIR, `${personaId}.json`);

        if (!filePath.startsWith(DEMO_STATES_DIR)) {
            return res.status(400).json({
                success: false,
                message: 'Persona path is not permitted'
            });
        }

        let rawState;
        try {
            rawState = await fs.readFile(filePath, 'utf8');
        } catch (error) {
            if (error.code === 'ENOENT') {
                return res.status(404).json({
                    success: false,
                    message: `No demo state found for persona: ${personaId}`
                });
            }
            throw error;
        }

        let demoState;
        try {
            demoState = JSON.parse(rawState);
        } catch (parseError) {
            console.error('Failed to parse demo state file:', parseError);
            return res.status(500).json({
                success: false,
                message: 'Demo state file is corrupted'
            });
        }

        const completedPhaseIndexes = mapCompletedPhases(demoState.completed_phases);

        const demoModeState = buildDemoModeState(personaId, completedPhaseIndexes);

        const progressPayload = {
            persona: demoState.persona_id || personaId,
            total_xp: Number(demoState.total_xp) || 0,
            current_level: Number(demoState.current_level) || 0,
            completed_phases: completedPhaseIndexes.length,
            completed_phase_indexes: completedPhaseIndexes,
            nft_certificates: Array.isArray(demoState.nft_certificates) ? demoState.nft_certificates : [],
            token_transactions: {
                mfai_tokens: inferTokenBalance(demoState),
                last_updated: new Date()
            },
            demo_mode: demoModeState
        };

        if (req.user?.id) {
            await User.findByIdAndUpdate(
                req.user.id,
                {
                    total_xp: progressPayload.total_xp,
                    current_level: progressPayload.current_level,
                    completed_phases: progressPayload.completed_phases,
                    persona: progressPayload.persona,
                    nft_certificates: progressPayload.nft_certificates,
                    token_transactions: progressPayload.token_transactions,
                    demo_mode: demoModeState
                },
                { new: true }
            ).select('-password');
        }

        return res.status(200).json({
            success: true,
            persona: personaId,
            progress: progressPayload,
            demo_state: demoState
        });
    } catch (error) {
        console.error('Load demo state error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load demo state',
            error: error.message
        });
    }
};

exports.createJourney = async (req, res) => {
    try {
        const {
            user_wallet,
            journey_type,
            start_date,
            current_phase,
            completion_percentage,
            phases_status } = req.body;

        const journey = new Journey({
            user_id: req.user.id,
            user_wallet,
            journey_type,
            start_date,
            current_phase,
            completion_percentage,
            phases_status
        });

        await journey.save();
        res.status(201).json({
            success: true,
            journey
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to create journey',
            error: error.message
        });
    }
};

exports.getJourney = async (req, res) => {
    try {
        const journey = await Journey.findById(req.params.id);
        res.status(200).json(journey);
    } catch (error) {
        res.status(400).json({ success: false, message: error });
    }

};

exports.getAllJourney = async (req, res) => {
    try {
        const journeys = await Journey.find().populate('user_id', 'name email');
        res.status(200).json({
            success: true,
            journeys
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to fetch journeys',
            error: error.message
        });
    }
};

exports.getUserJourneys = async (req, res) => {
    try {
        const journeys = await Journey.find({ user_id: req.user.id });
        res.status(200).json({
            success: true,
            journeys
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to fetch user journeys',
            error: error.message
        });
    }
};

exports.getUserProgress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            progress: {
                total_xp: user.total_xp,
                current_level: user.current_level,
                completed_phases: user.completed_phases,
                completed_phase_indexes: Array.isArray(user.demo_mode?.completed_phase_indexes)
                    ? user.demo_mode.completed_phase_indexes
                    : [],
                nft_certificates: user.nft_certificates,
                token_transactions: user.token_transactions,
                subscription: user.subscription,
                persona: user.persona,
                demo_mode: user.demo_mode || getDisabledDemoModeState()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user progress',
            error: error.message
        });
    }
};

exports.updateUserProgress = async (req, res) => {
    try {
        const { total_xp, current_level, completed_phases } = req.body;

        const updateData = {};
        if (total_xp !== undefined) updateData.total_xp = total_xp;
        if (current_level !== undefined) updateData.current_level = current_level;
        if (completed_phases !== undefined) updateData.completed_phases = completed_phases;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Progress updated successfully',
            progress: {
                total_xp: user.total_xp,
                current_level: user.current_level,
                completed_phases: user.completed_phases
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update progress',
            error: error.message
        });
    }
};

exports.resetUserProgress = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                total_xp: 0,
                current_level: 0,
                completed_phases: 0,
                nft_certificates: [],
                token_transactions: {
                    mfai_tokens: 0,
                    last_updated: new Date()
                },
                demo_mode: getDisabledDemoModeState()
            },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Progress reset successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to reset progress',
            error: error.message
        });
    }
};

exports.completePhase = async (req, res) => {
    try {
        const { phase_number, score, nft_address } = req.body;

        // Update user progress
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $inc: { completed_phases: 1, total_xp: 100 },
                $push: {
                    nft_certificates: {
                        phase: phase_number,
                        nft_address: nft_address || '',
                        score: score || 0,
                        mint_date: new Date(),
                        title: req.body.title,
                        description: req.body.description,
                        image_url: req.body.image_url,
                        rarity: req.body.rarity,
                        xp_earned: req.body.xp_reward
                    }
                },
                $set: {
                    demo_mode: getDisabledDemoModeState()
                }
            },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Phase completed successfully',
            progress: {
                completed_phases: user.completed_phases,
                nft_certificates: user.nft_certificates
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to complete phase',
            error: error.message
        });
    }
};

exports.updateJourney = async (req, res) => {
    const {
        user_id,
        user_wallet,
        journey_type,
        start_date,
        current_phase,
        completion_percentage,
        phases_status } = req.body;
    const journey = await Journey.findByIdAndUpdate(req.params.id, {
        user_id,
        user_wallet,
        journey_type,
        start_date,
        current_phase,
        completion_percentage,
        phases_status
    }, { new: true });
    try {
        res.status(200).json(journey);
    } catch (error) {
        res.status(400).json({ success: false, message: error });
    }
};

exports.deleteJourney = async (req, res) => {
    try {
        await Journey.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Journey deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error });
    }

};

// --- AI / Zyno Integration ---

const ZynoAgent = require('../agents/ZynoAgent');
const TokenomicsAgent = require('../agents/TokenomicsAgent');
// const GrowthAgent = require('../agents/GrowthAgent'); // Future use

exports.step = async (req, res) => {
    try {
        const { journeyId } = req.params;
        const {
            userInput,
            phaseId,
            trackId,
            language,
            journeyState,
            mode, // discovery, builder, expert
            tone  // pedagogical, investor_pitch
        } = req.body;

        const resolvedMode = mode || 'discovery';
        const resolvedTone = tone || 'pedagogical';
        const resolvedJourneyState = journeyState || {};

        // In a real app, we might fetch the journey from DB to verify ownership/state
        // const journey = await Journey.findById(journeyId);

        const zyno = new ZynoAgent();
        const ctx = {
            userId: req.user ? req.user.id : 'anonymous',
            journeyId,
            phaseId,
            trackId,
            language: language || 'fr',
            userProfile: {
                persona: trackId, // simplistic mapping for now
                mode: resolvedMode,
                tone: resolvedTone
            },
            lastInput: userInput,
            journeyState: resolvedJourneyState
        };

        const result = await zyno.run(ctx);

        // Here we could save the agent logs to DB

        res.status(200).json(result.payload);

    } catch (error) {
        console.error('Zyno Step Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process journey step',
            error: error.message
        });
    }
};

exports.submit = async (req, res) => {
    try {
        const { journeyId } = req.params;
        const {
            missionId,
            submission,
            inputType,
            trackId,
            phaseId
        } = req.body;

        const AgentFactory = require('../agents/AgentFactory');

        // Use AgentFactory to select the best agent for this submission
        const agent = AgentFactory.getAgentForContext({ trackId, phaseId, missionId });
        console.log(`[Submit] Selected agent ${agent.name} for track ${trackId}, phase ${phaseId}`);

        const ctx = {
            userId: req.user ? req.user.id : 'anonymous',
            journeyId,
            phaseId,
            trackId,
            submission,
            lastInput: submission // for generic prompt
        };

        // Idempotency: generate key based on input content to allow retries on different input, 
        // but prevent double-processing of identical submission.
        const idempotencyKey = generateIdempotencyKey(journeyId, phaseId, agent.name, { submission });
        
        const result = await agent.run(ctx, { idempotencyKey });

        // Calculate XP delta (simple logic for MVP)
        const xpDelta = Math.floor((result.payload.global_score || 0) * 10); // Score / 10 * 100 ?? No, score is usually /10. So * 10 = 0-100 XP.

        // Sync Journey State Machine
        try {
            // Find active journey for user (assuming single active journey for MVP)
            const journey = await Journey.findOne({ user_id: req.user.id }).sort({ start_date: -1 });
            
            if (journey) {
                // If we are completing phase_number (e.g. 1), we move to 2.
                // Current step should theoretically be phase-1.
                const currentPhaseStep = `phase-${phase_number}`;
                const nextPhaseStep = `phase-${phase_number + 1}`;
                
                // Only advance if we are at the expected step (or rely on service check)
                if (journey.currentStepId === currentPhaseStep) {
                    await journeyStateService.advanceJourneyStep({
                        journeyId: journey._id,
                        fromStepId: currentPhaseStep,
                        toStepId: nextPhaseStep,
                        trigger: 'PHASE_COMPLETION'
                    });
                } else {
                    // Force update if out of sync (self-healing for legacy data)
                    journey.currentStepId = nextPhaseStep;
                    journey.current_phase = phase_number + 1;
                    await journey.save();
                }
            }
        } catch (stateError) {
            console.warn('Failed to sync journey state:', stateError.message);
            // Don't fail the request, as User model is the primary source for frontend
        }

        res.status(200).json({
            success: true,
            message: 'Phase completed successfully',
            progress: {
                completed_phases: user.completed_phases,
                nft_certificates: user.nft_certificates
            }
        });
    } catch (error) {
        console.error('Submission Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process submission',
            error: error.message
        });
    }
};
