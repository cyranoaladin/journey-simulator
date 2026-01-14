/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Cpu, Gauge, Home, Layers, LifeBuoy, Network, Rocket, Book, LogOut, X } from 'lucide-react';
import { useJourneyStore } from '../../store/journeyStore';
import { useAuth } from '../../contexts/AuthContext';
import clsx from 'clsx';
import { logger } from '../../utils/logger';
import { shallow } from 'zustand/shallow';

type SidebarProps = {
  variant?: 'docked' | 'overlay';
  onClose?: () => void;
};

const navItems = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/journeys', label: 'Journeys', icon: Compass },
  { to: '/zyno', label: 'Zyno Console', icon: Cpu },
  { to: '/playground', label: 'Playground', icon: Rocket },
  { to: '/dao', label: 'DAO Hub', icon: Network },
  { to: '/resources', label: 'Resources', icon: Layers },
  { to: '/guide', label: 'Platform Guide', icon: Book },
  { to: '/support', label: 'Help Center', icon: LifeBuoy },
];

const Sidebar = ({ variant = 'docked', onClose }: SidebarProps) => {
  const { logout } = useAuth();
  const { selectedPersona, userProgress } = useJourneyStore(
    (state) => ({
      selectedPersona: state.selectedPersona,
      userProgress: state.userProgress,
    }),
    shallow
  );
  logger.debug('Sidebar: render', { selectedPersonaId: selectedPersona?.id, completedPhases: userProgress?.completedPhases?.length ?? 0, variant });
  const isOverlay = variant === 'overlay';
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (isOverlay) {
      setExpanded(true);
    }
  }, [isOverlay]);

  const completion = useMemo(() => {
    const total = selectedPersona?.phases?.length ?? 0;
    const completed = userProgress?.completedPhases?.length ?? 0;
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, rate };
  }, [selectedPersona?.phases?.length, userProgress?.completedPhases?.length ?? 0]);

  const progressValue = Math.max(0, Math.min(100, completion.rate));

  const metrics = useMemo(
    () => [
      { id: 'xp', label: 'Total XP', value: userProgress?.totalXP ?? 0 },
      { id: 'mfai', label: '$MFAI', value: userProgress?.mfaiTokens ?? 0 },
      { id: 'vote', label: 'Voting Power', value: userProgress?.votingPower ?? 0 },
      { id: 'nfts', label: 'NFT Badges', value: userProgress?.nfts?.length ?? 0 },
    ],
    [userProgress?.mfaiTokens ?? 0, userProgress?.nfts?.length ?? 0, userProgress?.totalXP ?? 0, userProgress?.votingPower ?? 0]
  );

  const containerClasses = clsx(
    'flex flex-col gap-6 rounded-3xl border border-indigo-500/20 bg-indigo-950/20 p-6 shadow-inner transition-all duration-300 overflow-hidden backdrop-blur-lg',
    {
      'sticky top-24 hidden h-[calc(100vh-6rem)] xl:flex': !isOverlay,
      'w-80': !isOverlay && expanded,
      'w-24': !isOverlay && !expanded,
      'relative h-full w-full max-h-[calc(100vh-3rem)] overflow-y-auto bg-indigo-950/95 shadow-2xl': isOverlay,
    }
  );

  return (
    <aside className={containerClasses} aria-label="Dashboard navigation">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className={clsx(
            'flex items-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200 transition-colors',
            {
              'justify-between': !isOverlay,
              'justify-center w-full': isOverlay,
            }
          )}
          disabled={isOverlay}
        >
          {expanded && !isOverlay && <span>Journey Pulse</span>}
          <Gauge size={16} className={clsx('text-indigo-300', { 'mx-auto': !expanded || isOverlay })} />
        </button>
        {isOverlay && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/20 p-2 text-white/70 transition hover:text-white"
            aria-label="Close navigation panel"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="space-y-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${isActive
                ? 'bg-indigo-500/20 text-indigo-100 shadow-[0_0_20px_rgba(165,99,245,0.25)]'
                : 'text-indigo-200 hover:bg-indigo-500/10 hover:text-white'
              } ${!expanded && 'justify-center px-2'}`
            }
            title={!expanded ? label : undefined}
          >
            <Icon size={18} className="shrink-0" />
            {expanded ? <span>{label}</span> : null}
          </NavLink>
        ))}
      </div>

      {expanded && (
        <>
          <div className="mt-4 space-y-3 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-indigo-200">
              <span>Progress</span>
              <span>{completion.rate}%</span>
            </div>
            <progress
              className="mfai-progress"
              max={100}
              value={progressValue}
              aria-label="Journey Progress"
              aria-valuetext={`${completion.completed} sur ${completion.total || 0} phases`}
            />
            <p className="text-[11px] text-indigo-200/80">
              {completion.completed}/{completion.total || ''} phases completed
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
        </>
      )}



      <div className="mt-auto pt-4 border-t border-indigo-500/20">
        <button
          onClick={logout}
          className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full ${!expanded && 'justify-center px-2'}`}
          title={!expanded ? 'Logout' : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {expanded ? <span>Logout</span> : null}
        </button>
      </div>
    </aside >
  );
};

export default Sidebar;
