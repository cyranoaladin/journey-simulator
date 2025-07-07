import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Sparkles, ThumbsUp, ThumbsDown, X, Send } from 'lucide-react';
import { useJourneyStore } from '../../store/journeyStore';

interface ZynoBoxProps {
  context?: string;
  tips?: string[];
  onPrompt?: (msg: string) => void;
}

const ZynoBox: React.FC<ZynoBoxProps> = ({ 
  context = '',
  tips = [],
  onPrompt 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTip, setCurrentTip] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const { selectedPersona, userProgress } = useJourneyStore();

  // Enhanced tips based on different personas
  const curiousStudentTips = [
    "Knowledge is your first capital. Every concept you learn becomes your currency in the Proof Economy.",
    "You're not just learning—you're mining skills into capital. Each mastered concept becomes a tokenized asset.",
    "Your wallet isn't just a tool—it's your sovereign identity in the digital economy.",
    "This NFT is your on-chain diploma. It's cryptographic proof of your transformation.",
    "Your vote is your voice in the protocol. You're not just voting—you're co-creating the future.",
    "Your skills now generate dividends. Congratulations! You've evolved from consumer to owner."
  ];

  const entrepreneurTips = [
    "Your clients are not just consumers anymore. They become co-builders of your vision.",
    "The most successful Web3 businesses solve real problems with token incentives.",
    "Your MVP isn't just a product—it's an ecosystem where users become co-creators.",
    "A validated vision backed by community support is already valuable capital.",
    "Your stakeholders aren't just customers—they're co-owners of your success.",
    "DAO funding isn't just investment—it's adoption by a community that believes in your vision."
  ];

  const developerTips = [
    "Your code isn't just functionality—it's your identity and reputation in the ecosystem.",
    "The blockchain is immutable—write code like your reputation depends on it.",
    "Great developers write code that works—architects create systems that evolve.",
    "An audit isn't judgment—it's validation that transforms your code into a trusted asset.",
    "Demo Day isn't competition—it's celebration of how you're evolving the ecosystem.",
    "You no longer build on the protocol—you build the protocol itself."
  ];

  const creatorTips = [
    "Your creativity is more than content—it's cognitive capital. Every visual becomes a vector of value.",
    "In the protocol, every visual is a vector of value. Your generative art becomes infrastructure for creativity.",
    "Your Proof-of-Creation™ isn't just recognition—it's your creative license in the cognitive economy.",
    "Distribution is creation. Every airdrop builds the community that values your cognitive capital.",
    "Your creativity now generates autonomous value. Welcome to the cognitive economy where art creates capital.",
    "AI doesn't replace creativity—it amplifies it. Your prompts become your signature style."
  ];

  const communicatorTips = [
    "Coordination is not management. It's strategy made relational.",
    "Your missions become the paths others will follow. Design with intention.",
    "Leadership in Web3 is earned through contribution, not appointment.",
    "Your voice now shapes the collective intelligence of the ecosystem.",
    "You now orchestrate the protocol's evolution. Your coordination becomes the ecosystem's nervous system."
  ];

  const managerTips = [
    "You don't just manage tasks. You activate systems that deliver real outcomes.",
    "Your mission design becomes the infrastructure others use to create value.",
    "Proof-of-Orchestration™ validates your ability to turn chaos into coordinated value creation.",
    "Meta-missions coordinate the coordination. You're now orchestrating the orchestrators.",
    "In a decentralized world, operations isn't back office. It's the engine of collective sovereignty."
  ];

  const defiTips = [
    "You don't just hold crypto. You validate, stake, and compound your knowledge into on-chain returns.",
    "Liquidity providing isn't just parking tokens—you're becoming the infrastructure that powers DeFi.",
    "Your Proof-of-Yield™ demonstrates mastery over the complex dance of risk and reward in DeFi.",
    "Your vote shapes the future of DeFi. You're not just using protocols—you're governing them.",
    "Compounding isn't just about returns—it's about building sustainable wealth through disciplined DeFi mastery.",
    "Risk management isn't limiting returns—it's ensuring your DeFi journey continues through market cycles."
  ];

  const nftCreatorTips = [
    "Your designs become immutable proofs of your creativity — tokenised, licensed, rewarded, and unstoppable.",
    "A collection isn't just multiple pieces—it's a cohesive narrative that builds value through scarcity and community.",
    "Validation transforms your art from personal expression to community-recognized value.",
    "Your collectors aren't just buyers—they're stakeholders in your creative journey.",
    "Royalties aren't just passive income—they're proof that your creativity generates perpetual value.",
    "In the NFT economy, your reputation is your most valuable asset. Each creation builds your on-chain portfolio."
  ];

  const investorTips = [
    "Capital works harder when it works together. Your stake is your voice — your conviction creates collective value.",
    "Your evaluation isn't just an opinion—it's a signal that shapes collective intelligence about value.",
    "Your Proof-of-Invest™ isn't just a badge—it's validation of your capital allocation wisdom.",
    "Your capital allocation decisions now shape the protocol's future. You're not just investing—you're architecting.",
    "Your conviction now generates dividends. Welcome to the cognitive economy where aligned capital creates compounding value.",
    "Due diligence isn't just risk management—it's the foundation of confident capital deployment."
  ];

  // Default tips if none provided
  const defaultTips = [
    "The Cognitive Activation Protocol™ transforms your skills into tokenized assets. Each step proves your evolution.",
    "Your journey is unique. Based on your profile, I recommend starting with the Learn phase to build solid foundations.",
    "Proof-of-Skill™ NFTs aren't decorative - they're cryptographic proof of your transformation and open opportunities.",
    "The Proof Economy rewards created value, not time spent. Your skills become your capital.",
    "Each completed phase brings you closer to digital sovereignty. Keep going, you're on the right track!"
  ];

  // Use persona-specific tips if available
  const getActiveTips = () => {
    if (selectedPersona?.id === 'curious-student') return curiousStudentTips;
    if (selectedPersona?.id === 'web2-entrepreneur') return entrepreneurTips;
    if (selectedPersona?.id === 'web3-developer') return developerTips;
    if (selectedPersona?.id === 'content-creator') return creatorTips;
    if (selectedPersona?.id === 'community-communicator') return communicatorTips;
    if (selectedPersona?.id === 'project-manager') return managerTips;
    if (selectedPersona?.id === 'defi-explorer') return defiTips;
    if (selectedPersona?.id === 'nft-creator') return nftCreatorTips;
    if (selectedPersona?.id === 'investor') return investorTips;
    if (tips.length > 0) return tips;
    return defaultTips;
  };

  const activeTips = getActiveTips();

  // Set a random tip when component mounts or context changes
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * activeTips.length);
    setCurrentTip(activeTips[randomIndex]);
    setFeedbackGiven(false);
  }, [context, activeTips]);

  // Get a contextual greeting based on user progress
  const getGreeting = () => {
    if (!selectedPersona) return "Hi! I'm Zyno, your AI Co-Founder™. Ready to start your cognitive activation journey?";
    
    if (userProgress.completedPhases.length === 0) {
      return `Welcome to the ${selectedPersona.title} journey! I'm Zyno, your AI Co-Founder™. Let's transform your skills into capital.`;
    }
    
    if (userProgress.completedPhases.length === selectedPersona.phases.length) {
      return "Congratulations on completing your journey! You've achieved digital sovereignty. What's your next adventure?";
    }
    
    const currentPhaseIndex = userProgress.completedPhases.length;
    const currentPhase = selectedPersona.phases[currentPhaseIndex];
    
    return `You're currently in the ${currentPhase.title} phase. I'm here to guide you through each step. How can I help you progress?`;
  };

  const handleFeedback = (positive: boolean) => {
    // In a real implementation, this would send feedback to a backend
    console.log(`User gave ${positive ? 'positive' : 'negative'} feedback for tip: ${currentTip}`);
    setFeedbackGiven(true);
  };

  const getNewTip = () => {
    const availableTips = activeTips.filter(tip => tip !== currentTip);
    const randomIndex = Math.floor(Math.random() * availableTips.length);
    setCurrentTip(availableTips[randomIndex]);
    setFeedbackGiven(false);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 300 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-primary rounded-full flex items-center justify-center shadow-lg"
      >
        <MessageCircle size={24} className="text-white" />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-primary rounded-full opacity-30"
        />
      </motion.button>

      {/* Zyno Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-6 z-50 w-80 glass-effect rounded-2xl overflow-hidden border border-white/20"
          >
            {/* Header */}
            <div className="bg-gradient-primary p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="font-space font-semibold text-white">Zyno</h3>
                  <p className="text-xs text-white/80">AI Co-Founder™</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-4 max-h-80 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center">
                    <Sparkles size={12} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold">Zyno</span>
                </div>
                <p className="text-sm bg-white/5 p-3 rounded-lg rounded-tl-none">
                  {getGreeting()}
                </p>
              </motion.div>

              {currentTip && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Sparkles size={12} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold">Zyno</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg rounded-tl-none">
                    <p className="text-sm">{currentTip}</p>
                    
                    {/* Feedback buttons */}
                    {!feedbackGiven ? (
                      <div className="flex justify-between mt-3">
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleFeedback(true)}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                          >
                            <ThumbsUp size={14} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleFeedback(false)}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                          >
                            <ThumbsDown size={14} />
                          </motion.button>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={getNewTip}
                          className="text-xs text-primary-400 hover:text-primary-300"
                        >
                          New tip
                        </motion.button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center mt-3">
                        <div className="text-xs text-primary-400">
                          Thanks for your feedback!
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={getNewTip}
                          className="text-xs text-primary-400 hover:text-primary-300"
                        >
                          New tip
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Journey Progress Insight */}
              {selectedPersona && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Sparkles size={12} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold">Zyno</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg rounded-tl-none">
                    <p className="text-sm">
                      You've completed {userProgress.completedPhases.length} out of {selectedPersona.phases.length} phases. 
                      {userProgress.completedPhases.length === 0 && " Ready to start your first phase?"}
                      {userProgress.completedPhases.length > 0 && userProgress.completedPhases.length < selectedPersona.phases.length && " Keep up the great progress!"}
                      {userProgress.completedPhases.length === selectedPersona.phases.length && " Amazing! You've achieved digital sovereignty!"}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Input */}
              {onPrompt && (
                <div className="mt-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Ask Zyno a question..."
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/60 focus:outline-none focus:border-primary-400"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.currentTarget as HTMLInputElement;
                          if (input.value.trim()) {
                            onPrompt(input.value);
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const input = document.querySelector('input') as HTMLInputElement;
                        if (input?.value.trim()) {
                          onPrompt(input.value);
                          input.value = '';
                        }
                      }}
                      className="bg-gradient-primary p-2 rounded-lg"
                    >
                      <Send size={16} className="text-white" />
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ZynoBox;