/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 * 
 * Phase 4 Orchestration Routes - Minimal Amendment for E2E Testing
 * Provides intent routing endpoint with agent metadata
 */

const express = require('express');
const router = express.Router();
const { routeIntent } = require('../orchestration/intentRouter');
const { orchestrateZyno } = require('../orchestration/zynoOrchestrator');

/**
 * Sanitizes text to remove sensitive secrets
 * @param {string} text - The text to sanitize
 * @returns {string} - The sanitized text
 */
function sanitize(text) {
    if (!text || typeof text !== 'string') return text;
    return text
        .replace(/Bearer\s+[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/g, '[REDACTED_BEARER]')
        .replace(/eyJ[A-Za-z0-9\-_]{10,}\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/g, '[REDACTED_JWT]')
        .replace(/Authorization["']?\s*:\s*["']?[^"'\n]+["']?/gi, 'Authorization: [REDACTED]');
}


/**
 * POST /api/orchestration/intent
 * Routes user intent to appropriate agent
 * Returns agent metadata for E2E validation
 */
router.post('/intent', async (req, res) => {
    try {
        const { prompt, message, intent, userId, sessionId } = req.body;

        // Use explicit intent if provided, otherwise use prompt/message as fallback
        const intentToRoute = intent || prompt || message;

        if (!intentToRoute) {
            return res.status(400).json({
                error: 'Input required',
                message: 'Please provide intent, prompt, or message',
            });
        }

        // Route intent to agent
        // If "intent" is explicitly provided, we enforce strict routing (no fallback)
        // If it's a prompt/message, we allow fallback
        const isExplicitIntent = Boolean(intent);

        const routingResult = routeIntent({
            intent: intentToRoute,
            input: message || prompt || intentToRoute,
            context: { userId, sessionId },
            strict: isExplicitIntent
        });

        // Check if routing succeeded
        if (!routingResult || !routingResult.selectedAgents || routingResult.selectedAgents.length === 0) {
            return res.status(400).json({
                error: 'Intent routing failed',
                message: `No agent found for intent: ${intentToRoute}`,
                status: 'error',
            });
        }

        const selectedAgent = routingResult.selectedAgents[0];

        // Return agent metadata (required for Phase 4 tests)
        res.json({
            agentId: selectedAgent.agentId,
            agentName: selectedAgent.agentId, // Use agentId as agentName for consistency
            status: 'success',
            confidence: selectedAgent.confidenceWeight || 1.0,
            priority: selectedAgent.priority || 5,
            intent: routingResult.intentNormalized || intentToRoute,
        });

    } catch (error) {
        console.error('[Orchestration Intent] Error:', error);
        res.status(500).json({
            error: 'Orchestration error',
            message: error.message,
            stack: error.stack, // E2E Debug
            status: 'error',
        });
    }
});

/**
 * POST /api/orchestration/invoke
 * Invokes agent and returns output with timeline
 */
router.post('/invoke', async (req, res) => {
    try {
        const { agentName, input, userId, sessionId } = req.body;

        if (!agentName || !input) {
            return res.status(400).json({
                error: 'agentName and input required',
            });
        }

        const startTime = Date.now();

        // Orchestrate via Zyno
        const result = await orchestrateZyno(input, {
            userId: userId || 'test-user',
            sessionId: sessionId || 'test-session',
            agentOverride: agentName,
        });

        const duration = Date.now() - startTime;

        // Return with timeline metadata
        res.json({
            agentId: agentName,
            status: result.success ? 'success' : 'error',
            output: sanitize(result.output || result.message || ''),
            summary: sanitize(result.summary || ''),
            findings: result.findings || [],
            actions: result.actions || [],
            details: sanitize(result.details || result.output || ''),
            timeline: {
                durationMs: duration,
                startedAt: new Date(startTime).toISOString(),
                finishedAt: new Date().toISOString(),
                retries: 0,
            },
            resources: result.resources || [],
            rag: {
                usedRemote: result.ragUsed || false,
            },
            llm: {
                realStatus: result.llmStatus || 'OK',
            },
        });

    } catch (error) {
        console.error('[Orchestration Invoke] FATAL ERROR:', error);
        res.status(500).json({
            error: 'Invocation error',
            message: error.message,
            stack: error.stack,
            status: 'error',
        });
    }
});

module.exports = router;
