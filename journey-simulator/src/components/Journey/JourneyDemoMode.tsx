/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { ArrowLeft, LayoutGrid, Loader2, Maximize2, Minimize2, PanelLeft, PanelRight, Sparkles, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shallow } from 'zustand/shallow';
import { useJourneyStore } from '../../store/journeyStore';
import type { JourneyStepResponse, UIBlock, TextBlock } from '../../types/uiBlocks';
import { tokenStore } from '../../utils/tokenStore';
import UIBlocksRenderer from '../UIBlocks/UIBlocksRenderer';
import { JourneyProgressBar } from './JourneyProgressBar';
import JourneyTimeline from './JourneyTimeline';
import ZynoSignalSidebar from './ZynoSignalSidebar';
import ZynoChat from './ZynoChat';

import { DEMO_SCENARIOS } from '../../config/demoScenarios';
import { useDemoEngine } from '../../hooks/useDemoEngine';
import { usePhaseData } from '../../hooks/usePhaseData';

import JourneyCompletedPage from '../JourneyCompletedPage';

import { toast } from 'sonner';
import { useWorkspaceLayout } from '../../contexts/WorkspaceLayoutContext';
import { useArtifacts } from '../../hooks/useArtifacts';
import { ArtifactModal } from '../Artifacts/ArtifactModal';
import { NeuralOverlay } from '../Artifacts/NeuralOverlay';
import NFTProofModal from '../NFTProofModal';
import MarketLaunchpad from '../MarketLaunchpad';
import { StakingModal } from '../Modals/StakingModal';
import { DaoVoteModal } from '../Modals/DaoVoteModal';

const computeGridTemplate = (focusMode: boolean, leftPanelOpen: boolean, rightPanelOpen: boolean) => {
    if (focusMode) return 'grid-cols-1';
    if (leftPanelOpen && rightPanelOpen) return 'grid-cols-[280px_1fr_320px]';
    if (leftPanelOpen) return 'grid-cols-[280px_1fr]';
    if (rightPanelOpen) return 'grid-cols-[1fr_320px]';
    return 'grid-cols-1';
};

interface JourneyDemoModeProps {
    onBack?: () => void;
}

