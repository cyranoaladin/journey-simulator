/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import WalletConnectionBanner from '../components/shared/WalletConnectionBanner';
import SkillchainBanner from '../components/SkillchainBanner';
import ResourceHub from '../components/Resources/ResourceHub';

const Resources = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const focus = (location.state as { focus?: string } | null)?.focus;
    if (focus === 'skillchain-card') {
      const target = document.getElementById('skillchain-banner');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      navigate('.', { replace: true, state: null });
    }
  }, [location.state, navigate]);

  return (
    <div className="space-y-8">
      <WalletConnectionBanner />
      <SkillchainBanner />
      <ResourceHub />
    </div>
  );
};

export default Resources;
