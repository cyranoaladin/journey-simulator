import WalletConnectionBanner from '../components/shared/WalletConnectionBanner';
import SkillchainBanner from '../components/SkillchainBanner';
import JourneysPage from '../components/JourneysPage';

const Journey = () => {
  return (
    <div className="space-y-8">
      <WalletConnectionBanner />
      <SkillchainBanner />
      <JourneysPage />
    </div>
  );
};

export default Journey;
