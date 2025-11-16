import WalletConnectionBanner from '../components/shared/WalletConnectionBanner';
import SkillchainBanner from '../components/SkillchainBanner';
import JourneyCompletedPage from '../components/JourneyCompletedPage';

const JourneyCompleted = () => {
  return (
    <div className="space-y-8">
      <WalletConnectionBanner />
      <SkillchainBanner />
      <JourneyCompletedPage />
    </div>
  );
};

export default JourneyCompleted;
