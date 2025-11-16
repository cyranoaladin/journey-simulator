import WalletConnectionBanner from '../components/shared/WalletConnectionBanner';
import SkillchainBanner from '../components/SkillchainBanner';
import PlaygroundPage from '../components/PlaygroundPage';

const Playground = () => {
  return (
    <div className="space-y-8">
      <WalletConnectionBanner />
      <SkillchainBanner />
      <PlaygroundPage />
    </div>
  );
};

export default Playground;
