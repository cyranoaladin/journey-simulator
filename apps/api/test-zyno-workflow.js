/**
 * Zyno Workflow Validation Script
 * Tests persona → phase → agent routing
 */

const workflowMap = require('./src/orchestration/workflowMap.js');
const agentsRegistry = require('./src/agents/registry.js');

console.log('=========================================');
console.log('Zyno Workflow Validation');
console.log('=========================================\n');

const personas = Object.keys(workflowMap);
console.log(`✓ Found ${personas.length} personas in workflow map\n`);

let totalPhases = 0;
let missingIntents = [];
const registeredIntents = new Set();

// Build intent registry
agentsRegistry.forEach(agent => {
  agent.intents.forEach(intent => registeredIntents.add(intent));
});

console.log('Validating persona → phase → agent routing:\n');

personas.forEach(personaId => {
  const persona = workflowMap[personaId];
  const phases = Object.keys(persona.phases);
  totalPhases += phases.length;
  
  console.log(`📍 ${personaId}:`);
  
  phases.forEach(phaseId => {
    const intents = persona.phases[phaseId];
    const intentStatus = intents.map(intent => {
      const exists = registeredIntents.has(intent);
      if (!exists) missingIntents.push({ personaId, phaseId, intent });
      return exists ? '✓' : '✗';
    }).join(' ');
    
    console.log(`  ${phaseId}: [${intents.join(', ')}] ${intentStatus}`);
  });
  console.log('');
});

console.log('=========================================');
console.log('Summary:');
console.log('=========================================');
console.log(`Total Personas: ${personas.length}`);
console.log(`Total Phases: ${totalPhases}`);
console.log(`Registered Agent Intents: ${registeredIntents.size}`);

if (missingIntents.length > 0) {
  console.log(`\n⚠️  Missing Intents (${missingIntents.length}):`);
  missingIntents.forEach(({ personaId, phaseId, intent }) => {
    console.log(`  - ${intent} (needed by ${personaId}/${phaseId})`);
  });
} else {
  console.log('\n✅ All intents are registered!');
}

console.log('\n=========================================');
console.log('Available Agent Intents:');
console.log('=========================================');
const sortedIntents = Array.from(registeredIntents).sort();
sortedIntents.forEach((intent, i) => {
  if (i % 4 === 0) process.stdout.write('\n');
  process.stdout.write(`${intent.padEnd(22)}`);
});
console.log('\n');

process.exit(missingIntents.length > 0 ? 1 : 0);
