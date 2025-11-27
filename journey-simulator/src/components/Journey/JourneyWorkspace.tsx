import { useState, useMemo } from 'react';
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
import confetti from 'canvas-confetti';
import NFTProofModal from '../NFTProofModal';

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

  const [showProofModal, setShowProofModal] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);

  const canCompletePhase = useMemo(() => {
    if (!lastStep) return false;
    const evalBlock = lastStep.ui_blocks?.find((block: any) =>
      block.kind === 'evaluation_block' || block.kind === 'evaluation'
    );
    if (!evalBlock) return false;
    // @ts-expect-error - global_score might be string
    const score = Number(evalBlock.global_score || 0);
    // @ts-expect-error - max_score might be string
    const maxScore = Number(evalBlock.max_score || 100);
    const threshold = Math.max(70, Math.round(maxScore * 0.6));
    return score >= threshold;
  }, [lastStep]);

  if (!selectedPersona) return null;

  const activePhaseIndex = currentPhaseIndex ?? userProgress.completedPhases.length;
  const activePhase = selectedPersona.phases[activePhaseIndex] || selectedPersona.phases[0];

  const handleCompletePhase = () => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00f0ff', '#7000ff', '#ffffff']
    });

    // Call the actual store action
    completePhase(activePhaseIndex, { score: 100, phaseNumber: activePhaseIndex + 1 });

    // Show modal after a short delay
    setTimeout(() => {
      setShowProofModal(true);
    }, 1000);
  };

  const handleRunInteractiveStep = async () => {
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

              {activePhaseIndex === userProgress.completedPhases.length && canCompletePhase && (
                <button
                  onClick={handleCompletePhase}
                  className="btn-secondary text-sm px-4 py-2 flex items-center gap-2 border-green-500/50 text-green-400 hover:bg-green-500/10 ml-2"
                >
                  ✓ Complete Phase
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
            <UIBlocksRenderer response={lastStep as JourneyStepResponse} />
          ) : (
            <div className="text-center py-20 opacity-60">
              <p>Click "Start" to begin this phase with Zyno.</p>
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
            <h4 className="font-semibold mb-3">Resources</h4>
            <div className="space-y-2 text-sm opacity-80">
              <a
                href="https://github.com/topics/whitepaper"
                target="_blank"
                rel="noreferrer"
                className="block p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
              >
                📄 Whitepaper Examples
              </a>
              <a
                href="https://solana.com/docs"
                target="_blank"
                rel="noreferrer"
                className="block p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
              >
                📊 Solana Documentation
              </a>
              <a
                href="https://solana.com/developers"
                target="_blank"
                rel="noreferrer"
                className="block p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
              >
                🔗 Solana Developers
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* NFT Proof Modal */}
      {showProofModal && (
        <NFTProofModal
          proofType="Skill"
          title={activePhase.title}
          description={`Successfully completed the ${activePhase.title} phase.`}
          xpEarned={activePhase.xpReward}
          phase={activePhase.title}
          phaseNumber={activePhaseIndex + 1}
          onClose={() => setShowProofModal(false)}
        />
      )}
    </div>
  );
};

export default JourneyWorkspace;