/**
 * Project: Money Factory AI (MFAI)
 * Module: Offline Fallback Logic
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

type PersistedJourneyState = {
    userProgress?: {
        totalXP?: number;
        completedPhases?: number[];
    };
    selectedPersona?: {
        id?: string;
    } | null;
};

const readPersistedJourneyState = (): PersistedJourneyState | null => {
    try {
        const raw = localStorage.getItem('mfai-journey-storage');
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw);
        return parsed?.state ?? parsed;
    } catch (error) {
        console.warn('[API] Failed to parse offline journey state:', error);
        return null;
    }
};

const getLocalProgressSnapshot = () => {
    const persisted = readPersistedJourneyState();
    const completedPhases = Array.isArray(persisted?.userProgress?.completedPhases)
        ? persisted?.userProgress?.completedPhases
        : [];
    const totalXP = typeof persisted?.userProgress?.totalXP === 'number'
        ? persisted.userProgress.totalXP
        : 0;

    return {
        completedPhases,
        totalXP,
        currentPhase: completedPhases.length,
        personaId: persisted?.selectedPersona?.id ?? 'offline-persona',
    };
};

const buildOfflineAgentLogs = (currentPhase: number, totalXP: number) => {
    const timestamp = new Date().toISOString();
    return [
        {
            userId: 'offline-user',
            agentName: 'Zyno Orchestrator',
            ae_summary: 'Offline fallback: synthesizing evaluation locally.',
            ae_outcome: 'success',
            payload: {
                phaseEvaluated: currentPhase,
                totalXP,
                source: 'offline-fallback',
            },
            timestamp,
        },
        {
            userId: 'offline-user',
            agentName: 'Proof Agent',
            ae_summary: 'Generated synthetic Proof-of-Skill insights.',
            ae_outcome: 'success',
            payload: {
                artifactsUnlocked: currentPhase,
                xpSignal: totalXP,
            },
            timestamp,
        },
    ];
};

export const handleOfflineFallback = async <T>(path: string, error: unknown): Promise<T | undefined> => {
    const normalizedPath = path.split('?')[0];
    const { currentPhase, totalXP } = getLocalProgressSnapshot();
    console.warn("[API] Offline fallback engaged", { path, error });

    try {
        if (normalizedPath === '/journey/artifacts') {
            const artifactsModule = await import('../../data/artifacts.json');
            const artifacts = artifactsModule.default.map((artifact: any) => ({
                ...artifact,
                status: artifact.unlockPhase <= currentPhase ? 'unlocked' : 'locked',
            }));

            return {
                success: true,
                artifacts,
                currentPhase,
            } as unknown as T;
        }

        if (normalizedPath.includes('/api/agents/runs') || normalizedPath.includes('/api/agents/logs') || normalizedPath.includes('/admin/agent-logs')) {
            // NOTE: This fallback mock might be why we get "No Agent Intel" if the real backend is unreachable!
            // But we are focusing on solving backend connection, not improving this mock right now.
            return buildOfflineAgentLogs(currentPhase, totalXP) as unknown as T;
        }

        if (normalizedPath === '/solana/mint/simulate') {
            const riskScore = parseFloat(Math.max(0.02, 0.35 - totalXP / 5000).toFixed(2));
            const confidence = parseFloat(Math.min(0.98, 0.6 + totalXP / 2000).toFixed(2));

            return {
                ok: true,
                sim: {
                    ok: true,
                    estFeeLamports: 4000 + Math.round(totalXP / 2),
                    riskScore,
                    confidence,
                    network: 'devnet',
                },
            } as unknown as T;
        }

        if (normalizedPath === '/solana/mint/execute') {
            const idSuffix = Date.now();
            return {
                ok: true,
                jobId: `offline-mint-${idSuffix}`,
                status: 'completed',
                tx: {
                    mintAddress: `OfflineMint${idSuffix}`,
                    txSig: `OfflineTx${Math.random().toString(36).slice(2)}`,
                },
            } as unknown as T;
        }
    } catch (fallbackError) {
        console.error("[API] Offline fallback failed", { path, error: fallbackError });
    }

    return undefined;
};
