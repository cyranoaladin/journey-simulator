/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

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

// Public health check (for proxy verification)
router.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'journey-router' });
});

// Protected routes (requires authentication)
router.get('/all-journey', protect, journeyController.getAllJourney);

// User progress and action routes (Must be before dynamic :journeyId routes)
router.get('/user-progress', protect, journeyController.getUserProgress);
router.put('/user-progress', protect, journeyController.updateUserProgress);
router.post('/complete-phase', protect, journeyController.completePhase);
router.post('/action', protect, journeyController.journeyAction);
router.post('/reset-progress', protect, journeyController.resetUserProgress);
router.get('/user-journeys', protect, journeyController.getUserJourneys);
router.post('/quiz/verify', protect, journeyController.verifyQuiz);
router.post('/mint/request', protect, journeyController.requestMint);
router.get('/mint/status/:jobId', protect, journeyController.getMintStatus);

// Protected routes (general)
router.post('/add-journey', protect, journeyController.createJourney);
router.put('/update-journey/:id', protect, journeyController.updateJourney);
router.delete('/delete/:id', protect, journeyController.deleteJourney);

// AI / Zyno routes (Dynamic params last)
// Step requires authentication for secure user context
router.post('/:journeyId/step', protect, journeyController.step);
router.post('/:journeyId/submit', protect, journeyController.submit);

// Demo mode route
router.post('/load-demo', protect, journeyController.loadDemoState);

// Schema endpoint - expose journey structure
router.get('/schema', journeyController.getJourneySchema);

// Artifacts endpoint - expose unlocked artifacts based on user progress
router.get('/artifacts', protect, journeyController.getUserArtifacts);

// Metrics endpoints
router.get('/metrics', protect, metricsController.getGlobalMetrics);
router.get('/:id/metrics', protect, metricsController.getJourneyMetrics);

module.exports = router;
