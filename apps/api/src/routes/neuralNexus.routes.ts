/**
 * Project: Money Factory AI (MFAI)
 * Neural Nexus Routes
 * Status: Production Ready - 2026
 */

import { Router } from 'express';
import { NeuralNexusController } from '../controllers/neuralNexus.controller';
import { protect } from '../middleware/auth';

const router = Router();

// Public endpoints (for testing)
router.post('/search', NeuralNexusController.searchContext);
router.post('/query', NeuralNexusController.queryAgent);

// Protected endpoints
router.get('/logs', protect, NeuralNexusController.getLogs);
router.post('/seed', protect, NeuralNexusController.seedKnowledgeBase);

export default router;
