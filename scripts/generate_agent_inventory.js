const fs = require('node:fs');
const path = require('node:path');

// Mock process.env to ensure we get all agents from registry
process.env.NODE_ENV = 'production';

const registryPath = path.join(__dirname, '../mf-back/agents/registry.js');
const promptsPath = path.join(__dirname, '../mf-back/agents/prompts.js');
const agentsDir = path.resolve(__dirname, '../mf-back/agents');

const agentsMetadata = require(registryPath);
const prompts = require(promptsPath);

const inventory = agentsMetadata.map(meta => {
    const agentId = meta.agentId;
    let hasPrompt = false;
    let promptLocation = null;

    // Check prompts.js
    if (prompts.getSystemPrompt(agentId) !== 'You are a helpful agent.\nReturn concise, structured findings. Always include short actions.') {
        hasPrompt = true;
        promptLocation = 'prompts.js';
    }

    // Check class file
    const safeAgentId = path.basename(agentId);
    const classFilePath = path.resolve(agentsDir, `${safeAgentId}.js`);
    if (!classFilePath.startsWith(agentsDir)) {
        return null;
    }
    if (fs.existsSync(classFilePath)) {
        const content = fs.readFileSync(classFilePath, 'utf8');
        if (content.includes('buildPrompt') || content.includes('systemPrompt') || content.includes('prompt:')) {
            hasPrompt = true;
            promptLocation = promptLocation ? `${promptLocation} + ${agentId}.js` : `${agentId}.js`;
        }
    }

    return {
        agentId,
        name: meta.name || agentId,
        domain: meta.domain,
        specialty: meta.specialty || meta.domain || null,
        hasPrompt,
        promptLocation,
        ragCapable: !!meta.requiresRag,
        llmCapable: true, // All these agents use LLM
        enabled: !!meta.enabled,
        priority: meta.priority
    };
}).filter(Boolean);

const result = {
    count: inventory.length,
    agents: inventory
};

console.log(JSON.stringify(result, null, 2));
const outputPath = path.resolve(__dirname, '../artifacts/phase4-agent-inventory.json');
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
