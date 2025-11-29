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
  PanelLeftClose,
  PanelRight,
  PanelRightClose,
  Maximize2,
  Minimize2
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

  useEffect(() => {
    console.log('[JourneyWorkspace] MOUNTED');
  }, []);

  const [proofModalData, setProofModalData] = useState<any>(null);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);

  if (!selectedPersona) return null;

  const activePhaseIndex = currentPhaseIndex ?? userProgress.completedPhases.length;



  // Check if journey is completed
  if (activePhaseIndex >= selectedPersona.phases.length) {
    return <JourneyCompletedPage />;
  }

  const activePhase = selectedPersona.phases[activePhaseIndex] || selectedPersona.phases[0];
  console.log('[JourneyWorkspace] Rendering phase:', activePhase?.title);

  const handleCompletePhase = () => {
    // Capture current phase data BEFORE updating state
    const completedPhaseData = {
      proofType: getProofType(selectedPersona.id, activePhase.id),
      title: activePhase.nftReward || `Proof-of-${getProofType(selectedPersona.id, activePhase.id)}™`,
      description: `Successfully completed the ${activePhase.title} phase.`,
      imageUrl: getPersonaProofData(selectedPersona.id, activePhase.id, getProofType(selectedPersona.id, activePhase.id), activePhase.xpReward, activePhase.title, activePhaseIndex + 1).imageUrl,
      xpEarned: activePhase.xpReward,
      phase: activePhase.title,
      phaseNumber: activePhaseIndex + 1
    };

    // Call the actual store action
    completePhase(activePhaseIndex, {
      score: 100,
      phaseNumber: activePhaseIndex + 1,
      xpReward: activePhase.xpReward,
      mfaiReward: activePhase.mfaiReward
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
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-100px)] relative overflow-hidden">
      {/* Left Column: Timeline & Context */}
      <div className={`transition-all duration-300 border-r border-white/10 ${showLeftPanel ? 'w-80' : 'w-0 overflow-hidden'}`}>
        <div className="h-full overflow-y-auto">
          <div className="glass-effect rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-space font-bold text-xl mb-2 bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">
                  {selectedPersona.title} Journey
                </h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className="opacity-80">Level {Math.floor(userProgress.totalXP / 1000) + 1}</span>
                  <span className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    {userProgress.totalXP} XP
                  </span>
                </div>
              </div>
            </div>

            <JourneyTimeline
              phases={selectedPersona.phases}
              currentPhase={userProgress.completedPhases.length}
              onPhaseChange={setCurrentPhase}
            />
          </div>

          <div className="glass-effect rounded-2xl p-6">
            <h4 className="font-semibold mb-4 text-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-cyan" />
              Current Phase
            </h4>
            <p className="text-sm opacity-80 mb-6 leading-relaxed">{activePhase.description}</p>

            <div className="grid grid-cols-3 gap-3">
              <div className="glass-effect rounded-xl p-3 text-center">
                <div className="flex justify-center mb-2">
                  <Trophy size={18} className="text-accent-gold" />
                </div>
                <div className="text-xs opacity-70 mb-1">XP Reward</div>
                <div className="text-lg font-bold text-accent-gold">{activePhase.xpReward}</div>
              </div>
              <div className="glass-effect rounded-xl p-3 text-center">
                <div className="flex justify-center mb-2">
                  <Coins size={18} className="text-accent-cyan" />
                </div>
                <div className="text-xs opacity-70 mb-1">$MFAI Tokens</div>
                <div className="text-lg font-bold text-accent-cyan">{activePhase.mfaiReward || 0}</div>
              </div>
              <div className="glass-effect rounded-xl p-3 text-center">
                <div className="flex justify-center mb-2">
                  <Award size={18} className="text-accent-purple" />
                </div>
                <div className="text-xs opacity-70 mb-1">NFT Badge</div>
                <div className="text-lg font-bold text-accent-purple">Yes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Column: Active Workspace */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0">
        {/* Toolbar for View Controls */}
        <div className="flex justify-between items-center bg-white/5 rounded-lg p-2 sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex gap-2">
            <button
              onClick={() => setShowLeftPanel(!showLeftPanel)}
              className={`p-1.5 rounded-md transition-colors ${showLeftPanel ? 'bg-accent-cyan/20 text-accent-cyan' : 'hover:bg-white/10 text-slate-400'}`}
              title={showLeftPanel ? "Hide left panel" : "Show left panel"}
            >
              {showLeftPanel ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
            </button>
          </div>

          <button
            onClick={() => {
              setShowLeftPanel(prev => !prev);
              setShowRightPanel(prev => !prev);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-accent-cyan/10 hover:bg-accent-cyan/20 text-accent-cyan rounded-md text-xs font-medium transition-colors"
            title="Toggle focus mode"
          >
            {(showLeftPanel || showRightPanel) ? (
              <>
                <Minimize2 size={14} />
                <span>Exit Focus</span>
              </>
            ) : (
              <>
                <Maximize2 size={14} />
                <span>Focus Mode</span>
              </>
            )}
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setShowRightPanel(!showRightPanel)}
              className={`p-1.5 rounded-md transition-colors ${showRightPanel ? 'bg-accent-cyan/20 text-accent-cyan' : 'hover:bg-white/10 text-slate-400'}`}
              title={showRightPanel ? "Hide right panel" : "Show right panel"}
            >
              {showRightPanel ? <PanelRightClose size={18} /> : <PanelRight size={18} />}
            </button>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-space font-bold">{activePhase.title}</h2>

            <div className="flex items-center gap-2 text-xs">
              <div className="flex flex-col gap-1">
                <label className="opacity-50 text-[10px] uppercase tracking-wider">Mode</label>
                <select
                  value={uiMode}
                  onChange={(e) => setUiMode(e.target.value as any)}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded px-2 py-1 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="discovery">Discovery</option>
                  <option value="builder">Builder</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="opacity-50 text-[10px] uppercase tracking-wider">Tone</label>
                <select
                  value={uiTone}
                  onChange={(e) => setUiTone(e.target.value as any)}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded px-2 py-1 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="pedagogical">Pedagogical</option>
                  <option value="investor_pitch">Investor Pitch</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <button
                onClick={handleRunInteractiveStep}
                disabled={isStepLoading}
                className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
              >
                {isStepLoading ? <Loader2 size={16} className="animate-spin" /> : 'Start / Continue'}
              </button>

              {/* Demo Mode Action Button - Only show after Zyno provides content */}
              {lastStep?.ui_blocks && lastStep.ui_blocks.length > 0 && !userProgress.completedPhases.includes(activePhaseIndex) && (
                <button
                  onClick={() => {
                    // 1. Handle Staking
                    if (activePhase.stakingRequired) {
                      setShowStakingModal(true);
                    }
                    // 2. Handle DAO Vote
                    else if (activePhase.daoVoteRequired) {
                      setShowVoteModal(true);
                    }
                    // 3. Handle NFT Reward (Minting)
                    else if (activePhase.nftReward) {
                      handleCompletePhase(); // Opens NFT Modal
                    }
                    // 4. Default Completion
                    else {
                      completePhase(activePhaseIndex, {
                        score: 100,
                        phaseNumber: activePhaseIndex + 1,
                        xpReward: activePhase.xpReward,
                        mfaiReward: activePhase.mfaiReward
                      });
                    }
                  }}
                  className="btn-primary text-sm px-4 py-2 flex items-center gap-2 bg-gradient-to-r from-accent-gold to-orange-500 hover:from-accent-gold/80 hover:to-orange-500/80 border-none text-black font-bold shadow-[0_0_15px_rgba(255,215,0,0.3)]"
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

              {userProgress.completedPhases.includes(activePhaseIndex) && activePhase.nftReward && (
                <button
                  onClick={() => setProofModalData({
                    proofType: getProofType(selectedPersona.id, activePhase.id),
                    title: activePhase.nftReward || `Proof-of-${getProofType(selectedPersona.id, activePhase.id)}™`,
                    description: `Successfully completed the ${activePhase.title} phase.`,
                    imageUrl: getPersonaProofData(selectedPersona.id, activePhase.id, getProofType(selectedPersona.id, activePhase.id), activePhase.xpReward, activePhase.title, activePhaseIndex + 1).imageUrl,
                    xpEarned: activePhase.xpReward,
                    phase: activePhase.title,
                    phaseNumber: activePhaseIndex + 1
                  })}
                  className="btn-secondary text-sm px-4 py-2 flex items-center gap-2 border-accent-purple/50 text-accent-purple hover:bg-accent-purple/10 ml-2"
                >
                  <Award size={16} />
                  View Proof-of-{getProofType(selectedPersona.id, activePhase.id)}™
                </button>
              )}
            </div>
          </div>

          {isStepLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 size={48} className="animate-spin text-accent-cyan" />
              <p className="text-white/60">Zyno is orchestrating your session...</p>
            </div>
          ) : lastStep ? (
            <>
              <UIBlocksRenderer response={lastStep as JourneyStepResponse} />
            </>
          ) : (
            <div className="animate-fadeIn">
              <PhaseDetails phase={activePhase} />

              {/* Bottom Action Button for convenience */}
              {!userProgress.completedPhases.includes(activePhaseIndex) && (
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
                          phaseNumber: activePhaseIndex + 1,
                          xpReward: activePhase.xpReward,
                          mfaiReward: activePhase.mfaiReward
                        });
                      }
                    }}
                    className="btn-primary text-sm px-8 py-3 flex items-center gap-2 bg-gradient-to-r from-accent-gold to-orange-500 hover:from-accent-gold/80 hover:to-orange-500/80 border-none text-black font-bold shadow-[0_0_20px_rgba(255,215,0,0.2)] transform hover:scale-105 transition-all"
                  >
                    {activePhase.stakingRequired ? (
                      <>
                        <Coins size={18} />
                        <span className="text-base">Validate & Stake</span>
                      </>
                    ) : activePhase.daoVoteRequired ? (
                      <>
                        <Trophy size={18} />
                        <span className="text-base">Validate & Vote</span>
                      </>
                    ) : activePhase.nftReward ? (
                      <>
                        <Award size={18} />
                        <span className="text-base">Validate & Mint NFT</span>
                      </>
                    ) : (
                      <>
                        <Loader2 size={18} />
                        <span className="text-base">Validate Phase</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Agents & Resources */}
      <div className={`transition-all duration-300 border-l border-white/10 ${showRightPanel ? 'w-80' : 'w-0 overflow-hidden'}`}>
        <div className="h-full overflow-y-auto">
          <div className="glass-effect rounded-2xl p-6 mb-6 h-1/2 overflow-y-auto">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Agent Activity
            </h4>
            <AgentActivityFeed />
          </div>

          <div className="glass-effect rounded-2xl p-6 h-1/2">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse" />
              Library
            </h4>
            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: 'calc(100% - 40px)' }}>
              {resources.map((resource) => {
                const Icon = getResourceIcon(resource.type);
                return (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-3 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer transition-all border border-white/5 hover:border-accent-cyan/30 group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-white/5 text-accent-cyan group-hover:text-white transition-colors">
                          <Icon size={14} />
                        </div>
                        <span className="text-xs font-medium text-accent-cyan/80 uppercase tracking-wider">{resource.type}</span>
                      </div>
                      <span className="text-[10px] opacity-60 bg-black/20 px-2 py-0.5 rounded-full">{resource.duration}</span>
                    </div>

                    <h5 className="font-medium text-sm mb-1 group-hover:text-accent-cyan transition-colors line-clamp-1">{resource.title}</h5>
                    <p className="text-xs opacity-70 mb-2 line-clamp-2 leading-relaxed">{resource.description}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {resource.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/60">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* NFT Proof Modal */}
      {
        proofModalData && (
          <NFTProofModal
            proofType={proofModalData.proofType}
            title={proofModalData.title}
            description={proofModalData.description}
            imageUrl={proofModalData.imageUrl}
            xpEarned={proofModalData.xpEarned}
            phase={proofModalData.phase}
            phaseNumber={proofModalData.phaseNumber}
            onClose={() => setProofModalData(null)}
          />
        )
      }

      {/* Staking Modal */}
      {showStakingModal && (
        <StakingModal
          availableAmount={1000} // Mock available amount
          currentStaked={0}
          onClose={() => setShowStakingModal(false)}
          onStake={(_amount) => {
            setShowStakingModal(false);
            // After staking, proceed to complete phase (and show NFT if applicable)
            if (activePhase.nftReward) {
              handleCompletePhase();
            } else {
              completePhase(activePhaseIndex, {
                score: 100,
                phaseNumber: activePhaseIndex + 1,
                xpReward: activePhase.xpReward,
                mfaiReward: activePhase.mfaiReward
              });
            }
          }}
        />
      )}

      {/* DAO Vote Modal */}
      {showVoteModal && (
        <DAOVoteModal
          phase={activePhase}
          votingPower={50} // Mock voting power
          onClose={() => setShowVoteModal(false)}
          onVote={(_vote) => {
            setShowVoteModal(false);
            // After voting, proceed to complete phase (and show NFT if applicable)
            if (activePhase.nftReward) {
              handleCompletePhase();
            } else {
              completePhase(activePhaseIndex, {
                score: 100,
                phaseNumber: activePhaseIndex + 1,
                xpReward: activePhase.xpReward,
                mfaiReward: activePhase.mfaiReward
              });
            }
          }}
        />
      )}
    </div >
  );
};

export default JourneyWorkspace;