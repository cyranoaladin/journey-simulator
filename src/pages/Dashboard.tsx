import WalletConnectionBanner from '../components/shared/WalletConnectionBanner';
import SkillchainBanner from '../components/SkillchainBanner';
import HeroSection from '../components/HeroSection';
import JourneysPreview from '../components/JourneysPreview';
import AccessPassHolders from '../components/AccessPassHolders';

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <WalletConnectionBanner />
      <SkillchainBanner />
      <section aria-labelledby="dashboard-hero" className="space-y-12">
        <HeroSection />
        <JourneysPreview />
        <AccessPassHolders />
      </section>
    </div>
  );
};

export default Dashboard;
