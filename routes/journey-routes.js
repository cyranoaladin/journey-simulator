var express = require('express');
var router = express.Router();
const journeyController = require('../controllers/journey-controller');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/all-journey', journeyController.getAllJourney);

// Protected routes
router.post('/add-journey', protect, journeyController.createJourney);
router.put('/update-journey/:id', protect, journeyController.updateJourney);
router.delete('/delete/:id', protect, journeyController.deleteJourney);

// User progress routes
router.get('/user-progress', protect, journeyController.getUserProgress);
router.put('/user-progress', protect, journeyController.updateUserProgress);
router.post('/complete-phase', protect, journeyController.completePhase);
router.get('/user-journeys', protect, journeyController.getUserJourneys);

module.exports = router;
