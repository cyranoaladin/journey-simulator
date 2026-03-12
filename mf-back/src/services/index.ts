/**
 * Services Barrel Export
 * Centralizes all service exports for cleaner imports
 * 
 * Created: 2026-03-11
 * Usage: import { JourneyService, EvaluationService } from '../services';
 */

export { AgentMemoryService, agentMemoryService } from './AgentMemoryService';
export { EvaluationService } from './EvaluationService';
export { JourneyService } from './JourneyService';
export { MetricsService, metricsRegistry } from './MetricsService';
export { 
  retrieveContext,
  processAgentQuery,
  logRagInteraction,
  generateEmbedding,
  type ContextChunk,
  type AgentQueryResult,
} from './neuralNexusService';
export { 
  OrchestrationService,
  handleAgentInteraction,
  type AgentInteractionPayload,
  type AgentInteractionResult,
  isValidAgentType,
  getValidAgentTypes,
  batchAgentInteractions,
} from './OrchestrationService';

// Re-export EvaluationService as default for backward compatibility
export { EvaluationService as default } from './EvaluationService';
