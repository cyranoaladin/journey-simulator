import { useState } from 'react';
import WalletConnectionBanner from '../components/shared/WalletConnectionBanner';
import SkillchainBanner from '../components/SkillchainBanner';
import { ZynoConsole } from '../components/Zyno/ZynoConsole';
import DashboardZyno from '../components/Zyno/DashboardZyno';
import type { MissionSummary } from '../components/Zyno/MissionFeedbackSummary';

const Zyno = () => {
  const [lastMissionSummary, setLastMissionSummary] = useState<MissionSummary | null>(null);

  return (
    <div className="space-y-8">
      <WalletConnectionBanner />
      <SkillchainBanner />
      <DashboardZyno missionSummary={lastMissionSummary} />
      <section id="zyno-console" className="rounded-3xl border border-indigo-500/20 bg-indigo-500/5 p-6">
        <ZynoConsole onMissionUpdate={setLastMissionSummary} />
      </section>
    </div>
  );
};

export default Zyno;
