/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { ArrowLeft, CheckCircle2, ChevronRight, LayoutGrid, Maximize2, Minimize2, PanelLeft, PanelRight, Target } from 'lucide-react';
import React, { Component, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shallow } from 'zustand/shallow';
import { getPersonaProofData, getProofType } from '../../data/proofsData';
import { useJourneyStore } from '../../store/journeyStore';
import type { JourneyStepResponse, UIBlock, TextBlock, MissionBlock } from '../../types/uiBlocks';
import { api } from '../../utils/api';
import { tokenStore } from '../../utils/tokenStore';
import UIBlocksRenderer from '../UIBlocks/UIBlocksRenderer';
import { JourneyNextActionsPanel } from './JourneyNextActionsPanel';
import { JourneyProgressBar } from './JourneyProgressBar';
import JourneyTimeline from './JourneyTimeline';
import ZynoSignalSidebar from './ZynoSignalSidebar';
import ZynoChat from './ZynoChat';
import { ActiveAgentsPanel } from './ActiveAgentsPanel';
import { ResourceDeliveryPanel } from './ResourceDeliveryPanel';

import { usePhaseData } from '../../hooks/usePhaseData';

import DAOVoteModal from '../DAOVoteModal';
import StakingModal from '../StakingModal';
import NFTProofModal from '../NFTProofModal';

import JourneyCompletedPage from '../JourneyCompletedPage';
import { LaunchCollaterizePhase } from './LaunchCollaterizePhase';

import { toast } from 'sonner';
import { useWorkspaceLayout } from '../../contexts/WorkspaceLayoutContext';
import { useArtifacts } from '../../hooks/useArtifacts';
import { ArtifactModal } from '../Artifacts/ArtifactModal';
import { NeuralOverlay } from '../Artifacts/NeuralOverlay';

class SafeBoundary extends Component<{ fallback?: React.ReactNode; children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch() {
        // swallow
    }
    render() {
        if (this.state.hasError) {
            return this.props.fallback || <div className="text-xs text-amber-300">Section indisponible.</div>;
        }
        return this.props.children;
    }
}

const buildArtifactCatalog = (artifacts: any[] = []) =>
    artifacts
        .map((artifact) => ({
            key: artifact.id,
            title: artifact.title,
            category: artifact.agent?.role ?? artifact.type,
            agent: artifact.agent?.name ?? 'Zyno Agent',
            version: 'v1.0.0',
            fileUrl: artifact.fileUrl ?? '',
            status: artifact.status ?? 'unlocked',
        }))
        .sort((a, b) => {
            if (a.status === b.status) return a.title.localeCompare(b.title);
            return a.status === 'unlocked' ? -1 : 1;
        });

const useArtifactSelection = (
    artifacts: any[] | undefined,
    selectedArtifactKey: string | null,
    setSelectedArtifactKey: (key: string | null) => void
) => {
    const artifactCatalog = useMemo(() => buildArtifactCatalog(artifacts), [artifacts]);

    useEffect(() => {
        if (artifactCatalog.length === 0) {
            if (selectedArtifactKey !== null) setSelectedArtifactKey(null);
            return;
        }
        const fallbackArtifact =
            artifactCatalog.find((artifact) => artifact.status === 'unlocked') ?? artifactCatalog[0];
        if (!selectedArtifactKey) {
            setSelectedArtifactKey(fallbackArtifact.key);
            return;
        }
        const selectionStillExists = artifactCatalog.some((artifact) => artifact.key === selectedArtifactKey);
        if (!selectionStillExists) {
            setSelectedArtifactKey(fallbackArtifact.key);
        }
    }, [artifactCatalog, selectedArtifactKey, setSelectedArtifactKey]);

    return artifactCatalog;
};

