/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user-controller');
const { protect, adminOnly } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

/* Authentication routes */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60, // shared bucket for auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120, // refresh may be called by multiple tabs/dev tools
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, userController.registerUser);
router.post('/login', authLimiter, userController.loginUser);
router.post('/wallet-challenge', authLimiter, userController.createWalletChallenge);
router.post('/login-wallet', authLimiter, userController.loginWithWallet);
router.post('/logout', authLimiter, userController.logoutUser);
router.post('/refresh', refreshLimiter, userController.refreshToken);

/* Protected user routes */
router.get('/profile', protect, userController.getUserProfile);
router.put('/update-profile', protect, userController.updateUserProfile);
router.delete('/delete-profile', protect, userController.deleteUser);

/* Admin only routes */
router.get('/all', protect, adminOnly, userController.getAllUsers);
router.put('/role/:id', protect, adminOnly, userController.changeUserRole);
router.put('/subscription/:id', protect, adminOnly, userController.subscription);

/* Token and progress routes */
router.put('/tokens', protect, userController.updateTokenBalance);
router.post('/nft-certificates', protect, userController.addNFTCertificate);

/* Neural Handshake (Phase 5) */
router.get('/neural-handshake', protect, userController.getNeuralHandshakeStatus);
router.post('/neural-handshake/sync', protect, userController.syncNeuralHandshake);

module.exports = router;
