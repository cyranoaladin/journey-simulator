/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { tokenStore } from '../../utils/tokenStore';
import JourneyDemoMode from './JourneyDemoMode';
import JourneySimulationMode from './JourneySimulationMode';

import { useJourneyStore } from '../../store/journeyStore';

interface JourneyWorkspaceProps {
  onBack?: () => void;
}

const JourneyWorkspace = ({ onBack }: JourneyWorkspaceProps) => {
  const isDemo = tokenStore.getAccessToken() === 'demo-token';
  const isStepLoading = useJourneyStore((s) => s.isStepLoading);

  return (
    <>
      {isStepLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-accent-cyan font-mono tracking-widest animate-pulse">SYNCING NEURAL STATE...</div>
          </div>
        </div>
      )}
      {isDemo ? <JourneyDemoMode onBack={onBack} /> : <JourneySimulationMode onBack={onBack} />}
    </>
  );
};

export default JourneyWorkspace;
