import { useState, useEffect } from 'react';
import JourneyTimeline from './JourneyTimeline';
import AgentActivityFeed from '../AgentActivityFeed';
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
  LayoutGrid
} from 'lucide-react';
import type { JourneyStepResponse } from '../../types/uiBlocks';
// import confetti from 'canvas-confetti';
import NFTProofModal from '../NFTProofModal';
import { getProofType, getPersonaProofData } from '../../data/proofsData';
import { resources, getResourceIcon } from '../../data/resources';
import PhaseDetails from './PhaseDetails';

import StakingModal from '../StakingModal';
import DAOVoteModal from '../DAOVoteModal';

import JourneyCompletedPage from '../JourneyCompletedPage';
import { LaunchCollaterizePhase } from './LaunchCollaterizePhase';

import { NeuralOverlay } from '../Artifacts/NeuralOverlay';
import { ArtifactModal } from '../Artifacts/ArtifactModal';
import artifactsData from '../../data/artifacts.json';
import { ProjectAssets } from '../Artifacts/ProjectAssets';
import { toast } from 'sonner';
import { useWorkspaceLayout } from '../../contexts/WorkspaceLayoutContext';

const JourneyWorkspace = () => {
  const {
    selectedPersona,
    userProgress,
    currentPhase: currentPhaseIndex,
    lastStep,
    isStepLoading,
    runInteractiveStep,
    setCurrentPhase,
    completePhase,
    uiMode,
    setUiMode,
    uiTone,
    setUiTone
  } = useJourneyStore();

  const [isThinking, setIsThinking] = useState(false);
  const [currentTask, setCurrentTask] = useState({ agent: '', task: '' });
  const [viewingArtifact, setViewingArtifact] = useState<any>(null);
  const [unlockedArtifacts, setUnlockedArtifacts] = useState<string[]>([]);

  const DEMO_SCENARIOS: Record<string, Record<number, string>> = {
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
      const currentStepIndex = (userProgress?.completedPhases?.length ?? 0) + 1;
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
  }, [lastStep, selectedPersona, userProgress?.completedPhases, unlockedArtifacts]);

  useEffect(() => {
    console.log('[JourneyWorkspace] MOUNTED');
  }, []);

  const [proofModalData, setProofModalData] = useState<any>(null);
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
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

  const activePhaseIndex = currentPhaseIndex ?? (userProgress?.completedPhases?.length ?? 0);



  // Check if journey is completed
  if (activePhaseIndex >= selectedPersona.phases.length) {
    return <JourneyCompletedPage />;
  }

  const activePhase = selectedPersona.phases[activePhaseIndex] || selectedPersona.phases[0];
  console.log('[JourneyWorkspace] Rendering phase:', activePhase?.title, 'ID:', activePhase?.id);

  const totalPhases = selectedPersona.phases.length;
  const completedPhases = userProgress?.completedPhases?.length ?? 0;
  const completionRate = totalPhases === 0 ? 0 : Math.round((completedPhases / totalPhases) * 100);
  const activePhaseNumber = activePhaseIndex + 1;
  const isPhaseCompleted = userProgress?.completedPhases?.includes(activePhaseIndex) ?? false;
  const densityLabel = density === 'compact' ? 'Compact' : 'Comfortable';
  const focusButtonCopy = focusMode ? 'Exit Focus' : 'Focus Mode';
  const navButtonCopy = leftPanelOpen ? 'Hide Navigation' : 'Navigation';
  const insightsButtonCopy = rightPanelOpen ? 'Hide Insights' : 'Insights';
  const controlButtonClass = 'inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/70 transition hover:border-accent-cyan hover:text-accent-cyan focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/60';

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

  const handleCompletePhase = () => {
    // Capture current phase data BEFORE updating state
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
      title: proofData.name || activePhase.nftReward || `Proof-of-${proofType}™`,
      description: proofData.description || `Successfully completed the ${activePhase.title} phase.`,
      imageUrl: proofData.imageUrl,
      xpEarned: activePhase.xpReward,
      phase: activePhase.title,
      phaseNumber: activePhaseIndex + 1
    };

    // Call the actual store action
    completePhase(activePhaseIndex, {
      score: 100,
      phaseNumber: activePhaseIndex + 1,
      xpReward: activePhase.xpReward,
      mfaiReward: activePhase.mfaiReward,
      nftReward: activePhase.nftReward
    });

    // Show modal after a short delay with CAPTURED data
    setTimeout(() => {
      setProofModalData(completedPhaseData);
    }, 1000);
  };

  const handleRunInteractiveStep = async () => {
    if (isStepLoading) return;
    if (!activePhase) return;

    try {
      await runInteractiveStep({
        phaseId: activePhase.id,
        trackId: selectedPersona.id,
        userInput: ''
      });
    } catch (error) {
      console.error('Error running interactive step:', error);
    }
  };

  return (
    <div className="space-y-6">
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

      <section className="glass-effect rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Journey Workspace</p>
            <h1 className="text-3xl font-space font-bold text-white">{selectedPersona.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
              <span>Phase {activePhaseNumber} of {totalPhases}</span>
              <span className="flex items-center gap-2">
                <Trophy size={16} className="text-accent-gold" />
                {(userProgress?.totalXP ?? 0).toLocaleString()} XP
              </span>
              <span className="flex items-center gap-2">
                <Coins size={16} className="text-accent-cyan" />
                {(userProgress?.mfaiTokens ?? 0).toLocaleString()} $MFAI
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleNavigationToggle}
              className={`${controlButtonClass} ${leftPanelOpen ? 'border-accent-cyan/40 text-accent-cyan' : ''}`}
            >
              <PanelLeft size={16} />
              <span>{navButtonCopy}</span>
            </button>
            <button
              type="button"
              onClick={toggleFocusMode}
              className={`${controlButtonClass} ${focusMode ? 'border-accent-cyan/40 text-accent-cyan' : ''}`}
            >
              {focusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              <span>{focusButtonCopy}</span>
            </button>
            <button
              type="button"
              onClick={handleInsightsToggle}
              className={`${controlButtonClass} ${rightPanelOpen ? 'border-accent-cyan/40 text-accent-cyan' : ''}`}
            >
              <PanelRight size={16} />
              <span>{insightsButtonCopy}</span>
            </button>
            <button
              type="button"
              onClick={cycleDensity}
              className={controlButtonClass}
            >
              <LayoutGrid size={16} />
              <span>{densityLabel}</span>
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <progress
            value={completionRate}
            max={100}
            aria-label="Journey completion"
            className="mfai-progress mfai-progress-accent"
          />
          <div className="flex flex-wrap items-center gap-4 text-xs text-white/60">
            <span>{completionRate}% complete</span>
            <span>{completedPhases}/{totalPhases} phases validated</span>
            <span>{(userProgress?.nfts?.length ?? 0)} Proof-of-Skill™ badges</span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-6">
          <section className="glass-effect rounded-3xl border border-white/10 bg-[#12122B]/70 p-6 shadow-lg">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-[0.4em] text-white/60">
                  Current Phase
                </h2>
                <h3 className="text-2xl font-space font-bold text-white">{activePhase.title}</h3>
                <p className="text-sm leading-relaxed text-white/70">{activePhase.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex flex-col text-xs uppercase tracking-[0.3em] text-white/80">
                  Mode
                  <select
                    value={uiMode}
                    onChange={(e) => setUiMode(e.target.value as any)}
                    className="mt-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white shadow-inner backdrop-blur focus:outline-none focus:ring-2 focus:ring-accent-cyan/60 focus:border-accent-cyan/50"
                  >
                    <option value="discovery" className="text-black">Discovery</option>
                    <option value="builder" className="text-black">Builder</option>
                    <option value="expert" className="text-black">Expert</option>
                  </select>
                </label>

                <label className="flex flex-col text-xs uppercase tracking-[0.3em] text-white/80">
                  Tone
                  <select
                    value={uiTone}
                    onChange={(e) => setUiTone(e.target.value as any)}
                    className="mt-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white shadow-inner backdrop-blur focus:outline-none focus:ring-2 focus:ring-accent-cyan/60 focus:border-accent-cyan/50"
                  >
                    <option value="pedagogical" className="text-black">Pedagogical</option>
                    <option value="investor_pitch" className="text-black">Investor Pitch</option>
                    <option value="critical" className="text-black">Critical</option>
                  </select>
                </label>

                <button
                  onClick={handleRunInteractiveStep}
                  disabled={isStepLoading}
                  className="inline-flex items-center gap-2 rounded-full bg-accent-cyan/20 px-4 py-2 text-sm font-semibold text-accent-cyan transition hover:bg-accent-cyan/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/60"
                  type="button"
                >
                  {isStepLoading ? <Loader2 size={16} className="animate-spin" /> : 'Start / Continue'}
                </button>

                {lastStep?.ui_blocks && lastStep.ui_blocks.length > 0 && !isPhaseCompleted && (
                  <button
                    onClick={() => {
                      if (activePhase.stakingRequired) {
                        setShowStakingModal(true);
                      } else if (activePhase.daoVoteRequired) {
                        setShowVoteModal(true);
                      } else if (activePhase.nftReward) {
                        handleCompletePhase();
                      } else {
                        completePhase(activePhaseIndex, {
                          score: 100,
                          phaseNumber: activePhaseNumber,
                          xpReward: activePhase.xpReward,
                          mfaiReward: activePhase.mfaiReward
                        });
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent-gold to-orange-500 px-4 py-2 text-sm font-semibold text-black shadow-[0_0_15px_rgba(255,215,0,0.3)] transition hover:from-accent-gold/80 hover:to-orange-500/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50"
                    type="button"
                  >
                    {activePhase.stakingRequired ? (
                      <>
                        <Coins size={16} />
                        <span>Validate & Stake</span>
                      </>
                    ) : activePhase.daoVoteRequired ? (
                      <>
                        <Trophy size={16} />
                        <span>Validate & Vote</span>
                      </>
                    ) : activePhase.nftReward ? (
                      <>
                        <Award size={16} />
                        <span>Validate & Mint NFT</span>
                      </>
                    ) : (
                      <>
                        <Trophy size={16} />
                        <span>Complete Phase</span>
                      </>
                    )}
                  </button>
                )}

                {isPhaseCompleted && activePhase.nftReward && (
                  <button
                    onClick={() =>
                      setProofModalData({
                        proofType: getProofType(selectedPersona.id, activePhase.id),
                        title: activePhase.nftReward || `Proof-of-${getProofType(selectedPersona.id, activePhase.id)}™`,
                        description: `Successfully completed the ${activePhase.title} phase.`,
                        imageUrl: getPersonaProofData(
                          selectedPersona.id,
                          activePhase.id,
                          getProofType(selectedPersona.id, activePhase.id),
                          activePhase.xpReward,
                          activePhase.title,
                          activePhaseNumber
                        ).imageUrl,
                        xpEarned: activePhase.xpReward,
                        phase: activePhase.title,
                        phaseNumber: activePhaseNumber
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-accent-purple/40 px-4 py-2 text-sm font-semibold text-accent-purple transition hover:bg-accent-purple/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple/40"
                    type="button"
                  >
                    <Award size={16} />
                    View Proof-of-{getProofType(selectedPersona.id, activePhase.id)}™
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <div className="flex justify-center">
                  <Trophy size={20} className="text-accent-gold" />
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.3em] text-white/50">XP Reward</p>
                <p className="mt-2 text-xl font-semibold text-accent-gold">{activePhase.xpReward}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <div className="flex justify-center">
                  <Coins size={20} className="text-accent-cyan" />
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.3em] text-white/50">$MFAI Tokens</p>
                <p className="mt-2 text-xl font-semibold text-accent-cyan">{activePhase.mfaiReward || 0}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <div className="flex justify-center">
                  <Award size={20} className="text-accent-purple" />
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.3em] text-white/50">NFT Reward</p>
                <p className="mt-2 text-xl font-semibold text-accent-purple">{activePhase.nftReward ? 'Available' : 'Optional'}</p>
              </div>
            </div>

            <div className="mt-6">
              {isStepLoading ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-16">
                  <Loader2 size={48} className="animate-spin text-accent-cyan" />
                  <p className="text-white/60">Zyno is orchestrating your session...</p>
                </div>
              ) : activePhase.id === 'launch-collaterize' ? (
                <LaunchCollaterizePhase />
              ) : lastStep ? (
                <UIBlocksRenderer response={lastStep as JourneyStepResponse} />
              ) : (
                <>
                  <PhaseDetails phase={activePhase} />
                  {!isPhaseCompleted && (
                    <div className="mt-8 flex justify-center">
                      <button
                        onClick={() => {
                          if (activePhase.stakingRequired) {
                            setShowStakingModal(true);
                          } else if (activePhase.daoVoteRequired) {
                            setShowVoteModal(true);
                          } else if (activePhase.nftReward) {
                            handleCompletePhase();
                          } else {
                            completePhase(activePhaseIndex, {
                              score: 100,
                              phaseNumber: activePhaseNumber,
                              xpReward: activePhase.xpReward,
                              mfaiReward: activePhase.mfaiReward
                            });
                          }
                        }}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent-gold to-orange-500 px-6 py-3 text-sm font-semibold text-black shadow-[0_0_20px_rgba(255,215,0,0.2)] transition hover:from-accent-gold/80 hover:to-orange-500/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/40"
                        type="button"
                      >
                        {activePhase.stakingRequired ? (
                          <>
                            <Coins size={18} />
                            <span>Validate & Stake</span>
                          </>
                        ) : activePhase.daoVoteRequired ? (
                          <>
                            <Trophy size={18} />
                            <span>Validate & Vote</span>
                          </>
                        ) : activePhase.nftReward ? (
                          <>
                            <Award size={18} />
                            <span>Validate & Mint NFT</span>
                          </>
                        ) : (
                          <>
                            <Loader2 size={18} />
                            <span>Validate Phase</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          <section className="glass-effect rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg">
            <ProjectAssets />
          </section>
        </div>

        <div className="space-y-6">
          <section className="glass-effect rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-white">Journey Map</h3>
                <p className="text-xs text-white/60">Review upcoming phases and revisit completed milestones.</p>
              </div>
              <button
                type="button"
                onClick={handleNavigationToggle}
                className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/70 transition hover:border-accent-cyan hover:text-accent-cyan"
              >
                {leftPanelOpen ? 'Collapse Nav' : 'Open Nav'}
              </button>
            </div>
            <div className="mt-4 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
              <JourneyTimeline
                phases={selectedPersona.phases}
                currentPhase={completedPhases}
                onPhaseChange={setCurrentPhase}
              />
            </div>
          </section>

          <section className="glass-effect rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Agent Activity</h3>
              <button
                type="button"
                onClick={handleInsightsToggle}
                className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/70 transition hover:border-accent-cyan hover:text-accent-cyan"
              >
                {rightPanelOpen ? 'Collapse' : 'Open Panel'}
              </button>
            </div>
            <div className="mt-4 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
              <AgentActivityFeed />
            </div>
          </section>

          <section className="glass-effect rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-white">Reference Library</h3>
            <div className="mt-4 max-h-[320px] space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {resources.map((resource) => {
                const Icon = getResourceIcon(resource.type);
                return (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:border-accent-cyan/40 hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
                        <span className="rounded-lg bg-white/10 p-1.5 text-accent-cyan">
                          <Icon size={14} />
                        </span>
                        {resource.type}
                      </span>
                      <span className="text-[10px] text-white/40">{resource.duration}</span>
                    </div>
                    <h4 className="mt-2 text-sm font-semibold text-white">{resource.title}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-white/60">{resource.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {resource.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/50">
                          {tag}
                        </span>
                      ))}
                    </div>
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

      {showStakingModal && (
        <StakingModal
          availableAmount={1000}
          currentStaked={0}
          onClose={() => setShowStakingModal(false)}
          onStake={(_amount) => {
            setShowStakingModal(false);
            if (activePhase.nftReward) {
              handleCompletePhase();
            } else {
              completePhase(activePhaseIndex, {
                score: 100,
                phaseNumber: activePhaseNumber,
                xpReward: activePhase.xpReward,
                mfaiReward: activePhase.mfaiReward
              });
            }
          }}
        />
      )}

      {showVoteModal && (
        <DAOVoteModal
          phase={activePhase}
          votingPower={50}
          onClose={() => setShowVoteModal(false)}
          onVote={(_vote) => {
            setShowVoteModal(false);
            if (activePhase.nftReward) {
              handleCompletePhase();
            } else {
              completePhase(activePhaseIndex, {
                score: 100,
                phaseNumber: activePhaseNumber,
                xpReward: activePhase.xpReward,
                mfaiReward: activePhase.mfaiReward
              });
            }
          }}
        />
      )}
    </div>
  );
};

export default JourneyWorkspace;