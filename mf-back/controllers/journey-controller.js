// Stub for demo mode route to fix test errors
exports.getJourneySchema = async (req, res) => {
    // MVP stub: return empty schema
    res.status(200).json({ success: true, schema: {} });
};

exports.getUserArtifacts = async (req, res) => {
    // MVP stub: return empty artifacts
    res.status(200).json({ success: true, artifacts: [] });
};
exports.loadDemoState = async (req, res) => {
    // For MVP, just return a static demo state
    res.status(200).json({
        success: true,
        demo: {}
    });
};
const Journey = require('../models/Journeys');
const User = require('../models/user');

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
                nft_certificates: user.nft_certificates,
                token_transactions: user.token_transactions,
                subscription: user.subscription,
                persona: user.persona
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

        const result = await agent.run(ctx);

        // Calculate XP delta (simple logic for MVP)
        const xpDelta = Math.floor((result.payload.global_score || 0) * 10); // Score / 10 * 100 ?? No, score is usually /10. So * 10 = 0-100 XP.

        res.status(200).json({
            evaluation: result.payload,
            next_state: {
                xp_delta: xpDelta,
                completed_missions: [missionId]
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