const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.resolve(__dirname, '../agents');
const REGISTRY_PATH = path.resolve(__dirname, '../agents/registry.js');
const AGENTS_DIR_PREFIX = `${AGENTS_DIR}${path.sep}`;

// 1. Load Registry safely (require instead of eval)
let registryAgents = [];
try {
    // registry exports agents array
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const registry = require(REGISTRY_PATH);
    registryAgents = Array.isArray(registry.agents) ? registry.agents : [];
} catch (e) {
    console.error("Failed to load registry:", e);
}

// nosemgrep
const allFiles = fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith('.js') && !['registry.js', 'AgentFactory.js', 'BaseAgent.js', 'api-contract.js', 'agentUtils.js', 'telemetryUtils.js', 'agent_template.js', 'prompts.js'].includes(f));

console.log("| Agent Name | Active | Competence | System Prompt Status | Run/Execute Status | Workflow Reachability |");
console.log("|---|---|---|---|---|---|");

// semgrep:allowlist javascript.lang.security.audit.path-join-resolve-traversal.path-join-resolve-traversal - filenames sourced from controlled agents directory and sanitized.
allFiles.forEach(file => {
    const safeFile = path.basename(file);
    if (!/^[\w.-]+$/.test(safeFile)) {
        return;
    }
    // nosemgrep javascript.lang.security.audit.path-join-resolve-traversal.path-join-resolve-traversal
    const agentPath = path.resolve(AGENTS_DIR, safeFile);
    const relativePath = path.relative(AGENTS_DIR, agentPath);
    if (relativePath.startsWith('..')) {
        return;
    }
    const content = fs.readFileSync(agentPath, 'utf8');
    const agentName = file.replace('.js', '');

    // Check Registry
    const regEntry = registryAgents.find(a => a.agentId === agentName);
    const isActive = regEntry && regEntry.enabled !== false ? "✅ Yes" : "❌ No";
    const competence = regEntry ? (regEntry.domain || "Unknown") : "Unknown";
    const intents = regEntry ? (regEntry.intents || []) : [];

    // Check Density (System Prompt)
    let promptStatus = "⚠️ HOLLOW";
    // Look for this.systemPrompt = ... or get systemPrompt() ...
    // We look for a string assigned to systemPrompt that is substantial.
    // Or a template literal `...`
    const promptMatch = content.match(/systemPrompt\s*=\s*[`"']([\s\S]*?)[`"']/) || content.match(/get\s+systemPrompt\(\)\s*\{\s*return\s*[`"']([\s\S]*?)[`"']/);

    if (promptMatch && promptMatch[1].length > 50 && !promptMatch[1].includes("helpful assistant")) {
        promptStatus = "✅ Dense";
    } else if (content.includes("super(")) {
        // Might inherit prompt? 
        // If it just extends BaseAgent and doesn't override, it might be hollow if BaseAgent prompt is generic.
        // BaseAgent usually has a dynamic prompt builder.
        // We check if it DEFINES a prompt in constructor.
        if (!content.includes("this.systemPrompt")) {
            promptStatus = "⚠️ Inherited/Missing"; // Likely HOLLOW for a specialized agent
        }
    }

    // Check Run Method
    let runStatus = "⚠️ Mock/Missing";
    if (content.includes("async run(") || content.includes("async execute(")) {
        if (content.includes("return { mock: true }") || content.includes("return {}")) {
            runStatus = "⚠️ Mock";
        } else {
            runStatus = "✅ Real";
        }
    }

    // Check Workflow
    // Reachable if active AND has intents
    let reachability = "❌ UNREACHABLE";
    if (isActive === "✅ Yes" && intents.length > 0) {
        reachability = `✅ Via [${intents.join(', ')}]`;
    }

    console.log(`| ${agentName} | ${isActive} | ${competence} | ${promptStatus} | ${runStatus} | ${reachability} |`);
});
