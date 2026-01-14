import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RunMode } from '../types/uiBlocks';

interface RunModeState {
    runMode: RunMode;
    setRunMode: (mode: RunMode) => void;
    // Initialize from storage or default
    hydrate: () => void;
}

const normalizeRunMode = (v: unknown): RunMode => {
    if (v === 'real' || v === 'demo' || v === 'simulation') return v;
    return 'simulation';
};

export const useRunModeStore = create<RunModeState>()(
    persist(
        (set) => ({
            runMode: 'simulation',
            setRunMode: (mode) => {
                const normalized = normalizeRunMode(mode);
                set({ runMode: normalized });

                // Dispatch event for non-React listeners
                if (typeof window !== 'undefined') {
                    globalThis.dispatchEvent(new CustomEvent('mfai:runmode', { detail: normalized }));
                }
            },
            hydrate: () => {
                if (typeof window !== 'undefined') {
                    const stored = localStorage.getItem('mfai-run-mode');
                    if (stored) {
                        set({ runMode: normalizeRunMode(stored) });
                    }
                }
            }
        }),
        {
            name: 'mfai-run-mode-store',
            // We only persist the runMode field
            partialize: (state) => ({ runMode: state.runMode }),
            // Use efficient localStorage wrapper or default
        }
    )
);
