const DaoProposal = require('../models/DaoProposal');
const daoConfig = require('../config/dao-config');

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

exports.getProposals = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) filter.status = status;

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

exports.createProposal = async (req, res) => {
    try {
        const apiKey = req.headers['x-api-key'];
        if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const { title, description, createdBy } = req.body;
        if (!title) return res.status(400).json({ error: 'Title is required' });

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

exports.castVote = async (req, res) => {
    try {
        const { id } = req.params;
        const { voterId, support } = req.body;

        if (!voterId || support === undefined) {
            return res.status(400).json({ error: 'voterId and support are required' });
        }

        const proposal = await DaoProposal.findOne({ proposalId: id });

        if (!proposal) {
            // FIX: Use single string for console.warn to satisfy strict tests
            console.warn(`Proposal not found for ID: ${id}`);
            return res.status(404).json({ error: 'Proposal not found', id });
        }

        if (proposal.status === 'closed') {
            return res.status(400).json({ error: 'Proposal is closed' });
        }

        const voter = daoConfig.voters.find(v => v.id === voterId);
        if (!voter) return res.status(400).json({ error: 'Voter not registered' });

        const normalizedSupport = (support === true || support === 'yes') ? 'yes' : 'no';

        if (!proposal.voterDetails) proposal.voterDetails = new Map();
        if (proposal.voterDetails.get(voterId)) {
            return res.status(400).json({ error: 'Voter has already voted' });
        }

        if (normalizedSupport === 'yes') proposal.votes.yes += voter.weight;
        else proposal.votes.no += voter.weight;

        proposal.voterDetails.set(voterId, {
            support: normalizedSupport,
            weight: voter.weight,
            votedAt: new Date()
        });

        const totalVotes = proposal.votes.yes + proposal.votes.no;
        const quorumThreshold = (daoConfig.quorumPercent / 100) * daoConfig.totalVotingPower;
        proposal.quorumMet = totalVotes >= quorumThreshold;

        await proposal.save();

        console.log(`[DAO] Vote cast on ${id} by ${voterId}: ${normalizedSupport}`);

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

exports.closeProposal = async (req, res) => {
    try {
        const apiKey = req.headers['x-api-key'];
        if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const { id } = req.params;
        const proposal = await DaoProposal.findOne({ proposalId: id });

        if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
        if (proposal.status === 'closed') return res.status(400).json({ error: 'Proposal is already closed' });

        proposal.status = 'closed';
        proposal.closedAt = new Date();

        if (!proposal.quorumMet) proposal.outcome = 'failed_quorum';
        else if (proposal.votes.yes > proposal.votes.no) proposal.outcome = 'passed';
        else proposal.outcome = 'rejected';

        await proposal.save();
        console.log(`[DAO] Proposal ${id} closed: ${proposal.outcome}`);

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
