const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics-controller');
const { protect } = require('../middleware/auth');

// Analytics routes
router.post('/certification-download', protect, analyticsController.trackCertificationDownload);
router.post('/certification-share', protect, analyticsController.trackCertificationShare);
router.post('/holder-interaction', protect, analyticsController.trackHolderInteraction);
router.get('/access-pass-holders', protect, analyticsController.getAccessPassHolders);
router.get('/platform-stats', protect, analyticsController.getPlatformStats);

module.exports = router;
