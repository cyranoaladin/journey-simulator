/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const executionEngine = require('./mf-back/orchestration/executionEngine');
const ExecutionService = require('./mf-back/orchestration/services/executionService');

console.log('executionEngine exports keys:', Object.keys(executionEngine));
console.log('executeAgentWithRetry type:', typeof executionEngine.executeAgentWithRetry);

console.log('ExecutionService export type:', typeof ExecutionService);
console.log('ExecutionService static keys:', Object.getOwnPropertyNames(ExecutionService));
console.log('ExecutionService.executeAgentWithRetry type:', typeof ExecutionService.executeAgentWithRetry);
