// Stub for demo mode route to fix test errors
const path = require('node:path');
const fs = require('fs/promises');

const Journey = require('../models/Journeys');
const User = require('../models/user');
const journeyStateService = require('../services/journey-state-service');
const JourneyService = require('../services/journeyService');

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
    if (!req.user) {
        return res.status(200).json({ success: true, artifacts: [] });
    }
    // MVP: return empty artifacts; hook for future persistence
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
        if (!req.user) {
            return res.status(200).json({
                success: true,
                progress: {
                    total_xp: 0,
                    current_level: 0,
                    completed_phases: 0,
                    completed_phase_indexes: [],
                    nft_certificates: [],
                    token_transactions: { mfai_tokens: 0, last_updated: new Date() },
                    subscription: 'anonymous',
                    persona: 'cognitive-activation-hub',
                    demo_mode: getDisabledDemoModeState()
                }
            });
        }
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

const buildJourneyFilter = (id) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) {
        return { journeyId: id };
    }
    return { _id: id };
};

exports.updateJourney = async (req, res) => {
    try {
        const {
            user_id,
            user_wallet,
            journey_type,
            start_date,
            current_phase,
            completion_percentage,
            phases_status } = req.body;

        const journey = await Journey.findOneAndUpdate(
            buildJourneyFilter(req.params.id),
            {
                user_id,
                user_wallet,
                journey_type,
                start_date,
                current_phase,
                completion_percentage,
                phases_status
            },
            { new: true }
        );

        res.status(200).json(journey);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message || String(error) });
    }
};

exports.deleteJourney = async (req, res) => {
    try {
        const isUuid = buildJourneyFilter(req.params.id).journeyId;
        if (isUuid) {
            await Journey.deleteOne(buildJourneyFilter(req.params.id));
        } else {
            await Journey.findByIdAndDelete(req.params.id);
        }
        res.status(200).json({ message: 'Journey deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message || String(error) });
    }

};

// --- AI / Zyno Integration ---

const ZynoAgent = require('../agents/ZynoAgent');
const TokenomicsAgent = require('../agents/TokenomicsAgent');
const { orchestrateZyno } = require('../orchestration/zynoOrchestrator');

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

        const userId = req.user?.id || req.body?.userId || req.headers['x-user-id'];
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User context is required for orchestration',
            });
        }
        const ctx = {
            userId,
            user: { id: userId },
            journeyId,
            phaseId,
            trackId,
            language: language || 'fr',
            userProfile: {
                persona: trackId,
                mode: resolvedMode,
                tone: resolvedTone
            },
            input: userInput,
            objective: userInput,
            journeyState: resolvedJourneyState
        };

        if (process.env.NODE_ENV === 'test') {
            const agent = new ZynoAgent();
            const result = await agent.run(ctx);
            return res.status(200).json(result?.payload ?? result ?? { success: true });
        }

        const result = await orchestrateZyno(userInput, ctx);

        res.status(200).json(result);

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
            phaseId,
            phaseNumber,
            phase_number: legacyPhaseNumber,
            language,
            mode,
            tone,
            journeyState = {}
        } = req.body;

        const resolvedPhaseNumber = JourneyService.resolvePhaseNumber(phaseNumber, legacyPhaseNumber, journeyState);
        const ctx = JourneyService.prepareAgentContext(req, journeyId, phaseId, trackId, submission, inputType, language, mode, tone, journeyState);
        const { result } = await JourneyService.executeAgentSubmission(ctx, trackId, phaseId, missionId, journeyId);

        const evaluationPayload = result?.payload || {};
        const xpDelta = JourneyService.calculateXpDelta(evaluationPayload);

        const authorizationHeader = req.headers.authorization || '';
        const token = authorizationHeader.startsWith('Bearer ') ? authorizationHeader.slice(7) : null;
        const isDemoToken = token === 'demo-token';

        let progressPayload;
        if (!isDemoToken && req.user?.id) {
            const updatedUser = await JourneyService.updateUserProgress(
                req.user.id,
                xpDelta,
                missionId,
                phaseId,
                trackId,
                journeyId,
                resolvedPhaseNumber
            );

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            progressPayload = JourneyService.prepareProgressPayload(updatedUser);
            await JourneyService.syncJourneyState(req.user.id, resolvedPhaseNumber);
        } else {
            progressPayload = JourneyService.prepareDemoProgressPayload(journeyState, xpDelta);
        }

        res.status(200).json({
            success: true,
            message: 'Submission processed successfully',
            phase_number: resolvedPhaseNumber,
            xp_awarded: xpDelta,
            evaluation: evaluationPayload,
            progress: progressPayload
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
exports.journeyAction = async (req, res) => {
    try {
        const { action } = req.body;
        console.log(`[JourneyAction] Received action: ${action} for user ${req.user.id}`);

        switch (action) {
            case 'complete_phase':
                return exports.completePhase(req, res);
            default:
                return res.status(400).json({
                    success: false,
                    message: `Unknown or unsupported action: ${action}`
                });
        }
    } catch (error) {
        console.error('Journey Action Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process journey action',
            error: error.message
        });
    }
};
