/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { useMemo } from 'react';
import { Persona, UserProgress } from '../types/journey';
import { getPhaseFromStepId } from '../config/journeyPhases';

interface UsePhaseDataProps {
    selectedPersona: Persona | null;
    activePhaseIndex: number;
    userProgress: UserProgress;
}

export const usePhaseData = ({
    selectedPersona,
    activePhaseIndex,
    userProgress
}: UsePhaseDataProps) => {
    const phases = selectedPersona?.phases ?? [];
    const activePhase = phases[activePhaseIndex] ?? phases[0] ?? null;

    // Safe Active Phase with defaults
    const safeActivePhase = useMemo(() => activePhase ?? {
        id: 'unknown',
        title: 'Current Phase',
        description: '',
        mission: '',
        tools: [],
        xpReward: 0,
        mfaiReward: 0,
        nftReward: undefined,
        stakingRequired: 0,
        daoVoteRequired: false,
        outcomes: []
    }, [activePhase]);

    const activePhaseNumber = activePhaseIndex + 1;
    // Ensure strict number comparison for completion
    const isPhaseCompleted = (userProgress?.completedPhases || []).includes(activePhaseIndex);
    const totalPhases = phases.length;
    const completedCount = (userProgress?.completedPhases || []).length;
    const completionPercent = totalPhases === 0 ? 0 : Math.min(100, Math.round((completedCount / totalPhases) * 100));
    const currentPhaseOrdinal = Math.min(totalPhases || 1, Math.max(1, activePhaseNumber));

    // Navigation / Configured Phase
    const selectedPersonaId = selectedPersona?.id ?? 'unknown';
    const currentStepId = `phase-${currentPhaseOrdinal}`;
    const configuredPhase = getPhaseFromStepId(selectedPersonaId, currentStepId);

    // Objectives
    const phaseObjectivesSource = (Array.isArray(activePhase?.outcomes) ? activePhase?.outcomes : []) as string[];
    const phaseObjectives = phaseObjectivesSource.filter((item) => Boolean(item && item.trim()));
    const objectivesFallback = phaseObjectives.length === 0
        ? [
            activePhase?.mission,
            'Review mission guidance and recommended tools.',
            'Submit your deliverable for evaluation to unlock rewards.',
        ].filter((item): item is string => Boolean(item && item.trim()))
        : [];
    const objectiveList = (phaseObjectives.length > 0 ? phaseObjectives : objectivesFallback) as string[];
    const objectiveStatuses = objectiveList.map((_, index) => {
        if (isPhaseCompleted) return 'done' as const;
        if (index === 0) return 'active' as const;
        return 'upcoming' as const;
    });

    return {
        activePhase,
        safeActivePhase,
        activePhaseNumber,
        isPhaseCompleted,
        totalPhases,
        completedCount,
        completionPercent,
        currentPhaseOrdinal,
        configuredPhase,
        objectiveList,
        objectiveStatuses
    };
};