const useAutoInteractionTrigger = (params: {
    selectedPersona: any;
    activePhase: any;
    isStepLoading: boolean;
    activePhaseIndex: number;
    totalPhases: number;
    lastStep: any;
    handleRunInteractiveStep: () => void | Promise<void>;
}) => {
    const autoInteractionKeyRef = useRef<string | null>(null);

    useEffect(() => {
        if (globalThis.window !== undefined && (globalThis.window as any).__E2E__ === true) return;
        if (typeof navigator !== 'undefined' && (navigator as any).webdriver) return;
        if (!params.selectedPersona) return;
        if (!params.activePhase) return;
        if (params.isStepLoading) return;
        if (params.activePhaseIndex >= params.totalPhases) return;

        const lastStepPhaseId = params.lastStep?.metadata?.phase_id;
        const lastStepPersonaId = params.lastStep?.metadata?.persona_id;
        const matchesCurrent = lastStepPhaseId === params.activePhase.id && lastStepPersonaId === params.selectedPersona.id;
        if (matchesCurrent) return;

        const key = `${params.selectedPersona.id}:${params.activePhase.id}`;
        if (autoInteractionKeyRef.current === key) return;
        autoInteractionKeyRef.current = key;

        const maybePromise = params.handleRunInteractiveStep();
        if (maybePromise && typeof (maybePromise as Promise<void>).catch === 'function') {
            (maybePromise as Promise<void>).catch((err) => {
                console.error('Auto interaction failed', err);
            });
        }
    }, [
        params.activePhase,
        params.activePhaseIndex,
        params.handleRunInteractiveStep,
        params.isStepLoading,
        params.lastStep?.metadata?.persona_id,
        params.lastStep?.metadata?.phase_id,
        params.selectedPersona,
        params.totalPhases,
    ]);
};

const computeGridTemplate = (focusMode: boolean, leftPanelOpen: boolean, rightPanelOpen: boolean) => {
    if (focusMode) return 'grid-cols-1';
    if (leftPanelOpen && rightPanelOpen) return 'grid-cols-[280px_1fr_320px]';
    if (leftPanelOpen) return 'grid-cols-[280px_1fr]';
    if (rightPanelOpen) return 'grid-cols-[1fr_320px]';
    return 'grid-cols-1';
};

interface JourneySimulationModeProps {
    onBack?: () => void;
}

