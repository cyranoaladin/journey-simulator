const express = require('express');
const router = express.Router();
const engineController = require('../controllers/journey-engine-controller');
const { protect } = require('../middleware/auth');

// All routes are protected by JWT (S1 Auth)
router.post('/start', protect, engineController.startJourney);
router.post('/submit', protect, engineController.submitPhase);
router.post('/advance', protect, engineController.devAdvance); // Mock/Dev for S2.3
router.get('/:id/state', protect, engineController.getState);

module.exports = router;
