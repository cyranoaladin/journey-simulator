// Stub for demo mode route to fix test errors
const path = require('node:path');
const fs = require('fs/promises');

const Journey = require('../models/Journeys');
const User = require('../models/user');
const journeyStateService = require('../services/journey-state-service');
const JourneyService = require('../services/journeyService');
const { randomUUID } = require('node:crypto');

const DEMO_STATES_DIR = path.join(__dirname, '..', 'data', 'demo-states');
const SAFE_PERSONA_ID = /^[a-z0-9-]+$/i;
const DEMO_USER_ID = '507f1f77bcf86cd799439011'; // Demo user ID - never write to DB

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

// In-memory mint job simulation (stub for BullMQ)
const mintJobs = new Map();
const MINT_DELAY_MS = 2500;

exports.getJourneySchema = async (req, res) => {
    // MVP stub: return empty schema
    res.status(200).json({ success: true, schema: {} });
};

const getAnswerKey = () => {
    try {
        if (process.env.QUIZ_ANSWER_MAP) {
            const parsed = JSON.parse(process.env.QUIZ_ANSWER_MAP);
            if (parsed && typeof parsed === 'object') return parsed;
        }
    } catch (e) {
        console.warn('[API] QUIZ_ANSWER_MAP parse failed, using defaults');
    }
    return {
        default: ['A'],
        'phase-1': ['A'],
        'phase-2': ['B'],
    };
};

exports.verifyQuiz = async (req, res) => {
    try {
        const { answers = [], phaseId } = req.body || {};
        const answerMap = getAnswerKey();
        const answerKey = Array.isArray(answerMap?.[phaseId]) ? answerMap[phaseId] : (answerMap.default || []);
        const total = Math.max(answerKey.length, answers.length, 1);
        let correct = 0;
        answers.forEach((val, idx) => {
            if (String(val).trim().toLowerCase() === (answerKey[idx] || '').toLowerCase()) {
                correct += 1;
            }
        });
        const score = Math.round((correct / total) * 1000) / 10; // 0..100 with 0.1 precision
        const passThreshold = Number(process.env.QUIZ_PASS_THRESHOLD || 80);
        const pass = score >= passThreshold;

        const xpAwarded = pass ? 50 : 10;
        const mfaiAwarded = pass ? 10 : 0;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $inc: {
                    total_xp: xpAwarded,
                    'token_transactions.mfai_tokens': mfaiAwarded,
                },
                $set: {
                    last_activity: new Date(),
                },
            },
            { new: true }
        ).select('-password');

        console.log('[API] Quiz validé', { userId: req.user.id, phaseId, score, pass });

        if (!pass) {
            return res.status(400).json({
                success: false,
                score,
                pass,
                message: 'Quiz failed',
            });
        }

        return res.status(200).json({
            success: true,
            score,
            pass,
            xpAwarded,
            mfaiAwarded,
            phaseStatus: 'VALIDATED',
            progress: {
                totalXP: user?.total_xp ?? 0,
                mfaiTokens: user?.token_transactions?.mfai_tokens ?? 0,
            },
        });
    } catch (error) {
        console.error('[API] Quiz validation error', error);
        return res.status(500).json({ success: false, message: 'Quiz validation failed' });
    }
};

exports.requestMint = async (req, res) => {
    try {
        const { score = 0, phaseId, title = 'Phase Certificate' } = req.body || {};
        const normalizedScore = Number(score) > 10 ? Number(score) / 10 : Number(score);
        const MIN_SCORE = Number(process.env.MINT_MIN_SCORE || 8);
        if (normalizedScore < MIN_SCORE) {
            return res.status(403).json({ success: false, message: 'Score insufficient for mint' });
        }
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (!user.wallet_address) {
            return res.status(400).json({ success: false, message: 'Wallet address required' });
        }

        const jobId = randomUUID();
        mintJobs.set(jobId, { status: 'PENDING', userId: user.id, phaseId, createdAt: Date.now() });

        const processJob = async () => {
            const job = mintJobs.get(jobId);
            if (!job) return;
            job.status = 'COMPLETED';
            job.signature = randomUUID().replace(/-/g, '').slice(0, 32);
            job.mintAddress = randomUUID().replace(/-/g, '').slice(0, 32);
            mintJobs.set(jobId, job);
            try {
                await User.findByIdAndUpdate(
                    user.id,
                    {
                        $push: {
                            nft_certificates: {
                                phase: Number(phaseId) || 0,
                                nft_address: job.mintAddress,
                                mint_address: job.signature,
                                score,
                                title,
                                description: 'Certification minted (simulated)',
                                rarity: 'epic',
                                xp_earned: 0,
                            },
                        },
                        $set: { last_activity: new Date() },
                    },
                    { new: true }
                ).select('-password');
                console.log('[MockWorker] Minting NFT...', { jobId, userId: user.id, phaseId, signature: job.signature });
            } catch (e) {
                console.error('[MockWorker] Failed to update user after mint', e);
            }
        };

        if (process.env.NODE_ENV === 'test') {
            await processJob();
        } else {
            setTimeout(processJob, MINT_DELAY_MS);
        }

        console.log('[API] Mint request enqueued', { jobId, userId: user.id, phaseId });

        return res.status(202).json({
            success: true,
            jobId,
            status: 'PENDING',
        });
    } catch (error) {
        console.error('[API] Mint request error', error);
        return res.status(500).json({ success: false, message: 'Mint request failed' });
    }
};

