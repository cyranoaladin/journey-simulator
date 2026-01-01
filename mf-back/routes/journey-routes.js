const express = require('express');
const router = express.Router();
console.log('Journey Routes Loaded');
const journeyController = require('../controllers/journey-controller');
const metricsController = require('../controllers/journey-metrics-controller');
const { protect, optionalAuth } = require('../middleware/auth');
const safeOptionalAuth = optionalAuth || ((_req, _res, next) => next());

router.use((req, res, next) => {
    console.log(`[JourneyRouter] ${req.method} ${req.url}`);
    next();
});

// Public routes
router.get('/all-journey', journeyController.getAllJourney);

// User progress and action routes (Must be before dynamic :journeyId routes)
router.get('/user-progress', safeOptionalAuth, journeyController.getUserProgress);
router.put('/user-progress', protect, journeyController.updateUserProgress);
router.post('/complete-phase', protect, journeyController.completePhase);
router.post('/action', protect, journeyController.journeyAction);
router.post('/reset-progress', protect, journeyController.resetUserProgress);
router.get('/user-journeys', protect, journeyController.getUserJourneys);

// Protected routes (general)
router.post('/add-journey', protect, journeyController.createJourney);
router.put('/update-journey/:id', protect, journeyController.updateJourney);
router.delete('/delete/:id', protect, journeyController.deleteJourney);

// AI / Zyno routes (Dynamic params last)
// Step uses optional auth: captures req.user if present (demo or JWT) for memory persistence
router.post('/:journeyId/step', safeOptionalAuth, journeyController.step);
router.post('/:journeyId/submit', protect, journeyController.submit);

// Demo mode route
router.post('/load-demo', safeOptionalAuth, journeyController.loadDemoState);

// Schema endpoint - expose journey structure
router.get('/schema', journeyController.getJourneySchema);

// Artifacts endpoint - expose unlocked artifacts based on user progress
router.get('/artifacts', safeOptionalAuth, journeyController.getUserArtifacts);

// Metrics endpoints
router.get('/metrics', protect, metricsController.getGlobalMetrics);
router.get('/:id/metrics', protect, metricsController.getJourneyMetrics);

module.exports = router;
