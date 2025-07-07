import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJourneyStore } from '../store/journeyStore';
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

const JourneysPage: React.FC = () => {
  const { 
    selectedPersona, 
    setSelectedPersona, 
    userProgress, 
    completePhase, 
    updateProgress,
    openModal,
    updateStaking,
    updateVotingPower
  } = useJourneyStore();

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number | null>(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMintingTutorial, setShowMintingTutorial] = useState(false);
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [showDAOVoteModal, setShowDAOVoteModal] = useState(false);
  const [currentProofData, setCurrentProofData] = useState<any>(null);

  const handlePhaseChange = (index: number) => {
    if (selectedPersona) {
      setCurrentPhaseIndex(index);
      openModal({ 
        type: 'phase', 
        phase: selectedPersona.phases[index],
        phaseIndex: index,
        persona: selectedPersona
      });
    }
  };

  const handlePhaseComplete = async (phaseIndex: number) => {
    if (selectedPersona) {
      const phase = selectedPersona.phases[phaseIndex];
      updateProgress(
        phase.xpReward, 
        phase.nftReward ? [phase.nftReward] : [], 
        phase.mfaiReward || 0
      );
      completePhase(phaseIndex);
      setCurrentPhaseIndex(phaseIndex);
      
      // If there's an NFT reward, open the NFT proof modal
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
          rarity: phaseIndex === 4 ? 'legendary' : 
                 phaseIndex === 3 ? 'epic' : 
                 phaseIndex === 2 ? 'rare' : 'common'
        });
        setShowProofModal(true);
        
        // Show minting tutorial for first-time users
        if (userProgress.nfts.length === 0) {
          setShowMintingTutorial(true);
        }
      }
      
      // If staking is required, open the staking modal
      if (phase.stakingRequired && userProgress.mfaiTokens >= phase.stakingRequired) {
        setTimeout(() => {
          setShowStakingModal(true);
        }, 1000);
      }
      
      // If DAO vote is required, open the DAO vote modal
      if (phase.daoVoteRequired) {
        setTimeout(() => {
          setShowDAOVoteModal(true);
        }, 1500);
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
        rarity: phaseIndex === 4 ? 'legendary' : 
               phaseIndex === 3 ? 'epic' : 
               phaseIndex === 2 ? 'rare' : 'common'
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

  const handleStakingComplete = (amount: number) => {
    // Update staking and close modal
    updateStaking(amount);
    setShowStakingModal(false);
  };

  const handleDAOVoteComplete = (vote: 'approve' | 'reject') => {
    // Update voting power and close modal
    updateVotingPower(userProgress.votingPower + 10);
    updateProgress(30, [`DAO Vote: ${vote}`], 5);
    setShowDAOVoteModal(false);
  };

  const handleShareProof = () => {
    setShowShareModal(true);
  };

  // Show Staking Modal
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

  // Show DAO Vote Modal
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

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-space font-bold mb-6">
            <span className="gradient-text">
              Choose Your Path to Sovereignty
            </span>
          </h2>
          <p className="text-lg opacity-80 max-w-3xl mx-auto mb-6">
            Discover how the <span className="font-semibold text-accent-cyan">Cognitive Activation Protocol™</span> 
            transforms your skills into capital based on your unique profile
          </p>
          
          {/* Reset Progress Button */}
          <ResetProgressButton className="mx-auto mt-4" />
        </motion.div>

        {/* Persona Selection */}
        {!selectedPersona && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {personas.map((persona, index) => (
              <JourneyCard 
                key={persona.id} 
                persona={persona} 
              />
            ))}
          </div>
        )}

        {/* Selected Journey */}
        {selectedPersona && (
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 text-center"
            >
              <h3 className="text-2xl font-space font-semibold mb-3">
                <span className="text-accent-cyan">{selectedPersona.title}</span> Journey
              </h3>
              <p className="text-lg opacity-80 mb-6">
                <strong>Motivation:</strong> {selectedPersona.motivation}
              </p>
              <div className="flex justify-center mb-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPersona(null)}
                  className="btn-secondary"
                >
                  ← Back to all journeys
                </motion.button>
              </div>
            </motion.div>

            {/* Dashboard */}
            <JourneyDashboard />

            {/* Timeline */}
            <JourneyTimeline 
              phases={selectedPersona.phases}
              currentPhase={userProgress.completedPhases.length}
              onPhaseChange={handlePhaseChange}
            />

            {/* Current Phase Section - Only show if there are uncompleted phases */}
            {userProgress.completedPhases.length < selectedPersona.phases.length && (
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-2">
                  <PhaseSection 
                    phase={selectedPersona.phases[userProgress.completedPhases.length]}
                    isCompleted={false}
                    isCurrent={true}
                    isLocked={false}
                    onComplete={() => handlePhaseComplete(userProgress.completedPhases.length)}
                    onMintNFT={() => handleViewNFT(userProgress.completedPhases.length)}
                    onStake={handleStaking}
                    onVote={handleDAOVote}
                  />
                </div>
                <div className="space-y-6">
                  <XPTracker 
                    currentXP={userProgress.totalXP}
                    phaseXP={selectedPersona.phases[userProgress.completedPhases.length]?.xpReward || 0}
                    nextRewardAt={(Math.floor(userProgress.totalXP / 200) + 1) * 200}
                  />
                  
                  {/* Proof Certifications Board */}
                  <ProofCertificationsBoard />
                  
                  {/* Wallet Status */}
                  <WalletStatusDisplay />
                  
                  {showMintingTutorial && (
                    <div className="mt-6">
                      <NFTMintingTutorial />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Completed Phases */}
            {userProgress.completedPhases.length > 0 && (
              <div className="mb-12">
                <h3 className="text-xl font-space font-semibold mb-4">Completed Phases</h3>
                <div className="grid gap-6">
                  {userProgress.completedPhases.map((phaseIndex) => (
                    <PhaseSection
                      key={selectedPersona.phases[phaseIndex].id}
                      phase={selectedPersona.phases[phaseIndex]}
                      isCompleted={true}
                      isCurrent={false}
                      isLocked={false}
                      onComplete={() => {}}
                      onMintNFT={() => handleViewNFT(phaseIndex)}
                      onStake={handleStaking}
                      onVote={handleDAOVote}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Journey Completion */}
            {userProgress.completedPhases.length === selectedPersona.phases.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-12 text-center"
              >
                <div className="glass-effect rounded-xl p-8 max-w-2xl mx-auto border-2 border-accent-gold">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-space font-bold mb-4 gradient-text">
                    Journey Completed!
                  </h3>
                  <p className="text-lg opacity-80 mb-6">
                    Congratulations! You have completed the {selectedPersona.title} journey.
                    You are now an active member of the Money Factory AI ecosystem.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent-gold">{userProgress.totalXP}</div>
                      <div className="text-sm opacity-70">Total XP</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent-gold">{userProgress.nfts.length}</div>
                      <div className="text-sm opacity-70">NFTs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent-gold">{userProgress.mfaiTokens.toFixed(1)}</div>
                      <div className="text-sm opacity-70">$MFAI</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent-gold">{userProgress.votingPower}</div>
                      <div className="text-sm opacity-70">Voting Power</div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedPersona(null)}
                    className="btn-primary"
                  >
                    Explore other journeys
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
      
      {/* Zyno Assistant */}
      <ZynoBox 
        context={`persona:${selectedPersona?.id || 'none'};phase:${userProgress.completedPhases.length}`}
        tips={selectedPersona?.phases[userProgress.completedPhases.length]?.zynoTips || []}
        onPrompt={(msg) => console.log("User asked Zyno:", msg)}
      />

      {/* NFT Proof Modal */}
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
              // Here you would navigate to or open the Skillchain Card view
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Share Modal */}
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
    </section>
  );
};

export default JourneysPage;