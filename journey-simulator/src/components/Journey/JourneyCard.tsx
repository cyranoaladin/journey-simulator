import React, { useCallback, useState } from 'react';
import { useJourneyStore } from '@/store/journeyStore';
import { api } from '@/utils/api';
import { ArrowRight, Zap, Loader2 } from 'lucide-react';

interface JourneyCardProps {
    persona: any; // Type should be Persona, using 'any' for quick fix
    onSelected?: (persona: any) => void;
    demoMode?: boolean;
    loadUserProgress?: () => Promise<void>;
    userProgress?: any;
    setUserProgress?: (progress: any) => void;
}

const JourneyCard: React.FC<JourneyCardProps> = ({
    persona,
    onSelected,
    demoMode,
    loadUserProgress,
    userProgress,
    setUserProgress,
}) => {
    // State declarations (Fixes TS2304: Cannot find name 'setIsLoading', 'setError', etc.)
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDemo, setIsLoadingDemo] = useState(false);
    const [error, setError] = useState<string | null>(null);


    // Derive userId for API calls (Fixes TS2304: Cannot find name 'userProgress')
    const userId = userProgress?.userId || userProgress?.id || localStorage.getItem('userId') || 'default_user';

    // Handlers are placed inside the component scope and use useCallback

    const handlePersonaSelection = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Update user profile with selected persona in backend (await to ensure state consistency)
            await api.updateUserProfile(userId, { persona: persona.id });

            // Navigate after successful update
            if (onSelected) {
                onSelected(persona);
            }
            // Logic moved to Journey.tsx to prevent race condition during navigation

        } catch (err) {
            console.error('Failed to select persona:', err);
            setError('Failed to select journey. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [userId, persona, onSelected, loadUserProgress]); // Dependency array to prevent stale closure

    const handleLoadDemo = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsLoadingDemo(true);
        setError(null);

        try {
            // Call backend to fetch demo state
            const result = await api.loadDemoState();

            if (result?.success && result?.progress) {
                const backendProgress = result.progress;

                // --- Progress Mapping (Fixes TS2304: userProgress, useJourneyStore) ---
                const completedCount = typeof backendProgress.completed_phases === 'number' ? backendProgress.completed_phases : 0;
                const completedPhases = Array.from({ length: completedCount }, (_, index) => index);

                const rawCertificates = Array.isArray(backendProgress.nft_certificates) ? backendProgress.nft_certificates : [];
                const mappedNfts = rawCertificates.map((certificate: any) => certificate?.title || certificate?.nft_address || `Phase ${certificate?.phase} NFT`);

                const mappedProgress = {
                    ...userProgress,
                    totalXP: backendProgress.total_xp || 0,
                    nfts: mappedNfts,
                    mfaiTokens: backendProgress.token_transactions?.mfai_tokens || 0,
                    completedPhases,
                    currentPersona: persona.id,
                    votingPower: Math.floor((backendProgress.total_xp || 0) / 10),
                    walletConnected: userProgress?.walletConnected ?? false,
                    walletAddress: userProgress?.walletAddress,
                };

                if (setUserProgress) {
                    setUserProgress(mappedProgress);
                }

                const { setCurrentPhase } = useJourneyStore.getState(); // Fixes TS2304: useJourneyStore
                setCurrentPhase(completedCount);

                if (onSelected) onSelected(persona);

            } else {
                if (loadUserProgress) {
                    await loadUserProgress();
                }
            }
        } catch (err) {
            console.error('Failed to load demo:', err);
            setError('Failed to load demo. Please try again.');
        } finally {
            setIsLoadingDemo(false);
        }
    }, [userId, persona, onSelected, setUserProgress, userProgress, loadUserProgress]);

    // Simple loading check
    const isBusy = isLoading || isLoadingDemo;

    return (
        <div
            className={`transition-all duration-300 ease-in-out ${isBusy ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl cursor-pointer'}`}
            onClick={isBusy ? undefined : handlePersonaSelection}
            aria-disabled={isBusy}
        >
            {/* --- Existing JSX Structure (Simplified) --- */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-700/60 dark:bg-slate-900">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-bold">{persona.title}</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {persona.description}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 rounded-md bg-red-100 p-2 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="mt-6 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePersonaSelection();
                        }}
                        disabled={isBusy}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:bg-slate-400/60"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                        {isLoading ? 'Loading...' : 'Start Journey'}
                    </button>

                    {demoMode && (
                        <button
                            type="button"
                            onClick={handleLoadDemo}
                            disabled={isBusy}
                            className="inline-flex items-center gap-2 rounded-lg border border-indigo-500 px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-500 hover:text-white disabled:opacity-50 dark:text-indigo-400 dark:hover:bg-indigo-500"
                        >
                            {isLoadingDemo ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                            {isLoadingDemo ? 'Loading Demo...' : 'Load Demo State'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JourneyCard;
