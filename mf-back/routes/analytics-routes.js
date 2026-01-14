/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics-controller');
const { protect } = require('../middleware/auth');
// Analytics routes
router.post('/certificate-download', protect, analyticsController.trackCertificateDownload);
router.post('/certificate-share', protect, analyticsController.trackCertificateShare);
router.post('/holder-interaction', protect, analyticsController.trackHolderInteraction);
router.get('/access-pass-holders', protect, analyticsController.getAccessPassHolders);
router.get('/platform-stats', protect, analyticsController.getPlatformStats);

module.exports = router;
