const express = require('express');
const daoState = require('../data/daoState');

const router = express.Router();

router.get('/dao/config', (_req, res) => {
  res.json({
    quorumPercent: daoState.config.quorumPercent,
    totalVotingPower: daoState.totalVotingPower,
    voters: daoState.listVoters()
  });
});

router.get('/dao/proposals', (_req, res) => {
  res.json({ proposals: daoState.listProposals() });
});

router.post('/dao/proposals', (req, res) => {
  const apiKey = req.header('x-api-key');
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { title, description, createdBy } = req.body || {};
  if (!title) {
    return res.status(400).json({ error: 'Proposal title is required.' });
  }

  try {
    const proposal = daoState.createProposal({ title, description, createdBy });
    return res.status(201).json({ proposal });
  } catch (error) {
    console.error('DAO create proposal error:', error);
    return res.status(500).json({ error: 'Unable to create proposal' });
  }
});

router.post('/dao/proposals/:id/vote', (req, res) => {
  const { id } = req.params;
  const { voterId, support } = req.body || {};

  if (!voterId) {
    return res.status(400).json({ error: 'voterId is required.' });
  }
  if (typeof support === 'undefined') {
    return res.status(400).json({ error: 'support flag is required.' });
  }

  try {
    const proposal = daoState.castVote(id, { voterId, support });
    return res.json({ proposal });
  } catch (error) {
    console.error('DAO vote error:', error);
    if (error.message === 'Proposal not found') {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    if (error.message === 'Proposal is closed') {
      return res.status(409).json({ error: 'Proposal already closed' });
    }
    if (error.message === 'Voter not registered' || error.message === 'Voter has already voted') {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Unable to record vote' });
  }
});

router.post('/dao/proposals/:id/close', (req, res) => {
  const apiKey = req.header('x-api-key');
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;

  try {
    const proposal = daoState.closeProposal(id);
    return res.json({ proposal });
  } catch (error) {
    console.error('DAO close proposal error:', error);
    if (error.message === 'Proposal not found') {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    return res.status(500).json({ error: 'Unable to close proposal' });
  }
});

module.exports = router;
