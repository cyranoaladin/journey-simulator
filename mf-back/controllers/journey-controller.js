const Journey = require('../models/Journeys');
const User = require('../models/user');
const mongoose = require('mongoose');

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
        const { phase_number, score, nft_address, xp_reward, mfai_reward } = req.body;

        // Create the new certificate object
        const newCertificate = {
            phase_number,
            completion_date: new Date(),
            score: score || 0,
            nft_address: nft_address || "0x...", // Placeholder if not provided
            xp_earned: xp_reward || 0 // Store the XP earned for this specific phase
        };

        // Prepare the update object
        const update = {
            $inc: {
                completed_phases: 1,
                total_xp: xp_reward || 0 // Increment total XP
            },
            $push: {
                nft_certificates: newCertificate
            }
        };

        // If there is an MFAI reward, increment the token balance
        if (mfai_reward) {
            update.$inc["token_transactions.mfai_tokens"] = mfai_reward;
            update.$set = { "token_transactions.last_updated": new Date() };
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            update,
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
            language: language || 'en',
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

        const userId = req.user ? req.user.id : new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'); // Demo/anonymous user ID

        // Validate required fields
        if (!missionId || !submission || !trackId || !phaseId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: missionId, submission, trackId, phaseId'
            });
        }

        const AgentFactory = require('../agents/AgentFactory');
        const MissionSubmission = require('../models/MissionSubmission');
        const User = require('../models/user');
        const ZynoAgent = require('../agents/ZynoAgent');

        // 1. Select and run evaluation agent
        const agent = AgentFactory.getAgentForContext({ trackId, phaseId, missionId });
        console.log(`[Submit] Selected agent ${agent.name} for mission ${missionId}`);

        const ctx = {
            userId: userId.toString(),
            journeyId,
            phaseId,
            trackId,
            missionId,
            submission,
            lastInput: submission
        };

        const result = await agent.run(ctx);
        const evaluation = result.payload;

        // 2. Calculate rewards
        const globalScore = evaluation.global_score || 0;
        const xpDelta = Math.floor(globalScore * 10); // Score 0-10 → XP 0-100
        const nftEligible = globalScore >= 8.0; // Threshold for NFT eligibility

        console.log(`[Submit] Score: ${globalScore}/10, XP: ${xpDelta}, NFT Eligible: ${nftEligible}`);

        // 3. Persist submission to database
        const submissionRecord = await MissionSubmission.create({
            userId,
            journeyId,
            missionId,
            trackId,
            phaseId,
            submission,
            inputType: inputType || 'text',
            agentName: agent.name,
            globalScore: globalScore,
            feedback: evaluation.feedback || 'No feedback available', // Ensure feedback is never empty
            axes: evaluation.axes || [],
            xpAwarded: xpDelta,
            nftEligible: nftEligible,
            evaluatedAt: new Date(),
            llmModel: result.metadata?.model || 'gpt-4o',
            llmTokensUsed: result.metadata?.tokens_used || 0,
            llmReasoningEffort: result.metadata?.reasoning_effort || 'medium'
        });

        console.log(`[Submit] Submission saved with ID: ${submissionRecord._id}`);

        // 4. Update user progress
        if (req.user) {
            await User.findByIdAndUpdate(userId, {
                $inc: { total_xp: xpDelta }
            });
            console.log(`[Submit] User XP updated: +${xpDelta}`);
        }

        // 5. Prepare NFT result if eligible
        let nftResult = null;
        if (nftEligible) {
            nftResult = {
                eligible: true,
                message: `Congratulations! You scored ${globalScore}/10 and earned a Proof-of-Skill™ NFT`,
                missionId,
                score: globalScore,
                certification: {
                    name: `${phaseId} - ${missionId}`,
                    description: `Completed ${missionId} with score ${globalScore}/10`,
                    rarity: globalScore >= 9.5 ? 'legendary' : globalScore >= 9.0 ? 'epic' : 'rare'
                }
            };
        }

        // 6. Generate next step with Zyno (includes evaluation_block)
        const zyno = new ZynoAgent();
        const nextStepCtx = {
            userId,
            journeyId,
            phaseId,
            trackId,
            language: 'en',
            userProfile: {
                persona: trackId,
                mode: 'builder', // Could be passed from request
                tone: 'pedagogical'
            },
            lastInput: `Mission ${missionId} completed with score ${globalScore}/10`,
            journeyState: {
                last_evaluation: {
                    mission_id: missionId,
                    score: globalScore,
                    feedback: evaluation.feedback,
                    axes: evaluation.axes,
                    xp_awarded: xpDelta,
                    nft_eligible: nftEligible
                },
                completed_missions: [missionId]
            }
        };

        let nextStep = null;
        try {
            const zynoResult = await zyno.run(nextStepCtx);
            nextStep = zynoResult.payload;

            // Ensure evaluation feedback is shown
            if (nextStep && nextStep.ui_blocks) {
                const feedbackBlocks = [
                    {
                        id: `eval-${Date.now()}`,
                        kind: 'evaluation_block', // Using 'kind' to match schema, though 'type' is also used
                        title: 'Mission Evaluation',
                        global_score: globalScore,
                        max_score: 10,
                        feedback: evaluation.feedback,
                        axes: evaluation.axes
                    },
                    {
                        id: `xp-${Date.now()}`,
                        kind: 'xp_block',
                        title: 'XP Gained',
                        current_xp: (req.user ? req.user.total_xp : 0) + xpDelta,
                        next_level_xp: 1000, // simplistic
                        gained_xp: xpDelta,
                        message: `You gained ${xpDelta} XP!`
                    }
                ];
                // Prepend feedback blocks
                console.log('[Submit] Injecting feedback blocks into nextStep');
                nextStep.ui_blocks = [...feedbackBlocks, ...nextStep.ui_blocks];

                // Ensure ALL blocks have unique IDs
                nextStep.ui_blocks = nextStep.ui_blocks.map((block, index) => ({
                    ...block,
                    id: block.id || `block-${Date.now()}-${index}`
                }));
            }
        } catch (zynoError) {
            console.error('[Submit] Zyno next step generation failed:', zynoError);
            // Fallback: create minimal next step
            nextStep = {
                metadata: {
                    mode: 'builder',
                    tone: 'pedagogical',
                    phase: phaseId,
                    track: trackId,
                    language: 'en',
                    timestamp: new Date().toISOString()
                },
                ui_blocks: [
                    {
                        id: `fallback-eval-${Date.now()}`,
                        type: 'evaluation_block',
                        title: 'Mission Evaluation',
                        global_score: globalScore,
                        feedback: evaluation.feedback,
                        axes: evaluation.axes
                    },
                    {
                        id: `fallback-xp-${Date.now()}`,
                        type: 'xp_block',
                        xp_gained: xpDelta,
                        message: `You gained ${xpDelta} XP!`
                    }
                ],
                agent_actions: [],
                next_state: {
                    xp_delta: xpDelta,
                    completed_missions: [missionId]
                }
            };
        }

        // 7. Return comprehensive response
        res.status(200).json({
            success: true,
            submission_id: submissionRecord._id,
            evaluation: {
                global_score: globalScore,
                feedback: evaluation.feedback,
                axes: evaluation.axes
            },
            rewards: {
                xp_delta: xpDelta,
                nft_eligible: nftEligible,
                nft_result: nftResult
            },
            next_step: nextStep, // Full JourneyStepResponse
            metadata: {
                agent_used: agent.name,
                evaluated_at: submissionRecord.evaluatedAt,
                submission_id: submissionRecord._id
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

exports.loadDemoState = async (req, res) => {
    try {
        const { personaId } = req.body;

        let userId = req.user ? req.user.id : null;
        let user = null;

        // Handle anonymous/demo user creation
        if (!userId) {
            const demoId = '507f1f77bcf86cd799439011';
            user = await User.findById(demoId);

            if (!user) {
                console.log('[LoadDemo] Creating new demo user...');
                user = await User.create({
                    _id: demoId,
                    name: 'Demo User',
                    email: 'demo@moneyfactory.ai',
                    password: 'demo_password_123', // Will be hashed by pre-save hook
                    wallet_address: 'DEMO_WALLET_ADDRESS',
                    persona: personaId || 'capital-foundry',
                    role: 'user',
                    is_active: true,
                    subscription: 'free plan'
                });
            }
            userId = user._id;
        } else {
            user = await User.findById(userId);
        }

        if (!personaId) {
            return res.status(400).json({
                success: false,
                message: 'personaId is required'
            });
        }

        // Load demo state from JSON
        const fs = require('fs');
        const path = require('path');
        const demoPath = path.join(__dirname, '../data/demo-states', `${personaId}.json`);

        if (!fs.existsSync(demoPath)) {
            return res.status(404).json({
                success: false,
                message: `No demo state found for persona: ${personaId}`
            });
        }

        const demoState = JSON.parse(fs.readFileSync(demoPath, 'utf8'));

        // Create or update user's journey with demo state
        const Journey = require('../models/Journeys');
        const journey = await Journey.findOneAndUpdate(
            { user_id: userId, journey_type: personaId },
            {
                user_id: userId,
                journey_type: personaId,
                current_phase: demoState.current_phase_index,
                completion_percentage: (demoState.completed_phases.length / 5) * 100,
                phases_status: demoState.completed_phases.map(idx => ({
                    phase_number: idx,
                    status: 'completed',
                    completed_at: new Date()
                })),
                demo_mode: true,
                demo_loaded_at: new Date()
            },
            { upsert: true, new: true }
        );

        // Update user progress
        const updatedUser = await User.findByIdAndUpdate(userId, {
            total_xp: demoState.total_xp,
            current_level: demoState.current_level,
            completed_phases: demoState.completed_phases.length,
            persona: personaId,
            nft_certificates: demoState.nft_certificates || []
        }, { new: true }).select('-password');

        console.log(`[LoadDemo] Demo state loaded for ${personaId}, user ${userId}`);

        res.status(200).json({
            success: true,
            message: 'Demo state loaded successfully',
            journey,
            demo_state: demoState,
            progress: {
                total_xp: updatedUser.total_xp,
                current_level: updatedUser.current_level,
                completed_phases: updatedUser.completed_phases,
                nft_certificates: updatedUser.nft_certificates,
                token_transactions: updatedUser.token_transactions,
                subscription: updatedUser.subscription,
                persona: updatedUser.persona
            }
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
/**
 * Get Journey Schema
 * Exposes the structure of all available journeys dynamically
 */
exports.getJourneySchema = async (req, res) => {
  try {
    const schema = {
      personas: [
        {
          id: 'cognitive-activation-hub',
          name: 'Cognitive Activation Hub',
          description: 'Structured learning path for Web3 builders',
          phases: [
            { id: 'foundations', name: 'Solana Systems Lab', order: 1 },
            { id: 'tokenomics', name: 'Token Design Studio', order: 2 },
            { id: 'dao', name: 'DAO Architecture Lab', order: 3 }
          ]
        },
        {
          id: 'capital-foundry',
          name: 'Capital Foundry',
          description: 'Investor readiness and fundraising',
          phases: [
            { id: 'discovery', name: 'Protocol Discovery Sprint', order: 1 },
            { id: 'validation', name: 'Market Validation Lab', order: 2 },
            { id: 'pitch', name: 'Investor Pitch Studio', order: 3 }
          ]
        }
      ],
      agents: [
        { id: 'ZynoAgent', name: 'Zyno', role: 'Guide & Orchestrator' },
        { id: 'CoachAgent', name: 'Coach', role: 'Coaching & Guidance' },
        { id: 'BuilderAgent', name: 'Builder', role: 'Technical Architecture' },
        { id: 'GrowthAgent', name: 'Growth', role: 'Marketing & Growth' },
        { id: 'DAOAgent', name: 'DAO', role: 'Governance Design' },
        { id: 'TokenomicsAgent', name: 'Tokenomics', role: 'Token Economics' }
      ],
      metadata: {
        version: '1.0',
        lastUpdated: new Date().toISOString()
      }
    };

    res.status(200).json(schema);
  } catch (error) {
    console.error('Error fetching journey schema:', error);
    res.status(500).json({ error: 'Failed to fetch journey schema' });
  }
};
