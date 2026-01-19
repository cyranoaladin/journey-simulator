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
// import { useAutoSimulation } from '../../hooks/useAutoSimulation';
import { usePhaseData } from '../../hooks/usePhaseData';

import JourneyCompletedPage from '../JourneyCompletedPage';

import { toast } from 'sonner';
import { useWorkspaceLayout } from '../../contexts/WorkspaceLayoutContext';
import { useArtifacts } from '../../hooks/useArtifacts';
import { ArtifactModal } from '../Artifacts/ArtifactModal';
import { NeuralOverlay } from '../Artifacts/NeuralOverlay';
import StakingModal from '../StakingModal';
import DAOVoteModal from '../DAOVoteModal';
import NFTProofModal from '../NFTProofModal';
import MarketLaunchpad from '../MarketLaunchpad';

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
        tickDemo,
        startDemoPhase,
        completePhase,
        openModal,
        closeModal,
        modalContent
    } = useJourneyStore(
        (state) => ({
            demoState: state.demoState,
            setDemoState: state.setDemoState,
            tickDemo: state.tickDemo,
            startDemoPhase: state.startDemoPhase,
            completePhase: state.completePhase,
            openModal: state.openModal,
            closeModal: state.closeModal,
            modalContent: state.modalContent
        }),
        shallow
    );

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

    // Final Validation Logic (The "Final Act")
    useEffect(() => {
        if (demoState?.status === 'WAITING_FOR_FINAL_VALIDATION') {
            console.log(`[Demo] Reached Final Validation for Index ${activePhaseIndex}`);

            // TRIGGER MAPPING (STRICT INDEX BASED)
            let modalContent = null;

            switch (activePhaseIndex) {
                case 0: // Phase 1: Orientation
                    modalContent = (
                        <div className="max-w-md w-full">
                            <h2 data-testid="demo-phase-validation-title" className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] text-xl font-space font-bold px-4 py-2 rounded-lg bg-black/60 border border-white/10 backdrop-blur-sm">
                                Cognitive Activation Badge
                            </h2>
                            <NFTProofModal
                                onClose={() => handlePhaseComplete(activePhaseIndex)}
                                proofType="Vision"
                                title="Cognitive Activation Badge"
                                description="Proof of neural synchronization."
                                imageUrl="/assets/badges/cognitive_master.png"
                                xpEarned={100}
                                phase={activePhase.title}
                                phaseNumber={1}
                                onViewSkillchain={() => handlePhaseComplete(activePhaseIndex)}
                            />
                        </div>
                    );
                    break;

                case 1: // Phase 2: Foundry
                    modalContent = (
                        <div className="max-w-2xl w-full">
                            <h2 data-testid="demo-phase-validation-title" className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] text-xl font-space font-bold px-4 py-2 rounded-lg bg-black/60 border border-white/10 backdrop-blur-sm">
                                Foundry Staking
                            </h2>
                            <StakingModal
                                onClose={() => handlePhaseComplete(activePhaseIndex)}
                                availableAmount={1000}
                                currentStaked={500}
                                onStake={(amount) => {
                                    console.log(`[Demo] Staked: ${amount}`);
                                    handlePhaseComplete(activePhaseIndex);
                                }}
                            />
                        </div>
                    );
                    break;

                case 2: // Phase 3: Resilience (DAO)
                    modalContent = (
                        <div className="max-w-2xl w-full">
                            <h2 data-testid="demo-phase-validation-title" className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] text-xl font-space font-bold px-4 py-2 rounded-lg bg-black/60 border border-white/10 backdrop-blur-sm">
                                Security Vote
                            </h2>
                            <DAOVoteModal
                                onClose={() => handlePhaseComplete(activePhaseIndex)}
                                phase={activePhase}
                                votingPower={100}
                                onVote={(vote) => {
                                    console.log(`[Demo] Voted: ${vote}`);
                                    handlePhaseComplete(activePhaseIndex);
                                }}
                            />
                        </div>
                    );
                    break;

                case 3: // Phase 4: Experience / Identity
                    modalContent = (
                        <div className="max-w-md w-full">
                            <h2 data-testid="demo-phase-validation-title" className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] text-xl font-space font-bold px-4 py-2 rounded-lg bg-black/60 border border-white/10 backdrop-blur-sm">
                                Identity Artifact
                            </h2>
                            <NFTProofModal
                                onClose={() => handlePhaseComplete(activePhaseIndex)}
                                proofType="Creation"
                                title="Identity Artifact"
                                description="Proof of established digital identity."
                                imageUrl="/assets/badges/identity_artifact.png"
                                xpEarned={200}
                                phase={activePhase.title}
                                phaseNumber={4}
                                onViewSkillchain={() => handlePhaseComplete(activePhaseIndex)}
                            />
                        </div>
                    );
                    break;

                case 4: // Phase 5: Launch (Market)
                    modalContent = (
                        <div className="max-w-4xl w-full">
                            <h2 data-testid="demo-phase-validation-title" className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] text-xl font-space font-bold px-4 py-2 rounded-lg bg-black/60 border border-white/10 backdrop-blur-sm">
                                Mainnet Ignition
                            </h2>
                            <MarketLaunchpad
                                onComplete={() => handlePhaseComplete(activePhaseIndex)}
                            />
                        </div>
                    );
                    break;

                case 5: // Phase 6: Collaterize (Veteran Status)
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
                                xpEarned={1000}
                                phase={activePhase.title}
                                phaseNumber={6}
                                onViewSkillchain={() => {
                                    handlePhaseComplete(activePhaseIndex);
                                    window.dispatchEvent(new CustomEvent('VETERAN_BADGE_UNLOCKED', { detail: { tier: 'veteran' } }));
                                }}
                            />
                        </div>
                    );
                    break;

                default:
                    console.warn(`[Demo] No modal definition for index ${activePhaseIndex}. Completing auto.`);
                    handlePhaseComplete(activePhaseIndex);
                    return;
            }

            if (modalContent) {
                openModal(modalContent);
            }
        }
    }, [demoState?.status, activePhase.id, activePhaseIndex, handlePhaseComplete, openModal, activePhase.title]);

    // TICK LOOP: The Heartbeat of the Demo
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (demoState?.isActive && demoState?.status === 'PLAYING') {
            timer = setTimeout(() => {
                tickDemo();
            }, demoState.typingDelayMs || 1500);
        }
        return () => clearTimeout(timer);
    }, [demoState?.status, demoState?.stepIndex, tickDemo, demoState?.typingDelayMs, demoState?.isActive]);

    // Start Phase on Mount or Phase Change
    useEffect(() => {
        if (!selectedPersona) return;
        // TRUST THE EFFECT DEPENDENCY: It fires when activePhase.id changes.
        // We must (re)start the demo sequence for the new phase.
        startDemoPhase(activePhase.id, selectedPersonaId);
    }, [activePhase.id, selectedPersonaId, startDemoPhase]);


    // Auto-Sim Logic: Unlocking artifacts
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
                toast.success("New Artifact Generated!");
                const artifact = artifacts.find(a => a.id === artifactId);
                if (artifact && demoState?.status === 'PLAYING') setViewingArtifact(artifact);
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
        try {
            tokenStore.clearTokens();
        } catch (error) {
            console.error('Error clearing tokens:', error);
        }
        navigate('/');
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
                                        <span>Step {(demoState.stepIndex || 0) + 1} / {demoState.currentSequence?.length || '?'}</span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/40">
                                        <motion.div
                                            className="h-full bg-accent-cyan"
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${Math.min(100, (((demoState.stepIndex || 0) + 1) / (demoState.currentSequence?.length || 1)) * 100)}%`
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
                            <JourneyTimeline phases={selectedPersona?.phases || []} currentPhase={userProgress.completedPhases.length} />
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
