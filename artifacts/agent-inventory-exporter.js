const fs = require('fs');
const path = require('path');

// Mock environment for registry
process.env.NODE_ENV = 'production'; // To get ALL agents (base + extra)
const agents = require('/home/alaeddine/Documents/journey_mfai_back_front/mf-back/agents/registry');

const inventoryPath = 'artifacts/proof/phase4_agent_inventory.json';
const mdPath = 'artifacts/proof/phase4_agent_inventory.md';

fs.writeFileSync(inventoryPath, JSON.stringify(agents, null, 2));
console.log(`✅ Exported ${agents.length} agents to ${inventoryPath}`);

let md = "# Agent Inventory (Phase 4)\n\n";
md += "| Agent ID | Domain | Capabilities | Intents | RAG | Priority |\n";
md += "|----------|--------|--------------|---------|-----|----------|\n";

agents.forEach(a => {
    md += `| ${a.agentId} | ${a.domain} | ${a.capabilities?.join(', ') || ''} | ${a.intents?.join(', ') || ''} | ${a.requiresRag ? '✅' : '❌'} | ${a.priority} |\n`;
});

fs.writeFileSync(mdPath, md);
console.log(`✅ Exported ${agents.length} agents to ${mdPath}`);
