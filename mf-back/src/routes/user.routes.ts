/**
 * User Routes - TypeScript
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { protect, adminOnly } from '../middleware/auth';
import * as userController from '../controllers/user.controller';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication routes
router.post('/register', authLimiter, userController.registerUser);
router.post('/login', authLimiter, userController.loginUser);
router.post('/wallet-challenge', authLimiter, userController.createWalletChallenge);
router.post('/login-wallet', authLimiter, userController.loginWithWallet);
router.post('/logout', authLimiter, userController.logoutUser);
router.post('/refresh', refreshLimiter, userController.refreshToken);

// Protected user routes
router.get('/profile', protect, userController.getUserProfile);
router.put('/update-profile', protect, userController.updateUserProfile);
router.delete('/delete-profile', protect, userController.deleteUser);

// Admin only routes
router.get('/all', protect, adminOnly, userController.getAllUsers);
router.put('/role/:id', protect, adminOnly, userController.changeUserRole);

// Token and progress routes
router.put('/tokens', protect, userController.updateTokenBalance);
router.post('/nft-certificates', protect, userController.addNFTCertificate);

// Neural Handshake
router.get('/neural-handshake', protect, userController.getNeuralHandshakeStatus);
router.post('/neural-handshake/sync', protect, userController.syncNeuralHandshake);

export default router;
