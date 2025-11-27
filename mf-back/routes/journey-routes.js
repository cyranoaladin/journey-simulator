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
router.post('/reset-progress', protect, journeyController.resetUserProgress);
router.get('/user-journeys', protect, journeyController.getUserJourneys);

// AI / Zyno routes
// Note: We might want to protect these, but for dev/demo ease we can leave them open or use 'protect'
router.post('/:journeyId/step', journeyController.step);
router.post('/:journeyId/submit', journeyController.submit);

// Demo mode route
router.post('/load-demo', journeyController.loadDemoState);

module.exports = router;
