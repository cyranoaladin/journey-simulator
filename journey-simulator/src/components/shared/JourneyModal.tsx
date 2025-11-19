import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle,
  Clock,
  Trophy,
  Zap,
  ExternalLink,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJourneyStore } from '../../store/journeyStore';
import CertificationModal from '../CertificationModal';
import StakingModal from '../StakingModal';
import DAOVoteModal from '../DAOVoteModal';
import AgentFeedbackModal from '../Zyno/AgentFeedbackModal';
import SkillchainCard from '../SkillchainCard';
import { personas } from '../../data/personas';
import type { AccessPassHolder } from '../../types/journey';

const JourneyModal = () => {
  const navigate = useNavigate();
  const { isModalOpen, modalContent, closeModal } = useJourneyStore();

  if (!isModalOpen || !modalContent) return null;

  const handleFollowHolderJourney = (holder: AccessPassHolder) => {
    if (!holder) return;

    const recommendedPersona = holder.recommendedPersonaId
      ? personas.find(persona => persona.id === holder.recommendedPersonaId)
      : undefined;

    closeModal();
    navigate('/journeys', {
      state: {
        source: 'access-pass-holder',
        holderId: holder.id,
        recommendedPersonaId: holder.recommendedPersonaId,
        recommendedPersonaTitle: recommendedPersona?.title,
      },
    });
  };

  const handleLearnMoreSkillchain = () => {
    closeModal();
    navigate('/resources', { state: { focus: 'skillchain-card' } });
  };

  const handleStartPhase = () => {
    if (modalContent.type === 'phase') {
      closeModal();
    }
  };

  const renderPhaseModal = () => {
    const { phase, persona, phaseIndex } = modalContent;

    return (
      <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="glass-effect rounded-2xl p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-space font-bold mb-2">
                Phase {phaseIndex + 1}: {phase.title}
              </h2>
              <p className="text-sm opacity-80">Journey: {persona.title}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={closeModal}
              className="p-2 rounded-lg glass-effect"
            >
              <X size={20} />
            </motion.button>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3">Description</h3>
            <p className="opacity-90 leading-relaxed">{phase.description}</p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center">
              <Trophy className="mr-2" size={20} />
              Mission
            </h3>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="font-medium">{phase.mission}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <Clock className="mr-2" size={16} />
                Duration & Rewards
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Estimated duration:</span>
                  <span className="font-mono">{phase.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span>XP Reward:</span>
                  <span className="font-mono text-accent-cyan">{phase.xpReward} XP</span>
                </div>
                {phase.nftReward && (
                  <div className="flex justify-between">
                    <span>NFT Reward:</span>
                    <span className="font-mono text-accent-gold">🏆 {phase.nftReward}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <Zap className="mr-2" size={16} />
                Tools & Resources
              </h4>
              <div className="space-y-1">
                {phase.tools.map((tool: string, idx: number) => (
                  <div key={idx} className="text-sm bg-white/5 rounded px-2 py-1">
                    {tool}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center">
              <CheckCircle className="mr-2" size={20} />
              Expected Outcomes
            </h3>
            <div className="grid gap-2">
              {phase.outcomes && Array.isArray(phase.outcomes) && phase.outcomes.length > 0 ? (
                phase.outcomes.map((outcome: string, idx: number) => (
                  <div key={idx} className="flex items-center text-sm">
                    <CheckCircle size={16} className="mr-2 text-green-400" />
                    {outcome}
                  </div>
                ))
              ) : (
                <div className="text-sm italic text-gray-400">No expected outcomes listed.</div>
              )}
            </div>
          </div>

          <div className="mb-8">
            <div className="bg-gradient-primary/20 border border-primary-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">Z</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Zyno says:</h4>
                  <p className="text-sm italic opacity-90">"{phase.zynoTip}"</p>
                </div>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartPhase}
            className="w-full btn-primary text-lg py-4 flex items-center justify-center space-x-2"
          >
            <Zap size={20} />
            <span>Begin this phase</span>
          </motion.button>
        </div>
      </div>
    );
  };

  const renderHolderModal = () => {
    const { holder } = modalContent as { holder: AccessPassHolder };
    return (
      <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="glass-effect rounded-2xl p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 text-5xl flex items-center justify-center bg-gradient-primary rounded-full shadow-lg">
                {holder.avatar}
              </div>
              <div>
                <h2 className="text-3xl font-space font-bold">{holder.name}</h2>
                <p className="text-xl opacity-80">{holder.title}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-3xl">
                    {holder.passLevel === 'Gold'
                      ? '🥇'
                      : holder.passLevel === 'Platinum'
                      ? '🥈'
                      : '💎'}
                  </span>
                  <span className="text-lg font-semibold">
                    {holder.passLevel} Skillchain Card™
                  </span>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={closeModal}
              className="p-2 rounded-lg glass-effect"
            >
              <X size={20} />
            </motion.button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Testimonial</h3>
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <p className="italic opacity-90 leading-relaxed text-lg">
                    "{holder.testimonial}"
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Journey Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  {holder.metrics.map(
                    (
                      metric: { label: string; value: string },
                      idx: number
                    ) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-4">
                        <div className="text-sm opacity-80">{metric.label}</div>
                        <div className="text-lg font-mono font-semibold">
                          {metric.value}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Skillchain Card™</h3>
                <div className="flex justify-center">
                  <div className="w-full max-w-xs">
                    <SkillchainCard />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Key Achievements</h3>
                <div className="space-y-3">
                  <div className="bg-white/5 rounded-lg p-4 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Trophy size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">
                        {holder.certifications} Certifications
                      </div>
                      <div className="text-sm opacity-70">
                        Proof-of-Skill™ NFTs earned
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingUp size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">{holder.roi}</div>
                      <div className="text-sm opacity-70">Return on investment</div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">{holder.projects}</div>
                      <div className="text-sm opacity-70">Projects completed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleFollowHolderJourney(holder)}
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
            >
              <ArrowRight size={20} />
              <span>Follow a similar journey</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLearnMoreSkillchain}
              className="flex-1 btn-secondary flex items-center justify-center space-x-2"
            >
              <ExternalLink size={20} />
              <span>Learn more about Skillchain Card™</span>
            </motion.button>
          </div>
        </div>
      </div>
    );
  };

  const renderModalContent = () => {
    switch (modalContent.type) {
      case 'phase':
        return renderPhaseModal();
      case 'holder':
        return renderHolderModal();
      case 'agent-feedback':
        if (!modalContent.step) {
          return null;
        }
        return (
          <AgentFeedbackModal
            step={modalContent.step}
            userId={modalContent.userId || 'demo_user'}
            missionId={modalContent.missionId}
          />
        );
      case 'certification':
        return (
          <CertificationModal
            certification={modalContent.certification}
            onClose={closeModal}
          />
        );
      case 'staking':
        return (
          <StakingModal
            availableAmount={modalContent.availableAmount || 0}
            currentStaked={modalContent.currentStaked || 0}
            onClose={closeModal}
          />
        );
      case 'daoVote':
        return (
          <DAOVoteModal
            phase={modalContent.phase}
            votingPower={modalContent.votingPower || 0}
            onClose={closeModal}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={closeModal}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="relative z-10"
        >
          {renderModalContent()}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default JourneyModal;
