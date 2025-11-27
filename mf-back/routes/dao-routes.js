const express = require('express');
const router = express.Router();
const daoController = require('../controllers/dao-controller');

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

module.exports = router;
