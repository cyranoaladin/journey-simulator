/**
 * Health Routes - TypeScript
 */

import { Router } from 'express';
import * as healthController from '../controllers/health.controller';

const router = Router();

router.get('/api/health', healthController.getHealth);
router.get('/health', healthController.getHealth);
router.get('/healthz', healthController.healthz);
router.get('/readyz', healthController.readyz);
router.get('/metrics', healthController.getMetrics);

export default router;
