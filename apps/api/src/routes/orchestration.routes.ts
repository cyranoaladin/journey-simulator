/**
 * Orchestration Routes
 */

import { Router } from 'express';
import { OrchestrationController } from '../controllers/orchestration.controller';

const router = Router();

router.post('/invoke', OrchestrationController.invokeAgent);

export default router;
