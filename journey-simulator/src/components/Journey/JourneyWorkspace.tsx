import { useState, useEffect, useRef } from 'react';
import JourneyTimeline from './JourneyTimeline';
import { JourneyProgressBar } from './JourneyProgressBar';
import { JourneyNextActionsPanel } from './JourneyNextActionsPanel';
import ZynoSignalSidebar from './ZynoSignalSidebar';
import UIBlocksRenderer from '../UIBlocks/UIBlocksRenderer';
import { useJourneyStore } from '../../store/journeyStore';
import {
  Loader2,
  Trophy,
  Coins,
  Award,
  PanelLeft,
  PanelRight,
  Maximize2,
  Minimize2,
  LayoutGrid,
  ArrowLeft,
  Target,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  FileText
} from 'lucide-react';
import type { JourneyStepResponse } from '../../types/uiBlocks';
// import confetti from 'canvas-confetti';
import NFTProofModal from '../NFTProofModal';
import { getProofType, getPersonaProofData } from '../../data/proofsData';
import { resources, getResourceIcon } from '../../data/resources';
import PhaseDetails from './PhaseDetails';
import { api } from '../../utils/api';

import StakingModal from '../StakingModal';
import DAOVoteModal from '../DAOVoteModal';

import JourneyCompletedPage from '../JourneyCompletedPage';
import { LaunchCollaterizePhase } from './LaunchCollaterizePhase';

import { NeuralOverlay } from '../Artifacts/NeuralOverlay';
import { ArtifactModal } from '../Artifacts/ArtifactModal';
import artifactsData from '../../data/artifacts.json';
import { toast } from 'sonner';
import { useWorkspaceLayout } from '../../contexts/WorkspaceLayoutContext';

interface JourneyWorkspaceProps {
  onBack?: () => void;
}

