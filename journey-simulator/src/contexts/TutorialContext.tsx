/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { createContext, useContext, useState, ReactNode } from 'react';
import ContextualTutorial from '../components/shared/ContextualTutorial';

interface TutorialContextType {
  startTutorial: (steps: any[], options?: { autoStart?: boolean }) => void;
  dismissTutorial: () => void;
  isTutorialActive: boolean;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

interface TutorialProviderProps {
  children: ReactNode;
}

export const TutorialProvider = ({ children }: TutorialProviderProps) => {
  const [tutorialSteps, setTutorialSteps] = useState<any[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialOptions, setTutorialOptions] = useState<{ autoStart?: boolean }>({});

  const startTutorial = (steps: any[], options: { autoStart?: boolean } = {}) => {
    setTutorialSteps(steps);
    setTutorialOptions(options);
    setShowTutorial(true);
  };

  const dismissTutorial = () => {
    setShowTutorial(false);
    setTutorialSteps([]);
  };

  const handleComplete = () => {
    dismissTutorial();
  };

  const handleSkip = () => {
    dismissTutorial();
  };

  return (
    <TutorialContext.Provider 
      value={{ 
        startTutorial, 
        dismissTutorial, 
        isTutorialActive: showTutorial 
      }}
    >
      {children}
      {showTutorial && tutorialSteps.length > 0 && (
        <ContextualTutorial
          steps={tutorialSteps}
          onComplete={handleComplete}
          onSkip={handleSkip}
          autoStart={tutorialOptions.autoStart}
        />
      )}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};