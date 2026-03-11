/**
 * Auth Routes - TypeScript
 */

import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/connect-wallet', authController.connectWallet);
router.get('/me', authController.getMe);
router.post('/verify', authController.verify);
router.post('/refresh', authController.refresh);
router.post('/test-cleanup', authController.testCleanup);
router.post('/test-login', authController.testLogin);

export default router;
