/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

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
