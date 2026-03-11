/**
 * Project: Money Factory AI (MFAI)
 * Agent Idempotence Utilities - Prisma Version
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('node:crypto');

const prisma = new PrismaClient();

/**
 * Generates a deterministic key based on inputs.
 * v2: Includes promptHash to ensure different prompts generate different cache keys.
 */
exports.generateIdempotencyKey = (journeyId, stepId, agentName, context = {}) => {
    const { userPrompt, ...restContext } = context;

    const promptHash = userPrompt
        ? crypto.createHash('sha256').update(String(userPrompt)).digest('hex').slice(0, 12)
        : 'no-prompt';

    const data = `idem:v2:${journeyId}:${stepId}:${agentName}:${JSON.stringify(restContext)}:${promptHash}`;
    return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Finds existing successful/running agent run or creates a new one.
 * Returns { run, isNew }.
 * If isNew is false, the caller should skip execution and return the existing output.
 */
exports.findOrCreateAgentRun = async (params) => {
    const { idempotencyKey, agentName, ...runData } = params;

    if (!idempotencyKey) {
        throw new Error('idempotencyKey is required');
    }

    // Try to find existing run (latest first)
    const existing = await prisma.agentRun.findFirst({
        where: { kind: agentName || 'unknown' },
        orderBy: { createdAt: 'desc' },
    });

    // If found and not failed, return it (idempotent success)
    if (existing && existing.status !== 'failed') {
        return { run: { ...existing, _id: existing.id }, isNew: false };
    }

    // Create new run
    const run = await prisma.agentRun.create({
        data: {
            kind: agentName || 'unknown',
            input: runData.input || {},
            status: 'started',
        },
    });

    return { run: { ...run, _id: run.id }, isNew: true };
};
