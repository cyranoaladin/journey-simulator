const Journey = require('../models/Journeys');
const AgentRun = require('../models/agent-run');

/**
 * Get global metrics across all journeys
 */
async function getGlobalMetrics() {
    const [journeyStats] = await Journey.aggregate([
        {
            $group: {
                _id: null,
                totalJourneys: { $sum: 1 },
                byState: { $push: '$state' },
                completedCount: {
                    $sum: { $cond: [{ $eq: ['$state', 'COMPLETED'] }, 1, 0] }
                },
                avgCompletion: { $avg: '$completion_percentage' }
            }
        }
    ]) || [{}];

    // manual grouping for state map if needed, or use $group by state
    const stateDistribution = await Journey.aggregate([
        {
            $group: {
                _id: '$state',
                count: { $sum: 1 }
            }
        }
    ]);

    const journeysByState = stateDistribution.reduce((acc, curr) => {
        acc[curr._id || 'UNKNOWN'] = curr.count;
        return acc;
    }, {});

    // Agent Runs Global Stats
    const [agentStats] = await AgentRun.aggregate([
        {
            $group: {
                _id: null,
                totalRuns: { $sum: 1 },
                avgDuration: { $avg: '$durationMs' },
                successRate: {
                    $avg: { $cond: [{ $eq: ['$status', 'succeeded'] }, 1, 0] }
                }
            }
        }
    ]) || [{}];

    // Count Investor Demo Runs (unique journeys)
    const [demoStats] = await AgentRun.aggregate([
        { $match: { journeyMode: 'investor_demo' } },
        { $group: { _id: '$journeyId' } },
        { $count: 'uniqueDemoJourneys' }
    ]) || [];

    return {
        totalJourneys: journeyStats.totalJourneys || 0,
        completedJourneys: journeyStats.completedCount || 0,
        journeysByState,
        globalCompletionAvg: Math.round((journeyStats.avgCompletion || 0) * 100) / 100,
        investorDemoRuns: demoStats.uniqueDemoJourneys || 0,
        agentRuns: {
            total: agentStats.totalRuns || 0,
            avgDurationMs: Math.round(agentStats.avgDuration || 0),
            successRate: Math.round((agentStats.successRate || 0) * 100) / 100
        }
    };
}

/**
 * Get metrics for a specific journey
 * @param {string} journeyId 
 */
async function getJourneyMetrics(journeyId) {
    const journey = await Journey.findById(journeyId);
    if (!journey) return null;

    const [agentStats] = await AgentRun.aggregate([
        { $match: { journeyId } },
        {
            $group: {
                _id: null,
                totalRuns: { $sum: 1 },
                avgDuration: { $avg: '$durationMs' },
                lastRun: { $max: '$createdAt' }
            }
        }
    ]) || [{}];

    return {
        journeyId: journey._id,
        state: journey.state,
        currentStepId: journey.currentStepId,
        completionPercentage: journey.completion_percentage,
        startedAt: journey.start_date,
        lastActiveAt: journey.updatedAt,
        agentRuns: {
            count: agentStats.totalRuns || 0,
            avgDurationMs: Math.round(agentStats.avgDuration || 0),
            lastRunAt: agentStats.lastRun
        }
    };
}

module.exports = {
    getGlobalMetrics,
    getJourneyMetrics
};
