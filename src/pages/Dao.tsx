import WalletConnectionBanner from '../components/shared/WalletConnectionBanner';
import SkillchainBanner from '../components/SkillchainBanner';
import DaoDashboard from '../components/Dao/DaoDashboard';

const Dao = () => {
  return (
    <div className="space-y-8">
      <WalletConnectionBanner />
      <SkillchainBanner />
      <DaoDashboard />
    </div>
  );
};

export default Dao;
