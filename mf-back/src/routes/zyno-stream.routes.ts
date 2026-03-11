/**
 * @file zyno-stream.routes.ts
 * @description Route SSE pour les réponses Zyno en streaming temps réel.
 * Endpoint : GET /api/zyno/stream?journeyId=xxx&stepId=xxx
 *
 * @author Kimi Code CLI — 2026-03-11
 */

import { Router, Request, Response } from 'express';
import { streamLLMResponse, setupSSEHeaders, buildMFAISystemMessage } from '../services/llmRouter';

const router = Router();

/**
 * GET /api/zyno/stream
 * Stream une réponse Zyno en SSE (Server-Sent Events)
 *
 * Query params:
 *   - journeyId : string (requis)
 *   - stepId    : string (requis)
 *   - userInput : string (optionnel)
 *   - persona   : string (optionnel)
 */
router.get('/stream', async (req: Request, res: Response) => {
  const { journeyId, stepId, userInput, persona } = req.query as Record<string, string>;

  if (!journeyId || !stepId) {
    return res.status(400).json({ error: 'journeyId and stepId are required' });
  }

  // Pour l'instant, pas d'authentification stricte - à ajouter avec middleware protect
  // TODO: Ajouter auth middleware en production

  setupSSEHeaders(res);

  // Signal de démarrage
  res.write(`data: ${JSON.stringify({ type: 'start', journeyId, stepId })}

`);

  const messages = [
    buildMFAISystemMessage(
      'Zyno, the AI orchestrator of Money Factory AI',
      `Journey ID: ${journeyId} | Step: ${stepId} | Persona: ${persona ?? 'unknown'}`
    ),
    {
      role: 'user' as const,
      content: userInput
        ? `User input for step ${stepId}: ${userInput}`
        : `Generate guidance for journey step: ${stepId}`,
    },
  ];

  await streamLLMResponse(messages, res, {
    taskType: 'reasoning',
    maxTokens: 1500,
    temperature: 0.4,
  });
});

export default router;
