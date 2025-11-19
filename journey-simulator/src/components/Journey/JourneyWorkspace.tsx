import { FC, useState } from 'react';
import JourneyTimeline from './JourneyTimeline';
import AgentActivityFeed from '../AgentActivityFeed';
import UIBlocksRenderer from '../UIBlocks/UIBlocksRenderer';
import { useJourneyStore } from '../../store/journeyStore';
import { Loader2, Trophy, Coins, Award } from 'lucide-react';
import type { JourneyStepResponse } from '../../types/uiBlocks';
import confetti from "canvas-confetti";
import NFTProofModal from '../NFTProofModal';
import { AnimatePresence } from 'framer-motion';

const JourneyWorkspace: FC = () => {
    const {
        selectedPersona,
        userProgress,
        currentPhase: currentPhaseIndex,
        lastStep,
        isStepLoading,
        runInteractiveStep,
        setCurrentPhase: setCurrentPhaseIndex,
        completePhase
    } = useJourneyStore();

    const [showProofModal, setShowProofModal] = useState(false);

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
        completePhase(currentPhaseIndex, { score: 100, phaseNumber: currentPhaseIndex + 1 });

        // Show modal after a short delay
        setTimeout(() => {
            setShowProofModal(true);
        }, 1000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)] relative">
            {/* Left Column: Timeline & Context (3 cols) */}
            <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-2">
                <div className="glass-effect rounded-xl p-4">
                    <h3 className="font-space font-bold text-lg mb-2 text-accent-cyan">
                        {selectedPersona.title} Journey
                    </h3>
                    <div className="flex justify-between text-sm opacity-70 mb-4">
                        <span>Level {Math.floor(userProgress.totalXP / 1000) + 1}</span>
                        <span>{userProgress.totalXP} XP</span>
                    </div>
                    <JourneyTimeline
                        phases={selectedPersona.phases}
                        currentPhase={userProgress.completedPhases.length}
                        onPhaseChange={(idx) => setCurrentPhaseIndex(idx)}
                    />
                </div>

                <div className="glass-effect rounded-xl p-4">
                    <h4 className="font-semibold mb-2">Current Phase</h4>
                    <p className="text-sm opacity-80 mb-3">{activePhase.description}</p>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-white/5 rounded p-2">
                            <Trophy size={14} className="mx-auto mb-1 text-accent-gold" />
                            {activePhase.xpReward} XP
                        </div>
                        <div className="bg-white/5 rounded p-2">
                            <Coins size={14} className="mx-auto mb-1 text-accent-cyan" />
                            {activePhase.mfaiReward || 0} $MFAI
                        </div>
                        <div className="bg-white/5 rounded p-2">
                            <Award size={14} className="mx-auto mb-1 text-accent-purple" />
                            NFT
                        </div>
                    </div>
                </div>
            </div>

            {/* Center Column: Active Workspace (6 cols) */}
            <div className="lg:col-span-6 flex flex-col gap-4 overflow-y-auto px-2">
                <div className="glass-effect rounded-xl p-6 min-h-[500px]">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <h2 className="text-2xl font-space font-bold">{activePhase.title}</h2>

                        <div className="flex items-center gap-2 text-xs">
                            <div className="flex flex-col gap-1">
                                <label className="opacity-50 text-[10px] uppercase tracking-wider">Mode</label>
                                <select
                                    value={useJourneyStore.getState().uiMode}
                                    onChange={(e) => useJourneyStore.getState().setUiMode(e.target.value as any)}
                                    className="bg-white/10 rounded px-2 py-1 border border-white/10 focus:border-accent-cyan outline-none"
                                >
                                    <option value="discovery">Discovery</option>
                                    <option value="builder">Builder</option>
                                    <option value="expert">Expert</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="opacity-50 text-[10px] uppercase tracking-wider">Tone</label>
                                <select
                                    value={useJourneyStore.getState().uiTone}
                                    onChange={(e) => useJourneyStore.getState().setUiTone(e.target.value as any)}
                                    className="bg-white/10 rounded px-2 py-1 border border-white/10 focus:border-accent-cyan outline-none"
                                >
                                    <option value="pedagogical">Pedagogical</option>
                                    <option value="investor_pitch">Investor Pitch</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>

                            <button
                                onClick={() => runInteractiveStep({ phaseId: activePhase.id, trackId: selectedPersona.id })}
                                disabled={isStepLoading}
                                className="btn-primary text-sm px-4 py-2 flex items-center gap-2 mt-4 sm:mt-0"
                            >
                                {isStepLoading ? <Loader2 size={16} className="animate-spin" /> : 'Start / Continue'}
                            </button>

                            {currentPhaseIndex === userProgress.completedPhases.length && (
                                <button
                                    onClick={handleCompletePhase}
                                    className="btn-secondary text-sm px-4 py-2 flex items-center gap-2 mt-4 sm:mt-0 border-green-500/50 text-green-400 hover:bg-green-500/10"
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

            {/* Right Column: Agents & Resources (3 cols) */}
            <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto pl-2">
                <div className="glass-effect rounded-xl p-4 h-1/2 overflow-hidden flex flex-col">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Agent Activity
                    </h4>
                    <div className="flex-1 overflow-y-auto">
                        <AgentActivityFeed />
                    </div>
                </div>

                <div className="glass-effect rounded-xl p-4 h-1/2">
                    <h4 className="font-semibold mb-3">Resources</h4>
                    {/* Placeholder for resources list */}
                    <div className="space-y-2 text-sm opacity-80">
                        <div className="p-2 bg-white/5 rounded hover:bg-white/10 cursor-pointer">
                            📄 Whitepaper Template
                        </div>
                        <div className="p-2 bg-white/5 rounded hover:bg-white/10 cursor-pointer">
                            📊 Tokenomics Calculator
                        </div>
                        <div className="p-2 bg-white/5 rounded hover:bg-white/10 cursor-pointer">
                            🔗 Solana Docs
                        </div>
                    </div>
                </div>
            </div>

            {/* NFT Proof Modal */}
            <AnimatePresence>
                {showProofModal && (
                    <NFTProofModal
                        proofType="Skill" // Default or map from phase
                        title={activePhase.title}
                        description={`Successfully completed the ${activePhase.title} phase.`}
                        xpEarned={activePhase.xpReward}
                        phase={activePhase.title}
                        phaseNumber={activePhaseIndex + 1}
                        onClose={() => setShowProofModal(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default JourneyWorkspace;
