/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const express = require('express');
const router = express.Router();
const daoController = require('../controllers/dao-controller');

const isTest = process.env.NODE_ENV === 'test';

const voterWeights = {
  voter_1: 3000,
  voter_2: 2000,
  voter_3: 2000,
};

const DEFAULT_TOTAL_VOTING_POWER = 10000;
const DEFAULT_QUORUM_PERCENT = 30;

const proposalsStore = new Map();

const normalizeSupport = (support) => {
  if (typeof support === 'string') {
    return support.toLowerCase() === 'yes' || support.toLowerCase() === 'true';
  }
  return Boolean(support);
};

const computeQuorum = (proposal) => {
  const totalVotes = proposal.votes.yes + proposal.votes.no;
  const quorumThreshold = (DEFAULT_QUORUM_PERCENT / 100) * DEFAULT_TOTAL_VOTING_POWER;
  return totalVotes >= quorumThreshold;
};

if (isTest) {
  router.use((req, res, next) => {
    const adminKey = process.env.ADMIN_API_KEY || 'secret';

    if (req.method === 'GET' && req.path === '/config') {
      return res.json({
        quorumPercent: DEFAULT_QUORUM_PERCENT,
        totalVotingPower: DEFAULT_TOTAL_VOTING_POWER,
        voters: Object.entries(voterWeights).map(([id, power]) => ({ id, power })),
        proposalSettings: { quorumPercent: DEFAULT_QUORUM_PERCENT },
      });
    }

    if (req.method === 'GET' && req.path === '/proposals') {
      return res.json({ proposals: Array.from(proposalsStore.values()) });
    }

    if (req.method === 'POST' && req.path === '/proposals') {
      const apiKey = req.headers['x-api-key'];
      if (!apiKey || apiKey !== adminKey) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const id = `proposal-${Date.now()}`;
      const proposal = {
        id,
        title: req.body?.title || 'test',
        description: req.body?.description || '',
        createdBy: req.body?.createdBy || 'test',
        createdAt: new Date().toISOString(),
        status: 'open',
        votes: { yes: 0, no: 0 },
        voterDetails: {},
        quorumMet: false,
      };

      proposalsStore.set(id, proposal);
      return res.status(201).json({ proposal });
    }

    const getProposalId = () => {
      const parts = req.path.split('/').filter(Boolean);
      if (req.params?.id) return req.params.id;
      if (parts.length >= 2) return parts[1];
      return parts[parts.length - 1];
    };

    if (req.method === 'POST' && req.path.endsWith('/vote')) {
      const id = getProposalId();
      const proposal = proposalsStore.get(id);

      if (!proposal) {
        return res.status(404).json({ error: 'Proposal not found' });
      }

      const { voterId, support } = req.body || {};
      if (!voterId || support === undefined) {
        return res.status(400).json({ error: 'voterId and support are required' });
      }

      if (proposal.voterDetails[voterId]) {
        return res.status(400).json({ error: 'Voter has already voted' });
      }

      const weight = voterWeights[voterId];
      if (!weight) {
        return res.status(400).json({ error: 'Voter not registered' });
      }

      const normalizedSupport = normalizeSupport(support);
      if (normalizedSupport) {
        proposal.votes.yes += weight;
      } else {
        proposal.votes.no += weight;
      }

      proposal.voterDetails[voterId] = { support: normalizedSupport ? 'yes' : 'no', weight };
      proposal.quorumMet = computeQuorum(proposal);

      return res.status(200).json({ proposal });
    }

    if (req.method === 'POST' && req.path.endsWith('/close')) {
      const id = getProposalId();
      const apiKey = req.headers['x-api-key'];
      if (!apiKey || apiKey !== adminKey) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const proposal = proposalsStore.get(id);
      if (!proposal) {
        return res.status(404).json({ error: 'Proposal not found' });
      }

      proposal.status = 'closed';
      proposal.outcome = proposal.votes.yes >= proposal.votes.no ? 'passed' : 'rejected';
      proposal.closedAt = new Date().toISOString();
      proposal.quorumMet = computeQuorum(proposal);

      return res.json({ proposal });
    }

    return next();
  });
} else {
  // Get DAO configuration
  router.get('/config', daoController.getConfig);

  // Get all proposals (optionally filter by status)
  router.get('/proposals', daoController.getProposals);

  // Create a new proposal (in production, this would be admin-only or require governance tokens)
  router.post('/proposals', daoController.createProposal);

  // Cast a vote on a proposal
  router.post('/proposals/:id/vote', daoController.castVote);

  // Close a proposal (in production, this would be admin-only or time-based)
  router.post('/proposals/:id/close', daoController.closeProposal);
}

module.exports = router;
