/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

// DAO Configuration for Journey Simulator
// This defines the governance parameters and voter weights

module.exports = {
    // Quorum requirement (percentage of total voting power)
    quorumPercent: 30, // 30% of voting power required for valid proposal

    // Total voting power in the system
    totalVotingPower: 10000,

    // Predefined voters with their voting weights
    // In a real DAO, this would come from token holdings or NFT ownership
    voters: [
        {
            id: 'voter_1',
            name: 'Community Pool',
            weight: 3000,
            description: 'Represents the broader community'
        },
        {
            id: 'voter_2',
            name: 'Team',
            weight: 2000,
            description: 'Core team members'
        },
        {
            id: 'voter_3',
            name: 'Investors',
            weight: 2000,
            description: 'Early investors and backers'
        },
        {
            id: 'voter_4',
            name: 'Builders',
            weight: 1500,
            description: 'Active builders and contributors'
        },
        {
            id: 'voter_5',
            name: 'Educators',
            weight: 1500,
            description: 'Educational content creators'
        }
    ],

    // Proposal lifecycle settings
    proposalSettings: {
        minVotingPeriod: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        maxVotingPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        executionDelay: 2 * 24 * 60 * 60 * 1000 // 2 days delay after passing
    }
};
