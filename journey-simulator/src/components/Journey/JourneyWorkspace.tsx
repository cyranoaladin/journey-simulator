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
