import { useState, useEffect, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MessageDisplay from "../components/shared/MessageDisplay";
import { useJourneyStore } from "../store/journeyStore";
import JourneyCard from "./Journey/JourneyCard";
import ZynoBox from "./Journey/ZynoBox";
import { personas } from "../data/personas";
import ResetProgressButton from "./ResetProgressButton";
import JourneyWorkspace from "./Journey/JourneyWorkspace";

const JourneysPage: FC = () => {
  const selectedPersona = useJourneyStore((state) => state.selectedPersona);
  const setSelectedPersona = useJourneyStore((state) => state.setSelectedPersona);
  const userProgress = useJourneyStore((state) => state.userProgress);
  const loadUserProgress = useJourneyStore((state) => state.loadUserProgress);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supportHighlights = [
    {
      title: "Zyno, AI Co-Founder",
      description:
        "Zyno orchestrates personalized curricula, turns protocol complexity into guided actions, and pair-programs on Solana builds so each pathway compounds faster.",
      bullets: [
        "Design studio for strategy, token economics, and governance stress tests",
        "Real-time AI pair for code reviews, prompt engineering, and architectural simulations",
        "Cognitive activator that adapts missions based on Proof-of-Skill™ signals",
      ],
    },
    {
      title: "Protocol Agent Mesh",
      description:
        "Specialized MFAI agents coordinate alongside Zyno to keep momentum high from ideation to launch.",
      bullets: [
        "Skillchain Miners validate mastery on-chain and unlock higher stakes missions",
        "Guardian Agents monitor security, treasury health, and incident response drills",
        "Sovereign Builders Network links founders with talent, capital, and Synaptic Governance",
      ],
    },
  ];

  useEffect(() => {
    console.log("JourneysPage: useEffect triggered");
    const loadProgress = async () => {
      console.log("JourneysPage: loading progress...");
      try {
        setIsLoading(true);
        setError(null);
        await loadUserProgress();
        console.log("JourneysPage: progress loaded successfully");
      } catch (err) {
        console.error("Failed to load user progress:", err);
        setError("Failed to load your progress. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [loadUserProgress]);

  const handleRefreshProgress = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await loadUserProgress();
    } catch (err) {
      console.error("Failed to refresh progress:", err);
      setError("Failed to refresh progress. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const navigate = useNavigate();

  const handleBackToPersonas = () => {
    setSelectedPersona(null);
    setError(null);
    setSuccessMessage(null);
    navigate('/journeys');
  };

  if (isLoading && !selectedPersona) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
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
            <MessageDisplay
              type="success"
              message={successMessage}
              onClose={() => setSuccessMessage(null)}
            />
          )}

          {error && (
            <div className="mb-4 flex justify-between items-start">
              <MessageDisplay
                type="error"
                message={error}
                onClose={() => setError(null)}
              />
              <button
                onClick={handleRefreshProgress}
                disabled={isLoading}
                className="ml-4 px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-700/20 border border-red-500/30 text-red-300 disabled:opacity-50 text-sm self-start"
              >
                {isLoading ? 'Refreshing...' : '🔄 Refresh'}
              </button>
            </div>
          )}
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-space font-bold mb-6">
            <span className="gradient-text">
              Choose Your Path to Sovereignty
            </span>
          </h1>
          <p className="text-xl opacity-80 max-w-4xl mx-auto mb-8 leading-relaxed">
            Discover how the{" "}
            <span className="font-semibold text-accent-cyan">
              Cognitive Activation Protocol™
            </span>{" "}
            transforms your skills into capital based on your unique profile
          </p>
          <div className="flex justify-center">
            <ResetProgressButton />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-16"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {supportHighlights.map((highlight, index) => (
              <div
                key={highlight.title}
                className="glass-effect rounded-2xl p-6 text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-accent-cyan">
                    {highlight.title}
                  </h3>
                  <span className="text-sm text-white/60">
                    Agent {index + 1}
                  </span>
                </div>
                <p className="text-base text-white/80 mb-4 leading-relaxed">
                  {highlight.description}
                </p>
                <ul className="space-y-2 text-sm text-white/70">
                  {highlight.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <span className="text-accent-cyan">{">"}</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        {!selectedPersona && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Select Your Journey Path
              </h2>
              <p className="text-lg opacity-70">
                Choose the path that resonates with your goals and aspirations
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {personas.map((persona, index) => (
                <motion.div
                  key={persona.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <JourneyCard
                    persona={persona}
                    onSelected={() => navigate(`/journeys/${persona.id}`)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {selectedPersona && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full"
          >
            <div className="mb-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackToPersonas}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                <span>← Back to all journeys</span>
              </motion.button>
            </div>

            <JourneyWorkspace />
          </motion.div>
        )}

        {
          userProgress.completedPhases.length ===
          selectedPersona?.phases.length && selectedPersona && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="glass-effect rounded-2xl p-8 max-w-4xl mx-auto border-2 border-accent-gold relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/10 to-accent-purple/10" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/20 rounded-full -translate-y-16 translate-x-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent-cyan/20 rounded-full translate-y-12 -translate-x-12" />
                <div className="relative">
                  <div className="text-8xl mb-6">🎉</div>
                  <h3 className="text-4xl font-space font-bold mb-4 gradient-text">
                    Journey Completed!
                  </h3>
                  <p className="text-xl opacity-80 mb-8 max-w-2xl mx-auto">
                    Congratulations! You have completed the{" "}
                    <span className="font-semibold text-accent-cyan">
                      {selectedPersona.title}
                    </span>{" "}
                    journey. You are now an active member of the Money Factory
                    AI ecosystem.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="glass-effect rounded-xl p-4">
                      <div className="text-3xl font-bold text-accent-gold mb-2">
                        {userProgress.totalXP}
                      </div>
                      <div className="text-sm opacity-70">Total XP</div>
                    </div>
                    <div className="glass-effect rounded-xl p-4">
                      <div className="text-3xl font-bold text-accent-purple mb-2">
                        {userProgress.nfts.length}
                      </div>
                      <div className="text-sm opacity-70">NFTs Earned</div>
                    </div>
                    <div className="glass-effect rounded-xl p-4">
                      <div className="text-3xl font-bold text-accent-cyan mb-2">
                        {userProgress.mfaiTokens.toFixed(1)}
                      </div>
                      <div className="text-sm opacity-70">$MFAI Tokens</div>
                    </div>
                    <div className="glass-effect rounded-xl p-4">
                      <div className="text-3xl font-bold text-accent-gold mb-2">
                        {userProgress.votingPower}
                      </div>
                      <div className="text-sm opacity-70">Voting Power</div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleBackToPersonas}
                      className="btn-primary"
                    >
                      Explore other journeys
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        }
      </main>

      <ZynoBox
        context={`persona:${selectedPersona?.id || "none"};phase:${userProgress.completedPhases.length}`}
        tips={
          selectedPersona?.phases[userProgress.completedPhases.length]
            ?.zynoTips || []
        }
        onPrompt={(msg) => console.log("User asked Zyno:", msg)}
      />
    </div>
  );
};

export default JourneysPage;
