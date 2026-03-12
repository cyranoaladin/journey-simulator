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

/**
 * GET /neural-nexus/documents
 * Liste les documents indexés dans la base de connaissances RAG
 */
router.get('/documents', protect, NeuralNexusController.listDocuments);

/**
 * GET /neural-nexus/rag
 * Alias pour /documents — utilisé par le frontend via /resources/rag
 */
router.get('/rag', protect, NeuralNexusController.listDocuments);

export default router;
