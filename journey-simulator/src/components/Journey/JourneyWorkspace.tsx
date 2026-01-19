/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { tokenStore } from '../../utils/tokenStore';
import JourneyDemoMode from './JourneyDemoMode';
import JourneySimulationMode from './JourneySimulationMode';

interface JourneyWorkspaceProps {
  onBack?: () => void;
}

const JourneyWorkspace = ({ onBack }: JourneyWorkspaceProps) => {
  const isDemo = tokenStore.getAccessToken() === 'demo-token';

      if (isDemo) {
    return <JourneyDemoMode onBack={onBack} />;
  }

  return <JourneySimulationMode onBack={onBack} />;
};

export default JourneyWorkspace;
