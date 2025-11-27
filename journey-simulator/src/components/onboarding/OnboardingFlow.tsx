import { useState, useEffect } from 'react';
import ContextualTutorial from '../shared/ContextualTutorial';

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Money Factory AI',
    content: 'Discover how the cognitive activation protocol transforms your skills into capital on the Solana ecosystem.'
  },
  {
    id: 'persona-selection',
    title: 'Select Your Profile',
    content: 'Choose a journey that matches your goals: builder, developer, strategist, etc. Each profile has a personalized curriculum.'
  },
  {
    id: 'journey-phases',
    title: 'Journey Phases',
    content: 'Each journey follows the sequence Learn → Build → Prove → Activate → Scale. You can return to each phase.'
  },
  {
    id: 'zyno-assistant',
    title: 'Your AI Co-founder: Zyno',
    content: 'Zyno orchestrates your experience, adapts content to your needs, and guides you in your strategic decisions.'
  },
  {
    id: 'rewards-system',
    title: 'Rewards System',
    content: 'Earn XP, Proof-of-*™ NFTs, and $MFAI tokens for your achievements.'
  },
  {
    id: 'community',
    title: 'Community Integration',
    content: 'Participate in DAOs, governance proposals, and join the network of sovereign builders.'
  }
];

interface OnboardingFlowProps {
  onStart?: () => void;
  onContinue?: () => void;
  onComplete?: () => void;
}

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [showTutorial, setShowTutorial] = useState(false);

  // Vérifier si le tutoriel a déjà été complété
  useEffect(() => {
    const hasCompletedTutorial = localStorage.getItem('onboarding-completed');
    if (!hasCompletedTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    localStorage.setItem('onboarding-completed', 'true');
    if (onComplete) {
      onComplete();
    }
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
    localStorage.setItem('onboarding-completed', 'true');
    if (onComplete) {
      onComplete();
    }
  };

  if (showTutorial) {
    return (
      <ContextualTutorial
        steps={onboardingSteps}
        onComplete={handleTutorialComplete}
        onSkip={handleTutorialSkip}
        autoStart={true}
      />
    );
  }

  return null;
};

export default OnboardingFlow;