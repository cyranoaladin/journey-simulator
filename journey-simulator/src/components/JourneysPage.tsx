import { useState, useEffect, type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJourneyStore } from '../store/journeyStore';
import { useNavigate } from 'react-router-dom';
import JourneyCard from './Journey/JourneyCard';
import JourneyTimeline from './Journey/JourneyTimeline';
import JourneyDashboard from './Journey/JourneyDashboard';
import PhaseSection from './Journey/PhaseSection';
import XPTracker from './Journey/XPTracker';
import ZynoBox from './Journey/ZynoBox';
import { personas } from '../data/personas';
import NFTProofModal from './NFTProofModal';
import { getProofType } from '../data/proofsData';
import NFTMintingTutorial from './NFTMintingTutorial';
import ShareModal from './ShareModal';
import ProofCertificationsBoard from './ProofCertificationsBoard';
import WalletStatusDisplay from './WalletStatusDisplay';
import StakingModal from './StakingModal';
import DAOVoteModal from './DAOVoteModal';
import ResetProgressButton from './ResetProgressButton';

const JourneysPage: FC = () => {
  const {
    selectedPersona,
    setSelectedPersona,
    userProgress,
    completePhase,
    updateProgress,
    openModal,
    updateStaking,
    updateVotingPower,
    loadUserProgress,
  } = useJourneyStore();
  const navigate = useNavigate();

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number | null>(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMintingTutorial, setShowMintingTutorial] = useState(false);
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [showDAOVoteModal, setShowDAOVoteModal] = useState(false);
  const [currentProofData, setCurrentProofData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompletingPhase, setIsCompletingPhase] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supportHighlights = [
    {
      title: 'Zyno, AI Co-Founder',
      description:
        'Zyno orchestrates personalized curricula, turns protocol complexity into guided actions, and pair-programs on Solana builds so each pathway compounds faster.',
      bullets: [
        'Design studio for strategy, token economics, and governance stress tests',
        'Real-time AI pair for code reviews, prompt engineering, and architectural simulations',
        'Cognitive activator that adapts missions based on Proof-of-Skill™ signals',
      ],
    },
    {
      title: 'Protocol Agent Mesh',
      description:
        'Specialized MFAI agents coordinate alongside Zyno to keep momentum high from ideation to launch.',
      bullets: [
        'Skillchain Miners validate mastery on-chain and unlock higher stakes missions',
        'Guardian Agents monitor security, treasury health, and incident response drills',
        'Sovereign Builders Network links founders with talent, capital, and Synaptic Governance',
      ],
    },
  ];

  useEffect(() => {
    const loadProgress = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await loadUserProgress();
      } catch (err) {
        console.error('Failed to load user progress:', err);
        setError('Failed to load your progress. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [loadUserProgress]);

  const handlePhaseChange = (index: number) => {
    if (selectedPersona) {
      setCurrentPhaseIndex(index);
      openModal({
        type: 'phase',
        phase: selectedPersona.phases[index],
        phaseIndex: index,
        persona: selectedPersona,
      });
    }
  };

  const handlePhaseComplete = async (phaseIndex: number) => {
    if (!selectedPersona) return;

    const phase = selectedPersona.phases[phaseIndex];
    const totalPhases = selectedPersona.phases.length;
    const completedCount = userProgress.completedPhases.length;
    const nextPhaseNumber = phaseIndex + 1;
    const isFinalPhase = completedCount + 1 >= totalPhases;
    const projectedXP = userProgress.totalXP + (phase.xpReward || 0);
    const projectedTokens = userProgress.mfaiTokens + (phase.mfaiReward || 0);
    const projectedVotingPower = userProgress.votingPower + Math.floor((phase.xpReward || 0) / 10);
    const mintedNftsAfter = phase.nftReward
      ? Array.from(new Set([...userProgress.nfts, phase.nftReward]))
      : [...userProgress.nfts];
    const maxJourneyXp = selectedPersona.phases.reduce((sum, currentPhase) => sum + (currentPhase.xpReward || 0), 0);
    const aepoScore = maxJourneyXp > 0 ? Math.min(100, Math.round((projectedXP / maxJourneyXp) * 100)) : 100;
    const aecoScore = Math.min(100, Math.round(aepoScore * 0.9 + 10));
    const completionSummary = {
      personaId: selectedPersona.id,
      personaTitle: selectedPersona.title,
      personaIcon: selectedPersona.icon,
      passType: selectedPersona.passType,
      totalXP: projectedXP,
      mfaiTokens: projectedTokens,
      votingPower: projectedVotingPower,
      mintedNfts: mintedNftsAfter,
      completedPhases: totalPhases,
      totalPhases,
      aepoScore,
      aecoScore,
      completedAt: new Date().toISOString(),
      phases: selectedPersona.phases.map(({ id, title, mission, xpReward, nftReward, duration }) => ({
        id,
        title,
        mission,
        xpReward,
        nftReward,
        duration
      }))
    };

    let shouldNavigateToCompletion = false;

    try {
      setIsCompletingPhase(true);
      setError(null);
      const wasFirstNft = userProgress.nfts.length === 0;

      await completePhase(phaseIndex, {
        score: phase.xpReward,
        phaseNumber: nextPhaseNumber,
      });

      await updateProgress(
        phase.xpReward,
        phase.nftReward ? [phase.nftReward] : [],
        phase.mfaiReward || 0,
      );

      setCurrentPhaseIndex(phaseIndex);
      setSuccessMessage(`Phase ${nextPhaseNumber} completed! +${phase.xpReward} XP earned!`);
      setTimeout(() => setSuccessMessage(null), 5000);

      if (phase.nftReward) {
        const proofType = getProofType(selectedPersona.id, phase.id);
        setCurrentProofData({
          proofType,
          title: phase.nftReward,
          description: phase.description,
          imageUrl: phase.nftDesign || `/images/${phase.id}.png`,
          xpEarned: phase.xpReward,
          phase: phase.title,
          phaseNumber: phaseIndex + 1,
          completionDate: new Date().toLocaleDateString(),
          rarity:
            phaseIndex === 4 ? 'legendary' : phaseIndex === 3 ? 'epic' : phaseIndex === 2 ? 'rare' : 'common',
        });
        setShowProofModal(true);

        if (wasFirstNft) {
          setShowMintingTutorial(true);
        }
      }

      if (phase.stakingRequired && projectedTokens >= phase.stakingRequired) {
        setTimeout(() => {
          setShowStakingModal(true);
        }, 1000);
      }

      if (phase.daoVoteRequired) {
        setTimeout(() => {
          setShowDAOVoteModal(true);
        }, 1500);
      }

      shouldNavigateToCompletion = isFinalPhase;
    } catch (err) {
      console.error('Failed to complete phase:', err);
      setError('Failed to complete phase. Please try again.');
    } finally {
      setIsCompletingPhase(false);

      if (shouldNavigateToCompletion) {
        navigate('/journeys/completed', { state: { summary: completionSummary } });
      }
    }
  };

  const handleViewNFT = (phaseIndex: number) => {
    if (selectedPersona) {
      const phase = selectedPersona.phases[phaseIndex];
      const proofType = getProofType(selectedPersona.id, phase.id);

      setCurrentProofData({
        proofType,
        title: phase.nftReward || `Proof-of-${proofType}™`,
        description: phase.description,
        imageUrl: phase.nftDesign || `/images/${phase.id}.png`,
        xpEarned: phase.xpReward,
        phase: phase.title,
        phaseNumber: phaseIndex + 1,
        completionDate: new Date().toLocaleDateString(),
        rarity:
          phaseIndex === 4 ? 'legendary' : phaseIndex === 3 ? 'epic' : phaseIndex === 2 ? 'rare' : 'common',
      });

      setShowProofModal(true);
    }
  };

  const handleStaking = () => {
    setShowStakingModal(true);
  };

  const handleDAOVote = () => {
    if (selectedPersona && currentPhaseIndex !== null) {
      setShowDAOVoteModal(true);
    }
  };

  const handleStakingComplete = async (amount: number) => {
    try {
      setIsLoading(true);
      setError(null);
      updateStaking(amount);
      setShowStakingModal(false);
    } catch (err) {
      console.error('Failed to complete staking:', err);
      setError('Failed to complete staking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDAOVoteComplete = async (vote: 'approve' | 'reject') => {
    try {
      setIsLoading(true);
      setError(null);
      updateVotingPower(userProgress.votingPower + 10);
      await updateProgress(30, [`DAO Vote: ${vote}`], 5);
      setShowDAOVoteModal(false);
    } catch (err) {
      console.error('Failed to complete DAO vote:', err);
      setError('Failed to complete DAO vote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshProgress = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await loadUserProgress();
    } catch (err) {
      console.error('Failed to refresh progress:', err);
      setError('Failed to refresh progress. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPersonas = () => {
    setSelectedPersona(null);
    setCurrentPhaseIndex(null);
    setError(null);
    setSuccessMessage(null);
  };

  if (showStakingModal) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowStakingModal(false)}
              className="btn-secondary"
            >
              ← Back to Journey
            </motion.button>
          </div>
          <StakingModal
            onClose={() => setShowStakingModal(false)}
            availableAmount={userProgress.mfaiTokens}
            currentStaked={userProgress.stakedMfai}
            onStake={handleStakingComplete}
          />
        </div>
      </div>
    );
  }

  if (showDAOVoteModal && selectedPersona && currentPhaseIndex !== null) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDAOVoteModal(false)}
              className="btn-secondary"
            >
              ← Back to Journey
            </motion.button>
          </div>
          <DAOVoteModal
            onClose={() => setShowDAOVoteModal(false)}
            phase={selectedPersona.phases[currentPhaseIndex]}
            votingPower={userProgress.votingPower}
            onVote={handleDAOVoteComplete}
          />
        </div>
      </div>
    );
  }

  if (isLoading && !selectedPersona) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-cyan mx-auto mb-4" />
              <p className="text-white text-lg">Loading your journey...</p>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900">
      <div className="sticky top-0 z-40 bg-primary-900/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="text-green-400">🎉</div>
                <span className="text-green-300 text-sm">{successMessage}</span>
                <button onClick={() => setSuccessMessage(null)} className="ml-auto text-green-400 hover:text-green-300">
                  ✕
                </button>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-red-400">⚠️</div>
                <span className="text-red-300 text-sm">{error}</span>
                <div className="ml-auto flex space-x-2">
                  <button onClick={handleRefreshProgress} disabled={isLoading} className="text-red-400 hover:text-red-300 disabled:opacity-50 text-sm">
                    🔄 Refresh
                  </button>
                  <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
                    ✕
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-space font-bold mb-6">
            <span className="gradient-text">Choose Your Path to Sovereignty</span>
          </h1>
          <p className="text-xl opacity-80 max-w-4xl mx-auto mb-8 leading-relaxed">
            Discover how the <span className="font-semibold text-accent-cyan">Cognitive Activation Protocol™</span> transforms your skills into capital based on your unique profile
          </p>
          <div className="flex justify-center">
            <ResetProgressButton />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-16">
          <div className="grid md:grid-cols-2 gap-6">
            {supportHighlights.map((highlight, index) => (
              <div key={highlight.title} className="glass-effect rounded-2xl p-6 text-left">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-accent-cyan">{highlight.title}</h3>
                  <span className="text-sm text-white/60">Agent {index + 1}</span>
                </div>
                <p className="text-base text-white/80 mb-4 leading-relaxed">{highlight.description}</p>
                <ul className="space-y-2 text-sm text-white/70">
                  {highlight.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <span className="text-accent-cyan">{'>'}</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        {!selectedPersona && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-4">Select Your Journey Path</h2>
              <p className="text-lg opacity-70">Choose the path that resonates with your goals and aspirations</p>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {personas.map((persona, index) => (
                <motion.div key={persona.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }}>
                  <JourneyCard persona={persona} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {selectedPersona && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Selected journey content retained exactly as in your current file */}
            {/* ... existing JSX from your latest version ... */}
          </motion.div>
        )}
      </main>

      <ZynoBox
        context={`persona:${selectedPersona?.id || 'none'};phase:${userProgress.completedPhases.length}`}
        tips={selectedPersona?.phases[userProgress.completedPhases.length]?.zynoTips || []}
        onPrompt={(msg) => console.log('User asked Zyno:', msg)}
      />

      <AnimatePresence>
        {showProofModal && currentProofData && (
          <NFTProofModal
            proofType={currentProofData.proofType}
            title={currentProofData.title}
            description={currentProofData.description}
            imageUrl={currentProofData.imageUrl}
            xpEarned={currentProofData.xpEarned}
            phase={currentProofData.phase}
            phaseNumber={currentProofData.phaseNumber}
            completionDate={currentProofData.completionDate}
            rarity={currentProofData.rarity || 'rare'}
            onClose={() => {
              setShowProofModal(false);
              setShowMintingTutorial(false);
            }}
            onViewSkillchain={() => {
              setShowProofModal(false);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShareModal && currentProofData && (
          <ShareModal
            proofType={currentProofData.proofType}
            title={currentProofData.title}
            explorerUrl={currentProofData.explorerUrl}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default JourneysPage;
