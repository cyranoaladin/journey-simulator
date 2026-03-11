/**
 * Agent Memory Service - Prisma Version
 * In-memory + PostgreSQL persistence for agent state
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface UserMemory {
    profile: Record<string, any>;
    history: any[];
    metrics: {
        AEPO: { total: number; count: number };
        AECO: { total: number; count: number };
    };
    aepo: number;
    aeco: number;
    updatedAt: string | null;
}

const memoryStore: Record<string, UserMemory> = {};

function createDefaultUserMemory(): UserMemory {
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

function ensureUser(userId: string): UserMemory {
    if (!memoryStore[userId]) {
        memoryStore[userId] = createDefaultUserMemory();
    }
    return memoryStore[userId];
}

function updateMetricAverages(userRecord: UserMemory, type: 'AEPO' | 'AECO', numericValue: number): void {
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

export function get(userId: string): UserMemory {
    if (!userId) {
        console.error('agent_memory.get called without userId');
        return createDefaultUserMemory();
    }
    return ensureUser(userId);
}

export function update(userId: string, data: Partial<UserMemory>): UserMemory | null {
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

export function pushHistory(userId: string, entry: any): any {
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

export async function saveInteraction(agentName: string, userId: string, data: any = {}): Promise<any> {
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
    } catch (err: any) {
        console.error('[agent_memory] Failed to save to PostgreSQL:', err.message);
    }

    return entry;
}

export function listAll(): Array<{ userId: string } & UserMemory> {
    return Object.entries(memoryStore).map(([userId, data]) => ({
        userId,
        ...data
    }));
}

export function reset(): void {
    Object.keys(memoryStore).forEach(key => delete memoryStore[key]);
}

// CommonJS export for backward compatibility
module.exports = {
    get,
    update,
    pushHistory,
    saveInteraction,
    listAll,
    reset
};
