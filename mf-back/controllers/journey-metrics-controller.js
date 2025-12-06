const metricsService = require('../services/journey-metrics-service');

async function getGlobalMetrics(req, res) {
    try {
        const metrics = await metricsService.getGlobalMetrics();
        res.json({
            success: true,
            data: metrics
        });
    } catch (error) {
        console.error('Error fetching global metrics:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch global metrics' });
    }
}

async function getJourneyMetrics(req, res) {
    try {
        const { id } = req.params;
        const metrics = await metricsService.getJourneyMetrics(id);

        if (!metrics) {
            return res.status(404).json({ success: false, error: 'Journey not found' });
        }

        res.json({
            success: true,
            data: metrics
        });
    } catch (error) {
        console.error(`Error fetching metrics for journey ${req.params.id}:`, error);
        res.status(500).json({ success: false, error: 'Failed to fetch journey metrics' });
    }
}

module.exports = {
    getGlobalMetrics,
    getJourneyMetrics
};
