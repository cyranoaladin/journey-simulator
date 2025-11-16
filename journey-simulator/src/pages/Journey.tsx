import WalletConnectionBanner from '../components/shared/WalletConnectionBanner';
import SkillchainBanner from '../components/SkillchainBanner';
import HeroSection from '../components/HeroSection';
import AccessPassHolders from '../components/AccessPassHolders';
import JourneysPage from '../components/JourneysPage';
import { useJourneyStore } from '../store/journeyStore';

const Journey = () => {
  const { selectedPersona } = useJourneyStore();

  return (
    <div className="space-y-8">
      <WalletConnectionBanner />
      <SkillchainBanner />
      {!selectedPersona && <HeroSection />}
      <JourneysPage />
      {!selectedPersona && <AccessPassHolders />}
    </div>
  );
};

export default Journey;
