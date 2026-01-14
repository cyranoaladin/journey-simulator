/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { motion } from "framer-motion";
import { useEffect, useMemo, useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import MessageDisplay from "../components/shared/MessageDisplay";
import { useJourneyStore } from "../store/journeyStore";
import JourneyCard from "./Journey/JourneyCard";
import ZynoBox from "./Journey/ZynoBox";
import { shallow } from "zustand/shallow";
import { toast } from "sonner";

import { personas } from "../data/personas";
import JourneyWorkspace from "./Journey/JourneyWorkspace";
import ResetProgressButton from "./ResetProgressButton";
import { logger } from "../utils/logger";

const EMPTY_TIPS: string[] = [];

const JourneysPage: FC = () => {
  const { selectedPersona, setSelectedPersona, userProgress } = useJourneyStore(
    (state) => ({
      selectedPersona: state.selectedPersona,
      setSelectedPersona: state.setSelectedPersona,
      userProgress: state.userProgress,
    }),
    shallow
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supportHighlights = useMemo(
    () => [
      {
        title: "Zyno, AI Co-Founder",
        description:
          "Zyno orchestrates personalized curricula, turns protocol complexity into guided actions, and pair-programs on Solana builds so each pathway compounds faster.",
        bullets: [
          "Design studio for strategy, token economics, and governance stress tests",
          "Real-time AI pair for code reviews, prompt engineering, and architectural simulations",
          "Cognitive activator that adapts missions based on Proof-of-Skill signals",
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
    ],
    []
  );

  useEffect(() => {
    logger.debug("JourneysPage: useEffect triggered");
    const loadProgress = async () => {
      logger.debug("JourneysPage: loading progress...");
      try {
        setIsLoading(true);
        setError(null);
        // NOTE: keep progress load, but cards must render regardless of user state
        await useJourneyStore.getState().loadUserProgress();
        logger.debug("JourneysPage: progress loaded successfully");
      } catch (err) {
        console.error("Failed to load user progress:", err);
        setError("Failed to load your progress. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, []);

  const handleRefreshProgress = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await useJourneyStore.getState().loadUserProgress();
    } catch (err) {
      console.error("Failed to refresh progress:", err);
      setError("Failed to refresh progress. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const navigate = useNavigate();

  const personaId = selectedPersona?.id ?? "none";
  const completedPhasesCount = userProgress?.completedPhases?.length ?? 0;
  const personaTips =
    selectedPersona?.phases?.[completedPhasesCount]?.zynoTips ?? EMPTY_TIPS;

  const totalPhases = selectedPersona?.phases?.length ?? 0;
  const completionRate = totalPhases === 0 ? 0 : Math.round((completedPhasesCount / totalPhases) * 100);
  const currentPhaseNumber = Math.min(totalPhases || 1, completedPhasesCount + 1);
  const currentPhase = selectedPersona?.phases?.[currentPhaseNumber - 1];
  const pendingQuiz = !!currentPhase?.quizId;
  const pendingMint = !!currentPhase?.nftReward;
  const pendingResources = (currentPhase?.resources as string[] | undefined)?.length ?? 0;

  const handleQuiz = () => {
    toast.info("Quiz lancé (placeholder) : répondez aux questions pour valider la phase.");
  };

  const handleMint = () => {
    toast.success("Mint déclenché (placeholder) : certificat en cours de génération.");
  };

  const handleResources = () => {
    toast.message("Ressources ouvertes", {
      description: "Consultez les guides et références de la phase.",
    });
  };

  const handleBackToPersonas = () => {
    setSelectedPersona(null);
    setError(null);
    setSuccessMessage(null);
    navigate('/journeys');
  };

  // Do NOT block rendering of personas on auth/progress state

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
                {isLoading ? 'Refreshing...' : ' Refresh'}
              </button>
            </div>
          )}
        </div>
      </div>

      <main className="container mx-auto px-4 py-8" data-testid="journeys-page">
        {!selectedPersona && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-6xl font-space font-bold mb-6">
                <span className="gradient-text" data-testid="journeys-page-title">
                  Choose Your Path to Sovereignty
                </span>
              </h1>
              <p className="text-xl opacity-80 max-w-4xl mx-auto mb-8 leading-relaxed">
                Discover how the{" "}
                <span className="font-semibold text-accent-cyan">
                  Cognitive Activation Protocol
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
          </>
        )}

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
            className="h-full space-y-8"
          >
            <div className="w-full">
              <JourneyWorkspace onBack={handleBackToPersonas} />
            </div>
          </motion.div>
        )}

        {selectedPersona && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] opacity-70">Phase status</p>
                  <p className="text-lg font-semibold">Phase {currentPhaseNumber}/{totalPhases || 1}</p>
                </div>
                <div className="text-sm font-semibold text-accent-cyan">{completionRate}%</div>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-gradient-accent" style={{ width: `${completionRate}%` }} />
              </div>
              <p className="mt-2 text-xs opacity-70">
                {pendingQuiz ? 'Quiz requis avant validation.' : 'Quiz non requis.'}{" "}
                {pendingMint ? 'Certification disponible après réussite.' : 'Mint non requis sur cette phase.'}
              </p>
              <p className="mt-1 text-xs opacity-80">
                Ressources disponibles : {pendingResources}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] opacity-70">Actions suivantes</p>
              <div className="flex flex-wrap gap-2">
                <button
                  className="btn-primary text-xs px-3 py-2"
                  onClick={() => navigate(`/journeys/${selectedPersona.id}`)}
                >
                  Continuer la phase
                </button>
                <button
                  className="btn-secondary text-xs px-3 py-2"
                  onClick={handleQuiz}
                  disabled={!pendingQuiz}
                >
                  Lancer le quiz
                </button>
                <button
                  className="btn-secondary text-xs px-3 py-2"
                  onClick={handleMint}
                  disabled={!pendingMint}
                >
                  Lancer le mint
                </button>
                <button
                  className="btn-secondary text-xs px-3 py-2"
                  onClick={handleResources}
                  disabled={!pendingResources}
                >
                  Ressources ({pendingResources})
                </button>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/80">
                <p className="font-semibold">Récapitulatif</p>
                <p className="opacity-80">
                  Dernière saisie : {useJourneyStore.getState().lastStep?.userInput || 'Non disponible'}.
                </p>
                <p className="opacity-80">
                  Prochain livrable attendu : {currentPhase?.mission || 'Décrire votre intention pour cette phase.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {
          completedPhasesCount ===
          (selectedPersona?.phases?.length ?? -1) && selectedPersona && (
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
                  <div className="text-8xl mb-6"></div>
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
                        {userProgress.nfts?.length ?? 0}
                      </div>
                      <div className="text-sm opacity-70">NFTs Earned</div>
                    </div>
                    <div className="glass-effect rounded-xl p-4">
                      <div className="text-3xl font-bold text-accent-cyan mb-2">
                        {(userProgress.mfaiTokens ?? 0).toFixed(1)}
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

      {!selectedPersona && (
        <ZynoBox
          context={`persona:${personaId};phase:${completedPhasesCount}`}
          tips={personaTips}
          onPrompt={(msg) => logger.debug("User asked Zyno:", msg)}
        />
      )}
    </div>
  );
};

export default JourneysPage;