const JourneyDemoMode = ({ onBack: _onBack }: JourneyDemoModeProps) => {
    const navigate = useNavigate();
    const {
        selectedPersona,
        userProgress,
        currentPhaseIndex,
        lastStep,
        uiMode,
        uiTone,
    } = useJourneyStore(
        (state) => ({
            selectedPersona: state.selectedPersona,
            userProgress: state.userProgress,
            currentPhaseIndex: state.currentPhase,
            lastStep: state.lastStep,
            uiMode: state.uiMode,
            uiTone: state.uiTone,
        }),
        shallow
    );

    const [viewingArtifact, setViewingArtifact] = useState<any>(null);
    const [unlockedArtifacts, setUnlockedArtifacts] = useState<string[]>([]);

    const pendingArtifactIdsRef = useRef<Set<string>>(new Set());
    const { artifacts } = useArtifacts({
        fallbackToStatic: true,
    });

    const activePhaseIndex = currentPhaseIndex ?? userProgress.completedPhases.length;
    const selectedPersonaId = selectedPersona?.id ?? 'unknown';

    const {
        activePhase,
        safeActivePhase,
        totalPhases,
    } = usePhaseData({
        selectedPersona,
        activePhaseIndex,
        userProgress
    });



    const {
        demoState,
        setDemoState,
        startDemoPhase,
        completePhase,
        openModal,
        closeModal,
        isModalOpen,
        modalContent,
        resetDemoCache
    } = useJourneyStore(
        (state) => ({
            demoState: state.demoState,
            setDemoState: state.setDemoState,
            startDemoPhase: state.startDemoPhase,
            completePhase: state.completePhase,
            openModal: state.openModal,
            closeModal: state.closeModal,
            isModalOpen: state.isModalOpen,
            modalContent: state.modalContent,
            resetDemoCache: state.resetDemoCache
        }),
        shallow
    );

    // Demo Engine Hook - handles all timing/tick logic with proper cleanup
    const { currentPhaseId: enginePhaseId } = useDemoEngine();

    /**
     * Synchronous phase transition handler.
     * Completes the phase and resets demo state for next phase.
     */
    const handlePhaseComplete = useCallback((phaseIndex: number) => {
        completePhase(phaseIndex);
        closeModal();
        // Reset demo state to allow next phase to start fresh
        setDemoState({ status: 'IDLE', stepIndex: -1 });
    }, [completePhase, closeModal, setDemoState]);

    // GUARD: Empty sequence protection - auto-exit if sequence is empty while PLAYING
    useEffect(() => {
        const isPlaying = demoState?.status === 'PLAYING';
        const isEmpty = !demoState?.currentSequence || demoState.currentSequence.length === 0;
        
        if (isPlaying && isEmpty) {
            console.error('[Demo] CRITICAL: Empty sequence detected while PLAYING. Auto-exiting.');
            toast.error('Simulation Sequence Interrupted', {
                description: 'Returning to safety. Please try again.',
            });
            // Reset to safe state
            resetDemoCache();
        }
    }, [demoState?.status, demoState?.currentSequence, resetDemoCache]);

    // Final Validation Logic (DATA-DRIVEN - No more switch on index)
    useEffect(() => {
        if (demoState?.status === 'WAITING_FOR_FINAL_VALIDATION') {
            console.log(`[Demo] Reached Final Validation for Phase: ${activePhase.id} (Index ${activePhaseIndex})`);

            // Extract phase data for dynamic rendering
            const phaseTitle = activePhase.title || `Phase ${activePhaseIndex + 1}`;
            const nftReward = activePhase.nftReward || `${phaseTitle} Badge`;
            const xpReward = activePhase.xpReward || 100;
            const isCollaterize = activePhase.id?.includes('collaterize') || activePhaseIndex === 5;
            const isLaunch = activePhase.id?.includes('launch') && !isCollaterize;

            let modalContent = null;

            // CASE 1: Collaterize Phase (Veteran Status - Final Act)
            if (isCollaterize) {
                modalContent = (
                    <div className="max-w-md w-full">
                        <h2 data-testid="demo-phase-validation-title" className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] text-xl font-space font-bold px-4 py-2 rounded-lg bg-black/60 border border-white/10 backdrop-blur-sm">
                            Veteran Status
                        </h2>
                        <NFTProofModal
                            onClose={() => {
                                handlePhaseComplete(activePhaseIndex);
                                window.dispatchEvent(new CustomEvent('VETERAN_BADGE_UNLOCKED', { detail: { tier: 'veteran' } }));
                            }}
                            proofType="Orchestration"
                            title="Veteran Status"
                            description="You have completed the full Journey. Welcome to the Collaterize Network."
                            imageUrl="/assets/badges/veteran_master.png"
                            xpEarned={xpReward}
                            phase={phaseTitle}
                            phaseNumber={activePhaseIndex + 1}
                            onViewSkillchain={() => {
                                handlePhaseComplete(activePhaseIndex);
                                window.dispatchEvent(new CustomEvent('VETERAN_BADGE_UNLOCKED', { detail: { tier: 'veteran' } }));
                            }}
                        />
                    </div>
                );
            }
            // CASE 2: Launch Phase with Market Launchpad
            else if (isLaunch) {
                modalContent = (
                    <div className="max-w-4xl w-full">
                        <h2 data-testid="demo-phase-validation-title" className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] text-xl font-space font-bold px-4 py-2 rounded-lg bg-black/60 border border-white/10 backdrop-blur-sm">
                            {phaseTitle}
                        </h2>
                        <MarketLaunchpad
                            onComplete={() => handlePhaseComplete(activePhaseIndex)}
                        />
                    </div>
                );
            }
            // CASE 3: Standard Phase - Generic NFT Badge Mint
            else {
                // FIXED: Use persona-specific image path instead of generic phase_X.png
                const personaId = selectedPersona?.id || 'cognitive-activation-hub';
                const phaseId = activePhase?.id || `phase-${activePhaseIndex + 1}`;
                const nftImageUrl = `/images/nfts/${personaId}/${phaseId}.png`;

                modalContent = (
                    <div className="max-w-md w-full">
                        <h2 data-testid="demo-phase-validation-title" className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] text-xl font-space font-bold px-4 py-2 rounded-lg bg-black/60 border border-white/10 backdrop-blur-sm">
                            {nftReward}
                        </h2>
                        <NFTProofModal
                            onClose={() => handlePhaseComplete(activePhaseIndex)}
                            personaId={personaId}
                            phaseId={phaseId}
                            proofType="Skill"
                            title={nftReward}
                            description={`Certification for completing ${phaseTitle}.`}
                            imageUrl={nftImageUrl}
                            xpEarned={xpReward}
                            phase={phaseTitle}
                            phaseNumber={activePhaseIndex + 1}
                            onViewSkillchain={() => handlePhaseComplete(activePhaseIndex)}
                        />
                    </div>
                );
            }

            if (modalContent && !isModalOpen) {
                openModal(modalContent);
            }
        }
    }, [demoState?.status, activePhase.id, activePhaseIndex, handlePhaseComplete, openModal, activePhase.title, activePhase.nftReward, activePhase.xpReward, isModalOpen]);

    // Detect Staking Requirement
    useEffect(() => {
        const hasStakingRequirement = typeof activePhase.stakingRequired === 'number' && activePhase.stakingRequired > 0;
        
        if (hasStakingRequirement && demoState?.status === 'PLAYING' && lastStep) {
            // Check if current step has a staking mission
            const hasMissionBlock = lastStep.ui_blocks?.some(
                (block) => block.kind === 'mission_block' && (block as any).mission_type === 'staking'
            );
            
            if (hasMissionBlock && !isModalOpen) {
                openModal(
                    <StakingModal
                        amount={activePhase.stakingRequired!}
                        phaseTitle={activePhase.title || `Phase ${activePhaseIndex + 1}`}
                        phaseDescription={activePhase.description}
                        currentBalance={userProgress.mfaiTokens}
                        onStake={() => {
                            toast.success(`Staked ${activePhase.stakingRequired} $MFAI`);
                            closeModal();
                            // Continue demo sequence
                            const store = useJourneyStore.getState();
                            if (store.submitDemoInteraction) {
                                store.submitDemoInteraction('stake', { amount: activePhase.stakingRequired! });
                            }
                        }}
                        onCancel={closeModal}
                    />
                );
            }
        }
    }, [activePhase.stakingRequired, demoState?.status, lastStep, isModalOpen, activePhase.title, activePhase.description, activePhaseIndex, userProgress.mfaiTokens, openModal, closeModal]);

    // Detect DAO Vote Requirement
    useEffect(() => {
        const hasDaoVoteRequirement = activePhase.daoVoteRequired === true;
        
        if (hasDaoVoteRequirement && demoState?.status === 'PLAYING' && lastStep) {
            // Check if current step has a DAO vote mission
            const hasDaoMissionBlock = lastStep.ui_blocks?.some(
                (block) => block.kind === 'mission_block' && (block as any).mission_type === 'dao_vote'
            );
            
            if (hasDaoMissionBlock && !isModalOpen) {
                openModal(
                    <DaoVoteModal
                        proposal={{
                            title: `${activePhase.title} Approval`,
                            description: activePhase.description || `Vote to approve ${activePhase.title} for ecosystem deployment`,
                            votesFor: 0,
                            votesAgainst: 0,
                            endDate: '7 days',
                        }}
                        votingPower={userProgress.votingPower}
                        onVote={(vote) => {
                            toast.success(`Voted ${vote === 'yes' ? 'FOR' : 'AGAINST'} the proposal`);
                            closeModal();
                            // Continue demo sequence
                            const store = useJourneyStore.getState();
                            if (store.submitDemoInteraction) {
                                store.submitDemoInteraction('dao_vote', { vote });
                            }
                        }}
                        onCancel={closeModal}
                    />
                );
            }
        }
    }, [activePhase.daoVoteRequired, demoState?.status, lastStep, isModalOpen, activePhase.title, activePhase.description, userProgress.votingPower, openModal, closeModal]);

    // Start Phase on Mount or Phase Change (with guard to prevent double-starts)
    useEffect(() => {
        if (!selectedPersona) return;
        // Guard: If we're already playing this phase, don't restart
        if (enginePhaseId === activePhase.id && demoState?.status !== 'IDLE') {
            return;
        }
        startDemoPhase(activePhase.id, selectedPersonaId);
    }, [activePhase.id, selectedPersonaId, startDemoPhase, enginePhaseId, selectedPersona]);
    // NOTE: demoState?.status removed from deps to prevent re-trigger on status change


    // Auto-Sim Logic: Unlocking artifacts (notification only, no auto-open modal)
    useEffect(() => {
        if ((lastStep?.ui_blocks?.length ?? 0) > 0) {
            const personaId = selectedPersona?.id || 'web3_builder';
            const currentStepIndex = userProgress.completedPhases.length + 1;
            const artifactId = DEMO_SCENARIOS[personaId]?.[currentStepIndex];

            if (
                artifactId &&
                !unlockedArtifacts.includes(artifactId) &&
                !pendingArtifactIdsRef.current.has(artifactId)
            ) {
                setUnlockedArtifacts((prev) => (prev.includes(artifactId) ? prev : [...prev, artifactId]));
                pendingArtifactIdsRef.current.delete(artifactId);
                toast.success("New Artifact Generated!", {
                    description: "Check the sidebar to view your artifacts."
                });
                // DO NOT auto-open modal - let user click to view
            }
        }
    }, [artifacts, demoState?.status, lastStep, selectedPersona, unlockedArtifacts, userProgress.completedPhases]);

    useEffect(() => {
        return () => {
            pendingArtifactIdsRef.current.clear();
        };
    }, []);

    const {
        focusMode,
        leftPanelOpen,
        rightPanelOpen,
        toggleFocusMode,
        setLeftPanelOpen,
        setRightPanelOpen,
        cycleDensity
    } = useWorkspaceLayout();

    // const autoSimPercent = autoSimProgress
    //     ? Math.min(100, Math.max(0, (autoSimProgress.current / Math.max(autoSimProgress.total, 1)) * 100))
    //     : 0;

    const localInteractionStep = useMemo<JourneyStepResponse>(() => {
        // We can keep the local mock blocks for fallback
        const blocks: UIBlock[] = [];
        // ... (Simplified blocks for demo) ...
        const introBlock: TextBlock = {
            kind: 'text_block' as const,
            id: `${selectedPersonaId}:${safeActivePhase.id}:intro`,
            title: 'Zyno Demo Brief',
            body_markdown: `**Phase:** ${safeActivePhase.title}\n\nObserving autonomous agent completion of this phase.`,
        };
        blocks.push(introBlock);

        return {
            metadata: {
                persona_id: selectedPersonaId,
                journey_track: selectedPersonaId,
                phase_id: safeActivePhase.id,
                language: 'en',
                mode: uiMode,
                tone: uiTone,
                title: `${safeActivePhase.title}  Demo`,
                summary: 'Demo execution',
            },
            ui_blocks: blocks,
            agent_actions: [],
            next_state: { phase_id: safeActivePhase.id, completed_missions: [], xp_delta: 0 },
        };
    }, [safeActivePhase, selectedPersonaId, uiMode, uiTone]);

    const interactionResponse = useMemo<JourneyStepResponse>(() => {
        // If we have a step from the store/auto-sim, use it.
        const candidate = lastStep as unknown as JourneyStepResponse | null;
        if (candidate?.ui_blocks?.length) return candidate;
        return localInteractionStep;
    }, [lastStep, localInteractionStep]);

    if (!selectedPersona) return null;
    if (activePhaseIndex >= totalPhases) return <JourneyCompletedPage />;

    const handleExitDemo = () => {
        // Nuclear reset: clear everything
        resetDemoCache();
        setUnlockedArtifacts([]);
        pendingArtifactIdsRef.current.clear();
        try {
            tokenStore.clearTokens();
        } catch (error) {
            console.error('Error clearing tokens:', error);
        }
        navigate('/');
    };

    const handleHardReset = () => {
        // RESET DEMO: Restart journey from beginning
        console.log('[Demo] Hard reset initiated - restarting journey from beginning');

        // 1. Clear React component state
        setUnlockedArtifacts([]);
        pendingArtifactIdsRef.current.clear();
        setViewingArtifact(null);

        // 2. Clear demo-specific localStorage keys only
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem('mfai-journey-storage');
            window.localStorage.removeItem('demo_mock_db');
        }

        // 3. Reset store demo state
        resetDemoCache();

        // 4. Restart from first phase
        if (selectedPersona && selectedPersona.phases.length > 0) {
            const firstPhase = selectedPersona.phases[0];
            console.log(`[Demo] Restarting from first phase: ${firstPhase.id}`);

            // Small delay to ensure state is clean before restarting
            setTimeout(() => {
                startDemoPhase(firstPhase.id, selectedPersonaId);
            }, 100);
        } else {
            console.error('[Demo] No persona or phases available for reset');
        }
    };

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

    return (
        <div className="min-h-screen bg-[#0A0A1F] pb-20 font-sans text-white">
            <NeuralOverlay
                isVisible={demoState?.status === 'PLAYING'}
                agentName="Zyno"
                taskName={`Downloading Knowledge Packet (${(demoState?.stepIndex || 0) + 1}/${demoState?.currentSequence?.length || '?'})`}
            />

            {/* GENERIC DEMO MODAL RENDERER */}
            {modalContent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop handled by the modal component itself usually, but we add a safety layer if needed, 
                        though NFTProofModal has its own backdrop. 
                        Actually NFTProofModal has 'fixed inset-0' so we just render it. 
                     */}
                    {modalContent}
                </div>
            )}

            <ArtifactModal isOpen={!!viewingArtifact} onClose={() => setViewingArtifact(null)} fileUrl={viewingArtifact?.fileUrl} title={viewingArtifact?.title} />

            {/* HEADER */}
            <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-[#0A0A1F]/95 px-6 backdrop-blur">
                <div className="flex items-center gap-3">
                    <button onClick={handleExitDemo} className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition hover:bg-white/10">
                        <ArrowLeft size={14} className="text-white/60 group-hover:text-white" />
                        <span className="text-xs font-medium text-white/60 group-hover:text-white">Exit Demo</span>
                    </button>
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
                    <h1 className="text-sm font-bold uppercase tracking-wider text-white">{selectedPersona.title}</h1>
                    <span className="rounded-full bg-accent-cyan/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent-cyan border border-accent-cyan/20">Demo Mode</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleNavigationToggle}
                        data-testid="toggle-timeline"
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

                    <div className="h-4 w-px bg-white/10 mx-1" />

                    <button 
                        onClick={handleHardReset} 
                        className="rounded-full border border-red-500/50 text-red-400 px-4 py-1.5 text-xs font-bold hover:bg-red-500/10 transition"
                        title="Clear demo cache and restart fresh"
                    >
                        Reset
                    </button>
                    <button onClick={handleExitDemo} className="rounded-full bg-white text-black px-4 py-1.5 text-xs font-bold hover:bg-gray-200 transition">Exit</button>
                </div>
            </header>

            {/* BODY */}
            <main className={`relative mx-auto max-w-[1920px] transition-all duration-300 ${focusMode ? 'px-0' : 'px-4 lg:px-8'} ${demoState?.status === 'WAITING_FOR_FINAL_VALIDATION' ? 'blur-sm pointer-events-none' : ''}`}>
                {!focusMode && (
                    <div className="mb-6 mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                        {/* SIMULATION CONTROLS */}
                        <div className="w-full rounded-xl border border-accent-cyan/30 bg-accent-cyan/5 p-4 shine-effect">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan/20 text-accent-cyan">
                                        {demoState?.status === 'PLAYING' ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">
                                            {demoState?.status === 'WAITING_FOR_INTERACTION' ? 'Awaiting Human Input' : 'Auto-Simulation Active'}
                                        </h3>
                                        <p className="text-xs text-white/60">
                                            {demoState?.status === 'WAITING_FOR_INTERACTION'
                                                ? 'Zyno has paused for you to interact.'
                                                : 'Zyno is navigating the journey autonomously.'}
                                        </p>
                                    </div>
                                </div>
                                {demoState?.status === 'PLAYING' && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-accent-cyan animate-pulse">Processing...</span>
                                    </div>
                                )}
                            </div>

                            {demoState?.isActive && (
                                <div className="mt-4">
                                    <div className="mb-1 flex justify-between text-xs uppercase tracking-wider text-accent-cyan">
                                        <span>Simulating {safeActivePhase.title}...</span>
                                        <span>Phase {activePhaseIndex + 1} / {selectedPersona.phases.length}</span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/40">
                                        <motion.div
                                            className="h-full bg-accent-cyan"
                                            initial={{ width: 0 }}
                                            animate={{
                                                // Progress: completed steps / total. Current step counts as "in progress" (partial)
                                                // Only show 100% when status is COMPLETED or WAITING_FOR_FINAL_VALIDATION
                                                width: `${Math.min(100, (() => {
                                                    const currentStep = demoState.stepIndex || 0;
                                                    const totalSteps = demoState.currentSequence?.length || 1;
                                                    const isCompleted = demoState.status === 'COMPLETED' || demoState.status === 'WAITING_FOR_FINAL_VALIDATION';
                                                    if (isCompleted) return 100;
                                                    // Show progress as: (completed steps + 0.5 for current) / total
                                                    return ((currentStep + 0.5) / totalSteps) * 100;
                                                })())}%`
                                            }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TRINITY LAYOUT */}
                <div className={`grid gap-6 transition-all duration-500 ${gridTemplate}`}>

                    {/* LEFT: TIMELINE (READ ONLY) */}
                    {showLeftPanel && (
                        <aside className="sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                            <JourneyTimeline phases={selectedPersona?.phases || []} currentPhase={activePhaseIndex} />
                        </aside>
                    )}

                    {/* CENTER: STAGE */}
                    <section className="min-h-[600px] space-y-6">
                        {!focusMode && <JourneyProgressBar personaId={selectedPersona.id} currentStepId={activePhase.id} />}

                        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-1 shadow-2xl backdrop-blur-2xl">
                            {/* Simplified Header for Blocks */}
                            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-purple to-blue-600 text-white shadow-lg">
                                        <Target size={16} />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold uppercase tracking-wider text-white">Simulation Stream</h2>
                                    </div>
                                </div>
                            </div>
                            <div className="max-h-[800px] overflow-y-auto bg-black/20 p-6 md:p-8">
                                <UIBlocksRenderer response={interactionResponse} />
                            </div>
                        </div>
                    </section>

                    {/* RIGHT: ARTIFACTS */}
                    {showRightPanel && (
                        <aside className="sticky top-24 h-[calc(100vh-8rem)] space-y-4 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                            <ZynoSignalSidebar className="w-full" />
                        </aside>
                    )}
                </div>
            </main>
            <ZynoChat
                className={demoState?.isActive ? "external-override" : ""}
                externalMessages={demoState?.isActive ? demoState.demoHistory : undefined}
            />
        </div>
    );
};

export default JourneyDemoMode;
