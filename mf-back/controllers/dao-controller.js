const DaoProposal = require('../models/DaoProposal');
const daoConfig = require('../config/dao-config');

/**
 * Get DAO configuration
 */
exports.getConfig = async (req, res) => {
    try {
        res.json({
            quorumPercent: daoConfig.quorumPercent,
            totalVotingPower: daoConfig.totalVotingPower,
            voters: daoConfig.voters,
            proposalSettings: daoConfig.proposalSettings
        });
    } catch (error) {
        console.error('Get DAO config error:', error);
        res.status(500).json({ error: 'Failed to fetch DAO config' });
    }
};

/**
 * Get all proposals
 */
exports.getProposals = async (req, res) => {
    try {
        const { status } = req.query;

        const filter = {};
        if (status) {
            filter.status = status;
        }

        const proposals = await DaoProposal.find(filter).sort({ createdAt: -1 });

        const formattedProposals = proposals.map(p => ({
            id: p.proposalId,
            title: p.title,
            description: p.description,
            createdBy: p.createdBy,
            createdAt: p.createdAt.toISOString(),
            closedAt: p.closedAt?.toISOString(),
            status: p.status,
            votes: p.votes,
            voterDetails: p.voterDetails ? Object.fromEntries(p.voterDetails) : {},
            quorumMet: p.quorumMet,
            outcome: p.outcome
        }));

        res.json({ proposals: formattedProposals });
    } catch (error) {
        console.error('Get proposals error:', error);
        res.status(500).json({ error: 'Failed to fetch proposals' });
    }
};

/**
 * Create a new proposal
 */
exports.createProposal = async (req, res) => {
    try {
        // Check admin API key
        const apiKey = req.headers['x-api-key'];
        if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const { title, description, createdBy } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const proposalId = `prop_${Date.now()}`;

        const proposal = await DaoProposal.create({
            proposalId,
            title,
            description: description || '',
            createdBy: createdBy || 'anonymous'
        });

        console.log(`[DAO] Created proposal ${proposalId}: ${title}`);

        res.status(201).json({
            proposal: {
                id: proposal.proposalId,
                title: proposal.title,
                description: proposal.description,
                createdBy: proposal.createdBy,
                createdAt: proposal.createdAt.toISOString(),
                status: proposal.status,
                votes: proposal.votes,
                voterDetails: {},
                quorumMet: false
            }
        });
    } catch (error) {
        console.error('Create proposal error:', error);
        res.status(500).json({ error: 'Failed to create proposal' });
    }
};

/**
 * Cast a vote on a proposal
 */
exports.castVote = async (req, res) => {
    try {
        const { id } = req.params;
        const { voterId, support } = req.body;

        if (!voterId || support === undefined) {
            return res.status(400).json({ error: 'voterId and support are required' });
        }

        const proposal = await DaoProposal.findOne({ proposalId: id });

        if (!proposal) {
            console.error('Proposal not found for ID:', id);
            return res.status(404).json({ error: 'Proposal not found' });
        }

        if (proposal.status === 'closed') {
            return res.status(400).json({ error: 'Proposal is closed' });
        }

        // Find voter weight
        const voter = daoConfig.voters.find(v => v.id === voterId);
        if (!voter) {
            return res.status(400).json({ error: 'Voter not registered' });
        }

        // Normalize support to 'yes' or 'no'
        const normalizedSupport = (support === true || support === 'yes') ? 'yes' : 'no';

        // Check if already voted
        if (!proposal.voterDetails) {
            proposal.voterDetails = new Map();
        }
        const existingVote = proposal.voterDetails.get(voterId);
        if (existingVote) {
            return res.status(400).json({ error: 'Voter has already voted' });
        }

        // Add new vote
        if (normalizedSupport === 'yes') {
            proposal.votes.yes += voter.weight;
        } else {
            proposal.votes.no += voter.weight;
        }

        proposal.voterDetails.set(voterId, {
            support: normalizedSupport,
            weight: voter.weight,
            votedAt: new Date()
        });

        // Check quorum
        const totalVotes = proposal.votes.yes + proposal.votes.no;
        const quorumThreshold = (daoConfig.quorumPercent / 100) * daoConfig.totalVotingPower;
        proposal.quorumMet = totalVotes >= quorumThreshold;

        await proposal.save();

        console.log(`[DAO] Vote cast on ${id} by ${voterId}: ${normalizedSupport} (weight: ${voter.weight})`);
        console.log(`[DAO] Current votes - Yes: ${proposal.votes.yes}, No: ${proposal.votes.no}, Quorum: ${proposal.quorumMet}`);

        res.json({
            proposal: {
                id: proposal.proposalId,
                title: proposal.title,
                description: proposal.description,
                createdBy: proposal.createdBy,
                createdAt: proposal.createdAt.toISOString(),
                closedAt: proposal.closedAt?.toISOString(),
                status: proposal.status,
                votes: proposal.votes,
                voterDetails: proposal.voterDetails ? Object.fromEntries(proposal.voterDetails) : {},
                quorumMet: proposal.quorumMet,
                outcome: proposal.outcome
            }
        });
    } catch (error) {
        console.error('Vote casting error:', error);
        res.status(500).json({ error: 'Failed to cast vote' });
    }
};

/**
 * Close a proposal
 */
exports.closeProposal = async (req, res) => {
    try {
        // Check admin API key
        const apiKey = req.headers['x-api-key'];
        if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const { id } = req.params;

        const proposal = await DaoProposal.findOne({ proposalId: id });

        if (!proposal) {
            return res.status(404).json({ error: 'Proposal not found' });
        }

        if (proposal.status === 'closed') {
            return res.status(400).json({ error: 'Proposal is already closed' });
        }

        proposal.status = 'closed';
        proposal.closedAt = new Date();

        // Determine outcome
        if (!proposal.quorumMet) {
            proposal.outcome = 'failed_quorum';
        } else if (proposal.votes.yes > proposal.votes.no) {
            proposal.outcome = 'passed';
        } else {
            proposal.outcome = 'rejected';
        }

        await proposal.save();

        console.log(`[DAO] Proposal ${id} closed with outcome: ${proposal.outcome}`);

        res.json({
            proposal: {
                id: proposal.proposalId,
                title: proposal.title,
                description: proposal.description,
                createdBy: proposal.createdBy,
                createdAt: proposal.createdAt.toISOString(),
                closedAt: proposal.closedAt.toISOString(),
                status: proposal.status,
                votes: proposal.votes,
                voterDetails: proposal.voterDetails ? Object.fromEntries(proposal.voterDetails) : {},
                quorumMet: proposal.quorumMet,
                outcome: proposal.outcome
            }
        });
    } catch (error) {
        console.error('Close proposal error:', error);
        res.status(500).json({ error: 'Failed to close proposal' });
    }
};
