import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { JourneyPhase } from '../../types/journey';
import { CheckCircle, Trophy, Coins, Zap, Play, Lock, ArrowRight, Rocket, Vote, Award, Palette, MessageSquare, Target, BarChart3, DollarSign, Loader2 } from 'lucide-react';
import { getProofType } from '../../data/proofsData';
import { useJourneyStore } from '../../store/journeyStore';
import { api } from '../../utils/api';

interface PhaseSectionProps {
  phase: JourneyPhase;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  onComplete: () => void;
  onMintNFT?: () => void;
  onStake?: () => void;
  onVote?: () => void;
}

const PhaseSection: React.FC<PhaseSectionProps> = ({
  phase,
  isCompleted,
  isCurrent,
  isLocked,
  onComplete,
  onMintNFT,
  onStake,
  onVote
}) => {
  const { selectedPersona, updateProgress, loadUserProgress } = useJourneyStore();
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Highlight keywords in text
  const highlightText = (text: string) => {
    return text.replace(
      /("([^"]+)")|(\*([^*]+)\*)/g,
      (match, _p1, p2, _p3, p4) => {
        if (p2) return `<span class="text-accent-cyan">"${p2}"</span>`;
        if (p4) return `<span class="font-semibold text-accent-gold">${p4}</span>`;
        return match;
      }
    );
  };

  const getButtonState = () => {
    if (isLocked) return { text: 'Locked', disabled: true, icon: <Lock size={16} /> };
    if (isCompleted) return { text: 'Completed', disabled: true, icon: <CheckCircle size={16} /> };
    if (isCurrent) return { text: 'Start Phase', disabled: false, icon: <Play size={16} /> };
    return { text: 'Available', disabled: false, icon: <ArrowRight size={16} /> };
  };

  const buttonState = getButtonState();

  // Handle phase completion with backend sync
  const handlePhaseCompletion = async () => {
    if (isCompleting || isCompleted || isLocked) return;
    
    try {
      setIsCompleting(true);
      setError(null);
      
      // Calculate phase number (assuming phases are indexed from 0)
      const phaseNumber = selectedPersona?.phases.findIndex(p => p.id === phase.id) ?? 0;
      
      // Complete phase in backend
      await api.completePhase({
        phase_number: phaseNumber + 1, // Backend expects 1-based indexing
        score: phase.xpReward,
        nft_address: phase.nftReward ? `phase-${phaseNumber + 1}-nft` : undefined
      });
      
      // Update local progress
      await updateProgress(phase.xpReward, [], phase.mfaiReward ?? 0);
      
      // Reload user progress to get latest data
      await loadUserProgress();
      
      // Call the original onComplete callback
      onComplete();
      
    } catch (error) {
      console.error('Failed to complete phase:', error);
      setError('Failed to complete phase. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const getPhaseIcon = () => {
    if (phase.isIncubation) return <Rocket size={20} />;
    if (phase.isLaunchpad) return <Trophy size={20} />;
    if (phase.daoVoteRequired) return <Vote size={20} />;
    if (phase.stakingRequired) return <Coins size={20} />;
    if (phase.id.includes('creator')) return <Palette size={20} />;
    if (phase.id.includes('communicator')) return <MessageSquare size={20} />;
    if (phase.id.includes('manager')) return <Target size={20} />;
    if (phase.id.includes('defi')) return <BarChart3 size={20} />;
    if (phase.id.includes('investor')) return <DollarSign size={20} />;
    if (phase.id.includes('nft')) return <Palette size={20} />;
    return <Zap size={20} />;
  };

  // Get proof type for this phase
  const getProofTypeForPhase = () => {
    if (!selectedPersona) return 'Skill';
    return getProofType(selectedPersona.id, phase.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`border-2 rounded-xl p-6 transition-all duration-300 ${
        isCompleted 
          ? 'border-green-500 bg-green-500/10' 
          : isCurrent 
            ? 'border-primary-500 bg-primary-500/10' 
            : isLocked 
              ? 'border-gray-600 bg-gray-600/10' 
              : 'border-gray-500 bg-gray-500/10'
      }`}
    >
      {/* Phase Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            isCompleted ? 'bg-green-500' :
            isCurrent ? 'bg-primary-500' :
            'bg-gray-600'
          }`}>
            {getPhaseIcon()}
          </div>
          <div>
            <h3 className="font-space font-semibold text-lg">{phase.title}</h3>
            <p className="text-sm opacity-80">{phase.duration}</p>
          </div>
        </div>
        
        {/* Special Phase Badges */}
        <div className="flex space-x-2">
          {phase.isIncubation && (
            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
              Incubation
            </span>
          )}
          {phase.isLaunchpad && (
            <span className="px-2 py-1 bg-gold-500/20 text-gold-400 text-xs rounded-full">
              Launchpad
            </span>
          )}
          {phase.daoVoteRequired && (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
              DAO Vote
            </span>
          )}
        </div>
      </div>

      {/* Phase Description */}
      <p className="text-sm opacity-90 mb-4">{phase.description}</p>
      
      {/* Mission */}
      <div className="bg-white/5 rounded-lg p-3 mb-4">
        <h4 className="font-semibold text-sm mb-2">Mission</h4>
        <p className="text-sm" dangerouslySetInnerHTML={{ __html: highlightText(phase.mission) }}></p>
      </div>

      {/* Modules (if available) */}
      {phase.modules && phase.modules.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-sm mb-3">Modules & Deliverables</h4>
          <div className="space-y-2">
            {phase.modules.map((module, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-sm">{module.title}</h5>
                  <span className="text-xs bg-accent-gold/20 text-accent-gold px-2 py-1 rounded-full">
                    {module.reward}
                  </span>
                </div>
                <p className="text-xs opacity-80 mb-2">{module.description}</p>
                <div className="text-xs">
                  <span className="font-semibold">Deliverable:</span> {module.deliverable}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tools & Resources */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2">Tools & Resources</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {phase.tools.map((tool, index) => (
            <div key={index} className="text-xs bg-white/5 rounded px-2 py-1">
              {tool}
            </div>
          ))}
        </div>
      </div>

      {/* Expected Outcomes */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2">Expected Outcomes</h4>
        <div className="grid gap-1">
          {phase.outcomes.map((outcome, idx) => (
            <div key={idx} className="flex items-center text-xs">
              <CheckCircle size={12} className="mr-2 text-green-400 flex-shrink-0" />
              <span>{outcome}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="text-center">
          <Trophy className="text-accent-gold mx-auto mb-1" size={16} />
          <div className="text-xs font-semibold">{phase.xpReward} XP</div>
        </div>
        
        {phase.mfaiReward && (
          <div className="text-center">
            <Coins className="text-accent-gold mx-auto mb-1" size={16} />
            <div className="text-xs font-semibold">{phase.mfaiReward} $MFAI</div>
          </div>
        )}
        
        {phase.nftReward && (
          <div className="text-center">
            <Award className="text-accent-purple mx-auto mb-1" size={16} />
            <div className="text-xs font-semibold">
              Proof-of-{getProofTypeForPhase()}™
            </div>
          </div>
        )}
        
        {phase.stakingRequired && (
          <div className="text-center">
            <Zap className="text-accent-cyan mx-auto mb-1" size={16} />
            <div className="text-xs font-semibold">Staking</div>
          </div>
        )}
      </div>

      {/* Requirements */}
      {phase.requirements && phase.requirements.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-sm mb-2">Prerequisites</h4>
          <ul className="text-xs space-y-1">
            {phase.requirements.map((req, index) => (
              <li key={index} className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-primary-500 rounded-full" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Zyno Tip */}
      <div className="bg-gradient-primary/20 border border-primary-500/30 rounded-lg p-3 mb-4">
        <div className="flex items-start space-x-2">
          <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">Z</span>
          </div>
          <div>
            <h4 className="font-semibold text-xs mb-1">Zyno says:</h4>
            <p className="text-xs italic opacity-90" dangerouslySetInnerHTML={{ __html: highlightText(phase.zynoTip) }}></p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="text-red-400">⚠️</div>
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <motion.button
        whileHover={{ scale: (buttonState.disabled || isCompleting) ? 1 : 1.02 }}
        whileTap={{ scale: (buttonState.disabled || isCompleting) ? 1 : 0.98 }}
        onClick={handlePhaseCompletion}
        disabled={buttonState.disabled || isCompleting}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
          (buttonState.disabled || isCompleting)
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-primary text-white hover:shadow-lg'
        }`}
      >
        {isCompleting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Completing...</span>
          </>
        ) : (
          <>
            {buttonState.icon}
            <span>{buttonState.text}</span>
          </>
        )}
      </motion.button>

      {/* Additional Action Buttons for Specialized Journeys */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
        {isCompleted && phase.nftReward && onMintNFT && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onMintNFT}
            className="py-2 px-4 rounded-lg border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white transition-all flex items-center justify-center space-x-2"
          >
            <Award size={16} />
            <span>View Proof-of-{getProofTypeForPhase()}™</span>
          </motion.button>
        )}
        
        {/* Generic Staking Button */}
        {phase.stakingRequired && onStake && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStake}
            disabled={isLocked}
            className={`py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 ${
              isLocked 
                ? 'border border-gray-600 text-gray-500 cursor-not-allowed' 
                : 'border border-accent-cyan text-accent-cyan hover:bg-accent-cyan hover:text-black'
            }`}
          >
            <Coins size={16} />
            <span>Stake $MFAI</span>
          </motion.button>
        )}
        
        {/* Generic DAO Vote Button */}
        {phase.daoVoteRequired && onVote && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onVote}
            disabled={isLocked}
            className={`py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 ${
              isLocked 
                ? 'border border-gray-600 text-gray-500 cursor-not-allowed' 
                : 'border border-accent-purple text-accent-purple hover:bg-accent-purple hover:text-white'
            }`}
          >
            <Vote size={16} />
            <span>DAO Vote</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default PhaseSection;