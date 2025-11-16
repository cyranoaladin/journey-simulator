import WalletConnectionBanner from '../components/shared/WalletConnectionBanner';
import SkillchainBanner from '../components/SkillchainBanner';
import SupportCenter from '../components/Support/SupportCenter';

const Support = () => {
  return (
    <div className="space-y-8">
      <WalletConnectionBanner />
      <SkillchainBanner />
      <SupportCenter />
    </div>
  );
};

export default Support;
