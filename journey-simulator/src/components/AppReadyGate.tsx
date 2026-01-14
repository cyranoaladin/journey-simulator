import { FC, ReactNode, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useJourneyStore } from '../store/journeyStore';
import { useRunModeStore } from '../store/runModeStore';

interface AppReadyGateProps {
    children: ReactNode;
}

export const AppReadyGate: FC<AppReadyGateProps> = ({ children }) => {
    const { isLoading: authLoading } = useAuth();
    const [journeyHydrated, setJourneyHydrated] = useState(false);
    const [runModeHydrated, setRunModeHydrated] = useState(false);

    useEffect(() => {
        // Check JourneyStore hydration
        const unsubJourney = useJourneyStore.persist.onFinishHydration(() => setJourneyHydrated(true));
        // If already hydrated (sync)
        if (useJourneyStore.persist.hasHydrated()) {
            setJourneyHydrated(true);
        }

        // Check RunModeStore hydration
        const unsubRunMode = useRunModeStore.persist.onFinishHydration(() => setRunModeHydrated(true));
        // If already hydrated
        if (useRunModeStore.persist.hasHydrated()) {
            setRunModeHydrated(true);
        }

        return () => {
            unsubJourney();
            unsubRunMode();
        };
    }, []);

    const authReady = !authLoading;
    // Strict Contract: Auth Ready AND Stores Hydrated
    const isReady = authReady && journeyHydrated && runModeHydrated;

    // Expose debug state for E2E diagnostics
    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).__APP_READY_STATE__ = {
                hydrated: journeyHydrated && runModeHydrated,
                authLoading: authLoading,
                runMode: useRunModeStore.getState().runMode,
                path: window.location.pathname,
                journeyHydrated,
                runModeHydrated,
                authReady,
                isReady,
                timestamp: new Date().toISOString(),
            };
        }
    }, [journeyHydrated, runModeHydrated, authLoading, authReady, isReady]);

    if (!isReady) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#09081a] text-slate-400" data-testid="app-loading">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-500" />
                    <span className="text-xs font-mono uppercase tracking-widest">
                        System Booting... ({!authLoading ? 'Auth OK' : 'Auth...'} | {journeyHydrated ? 'Store OK' : 'Store...'} | {runModeHydrated ? 'Mode OK' : 'Mode...'})
                    </span>
                </div>
            </div>
        );
    }

    // Once ready, we stamp the contract on a wrapper
    // NOTE: This wrapper replaces the previous 'app-ready' on LayoutShell to allow granular control
    // However, often we want the Layout structure to be visible even if loading content?
    // The user requested "app-ready" means "Store hydrated ...".
    // If we wrap the whole LayoutShell, the user sees a spinner.
    // If we wrap inner content, we show specific loaders.
    // Given "Boot Contract", usually we want the full layout to be effectively "ready" only when this passes.
    // But we might want the Header to be visible?
    // User Requirement: "AppReadyGate au niveau Layout (ou root route wrapper)".
    // Let's wrapping valid children.

    return (
        <>
            {/* We apply the data-testid to the first child if possible, 
          or wrapper div? 
          User said: "data-testid='app-ready' ... dans TOUS les layouts ... doit signifier ..."
          
          If we use a Fragment, we can't put data-testid.
          We can put a hidden div or attach to children?
          Safest is a transparent wrapper that acts as the signal holder.
      */}
            <div data-testid="app-ready" style={{ display: 'contents' }}>
                {children}
            </div>
        </>
    );
};
