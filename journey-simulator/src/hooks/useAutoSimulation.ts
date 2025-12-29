import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Persona } from '../types/journey';

interface UseAutoSimulationProps {
    isDemo: boolean;
    selectedPersona: Persona;
    activePhaseIndex: number;
    setCurrentPhase: (index: number) => void;
    runInteractiveStep: (params: any) => Promise<any>; // using 'any' for return type as step response structure might vary
    completePhase: (index: number, data: any) => Promise<void>;
    onThinkingStart: (task: string) => number;
    onThinkingEnd: (startedAt: number) => Promise<void>;
}

export const useAutoSimulation = ({
    isDemo,
    selectedPersona,
    activePhaseIndex,
    setCurrentPhase,
    runInteractiveStep,
    completePhase,
    onThinkingStart,
    onThinkingEnd
}: UseAutoSimulationProps) => {
    const [isAutoSimulating, setIsAutoSimulating] = useState(false);
    const [autoSimProgress, setAutoSimProgress] = useState<{ current: number; total: number; } | null>(null);
    const autoSimAbortRef = useRef(false);

    const startAutoSimulation = async () => {
        // Basic checks
        if (!isDemo || isAutoSimulating) return;

        autoSimAbortRef.current = false;
        setIsAutoSimulating(true);
        const phases = selectedPersona.phases;
        const startIndex = Math.max(0, activePhaseIndex);

        // Initial progress
        setAutoSimProgress({ current: startIndex + 1, total: phases.length });

        try {
            for (let i = startIndex; i < phases.length; i++) {
                if (autoSimAbortRef.current) break;

                const phase = phases[i];
                setAutoSimProgress({ current: i + 1, total: phases.length });
                setCurrentPhase(i);

                // Let React render the phase switch before requesting.
                await new Promise((r) => setTimeout(r, 150));

                const overlayStart = onThinkingStart(`Generating ${phase.title}…`);
                try {
                    await runInteractiveStep({
                        phaseId: phase.id,
                        trackId: selectedPersona.id,
                        userInput: '',
                    });
                } finally {
                    await onThinkingEnd(overlayStart);
                }

                // Small delay so the user can see the generated blocks.
                await new Promise((r) => setTimeout(r, 650));

                // Mark phase as completed in demo so progress/artifacts can advance.
                await completePhase(i, {
                    score: 100,
                    phaseNumber: i + 1,
                    xpReward: phase.xpReward,
                    mfaiReward: phase.mfaiReward,
                    nftReward: phase.nftReward,
                });

                // Another small pause before moving to next phase.
                await new Promise((r) => setTimeout(r, 450));
            }

            if (autoSimAbortRef.current) {
                // Auto-simulation was aborted
            } else {
                toast.success('Demo simulation complete: phases were played automatically.');
                toast.message('Auto-simulation stopped.');
            }
        } catch (err) {
            console.error("Auto simulation error:", err);
            toast.error("Auto simulation failed.");
        } finally {
            setIsAutoSimulating(false);
            setAutoSimProgress(null);
        }
    };

    const stopAutoSimulation = () => {
        if (!isAutoSimulating) return;
        autoSimAbortRef.current = true;
        setIsAutoSimulating(false);
        setAutoSimProgress(null);
    };

    return {
        isAutoSimulating,
        autoSimProgress,
        startAutoSimulation,
        stopAutoSimulation
    };
};
