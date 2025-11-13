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
                $inc: { completed_phases: 1 },
                $push: {
                    nft_certificates: {
                        phase: phase_number,
                        nft_address: nft_address || '',
                        score: score || 0,
                        mint_date: new Date()
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