exports.getMintStatus = async (req, res) => {
    try {
        const { jobId } = req.params || {};
        const job = mintJobs.get(jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }
        return res.status(200).json({
            success: true,
            status: job.status,
            signature: job.signature,
            mintAddress: job.mintAddress,
            phaseId: job.phaseId,
        });
    } catch (error) {
        console.error('[API] Mint status error', error);
        return res.status(500).json({ success: false, message: 'Mint status failed' });
    }
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

        // 🛡️ Security: Block demo user write to prevent DB corruption
        const isDemoUser = req.user?.id === DEMO_USER_ID;
        const authorizationHeader = req.headers.authorization || '';
        const token = authorizationHeader.startsWith('Bearer ') ? authorizationHeader.slice(7) : null;
        const hasDemoToken = token === 'demo-token';

        if (req.user?.id && !isDemoUser && !hasDemoToken) {
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

const buildPersonaContent = (trackId = '') => {
    const persona = (trackId || '').toLowerCase();
    if (persona.includes('capital') || persona === 'capital-foundry') {
        return {
            active_agents: [
                { id: 'agent-liquidity', role: 'Liquidity', name: 'Liquidity Architect', status: 'analyzing', bio: 'Designs pools and optimizes depth and incentives.' },
                { id: 'agent-risk', role: 'Risk', name: 'Risk Manager', status: 'analyzing', bio: 'Measures IL/volatility and sets guardrails.' },
            ],
            resources: [
                { kind: 'code', title: 'Rust Liquidity Pool Template', code: '// pool.rs\npub fn add_liquidity(...) { /* ... */ }', language: 'rust' },
                { kind: 'cheatsheet', title: 'Impermanent Loss Calculator', url: 'https://defillama.com/il-calculator', description: 'IL estimation for volatile pairs.' },
            ],
        };
    }
    if (persona.includes('impact') || persona === 'impact-engine') {
        return {
            active_agents: [
                { id: 'agent-governance', role: 'Governance', name: 'Governance Strategist', status: 'analyzing', bio: 'Designs governance, quorum, and voting rights.' },
                { id: 'agent-treasury', role: 'Finance', name: 'Treasury Auditor', status: 'analyzing', bio: 'Audits treasury, runway, and reconciliations.' },
            ],
            resources: [
                { kind: 'cheatsheet', title: 'DAO Bylaws Template', url: 'https://dao-template.example/charter', description: 'Charter template for tokenized governance.' },
                { kind: 'link', title: 'Realms Setup Guide', url: 'https://realms.today/guides', description: 'Step-by-step to configure a Realms DAO.' },
            ],
        };
    }
    return {
        active_agents: [
            { id: 'agent-security', role: 'Security', name: 'Security Sentinel', status: 'analyzing', bio: 'Scans vulnerabilities and threat surface.' },
            { id: 'agent-tokenomics', role: 'Economics', name: 'Tokenomics Expert', status: 'analyzing', bio: 'Optimizes distribution and economic balance.' },
        ],
        resources: [
            { kind: 'cheatsheet', title: 'Solana Token Standards Guide', url: 'https://solana.com/docs', description: 'SPL standards quick reference.' },
            { kind: 'code', title: 'Rust Program Template', code: '// entrypoint\npub fn process(...) { /* ... */ }', language: 'rust' },
        ],
    };
};

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

        // 🛡️ Security: Only trust req.user.id from authenticated middleware
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
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

        const personaId = trackId || ctx.userProfile?.persona;

        if (process.env.NODE_ENV === 'test') {
            const agent = new ZynoAgent();
            const result = await agent.run(ctx);
            const payload = result?.payload ?? result ?? { success: true };
            const personaContent = buildPersonaContent(personaId);
            payload.active_agents = payload.active_agents || personaContent.active_agents;
            payload.resources = payload.resources || personaContent.resources;
            return res.status(200).json(payload);
        }

        const result = await orchestrateZyno(userInput, ctx);
        const payload = result || {};
        const personaContent = buildPersonaContent(personaId);
        payload.active_agents = payload.active_agents || personaContent.active_agents;
        payload.resources = payload.resources || personaContent.resources;

        res.status(200).json(payload);

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
        const isDemoUser = req.user?.id === DEMO_USER_ID;

        let progressPayload;
        // 🛡️ Security: Block demo user write to prevent DB corruption
        if (!isDemoToken && !isDemoUser && req.user?.id) {
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