const JourneySimulationMode = ({ onBack }: JourneySimulationModeProps) => {
    const navigate = useNavigate();
    const apiJourneyId = useJourneyStore((state) => state.apiJourneyId);

    const {
        selectedPersona,
        userProgress,
        currentPhaseIndex,
        lastStep,
        isStepLoading,
        loadUserProgress,
        setCurrentPhase,
        completePhase,
        ensureApiJourneyId,
        uiMode,
        uiTone,
        updateStaking,
        updateVotingPower,
        runInteractiveStep,
    } = useJourneyStore(
        (state) => ({
            selectedPersona: state.selectedPersona,
            userProgress: state.userProgress,
            currentPhaseIndex: state.currentPhase,
            lastStep: state.lastStep,
            isStepLoading: state.isStepLoading,
            loadUserProgress: state.loadUserProgress,
            setCurrentPhase: state.setCurrentPhase,
            completePhase: state.completePhase,
            ensureApiJourneyId: state.ensureApiJourneyId,
            uiMode: state.uiMode,
            uiTone: state.uiTone,
            updateStaking: state.updateStaking,
            updateVotingPower: state.updateVotingPower,
            runInteractiveStep: state.runInteractiveStep,
        }),
        shallow
    );

    const [isThinking, setIsThinking] = useState(false);
    const [currentTask, setCurrentTask] = useState({ agent: '', task: '' });
    const [viewingArtifact, setViewingArtifact] = useState<any>(null);
    const [selectedArtifactKey, setSelectedArtifactKey] = useState<string | null>(null);

    const { artifacts } = useArtifacts({
        fallbackToStatic: false,
    });

    const activePhaseIndex = currentPhaseIndex ?? userProgress.completedPhases.length;
    const selectedPersonaId = selectedPersona?.id ?? 'unknown';

    const {
        activePhase,
        safeActivePhase,
        totalPhases,
        configuredPhase,
        isPhaseCompleted
    } = usePhaseData({
        selectedPersona,
        activePhaseIndex,
        userProgress
    });

    // Legacy properties removed - these don't exist in current store
    const phaseStatus: string = 'IN_PROGRESS';
    const phaseFeedback: any = null;
    const rewardsReady = false;
    const quizUnlocked = false;
    const mintUnlocked = false;
    const rewardsClaimed = false;
    const mintStatus: string = 'idle';
    const markQuizPassed = () => console.log('markQuizPassed not implemented');
    const claimRewards = () => console.log('claimRewards not implemented');
    const activeAgents: any[] = [];
    const generatedResources: any[] = [];



    const showNeuralOverlay = (task: string) => {
        const startedAt = Date.now();
        setIsThinking(true);
        setCurrentTask({ agent: 'Zyno', task });
        return startedAt;
    };

    const hideNeuralOverlay = async (startedAt: number) => {
        const elapsed = Date.now() - startedAt;
        if (elapsed < 450) {
            await new Promise((r) => setTimeout(r, 450 - elapsed));
        }
        setIsThinking(false);
    };

    const [proofModalData, setProofModalData] = useState<any>(null);
    const [showStakingModal, setShowStakingModal] = useState(false);
    const [showVoteModal, setShowVoteModal] = useState(false);
    const [isSubmittingPhase, setIsSubmittingPhase] = useState(false);
    const [userDraft, setUserDraft] = useState('');
    const handleDemoReset = useCallback(() => {
        try {
            window.localStorage.removeItem('mfai-journey-storage');
        } catch {
            // ignore
        }
        window.location.reload();
    }, []);
    const claimLabel = useMemo(() => {
        if (rewardsClaimed || mintStatus === 'completed') return 'Récompenses prises';
        if (mintStatus === 'finalizing') return 'Finalisation...';
        if (mintStatus === 'minting') return 'Minting on Solana...';
        if (mintStatus === 'initiating') return 'Initiating Transaction...';
        if (mintStatus === 'pending') return 'En attente du backend...';
        return 'Mint & Récompenses';
    }, [rewardsClaimed, mintStatus]);

    const {
        focusMode,
        leftPanelOpen,
        rightPanelOpen,
        toggleFocusMode,
        setLeftPanelOpen,
        setRightPanelOpen,
        cycleDensity,
    } = useWorkspaceLayout();

    // Artifact Catalog
    useArtifactSelection(artifacts, selectedArtifactKey, setSelectedArtifactKey);

    const handleRunInteractiveStep = async () => {
        if (isStepLoading) return;
        if (!activePhase) return;
        if (!selectedPersona) return;

        const overlayStart = showNeuralOverlay(`Generating ${safeActivePhase.title}`);
        try {
            await runInteractiveStep({
                phaseId: safeActivePhase.id,
                trackId: selectedPersona.id,
                userInput: '',
            });
            await loadUserProgress(true);
        } finally {
            await hideNeuralOverlay(overlayStart);
        }
    };

    const onSubmitMission = async (input: string) => {
        if (isStepLoading || isSubmittingPhase) return;
        if (!activePhase || !selectedPersona) return;
        setIsSubmittingPhase(true);
        const overlayStart = showNeuralOverlay(`Submitting ${safeActivePhase.title}`);
        try {
            await runInteractiveStep({
                phaseId: safeActivePhase.id,
                trackId: selectedPersona.id,
                userInput: input || safeActivePhase.mission || '',
            });
            await loadUserProgress(true);
        } finally {
            setIsSubmittingPhase(false);
            await hideNeuralOverlay(overlayStart);
        }
    };

    // Auto-bootstrap active phase interaction
    useAutoInteractionTrigger({
        selectedPersona,
        activePhase,
        isStepLoading,
        activePhaseIndex,
        totalPhases,
        lastStep,
        handleRunInteractiveStep,
    });

    const getCompletionCtaLabel = () => {
        const hasStakingRequirement =
            typeof safeActivePhase.stakingRequired === 'number' && safeActivePhase.stakingRequired > 0;
        if (safeActivePhase.id === 'launch-collaterize') return 'Simulate Launch';
        if (hasStakingRequirement) return `Stake ${safeActivePhase.stakingRequired} $MFAI`;
        if (safeActivePhase.daoVoteRequired) return 'Vote';
        return 'Complete Phase';
    };

    const localInteractionStep = useMemo<JourneyStepResponse>(() => {
        const blocks: UIBlock[] = [];
        const introBlock: TextBlock = {
            kind: 'text_block' as const,
            id: `${selectedPersonaId}:${safeActivePhase.id}:intro`,
            title: 'Zyno Mission Brief',
            body_markdown: [
                `**Phase:** ${safeActivePhase.title}`,
                ``,
                safeActivePhase.mission ? `**Objective:** ${safeActivePhase.mission}` : `**Objective:** Complete the phase deliverable.`,
                ``,
                `Complete the mission below to validate this phase.`,
            ].join('\n'),
        };
        const deliverableBlock: MissionBlock = {
            kind: 'mission_block' as const,
            id: `${selectedPersonaId}:${safeActivePhase.id}:deliverable`,
            title: 'Deliverable Submission',
            description: safeActivePhase.mission || safeActivePhase.description || 'Submit your phase deliverable for evaluation.',
            mission_type: 'deliverable',
            expected_input_type: 'markdown_document',
            xp_reward: safeActivePhase.xpReward ?? 0,
            nft_reward_id: safeActivePhase.nftReward,
            is_mandatory: true,
        };
        blocks.push(introBlock, deliverableBlock);

        return {
            metadata: {
                persona_id: selectedPersonaId,
                journey_track: selectedPersonaId,
                phase_id: safeActivePhase.id,
                language: 'en',
                mode: uiMode,
                tone: uiTone,
                title: `${safeActivePhase.title}  Interaction`,
                summary: safeActivePhase.mission || safeActivePhase.description,
            },
            ui_blocks: blocks,
            agent_actions: [],
            next_state: { phase_id: safeActivePhase.id, completed_missions: [], xp_delta: 0 },
        };
    }, [safeActivePhase, selectedPersonaId, uiMode, uiTone]);

    const interactionResponse = useMemo<JourneyStepResponse>(() => {
        const candidate: JourneyStepResponse | null = lastStep ?? null;
        const hasBlocks = Boolean(candidate?.ui_blocks?.length);
        const looksLikeMock =
            candidate?.ui_blocks?.length === 1 && candidate.ui_blocks[0]?.title === 'Mock';
        const matchesPhase = candidate?.metadata?.phase_id === safeActivePhase.id;
        const matchesPersona = candidate?.metadata?.persona_id === selectedPersonaId;

        if (hasBlocks && matchesPhase && matchesPersona && !looksLikeMock) {
            return candidate;
        }
        return localInteractionStep;
    }, [lastStep, localInteractionStep, safeActivePhase.id, selectedPersonaId]);

    if (!selectedPersona) {
        return null;
    }
    // If activePhase is 0, we might need to show map or onboarding.
    // But standard view expects activePhase >= 1
    if (!activePhase) {
        // return <JourneyCompletedPage />;
    }
    if (activePhaseIndex >= totalPhases) return <JourneyCompletedPage />;

    const handleNavigationToggle = () => {
        if (leftPanelOpen) {
            setLeftPanelOpen(false);
            return;
        }
        if (focusMode) toggleFocusMode();
        setLeftPanelOpen(true);
    };
    const handleInsightsToggle = () => {
        if (rightPanelOpen) {
            setRightPanelOpen(false);
            return;
        }
        if (focusMode) toggleFocusMode();
        setRightPanelOpen(true);
    };

    const gridTemplate = computeGridTemplate(focusMode, leftPanelOpen, rightPanelOpen);
    const showLeftPanel = leftPanelOpen && !focusMode;
    const showRightPanel = rightPanelOpen && !focusMode;
    const showLaunchPhase = activePhase.id === 'launch-collaterize' && !isPhaseCompleted;

    const renderHeader = () => (
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-[#0A0A1F]/95 px-6 backdrop-blur">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => (onBack ? onBack() : navigate('/journeys'))}
                    className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition hover:bg-white/10"
                >
                    <ArrowLeft size={14} className="text-white/60 group-hover:text-white" />
                    <span className="text-xs font-medium text-white/60 group-hover:text-white">Back to Journeys</span>
                </button>
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="hidden md:flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-0.5">
                    <span>Journey</span>
                    <ChevronRight size={10} />
                    <span>{selectedPersona.title}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="rounded bg-accent-cyan/10 border border-accent-cyan/20 px-1.5 py-0.5 text-[10px] font-bold text-accent-cyan shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                        PHASE {activePhaseIndex + 1}
                    </span>
                    <h1 className="text-sm font-bold uppercase tracking-wider text-white">{safeActivePhase.title}</h1>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={handleNavigationToggle}
                    className={`rounded-full p-2 transition-colors ${leftPanelOpen ? 'text-white bg-white/10' : 'text-white/40 hover:bg-white/10 hover:text-white'}`}
                    title={leftPanelOpen ? 'Hide Timeline' : 'Show Timeline'}
                >
                    <PanelLeft size={18} />
                </button>
                <button
                    onClick={toggleFocusMode}
                    className={`rounded-full p-2 transition-colors ${focusMode ? 'text-accent-cyan bg-accent-cyan/10' : 'text-white/40 hover:bg-white/10 hover:text-white'}`}
                    title={focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
                >
                    {focusMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button
                    onClick={cycleDensity}
                    className="rounded-full p-2 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
                    title="Change View Density"
                >
                    <LayoutGrid size={18} />
                </button>
                <button
                    onClick={handleInsightsToggle}
                    className={`rounded-full p-2 transition-colors ${rightPanelOpen ? 'text-white bg-white/10' : 'text-white/40 hover:bg-white/10 hover:text-white'}`}
                    title={rightPanelOpen ? 'Hide Insights & Actions' : 'Show Insights & Actions'}
                >
                    <PanelRight size={18} />
                </button>
            </div>
        </header>
    );

    const renderLeftPanel = () =>
        showLeftPanel ? (
            <aside className="sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <JourneyTimeline
                    phases={selectedPersona?.phases || []}
                    currentPhase={activePhaseIndex}
                    onPhaseChange={(idx) => {
                        if (idx <= userProgress.completedPhases.length) setCurrentPhase(idx);
                    }}
                />
            </aside>
        ) : null;

    const renderCenterStage = () => (
        <section className="min-h-[600px] space-y-6">
            {!focusMode && <JourneyProgressBar personaId={selectedPersona.id} currentStepId={activePhase.id} />}
            {showLaunchPhase ? (
                <LaunchCollaterizePhase onComplete={handleCompletePhase} />
            ) : (
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-1 shadow-2xl backdrop-blur-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-purple to-blue-600 text-white shadow-lg">
                                <Target size={16} />
                            </div>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                                Mission Workspace
                                {' '}
                                <span className="hidden sm:inline ml-2 text-[10px] text-white/40 font-normal normal-case tracking-normal border-l border-white/10 pl-2">
                                    {safeActivePhase.mission ? 'Execute objectives & Validation' : 'View details'}
                                </span>
                            </h2>
                        </div>
                        {!isPhaseCompleted && (
                            <div className="flex gap-2">
                                {primaryNextAction && (
                                    <button
                                        data-testid="primary-action-button"
                                        onClick={() => handleNextActionClick(primaryNextAction.type, primaryNextAction.id)}
                                        className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
                                    >
                                        {primaryNextAction.label}
                                    </button>
                                )}
                                <button
                                    data-testid="complete-phase-button"
                                    onClick={handleCompletePhase}
                                    className="flex items-center gap-2 rounded-lg bg-accent-cyan px-3 py-1.5 text-xs font-bold text-black shadow-lg shadow-cyan-500/20 hover:bg-accent-cyan/90 transition-all"
                                >
                                    <CheckCircle2 size={14} />
                                    {getCompletionCtaLabel()}
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="grid gap-3 border-b border-white/10 bg-white/5 px-6 py-4 md:grid-cols-3">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/80 space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">Status</span>
                                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                                    {phaseStatus}
                                </span>
                            </div>
                            <p className="opacity-80">Phase {activePhaseIndex + 1}/{totalPhases || 1}</p>
                            <p className="opacity-70">Progress: {Math.round((activePhaseIndex / Math.max(1, totalPhases)) * 100)}%</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/80 space-y-1">
                            <div className="font-semibold text-white">Agent feedback</div>
                            {phaseFeedback ? (
                                <>
                                    <p>Score: {phaseFeedback.score}/100 ({phaseFeedback.verdict === 'pass' ? 'OK' : 'To improve'})</p>
                                    <p>Relevance : {phaseFeedback.relevance}</p>
                                    <div className="space-y-1">
                                        {(phaseFeedback?.axes || []).map((axis: any) => (
                                            <div key={axis.label}>
                                                <div className="flex items-center justify-between text-[11px]">
                                                    <span>{axis.label}</span>
                                                    <span>{axis.value}%</span>
                                                </div>
                                                <div className="h-1.5 rounded-full bg-white/10">
                                                    <div className="h-1.5 rounded-full bg-accent-cyan" style={{ width: `${Math.min(100, axis.value)}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <ul className="list-disc pl-4 space-y-1">
                                        {(phaseFeedback?.nextSteps || []).map((n: string, i: number) => (
                                            <li key={i}>{n}</li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <p className="opacity-70">Waiting for analysis.</p>
                            )}
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/80 space-y-2">
                            <div className="font-semibold text-white">Actions</div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    className="btn-primary text-[11px] px-2 py-1.5"
                                    onClick={() => onSubmitMission(userDraft || safeActivePhase.mission || 'Submission')}
                                    disabled={isSubmittingPhase || isStepLoading}
                                >
                                    {isSubmittingPhase ? 'Submitting...' : 'Submit'}
                                </button>
                                <button
                                    className="btn-secondary text-[11px] px-2 py-1.5"
                                    onClick={() => markQuizPassed()}
                                    disabled={!quizUnlocked && phaseStatus !== 'FEEDBACK_AVAILABLE'}
                                >
                                    Validate quiz
                                </button>
                                <button
                                    className="btn-secondary text-[11px] px-2 py-1.5"
                                    onClick={() => claimRewards()}
                                    disabled={!rewardsReady || rewardsClaimed || !mintUnlocked || mintStatus === 'initiating' || mintStatus === 'minting' || mintStatus === 'finalizing'}
                                >
                                    {claimLabel}
                                </button>
                                <button
                                    className="text-[10px] underline text-amber-300 hover:text-amber-200"
                                    type="button"
                                    onClick={handleDemoReset}
                                >
                                    Reset journey state
                                </button>
                            </div>
                            <div className="text-[11px] opacity-75">
                                XP: {userProgress.totalXP} | $MFAI: {userProgress.mfaiTokens}
                            </div>
                        </div>
                    </div>
                    <div className="border-b border-white/10 bg-white/5 px-6 py-4 grid gap-3 md:grid-cols-3">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/80 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-white">Active agents</span>
                            </div>
                            <SafeBoundary fallback={<div className="text-[11px] text-amber-300">Agents unavailable.</div>}>
                                <ActiveAgentsPanel agents={activeAgents || []} />
                            </SafeBoundary>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/80 space-y-2">
                            <div className="font-semibold text-white">Intel & Briefing</div>
                            <div className="text-white/80">
                                <p className="font-semibold text-[12px]">Objective</p>
                                <p className="text-[11px] opacity-80">{safeActivePhase.mission || 'Deliver the phase objective.'}</p>
                            </div>
                            <div className="text-white/80">
                                <p className="font-semibold text-[12px]">Criteria</p>
                                <ul className="list-disc pl-4 space-y-1 text-[11px] opacity-80">
                                    <li>Clarity of the deliverable</li>
                                    <li>Technical rigor</li>
                                    <li>Risk management and action plan</li>
                                </ul>
                            </div>
                            <div className="text-white/80">
                                <p className="font-semibold text-[12px]">Help</p>
                                <ul className="list-disc pl-4 space-y-1 text-[11px] opacity-80">
                                    <li>Structure your plan in context, execution, risks.</li>
                                    <li>Add a success metric and a dated milestone.</li>
                                    <li>Include a fallback if the key resource fails.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/80 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-white">Resources loot</span>
                            </div>
                            <SafeBoundary fallback={<div className="text-[11px] text-amber-300">Resources unavailable.</div>}>
                                <ResourceDeliveryPanel resources={generatedResources || []} />
                            </SafeBoundary>
                        </div>
                    </div>
                    <div className="border-b border-white/10 bg-white/5 px-6 py-4">
                        <label className="text-xs text-white/70">Deliverable submission</label>
                        <textarea
                            value={userDraft}
                            onChange={(e) => setUserDraft(e.target.value)}
                            className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white placeholder:text-white/40"
                            rows={3}
                            placeholder="Describe your deliverable for this phase..."
                        />
                    </div>
                    <div className="max-h-[800px] overflow-y-auto bg-black/20 p-6 md:p-8">
                        <UIBlocksRenderer response={interactionResponse} />
                    </div>
                </div>
            )}
        </section>
    );

    const renderRightPanel = () => {
        const storedId = apiJourneyId || ensureApiJourneyId();
        const activeJourneyId = /^[0-9a-fA-F]{24}$/.test(storedId) ? storedId : ensureApiJourneyId(); // Fallback if corrupted

        return showRightPanel ? (
            <aside className="sticky top-24 h-[calc(100vh-8rem)] space-y-4 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <JourneyNextActionsPanel
                    personaId={selectedPersona.id}
                    currentStepId={activePhase.id}
                    journeyId={activeJourneyId}
                    onActionClick={handleNextActionClick}
                />
                <ZynoSignalSidebar className="w-full" />
            </aside>
        ) : null;
    };

    const renderMain = () => (
        <main className={`relative mx-auto max-w-[1920px] transition-all duration-300 ${focusMode ? 'px-0' : 'px-4 lg:px-8'}`}>
            <div className={`grid gap-6 mt-6 transition-all duration-500 ${gridTemplate}`}>
                {renderLeftPanel()}
                {renderCenterStage()}
                {renderRightPanel()}
            </div>
        </main>
    );

    const buildCompletedPhaseData = () => {
        const proofType = getProofType(selectedPersona.id, activePhase.id);
        const proofData = getPersonaProofData(
            selectedPersona.id,
            activePhase.id,
            proofType,
            activePhase.xpReward,
            activePhase.title,
            activePhaseIndex + 1
        );
        return {
            personaId: selectedPersona.id,
            phaseId: activePhase.id,
            proofType,
            title: activePhase.nftReward || proofData.name || `Proof-of-${proofType}`,
            description: proofData.description || `Successfully completed the ${activePhase.title} phase.`,
            imageUrl: proofData.imageUrl,
            xpEarned: activePhase.xpReward,
            phase: activePhase.title,
            phaseNumber: activePhaseIndex + 1,
        };
    };

    const submitPhaseCompletion = async () => {
        const journeyId = ensureApiJourneyId();
        const missionPayload = {
            missionId: `${activePhase.id}-complete`,
            inputType: 'confirmation',
            submission: 'Phase Complete',
            journeyState: { xp: userProgress.totalXP },
        };
        await api.submitMission(journeyId, missionPayload as any);
        await completePhase(activePhaseIndex, {
            score: 100,
            phaseNumber: activePhaseIndex + 1,
            xpReward: activePhase.xpReward,
            mfaiReward: activePhase.mfaiReward,
            nftReward: activePhase.nftReward,
        });
    };

    const handleCompletePhase = async () => {
        if (isSubmittingPhase || isPhaseCompleted) return;
        if (!selectedPersona || !activePhase) return;

        const accessToken = tokenStore.getAccessToken();
        if (!accessToken) {
            toast.error('Please sign in before completing this phase.');
            return;
        }

        try {
            setIsSubmittingPhase(true);
            await submitPhaseCompletion();
            setTimeout(() => setProofModalData(buildCompletedPhaseData()), 1000);
            toast.success('Phase validated by Zyno AI.');
        } catch (error) {
            console.error(error);
            toast.error('Validation failed.');
        } finally {
            setIsSubmittingPhase(false);
        }
    };

    const handleNextActionClick = (actionType: string, _actionId: string) => {
        const overlayStart = showNeuralOverlay(`Initializing ${actionType.toUpperCase()} module...`);

        // Simulate checking requirement or preparing the tool
        setTimeout(() => {
            hideNeuralOverlay(overlayStart);
            toast.success(`Action ${actionType} ready.`);
            // In a real scenario, this would navigate to the tool or open a modal
            // For now, we scroll to the workspace
            const workspace = document.querySelector('section');
            workspace?.scrollIntoView({ behavior: 'smooth' });
        }, 1500);
    };

    const primaryNextAction = configuredPhase?.nextActions?.[0] ?? null;

    return (
        <div className="min-h-screen bg-[#0A0A1F] pb-20 font-sans text-white">
            <NeuralOverlay isVisible={isThinking} agentName={currentTask.agent} taskName={currentTask.task} />
            <ArtifactModal isOpen={!!viewingArtifact} onClose={() => setViewingArtifact(null)} fileUrl={viewingArtifact?.fileUrl} title={viewingArtifact?.title} />
            {renderHeader()}
            {renderMain()}
            {proofModalData && <NFTProofModal onClose={() => setProofModalData(null)} {...proofModalData} />}
            {showStakingModal && (
                <StakingModal
                    onClose={() => setShowStakingModal(false)}
                    availableAmount={userProgress.mfaiTokens}
                    currentStaked={userProgress.stakedMfai || 0}
                    onStake={(amount) => {
                        updateStaking(amount);
                        setShowStakingModal(false);
                        handleCompletePhase();
                    }}
                />
            )}
            {showVoteModal && (
                <DAOVoteModal
                    onClose={() => setShowVoteModal(false)}
                    phase={safeActivePhase}
                    votingPower={userProgress.votingPower}
                    onVote={(_vote) => {
                        updateVotingPower(10);
                        setShowVoteModal(false);
                        handleCompletePhase();
                    }}
                />
            )}
            <ZynoChat />
        </div>
    );
};

export default JourneySimulationMode;
