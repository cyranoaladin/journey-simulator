/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const { v4: uuid } = require('uuid');
const config = require('./daoConfig.json');

const totalVotingPower = config.voters.reduce((total, voter) => total + (voter.weight || 0), 0);

const votersById = config.voters.reduce((map, voter) => {
  if (voter?.id) {
    map[voter.id] = { weight: voter.weight || 1, name: voter.name || voter.id };
  }
  return map;
}, {});

const proposals = new Map();

function computeQuorum(votes) {
  const participation = (votes.yes + votes.no) / totalVotingPower * 100;
  return participation >= config.quorumPercent;
}

function evaluateOutcome(votes) {
  if (!computeQuorum(votes)) {
    return 'quorum_not_met';
  }
  return votes.yes > votes.no ? 'accepted' : 'rejected';
}

module.exports = {
  config,
  listProposals() {
    return Array.from(proposals.values());
  },
  createProposal({ title, description, createdBy }) {
    const id = uuid();
    const entry = {
      id,
      title,
      description: description || '',
      createdBy: createdBy || 'system',
      createdAt: new Date().toISOString(),
      status: 'active',
      votes: { yes: 0, no: 0 },
      voterDetails: {}
    };
    proposals.set(id, entry);
    return entry;
  },
  getProposal(id) {
    return proposals.get(id);
  },
  castVote(id, { voterId, support }) {
    const proposal = proposals.get(id);
    if (!proposal) {
      throw new Error('Proposal not found');
    }
    if (proposal.status !== 'active') {
      throw new Error('Proposal is closed');
    }

    const voter = votersById[voterId];
    if (!voter) {
      throw new Error('Voter not registered');
    }
    if (proposal.voterDetails[voterId]) {
      throw new Error('Voter has already voted');
    }

    const weight = voter.weight;
    if (support === true || support === 'yes') {
      proposal.votes.yes += weight;
      proposal.voterDetails[voterId] = { support: 'yes', weight };
    } else {
      proposal.votes.no += weight;
      proposal.voterDetails[voterId] = { support: 'no', weight };
    }

    proposal.quorumMet = computeQuorum(proposal.votes);
    proposal.outcome = evaluateOutcome(proposal.votes);
    return proposal;
  },
  closeProposal(id) {
    const proposal = proposals.get(id);
    if (!proposal) {
      throw new Error('Proposal not found');
    }
    proposal.status = 'closed';
    proposal.closedAt = new Date().toISOString();
    proposal.quorumMet = computeQuorum(proposal.votes);
    proposal.outcome = evaluateOutcome(proposal.votes);
    return proposal;
  },
  reset() {
    proposals.clear();
  },
  getVoter(id) {
    return votersById[id];
  },
  listVoters() {
    return Object.entries(votersById).map(([id, data]) => ({ id, ...data }));
  },
  totalVotingPower
};
