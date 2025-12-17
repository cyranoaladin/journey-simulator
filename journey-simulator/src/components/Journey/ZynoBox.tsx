import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Send, Sparkles, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useJourneyStore } from '../../store/journeyStore';

const EMPTY_TIPS: string[] = [];

interface ZynoBoxProps {
  context?: string;
  tips?: string[];
  onPrompt?: (msg: string) => void;
}

const ZynoBox: React.FC<ZynoBoxProps> = ({
  context = '',
  tips = EMPTY_TIPS,
  onPrompt
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTip, setCurrentTip] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const { selectedPersona, userProgress } = useJourneyStore();

  // Enhanced tips based on different personas
  const cognitiveHubTips = useMemo(() => [
    'Concepts are capital. Every mental model you sharpen turns future builds into compounding assets.',
    'Solana throughput is a design choice. Prototype until latency feels optional.',
    'Token design is economic storytelling—make incentives the plot that everyone wants to follow.',
    'Security is a ritual. Harden your wallet stack before the stakes climb.',
    'DAO participation is practice for ownership. The earlier you vote, the faster you influence.',
    'Publish your activation brief—clarity attracts collaborators and opportunities alike.'
  ], []);

  const capitalFoundryTips = useMemo(() => [
    'Performance plus risk discipline is the edge. Optimize Anchor code as hard as you iterate token design.',
    'Liquidity health tells the truth about your protocol. Stress-test it before users do.',
    'Oracle integrity is non-negotiable—guard it like the protocol’s nervous system.',
    'Circuit breakers and treasury dashboards win community trust when markets get loud.',
    'Sovereign Builders Network meetings are momentum multipliers—arrive with data and a precise ask.',
    'Neuro-Dividends reward shipping resilient primitives. Make that timeline concrete.'
  ], []);

  const systemArchitectTips = useMemo(() => [
    'Think in primitives—every reusable component compounds ecosystem velocity.',
    'Device incentives must feel fair on day one; otherwise your DePIN network never boots.',
    'Bind AI outputs to provenance so enterprises can trust what you deploy.',
    'Failure drills are your certification. Practice incidents before mainnet pressure arrives.',
    'Guardian agents are teammates—activate them early in your rollout plan.',
    'Documentation is infrastructure. Publish builder kits as soon as your topology stabilizes.'
  ], []);

  const experienceStudioTips = useMemo(() => [
    'Narrative clarity wins launches. Know exactly which emotion your experience should unlock.',
    'Design NFT lifecycles so value grows post-mint; static metadata is wasted potential.',
    'Token rewards need anti-bot habits baked in from sprint one.',
    'Usability labs are cheaper than churn. Watch real users move through your flows.',
    'Launch day is chapter one—keep rituals alive so community energy compounds.',
    'Sovereign Builders intros connect creatives with execution muscle. Ask Zyno for the match.'
  ], []);

  const impactEngineTips = useMemo(() => [
    'Purpose statements anchor governance. Revisit them every time the DAO scales.',
    'Contribution-based rewards keep momentum ethical and transparent.',
    'Impact metrics are narrative fuel—share them in dashboards people actually read.',
    'Soulbound credentials convert invisible labor into visible influence.',
    'Synaptic Governance favors clarity. Enter votes with concise trade-off analysis.',
    'Neuro-Dividends fund communities that stay accountable. Document your sprint outcomes.'
  ], []);

  const resilienceMasterTips = useMemo(() => [
    'Every exploit report you study buys you future response time.',
    'Fuzzing is non-negotiable—treat it like integration tests.',
    'Guardian agents love playbooks. Hand them crisp emergency procedures.',
    'On-chain forensics demand meticulous logs. Instrument before you need them.',
    'Communication discipline during incidents preserves credibility.',
    'Reward the fixes, not just the finds. Neuro-Dividends close the security loop.'
  ], []);

  // Default tips if none provided
  const defaultTips = useMemo(() => [
    'Every pathway converts capability into Proof-of-Skill™. Pick the mission that mirrors your ambition.',
    'Zyno, your AI Co-Founder, adapts phases dynamically—ask for a custom sprint if you need one.',
    'Proof assets are working credentials. Share them with collaborators to unlock opportunities faster.',
    'Skillchain Mining rewards consistent progress. Small completions compound quickly.',
    'The protocol agent mesh is active—ping us for Skillchain validation, guardian drills, or launch introductions.'
  ], []);

  // Use persona-specific tips if available (memoized to avoid effect loops)
  const activeTips = useMemo(() => {
    if (selectedPersona?.id === 'cognitive-activation-hub') return cognitiveHubTips;
    if (selectedPersona?.id === 'capital-foundry') return capitalFoundryTips;
    if (selectedPersona?.id === 'system-architect') return systemArchitectTips;
    if (selectedPersona?.id === 'experience-studio') return experienceStudioTips;
    if (selectedPersona?.id === 'impact-engine') return impactEngineTips;
    if (selectedPersona?.id === 'resilience-master') return resilienceMasterTips;
    if (tips.length > 0) return tips;
    return defaultTips;
  }, [
    selectedPersona?.id,
    tips,
    cognitiveHubTips,
    capitalFoundryTips,
    systemArchitectTips,
    experienceStudioTips,
    impactEngineTips,
    resilienceMasterTips,
    defaultTips
  ]);

  // Stable key to detect effective tip-set changes even if `tips` array identity changes.
  const tipsKey = useMemo(() => tips.join('||'), [tips]);

  // Set a random tip when component mounts or context changes
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * activeTips.length);
    setCurrentTip(activeTips[randomIndex]);
    setFeedbackGiven(false);
  }, [context, selectedPersona?.id, tipsKey]);

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
