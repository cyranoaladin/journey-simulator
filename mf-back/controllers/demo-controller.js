const User = require('../models/user');

/**
 * GET /demo/state
 * Returns demo state for the current user or a default demo state
 */
exports.getDemoState = async (req, res) => {
    try {
        // If user is authenticated, return their progress
        if (req.user) {
            const user = await User.findById(req.user.id).select('-password');
            if (user && user.progress) {
                return res.status(200).json({
                    success: true,
                    demoState: {
                        userId: user._id,
                        persona: user.persona || 'investor',
                        progress: user.progress,
                        completedPhases: user.progress?.completedPhases || [],
                        currentPhase: user.progress?.currentPhase || null,
                        tokens: user.tokens || 0,
                        xp: user.xp || 0
                    }
                });
            }
        }

        // Return default demo state for unauthenticated users
        return res.status(200).json({
            success: true,
            demoState: {
                persona: 'investor',
                progress: {
                    completedPhases: [],
                    currentPhase: null
                },
                completedPhases: [],
                currentPhase: null,
                tokens: 0,
                xp: 0
            }
        });
    } catch (error) {
        console.error('Error fetching demo state:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch demo state',
            error: error.message
        });
    }
};

/**
 * POST /demo/save
 * Saves demo state for authenticated users
 */
exports.saveDemoState = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const { progress, tokens, xp } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update user progress
        if (progress) user.progress = progress;
        if (tokens !== undefined) user.tokens = tokens;
        if (xp !== undefined) user.xp = xp;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Demo state saved successfully',
            demoState: {
                userId: user._id,
                persona: user.persona,
                progress: user.progress,
                tokens: user.tokens,
                xp: user.xp
            }
        });
    } catch (error) {
        console.error('Error saving demo state:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save demo state',
            error: error.message
        });
    }
};

module.exports = exports;
