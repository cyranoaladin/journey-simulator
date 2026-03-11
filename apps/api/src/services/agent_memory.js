/**
 * Agent Memory Service - Prisma Version
 * In-memory + PostgreSQL persistence for agent state
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const memoryStore = {};

function createDefaultUserMemory() {
    return {
        profile: {},
        history: [],
        metrics: {
            AEPO: { total: 0, count: 0 },
            AECO: { total: 0, count: 0 }
        },
        aepo: 0,
        aeco: 0,
        updatedAt: null
    };
}

function ensureUser(userId) {
    if (!memoryStore[userId]) {
        memoryStore[userId] = createDefaultUserMemory();
    }
    return memoryStore[userId];
}

function updateMetricAverages(userRecord, type, numericValue) {
    if (!Number.isFinite(numericValue)) return;

    if (!userRecord.metrics[type]) {
        userRecord.metrics[type] = { total: 0, count: 0 };
    }

    const bucket = userRecord.metrics[type];
    bucket.total += numericValue;
    bucket.count += 1;

    if (type === 'AEPO') {
        userRecord.aepo = Math.round(bucket.total / bucket.count);
    }
    if (type === 'AECO') {
        userRecord.aeco = Math.round(bucket.total / bucket.count);
    }
}

function get(userId) {
    if (!userId) {
        console.error('agent_memory.get called without userId');
        return createDefaultUserMemory();
    }
    return ensureUser(userId);
}

function update(userId, data) {
    if (!userId) {
        console.error('agent_memory.update called without userId');
        return null;
    }
    const userRecord = ensureUser(userId);
    memoryStore[userId] = {
        ...userRecord,
        ...data,
        updatedAt: new Date().toISOString()
    };
    return memoryStore[userId];
}

function pushHistory(userId, entry) {
    if (!userId) {
        console.error('agent_memory.pushHistory called without userId');
        return null;
    }
    const userRecord = ensureUser(userId);
    const historyEntry = {
        timestamp: new Date().toISOString(),
        ...entry
    };
    userRecord.history.push(historyEntry);
    userRecord.updatedAt = new Date().toISOString();
    return historyEntry;
}

async function saveInteraction(agentName, userId, data = {}) {
    if (!userId) {
        console.error('agent_memory.saveInteraction called without userId');
        return null;
    }
    const userRecord = ensureUser(userId);
    const entry = {
        timestamp: new Date().toISOString(),
        agentName,
        ...data
    };

    userRecord.history.push(entry);

    if (data.type === 'AEPO') {
        const score = Number(data.score ?? data.value ?? data.metric);
        updateMetricAverages(userRecord, 'AEPO', score);
    }

    if (data.type === 'AECO') {
        const score = Number(data.rating ?? data.score ?? data.value);
        updateMetricAverages(userRecord, 'AECO', score);
    }

    userRecord.updatedAt = new Date().toISOString();

    // PostgreSQL persistence via Prisma
    try {
        await prisma.agentLog.create({
            data: {
                userId,
                agent: agentName,
                action: 'INTERACTION',
                details: { userId, agentName, ...data },
                status: 'ok',
            },
        });
    } catch (err) {
        // console.error('[agent_memory] Failed to save to PostgreSQL:', err.message);
    }

    return entry;
}

function listAll() {
    return Object.entries(memoryStore).map(([userId, data]) => ({
        userId,
        ...data
    }));
}

function reset() {
    Object.keys(memoryStore).forEach(key => delete memoryStore[key]);
}

module.exports = {
    get,
    update,
    pushHistory,
    saveInteraction,
    listAll,
    reset
};
