// Minimal schema subset for runtime validation
export const JourneyStepResponseSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'JourneyStepResponse',
  type: 'object',
  required: ['metadata', 'ui_blocks', 'agent_actions', 'next_state'],
  properties: {
    metadata: {
      type: 'object',
      required: ['persona_id', 'journey_track', 'phase_id', 'language'],
      properties: {
        persona_id: { type: 'string' },
        journey_track: { type: 'string' },
        phase_id: { type: 'string' },
        language: { type: 'string', enum: ['fr', 'en'] },
        mode: { type: 'string', enum: ['discovery', 'builder', 'expert'] },
        tone: { type: 'string', enum: ['pedagogical', 'investor_pitch', 'critical'] },
        title: { type: 'string' },
        summary: { type: 'string' },
      },
      additionalProperties: false,
    },
    ui_blocks: { type: 'array' },
    agent_actions: { type: 'array' },
    next_state: { type: 'object' },
  },
}
