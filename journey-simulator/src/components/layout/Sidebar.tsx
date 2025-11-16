import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Cpu, Gauge, Home, Layers, LifeBuoy, Network, Rocket } from 'lucide-react';
import { useJourneyStore } from '../../store/journeyStore';

const navItems = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/journeys', label: 'Journeys', icon: Compass },
  { to: '/zyno', label: 'Zyno Console', icon: Cpu },
  { to: '/playground', label: 'Playground', icon: Rocket },
  { to: '/dao', label: 'DAO Hub', icon: Network },
  { to: '/resources', label: 'Resources', icon: Layers },
  { to: '/support', label: 'Help Center', icon: LifeBuoy },
];

const Sidebar = () => {
  const { selectedPersona, userProgress } = useJourneyStore();
  const [expanded, setExpanded] = useState(true);

  const completion = useMemo(() => {
    const total = selectedPersona?.phases?.length ?? 0;
    const completed = userProgress.completedPhases.length;
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, rate };
  }, [selectedPersona?.phases?.length, userProgress.completedPhases.length]);

  const progressValue = Math.max(0, Math.min(100, completion.rate));

  const metrics = useMemo(
    () => [
      { id: 'xp', label: 'Total XP', value: userProgress.totalXP },
      { id: 'mfai', label: '$MFAI', value: userProgress.mfaiTokens },
      { id: 'vote', label: 'Voting Power', value: userProgress.votingPower },
      { id: 'nfts', label: 'NFT Badges', value: userProgress.nfts.length },
    ],
    [userProgress.mfaiTokens, userProgress.nfts.length, userProgress.totalXP, userProgress.votingPower]
  );

  return (
    <aside
      className={`sticky top-24 hidden h-[calc(100vh-6rem)] flex-col gap-6 rounded-3xl border border-indigo-500/20 bg-indigo-950/20 p-6 shadow-inner lg:flex ${
        expanded ? 'w-80' : 'w-24'
      } transition-all duration-300`}
      aria-label="Dashboard navigation"
    >
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex items-center justify-between rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200"
      >
        <span>Journey Pulse</span>
        <Gauge size={16} className="text-indigo-300" />
      </button>

      <div className="space-y-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-500/20 text-indigo-100 shadow-[0_0_20px_rgba(165,99,245,0.25)]'
                  : 'text-indigo-200 hover:bg-indigo-500/10 hover:text-white'
              }`
            }
          >
            <Icon size={18} className="shrink-0" />
            {expanded ? <span>{label}</span> : null}
          </NavLink>
        ))}
      </div>

      <div className="mt-4 space-y-3 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-4">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-indigo-200">
          <span>Progress</span>
          <span>{completion.rate}%</span>
        </div>
        <progress
          className="mfai-progress"
          max={100}
          value={progressValue}
          aria-label="Progression du parcours"
          aria-valuetext={`${completion.completed} sur ${completion.total || 0} phases`}
        />
        <p className="text-[11px] text-indigo-200/80">
          {completion.completed}/{completion.total || '—'} phases completed
        </p>
      </div>

      <ul className="space-y-2">
        {metrics.map((metric) => (
          <li
            key={metric.id}
            className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-indigo-100"
          >
            <p className="text-[11px] uppercase tracking-[0.3em] text-indigo-200/70">{metric.label}</p>
            <p className="mt-1 font-mono text-lg">{metric.value.toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
