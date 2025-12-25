// Declarative tools registry (no real execution).
// Side effects classification: none | external | db | irreversible
module.exports = [
  {
    toolId: 'allow_uploads',
    description: 'Enable uploads for the current workspace or project scope.',
    inputSchema: { type: 'object', properties: { scope: { type: 'string' } } },
    sideEffects: 'external',
    requiresConfirmation: true,
  },
  {
    toolId: 'deny_uploads',
    description: 'Disable uploads for the current workspace or project scope.',
    inputSchema: { type: 'object', properties: { scope: { type: 'string' } } },
    sideEffects: 'external',
    requiresConfirmation: true,
  },
  {
    toolId: 'enable_checklist',
    description: 'Activate a product delivery checklist.',
    inputSchema: { type: 'object', properties: { checklistId: { type: 'string' } } },
    sideEffects: 'none',
    requiresConfirmation: false,
  },
];