const JourneyWorkspace = ({ onBack }: JourneyWorkspaceProps) => {
  const {
    selectedPersona,
    userProgress,
    currentPhase: currentPhaseIndex,
    lastStep,
    isStepLoading,
    runInteractiveStep,
    runInteractiveStepDebug,
    setCurrentPhase,
    completePhase,
    ensureApiJourneyId,
    uiMode,
    uiTone
  } = useJourneyStore();

  const [isThinking, setIsThinking] = useState(false);
  const [currentTask, setCurrentTask] = useState({ agent: '', task: '' });
  const [viewingArtifact, setViewingArtifact] = useState<any>(null);
  const [unlockedArtifacts, setUnlockedArtifacts] = useState<string[]>([]);
  const [isAutoSimulating, setIsAutoSimulating] = useState(false);
  const autoSimAbortRef = useRef(false);
  const [autoSimProgress, setAutoSimProgress] = useState<{ current: number; total: number } | null>(null);

  const DEMO_SCENARIOS: Record<string, Record<number, string>> = {
    'cognitive-activation-hub': {
      1: 'art-002', // Surface litepaper on first interactive run for demo flows
      3: 'art-003', // Tokenomics simulation after Token Design
      4: 'art-004'
    },
    'capital-foundry': {
      2: 'art-003',
      4: 'art-004'
    },
    'system-architect': {
      2: 'art-001',
      3: 'art-003'
    },
    'web2_migrator': { 2: 'art-web2-01' },  // Step 2 -> Migration Blueprint
    'web3_builder': { 3: 'art-003' },      // Step 3 -> Tokenomics
    'learner': { 5: 'art-learn-01' }, // Step 5 -> Certificate
    'investor': { 1: 'art-invest-01' },// Step 1 -> Deal Memo
    'rwa_issuer': { 2: 'art-rwa-01' }    // Step 2 -> RWA Sim
  };

  useEffect(() => {
    // NOTE: This is a simplified logic for demo purposes.
    // A more robust implementation would check the step completion status from the store.
    if (lastStep && lastStep.ui_blocks && lastStep.ui_blocks.length > 0) {
      const personaId = selectedPersona?.id || 'web3_builder';
      const currentStepIndex = userProgress.completedPhases.length + 1;
      const artifactId = DEMO_SCENARIOS[personaId]?.[currentStepIndex];

      if (artifactId && !unlockedArtifacts.includes(artifactId)) {
        const artifact = artifactsData.find(a => a.id === artifactId);
        if (!artifact) return;

        setCurrentTask({
          agent: artifact.agent.name,
          task: `Generating ${artifact.title}...`
        });
        setIsThinking(true);

        setTimeout(() => {
          setIsThinking(false);
          setUnlockedArtifacts(prev => [...prev, artifactId]);

          toast.success("New Artifact Generated!");

          setViewingArtifact(artifact);
        }, 3500);
      }
    }
  }, [lastStep, selectedPersona, userProgress.completedPhases, unlockedArtifacts]);

  useEffect(() => {
    console.log('[JourneyWorkspace] MOUNTED');
  }, []);

  const [proofModalData, setProofModalData] = useState<any>(null);
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [isSubmittingPhase, setIsSubmittingPhase] = useState(false);
  const {
    focusMode,
    leftPanelOpen,
    rightPanelOpen,
    toggleFocusMode,
    setLeftPanelOpen,
    setRightPanelOpen,
    density,
    cycleDensity,
  } = useWorkspaceLayout();

  if (!selectedPersona) return null;

  const activePhaseIndex = currentPhaseIndex ?? userProgress.completedPhases.length;



  // Check if journey is completed
  if (activePhaseIndex >= selectedPersona.phases.length) {
    return <JourneyCompletedPage />;
  }

  const activePhase = selectedPersona.phases[activePhaseIndex] || selectedPersona.phases[0];
  console.log('[JourneyWorkspace] Rendering phase:', activePhase?.title, 'ID:', activePhase?.id);

  const { completedPhases } = userProgress;
  const activePhaseNumber = activePhaseIndex + 1;
  const isPhaseCompleted = userProgress.completedPhases.includes(activePhaseIndex);

  // UI Helpers
  const densityLabel = density === 'compact' ? 'Compact' : 'Comfortable';
  const focusButtonCopy = focusMode ? 'Exit Focus' : 'Focus Mode';
  const navButtonCopy = leftPanelOpen ? 'Hide Navigation' : 'Navigation';
  const insightsButtonCopy = rightPanelOpen ? 'Hide Insights' : 'Insights';

  const handleNavigationToggle = () => {
    if (leftPanelOpen) {
      setLeftPanelOpen(false);
    } else {
      if (focusMode) {
        toggleFocusMode();
      }
      setLeftPanelOpen(true);
    }
  };

  const handleInsightsToggle = () => {
    if (rightPanelOpen) {
      setRightPanelOpen(false);
    } else {
      if (focusMode) {
        toggleFocusMode();
      }
      setRightPanelOpen(true);
    }
  };

  const handleCompletePhase = async () => {
    if (isSubmittingPhase || isPhaseCompleted) {
      return;
    }

    if (!selectedPersona || !activePhase) {
      return;
    }

    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!accessToken) {
      toast.error('Please sign in before completing this phase.');
      return;
    }

    const proofType = getProofType(selectedPersona.id, activePhase.id);
    const proofData = getPersonaProofData(
      selectedPersona.id,
      activePhase.id,
      proofType,
      activePhase.xpReward,
      activePhase.title,
      activePhaseIndex + 1
    );

    const completedPhaseData = {
      personaId: selectedPersona.id,
      phaseId: activePhase.id,
      proofType,
      title: activePhase.nftReward || proofData.name || `Proof-of-${proofType}™`,
      description: proofData.description || `Successfully completed the ${activePhase.title} phase.`,
      imageUrl: proofData.imageUrl,
      xpEarned: activePhase.xpReward,
      phase: activePhase.title,
      phaseNumber: activePhaseIndex + 1
    };

    const journeyId = ensureApiJourneyId();
    const missionId = `${activePhase.id}-mission`;

    const missionPayload = {
      missionId,
      inputType: 'confirmation',
      submission: completedPhaseData.description,
      language: 'en',
      mode: uiMode,
      tone: uiTone,
      trackId: selectedPersona.id,
      phaseId: activePhase.id,
      phaseNumber: activePhaseIndex + 1,
      journeyState: {
        xp: userProgress.totalXP,
        totalXP: userProgress.totalXP,
        completed: userProgress.completedPhases,
        completedCount: userProgress.completedPhases.length,
        nfts: userProgress.nfts,
        mfaiTokens: userProgress.mfaiTokens,
        currentPhase: activePhaseIndex + 1
      }
    };

    try {
      setIsSubmittingPhase(true);
      const submissionResult = await api.submitMission(journeyId, missionPayload);

      if (!submissionResult?.success) {
        throw new Error(submissionResult?.message || 'Submission rejected');
      }

      const rawScore = submissionResult?.evaluation?.global_score;
      const normalizedScore = typeof rawScore === 'number'
        ? Math.round(Math.max(0, Math.min(rawScore, 10)) * 10)
        : 100;

      await completePhase(activePhaseIndex, {
        score: normalizedScore,
        phaseNumber: activePhaseIndex + 1,
        xpReward: activePhase.xpReward,
        mfaiReward: activePhase.mfaiReward,
        nftReward: activePhase.nftReward
      });

      setTimeout(() => {
        setProofModalData(completedPhaseData);
      }, 1000);

      toast.success('Phase validated by Zyno AI.');
    } catch (error) {
      console.error('Failed to submit mission:', error);
      toast.error('Zyno could not evaluate this phase. Please try again.');
    } finally {
      setIsSubmittingPhase(false);
    }
  };

  const handleRunInteractiveStep = async () => {
    if (isStepLoading || isAutoSimulating) return;
    if (!activePhase) return;

    try {
      const isE2EDebug = typeof window !== 'undefined' && Boolean((window as any).__e2eJourneyStepConfig);
      const runner = isE2EDebug ? runInteractiveStepDebug : runInteractiveStep;
      const isDemo =
        Boolean(userProgress.demoModeEnabled) ||
        (typeof window !== 'undefined' &&
          (() => {
            try {
              return window.localStorage.getItem('accessToken') === 'demo-token'
            } catch {
              return false
            }
          })())

      // In demo mode, "Run Simulation" should autoplay phases sequentially.
      if (isDemo) {
        autoSimAbortRef.current = false
        setIsAutoSimulating(true)
        setAutoSimProgress({ current: Math.max(1, activePhaseIndex + 1), total: selectedPersona.phases.length })

        try {
          const phases = selectedPersona.phases
          for (let i = activePhaseIndex; i < phases.length; i++) {
            if (autoSimAbortRef.current) break

            const phase = phases[i]
            setAutoSimProgress({ current: i + 1, total: phases.length })
            setCurrentPhase(i)

            // Let React render the phase switch before requesting.
            await new Promise((r) => setTimeout(r, 150))

            await runner({
              phaseId: phase.id,
              trackId: selectedPersona.id,
              userInput: '',
            })

            // Small delay so the user can see the generated blocks.
            await new Promise((r) => setTimeout(r, 650))

            // Mark phase as completed in demo so progress/artifacts can advance.
            await completePhase(i, {
              score: 100,
              phaseNumber: i + 1,
              xpReward: phase.xpReward,
              mfaiReward: phase.mfaiReward,
              nftReward: phase.nftReward,
            })

            // Another small pause before moving to next phase.
            await new Promise((r) => setTimeout(r, 450))
          }

          if (!autoSimAbortRef.current) {
            toast.success('Simulation démo terminée : phases déroulées automatiquement.')
          } else {
            toast.message('Auto-simulation arrêtée.')
          }
        } finally {
          setIsAutoSimulating(false)
          setAutoSimProgress(null)
        }

        return
      }

      // Non-demo: run only current phase step.
      await runner({
        phaseId: activePhase.id,
        trackId: selectedPersona.id,
        userInput: '',
      })
    } catch (error) {
      console.error('Error running interactive step:', error);
    }
  };

  const handleStopAutoSimulation = () => {
    if (!isAutoSimulating) return
    autoSimAbortRef.current = true
    setIsAutoSimulating(false)
    setAutoSimProgress(null)
  }

  /* ... inside JourneyWorkspace component ... */

  // Handlers for Interactivity
  const handleExitDemo = () => {
    // In a real app, this might clear session or navigate to a dashboard
    window.location.href = '/';
  };

  const handleNextActionClick = (actionType: string, actionId: string) => {
    if (actionType === 'tool') {
      const toolName = actionId.replace(/-/g, ' ');
      toast.info(`Launching ${toolName}...`);

      // Simulate loading tool
      setIsThinking(true);
      setCurrentTask({ agent: 'System', task: `Initializing ${toolName}` });

      setTimeout(() => {
        setIsThinking(false);
        if (actionId === 'launch_readiness' || actionId === 'collaterize_sim') {
          // For specific tools, we could open a modal or navigate
          // For now, we simulate a successful "check" or "run"
          toast.success(`${toolName} activated.`);
        }
      }, 2000);
    } else {
      toast('Action Logged', { description: 'This action has been added to your journey queue.' });
    }
  };

  const handleArtifactClick = (artifactName: string) => {
    // Mock lookup for artifacts based on string name
    // In real app, `artifactsData` would be used properly
    const mockArtifact = {
      title: artifactName,
      fileUrl: '', // Would be a real URL in production
      type: 'document'
    };

    // If we have a specific mock for it in artifacts.json, use it
    const realMatch = artifactsData.find(a => a.title.includes(artifactName) || a.id.includes(artifactName.toLowerCase()));

    setViewingArtifact(realMatch || mockArtifact);

    if (!realMatch) {
      toast.info("Viewing Simulation Artifact", { description: "This is a placeholder for the generated document." });
    }
  };

  const handleViewReport = () => {
    toast.success("Generating Full Report...", {
      description: "Compiling simulation metrics and risk analysis."
    });
    // Could open a modal here in future
  };

  return (
    <div className="min-h-screen bg-[#0A0A1F] pb-20 font-sans text-white">
      <NeuralOverlay
        isVisible={isThinking}
        agentName={currentTask.agent}
        taskName={currentTask.task}
      />
      <ArtifactModal
        isOpen={!!viewingArtifact}
        onClose={() => setViewingArtifact(null)}
        fileUrl={viewingArtifact?.fileUrl}
        title={viewingArtifact?.title}
      />

      {/* GLOBAL STICKY HEADER */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-[#0A0A1F]/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-[#0A0A1F]/80">
        <div className="flex items-center gap-3">
          <button
            data-testid="back-to-journeys"
            onClick={() => onBack ? onBack() : window.history.back()}
            className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition hover:bg-white/10 hover:border-white/20"
          >
            <ArrowLeft size={14} className="text-white/60 group-hover:text-white" />
            <span className="text-xs font-medium text-white/60 group-hover:text-white">Back to Journeys</span>
          </button>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
          <h1 className="text-sm font-bold uppercase tracking-wider text-white">{selectedPersona.title}</h1>
          <span className="rounded-full bg-accent-cyan/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent-cyan border border-accent-cyan/20">Demo Mode</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleNavigationToggle}
            className={`rounded-full p-2 transition ${leftPanelOpen ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/10 hover:text-white'}`}
            title={navButtonCopy}
          >
            <PanelLeft size={18} />
          </button>

          <button
            onClick={toggleFocusMode}
            className={`rounded-full p-2 transition ${focusMode ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/10 hover:text-white'}`}
            title={focusButtonCopy}
          >
            {focusMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          <button
            onClick={cycleDensity}
            className="rounded-full p-2 text-white/40 hover:bg-white/10 hover:text-white transition"
            title={densityLabel}
          >
            <LayoutGrid size={18} />
          </button>

          <button
            onClick={handleInsightsToggle}
            className={`rounded-full p-2 transition ${rightPanelOpen ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/10 hover:text-white'}`}
            title={insightsButtonCopy}
          >
            <PanelRight size={18} />
          </button>

          <div className="h-6 w-px bg-white/10 mx-1"></div>

          <button
            onClick={handleExitDemo}
            className="rounded-full bg-white text-black px-4 py-1.5 text-xs font-bold hover:bg-gray-200 transition"
          >
            Exit Demo
          </button>
        </div>
      </header>

      {/* JOURNEY HEADER & PROGRESS */}
      <div className="mx-auto mt-8 w-full max-w-[1200px] px-6">
        <div className="mb-8 text-center space-y-2">
          <h2 className="text-4xl font-space font-bold text-white">{selectedPersona.title}</h2>
          <p className="mx-auto max-w-2xl text-base text-white/60">{selectedPersona?.description?.split('.')[0] || "Journey in progress"}.</p>

          {/* Stats Row Centered */}
          <div className="mt-4 flex justify-center gap-6 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <Trophy size={14} className="text-accent-gold" />
              <span>{userProgress.totalXP.toLocaleString()} XP</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins size={14} className="text-accent-cyan" />
              <span>{userProgress.mfaiTokens.toLocaleString()} $MFAI</span>
            </div>
          </div>
        </div>

        <JourneyProgressBar
          personaId={selectedPersona.id}
          currentStepId={`phase-${activePhaseNumber}`}
        />
      </div>

      {/* MAIN GRID LAYOUT */}
      <div className="mx-auto mt-8 grid max-w-6xl gap-8 px-6 lg:grid-cols-[2fr_1fr] items-start">

        {/* LEFT COLUMN - WORK AREA */}
        <div className="space-y-8">

          {/* CURRENT PHASE CARD - Primary Focus */}
          <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#12122B] p-8 shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-50">
              <span className="text-[100px] font-bold leading-none text-white/5">{activePhaseNumber}</span>
            </div>

            <div className="relative z-10 flex flex-col gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-cyan text-[10px] font-bold text-black">{activePhaseNumber}</span>
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-accent-cyan">Current Phase</h3>
                </div>
                <h2 className="text-3xl font-space font-bold text-white">{activePhase.title}</h2>
              </div>

              <p className="text-base text-white/70 max-w-xl leading-relaxed">
                {activePhase.description}
              </p>

              {/* Checklist mock */}
              <div className="space-y-3 rounded-xl bg-white/5 p-5 border border-white/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Phase Objectives</h4>
                {activePhase.mission ? (
                  <div className="flex items-start gap-2">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-accent-purple"></div>
                    <p className="text-sm text-white/80">{activePhase.mission}</p>
                  </div>
                ) : (
                  ['Analyze market requirements', 'Define token utility', 'Draft initial whitepaper'].map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${i === 0 ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-500' : 'border-white/10'}`}>
                        {i === 0 && <CheckCircle2 size={12} />}
                      </div>
                      <span className={`text-sm ${i === 0 ? 'text-white/40 line-through' : 'text-white'}`}>{item}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Primary CTA */}
              <div className="pt-2 flex flex-wrap gap-4">
                <button
                  onClick={handleRunInteractiveStep}
                  className="inline-flex items-center gap-2 rounded-full bg-accent-cyan px-8 py-4 text-base font-bold text-black shadow-lg shadow-accent-cyan/20 transition hover:bg-accent-cyan/90 hover:scale-105 active:scale-95"
                >
                  {isStepLoading || isAutoSimulating ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    'Run Simulation'
                  )}
                  <ArrowRight size={20} />
                </button>

                {isAutoSimulating && autoSimProgress && (
                  <button
                    onClick={handleStopAutoSimulation}
                    className="inline-flex items-center gap-2 rounded-full bg-red-500/90 px-8 py-4 text-base font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-500 active:scale-95"
                  >
                    Stop
                  </button>
                )}

                  {!isPhaseCompleted && (
                    <button
                      onClick={() => {
                        if (isSubmittingPhase) return;
                        if (activePhase.stakingRequired) {
                          setShowStakingModal(true);
                          return;
                        }
                        if (activePhase.daoVoteRequired) {
                          setShowVoteModal(true);
                          return;
                        }

                        void handleCompletePhase();
                      }}
                      disabled={isSubmittingPhase}
                      className={`inline-flex items-center gap-2 rounded-full bg-white/10 px-8 py-4 text-base font-bold text-white border border-white/10 transition ${isSubmittingPhase ? 'cursor-wait opacity-70' : 'hover:bg-white/20'}`}
                    >
                      {isSubmittingPhase ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          <span>Submitting…</span>
                        </>
                      ) : (
                        <>
                          {activePhase.nftReward ? <Award size={20} className="text-accent-cyan" /> : <CheckCircle2 size={20} />}
                          <span>{activePhase.nftReward ? 'Mint NFT' : 'Complete'}</span>
                        </>
                      )}
                    </button>
                  )}
              </div>

              {isAutoSimulating && autoSimProgress && (
                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-white/80 font-semibold">
                      Auto-simulation en cours : phase {autoSimProgress.current}/{autoSimProgress.total}
                    </div>
                    <div className="text-xs text-white/50">
                      {Math.round((autoSimProgress.current / autoSimProgress.total) * 100)}%
                    </div>
                  </div>
                  <div className="mt-3 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-accent-cyan"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, (autoSimProgress.current / autoSimProgress.total) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Phase Interaction Render */}
            <div className="mt-8 border-t border-white/5 pt-8">
              {isStepLoading ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                  <Loader2 size={32} className="animate-spin text-accent-cyan" />
                  <p className="text-sm text-white/60 animate-pulse">Processing Agent Interactions...</p>
                </div>
              ) : activePhase.id === 'launch-collaterize' ? (
                <LaunchCollaterizePhase />
              ) : lastStep ? (
                <UIBlocksRenderer response={lastStep as JourneyStepResponse} />
              ) : (
                <PhaseDetails phase={activePhase} />
              )}
            </div>
          </section>

          {/* SIMULATION RESULTS (New) */}
          <section className="rounded-2xl border border-white/5 bg-white/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <LayoutGrid size={20} className="text-accent-purple" />
                <h2 className="text-lg font-bold text-white">Simulation Results</h2>
              </div>
              <button
                onClick={handleViewReport}
                className="text-xs font-bold uppercase tracking-wider text-accent-cyan hover:underline"
              >
                View Full Report
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Market Fit', value: '84%', color: 'text-emerald-400' },
                { label: 'Risk Score', value: 'Low', color: 'text-emerald-400' },
                { label: 'Proj. TVL', value: '$1.2M', color: 'text-white' },
                { label: 'Sentiment', value: 'Bullish', color: 'text-accent-gold' }
              ].map((stat, i) => (
                <div key={i} className="rounded-xl bg-black/20 p-4 border border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">{stat.label}</p>
                  <p className={`text-2xl font-mono font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* KEY ARTIFACTS */}
          <section className="rounded-2xl border border-white/5 bg-white/5 p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Briefcase size={20} className="text-accent-gold" />
              Project Artifacts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Artifacts Grid */}
              {['Litepaper', 'Tokenomics', 'Pitch Deck', 'Legal Opinion', 'Go-to-Market', 'Audit Report'].map((art, i) => (
                <button
                  key={i}
                  onClick={() => handleArtifactClick(art)}
                  className="w-full text-left group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 hover:border-white/20 hover:shadow-xl cursor-pointer"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-purple/10 text-accent-purple group-hover:bg-accent-purple group-hover:text-white transition">
                    <FileText size={20} />
                  </div>
                  <h3 className="font-bold text-white group-hover:text-accent-cyan transition text-sm">{art}</h3>
                  <p className="text-[10px] text-white/40 mt-1">Version 1.{i}</p>
                </button>
              ))}
            </div>
          </section>

          {/* JOURNEY MAP */}
          <section className="rounded-2xl border border-white/5 bg-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Target size={20} className="text-accent-cyan" />
                Journey Map
              </h2>
            </div>
            <div className="max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              <JourneyTimeline
                phases={selectedPersona.phases}
                currentPhase={completedPhases.length}
                onPhaseChange={setCurrentPhase}
              />
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN - CONTEXT & AI (Sticky) */}
        <div className="space-y-6 lg:sticky lg:top-24">

          {/* NEXT ACTIONS */}
          <JourneyNextActionsPanel
            personaId={selectedPersona.id}
            currentStepId={`phase-${activePhaseNumber}`}
            journeyId={(userProgress as any)?.journey?._id || (userProgress as any)?.journeyId}
            onActionClick={handleNextActionClick}
            className="w-full shadow-xl"
          />

          {/* AGENT CONSOLE (Replaces Intel & Metrics) */}
          <ZynoSignalSidebar className="w-full" />

          {/* RESOURCES (Compact) */}
          <section className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Quick Reference</h3>
            <div className="space-y-2">
              {resources.slice(0, 3).map((resource) => {
                const Icon = getResourceIcon(resource.type);
                return (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs text-white/60 hover:text-accent-cyan transition"
                  >
                    <Icon size={12} />
                    <span className="truncate">{resource.title}</span>
                  </a>
                );
              })}
            </div>
          </section>

        </div>

      </div>


      {proofModalData && (
        <NFTProofModal
          personaId={proofModalData.personaId}
          phaseId={proofModalData.phaseId}
          proofType={proofModalData.proofType}
          title={proofModalData.title}
          description={proofModalData.description}
          imageUrl={proofModalData.imageUrl}
          xpEarned={proofModalData.xpEarned}
          phase={proofModalData.phase}
          phaseNumber={proofModalData.phaseNumber}
          onClose={() => setProofModalData(null)}
        />
      )}

      {
        showStakingModal && (
          <StakingModal
            availableAmount={1000}
            currentStaked={0}
            onClose={() => setShowStakingModal(false)}
              onStake={(_amount) => {
              setShowStakingModal(false);
                if (!isSubmittingPhase) {
                  void handleCompletePhase();
                }
            }}
          />
        )
      }

      {
        showVoteModal && (
          <DAOVoteModal
            phase={activePhase}
            votingPower={50}
            onClose={() => setShowVoteModal(false)}
              onVote={(_vote) => {
              setShowVoteModal(false);
                if (!isSubmittingPhase) {
                  void handleCompletePhase();
                }
            }}
          />
        )
      }
    </div >
  );
};

export default JourneyWorkspace;
