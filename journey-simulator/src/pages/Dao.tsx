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
      <div
        className="rounded-2xl border border-amber-300/60 bg-amber-100/80 p-4 text-amber-900 shadow-md"
        role="status"
        aria-label="Off-chain governance notice"
      >
        <p className="text-sm font-semibold uppercase tracking-wide">Governance currently running in Off-Chain Consensus (Beta)</p>
        <p className="text-sm">Votes and proposals are simulated off-chain during the beta phase. On-chain governance will be activated when the Solana minter and DAO contracts are promoted to mainnet.</p>
      </div>
      <DaoDashboard />
    </div>
  );
};

export default Dao;
