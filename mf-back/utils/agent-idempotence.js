/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const AgentRun = require('../models/agent-run');
const crypto = require('node:crypto');

/**
 * Generates a deterministic key based on inputs.
 * v2: Includes promptHash to ensure different prompts generate different cache keys.
 */
exports.generateIdempotencyKey = (journeyId, stepId, agentName, context = {}) => {
    const { userPrompt, ...restContext } = context;

    // Generate prompt hash (12 chars) if userPrompt is provided
    const promptHash = userPrompt
        ? crypto.createHash('sha256').update(String(userPrompt)).digest('hex').slice(0, 12)
        : 'no-prompt';

    // v2 tag to avoid collisions with old cache keys
    const data = `idem:v2:${journeyId}:${stepId}:${agentName}:${JSON.stringify(restContext)}:${promptHash}`;
    return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Finds existing successful/running agent run or creates a new one.
 * Returns { run, isNew }.
 * If isNew is false, the caller should skip execution and return the existing output.
 */
exports.findOrCreateAgentRun = async (params) => {
    const { idempotencyKey, ...runData } = params;

    if (!idempotencyKey) {
        throw new Error('idempotencyKey is required');
    }

    // Try to find existing run (latest first)
    const existing = await AgentRun.findOne({ idempotencyKey }).sort({ createdAt: -1 });

    // If found and not failed, return it (idempotent success)
    if (existing && existing.status !== 'failed') {
        return { run: existing, isNew: false };
    }

    // If failed or not found, create new run
    // Note: In a real distributed system, we'd use findOneAndUpdate with upsert or a lock
    // but for now this suffices as a basic hook.

    const run = await AgentRun.create({
        ...runData,
        idempotencyKey,
        status: 'started'
    });

    return { run, isNew: true };
};
