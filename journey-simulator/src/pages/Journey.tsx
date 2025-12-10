import WalletConnectionBanner from '../components/shared/WalletConnectionBanner';
import SkillchainBanner from '../components/SkillchainBanner';
import HeroSection from '../components/HeroSection';
import AccessPassHolders from '../components/AccessPassHolders';
import JourneysPage from '../components/JourneysPage';
import { useJourneyStore } from '../store/journeyStore';
import { useTutorial } from '../contexts/TutorialContext';
import { HelpCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { personas } from '../data/personas';
import JourneyWorkspace from '../components/Journey/JourneyWorkspace';

const Journey = () => {
  const { selectedPersona, setSelectedPersona } = useJourneyStore();
  const { startTutorial } = useTutorial();
  const { journeyId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (journeyId) {
      const persona = personas.find(p => p.id === journeyId);
      if (persona && persona.id !== selectedPersona?.id) {
        setSelectedPersona(persona);
        // Reload progress to ensure we have the latest backend state for this journey
        // This replaces the call in JourneyCard to avoid race conditions
        const state = useJourneyStore.getState?.();
        state?.loadUserProgress?.().catch(console.error);
      }
    } else if (selectedPersona) {
      // If no journeyId in URL but we have a selected persona, clear it
      // This ensures /journeys route always shows the list
      setSelectedPersona(null);
    }
  }, [journeyId, selectedPersona, setSelectedPersona]);

  const showJourneyTutorial = () => {
    startTutorial([
      {
        id: 'journey-intro',
        title: 'Welcome to your Journey',
        content: 'Discover how to explore the different facets of the capitalist economy on Solana through your personalized journey.'
      },
      {
        id: 'persona-explanation',
        title: 'Your Selected Profile',
        content: selectedPersona
          ? `You are currently following the ${selectedPersona.title} journey, designed for ${selectedPersona.targetProfile}.`
          : 'Select a profile to start your personalized journey.'
      },
      {
        id: 'phases-overview',
        title: 'Journey Phases',
        content: 'Each journey is divided into 5 phases: Learn, Build, Prove, Activate, and Scale. Progress at your own pace.'
      },
      {
        id: 'mission-types',
        title: 'Mission Types',
        content: 'Encounter quizzes, practical missions, coding challenges, evaluations, and governance opportunities.'
      }
    ], { autoStart: true });
  };

  const handlePersonaSelect = (persona: any) => {
    // Rely on useEffect to sync state from URL, avoiding race condition
    navigate(`/journeys/${persona.id}`);
  };

  return (
    <div className="space-y-8">
      <WalletConnectionBanner />
      <SkillchainBanner />
      {!selectedPersona && <HeroSection />}
      <div className="relative">
        {selectedPersona ? (
          <JourneyWorkspace />
        ) : (
          <JourneysPage onPersonaSelect={handlePersonaSelect} />
        )}
        <button
          onClick={showJourneyTutorial}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-gradient-to-r from-cyan-600 to-purple-600 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
          aria-label="Démarrer le tutoriel"
        >
          <HelpCircle size={20} className="text-white" />
        </button>
      </div>
      {!selectedPersona && <AccessPassHolders />}
    </div>
  );
};

export default Journey;
