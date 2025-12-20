import WalletConnectionBanner from '../components/shared/WalletConnectionBanner';
import SkillchainBanner from '../components/SkillchainBanner';
import HeroSection from '../components/HeroSection';
import AccessPassHolders from '../components/AccessPassHolders';
import JourneysPage from '../components/JourneysPage';
import { useJourneyStore } from '../store/journeyStore';
import { useTutorial } from '../contexts/TutorialContext';
import { HelpCircle } from 'lucide-react';
import { Navigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { personas } from '../data/personas';
import JourneyWorkspace from '../components/Journey/JourneyWorkspace';
import { isDemoSession } from '../utils/demoSession';

const Journey = () => {
  const { selectedPersona, setSelectedPersona } = useJourneyStore();
  const { startTutorial } = useTutorial();
  const { journeyId } = useParams();
  const demo = isDemoSession()

  useEffect(() => {
    if (demo) return
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
  }, [demo, journeyId, selectedPersona, setSelectedPersona]);

  // Hard separation: demo sessions should not live under real journey routes.
  if (demo) {
    return (
      <Navigate
        to={journeyId ? `/journeys/demo/${journeyId}` : '/journeys/demo'}
        replace
      />
    );
  }

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

  return (
    <div className="space-y-8">
      <WalletConnectionBanner />
      <SkillchainBanner />
      {!selectedPersona && <HeroSection />}
      <div className="relative">
        {selectedPersona ? (
          <JourneyWorkspace />
        ) : (
          <JourneysPage />
        )}
        <button
          onClick={showJourneyTutorial}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-gradient-to-r from-cyan-600 to-purple-600 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
          aria-label="Start tutorial"
        >
          <HelpCircle size={20} className="text-white" />
        </button>
      </div>
      {!selectedPersona && <AccessPassHolders />}
    </div>
  );
};

export default Journey;
