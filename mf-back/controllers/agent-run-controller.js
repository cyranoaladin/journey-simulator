const AgentRun = require('../models/agent-run');
const mongoose = require('mongoose');

exports.getAgentRuns = async (req, res) => {
    try {
        const { journeyId, stepId, agentName, status, page = 1, limit = 20 } = req.query;
        
        const query = {};
        if (journeyId) query.journeyId = journeyId;
        if (stepId) query.stepId = stepId;
        if (agentName) query.agentName = agentName;
        if (status) query.status = status;

        const skip = (page - 1) * limit;
        
        const runs = await AgentRun.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number.parseInt(limit, 10))
            .select('-input -output'); // Hide potentially sensitive data in list view

        const total = await AgentRun.countDocuments(query);

        res.status(200).json({
            success: true,
            data: runs,
            pagination: {
                page: Number.parseInt(page, 10),
                limit: Number.parseInt(limit, 10),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAgentRunDetails = async (req, res) => {
    try {
        const run = await AgentRun.findById(req.params.id);
        if (!run) return res.status(404).json({ success: false, message: 'Run not found' });
        
        // In a real scenario, check ownership here (req.user.id vs run.userId)
        
        res.status(200).json({ success: true, data: run });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getHealth = async (req, res) => {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.status(200).json({
        status: 'ok',
        mongo: mongoStatus,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
};
