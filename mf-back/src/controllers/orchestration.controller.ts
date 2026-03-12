/**
 * Orchestration Controller
 * Handles direct agent invocation and orchestration logic
 */

import { Request, Response } from 'express';
import { MetricsService } from '../services/MetricsService';
import { handleAgentInteraction, AgentInteractionPayload } from '../services/OrchestrationService';

export class OrchestrationController {

    static async invokeAgent(req: Request, res: Response): Promise<void> {
        try {
            // Adapter: Map /api/orchestration/invoke payload to AgentController format if possible
            // Incoming: { data: { agentName, input, userId } } (from agent-sweep.spec.ts)
            // OR plain body: { agentName, input, userId }

            const payload = req.body.data || req.body;
            const { agentName, input, userId } = payload;

            if (!agentName || !input) {
                res.status(400).json({ error: 'Missing agentName or input', required: ['agentName', 'input'] });
                return;
            }

            // Map agent name to internal format
            const mappedAgentType = OrchestrationController.mapAgentName(agentName);

            // Construct payload for handleAgentInteraction
            const interactionPayload: AgentInteractionPayload = {
                agentType: mappedAgentType,
                input: input,
                userId: userId,
                sessionId: `orch-${userId || 'anon'}-${Date.now()}`,
                context: {},
            };

            // Call the service function directly
            const result = await handleAgentInteraction(interactionPayload);

            res.json(result);

        } catch (error) {
            console.error('[OrchestrationController] Invoke Error:', error);
            res.status(500).json({ error: 'Orchestration invocation failed', details: (error as Error).message });
        }
    }

    // Helper to map test names to internal AgentType enum
    private static mapAgentName(name: string): string {
        // Simple heuristic mapping or direct pass-through
        // Tests use "GuideAgent", "ResearchAgent". We need "RESEARCH_AGENT".
        const upper = name.toUpperCase().replace('AGENT', '_AGENT');
        // e.g. "ResearchAgent" -> "RESEARCH_AGENT"
        // "GuideAgent" -> "GUIDE_AGENT" (if exists)
        // If it's already uppercase snake_case, use it.
        if (name.includes('_')) return name;

        // Special cases
        if (name === 'GuideAgent') return 'ARCHITECT_AGENT'; // Fallback

        return upper;
    }
}
