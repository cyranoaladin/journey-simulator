import { Menu, Zap, Bell } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useJourneyStore } from '../../store/journeyStore';
import { useLocation } from 'react-router-dom';

interface TopBarProps {
  onToggleSidebar: () => void;
}

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard':   'Dashboard',
  '/journey':     'My Journey',
  '/agents':      'AI Agents',
  '/dao':         'DAO',
  '/launchpad':   'Launchpad',
  '/resources':   'Resources',
  '/profile':     'My Profile',
  '/settings':    'Settings',
  '/guide':       'Guide',
};

export function TopBar({ onToggleSidebar }: TopBarProps) {
  const location = useLocation();
  const userProgress = useJourneyStore(state => state.userProgress);
  const selectedPersona = useJourneyStore(state => state.selectedPersona);

  const pageLabel = ROUTE_LABELS[location.pathname] ?? 'Money Factory AI';

  const currentPhaseNumber = userProgress
    ? (userProgress.completedPhases?.length ?? 0) + 1
    : 1;
  const totalPhases = selectedPersona?.phases?.length ?? 6;

  return (
    <header className="h-14 flex items-center gap-4 px-5 border-b border-white/7 flex-shrink-0 bg-void/60 backdrop-blur-sm">
      <button
        onClick={onToggleSidebar}
        className="text-ink-400 hover:text-ink-200 transition-colors"
      >
        <Menu size={18} />
      </button>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-ink-400 text-sm">{pageLabel}</span>
        {userProgress && (
          <>
            <span className="text-ink-500">/</span>
            <span className="text-ink-100 text-sm font-medium truncate">
              Phase {currentPhaseNumber}
            </span>
            <Badge variant="gold" className="ml-1">
              Step {currentPhaseNumber}/{totalPhases}
            </Badge>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button className="relative text-ink-400 hover:text-ink-200 transition-colors p-1.5">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gold-400 ring-2 ring-void" />
        </button>

        <Button
          variant="gold"
          size="sm"
          rightIcon={<Zap size={12} />}
          className="font-semibold"
        >
          Zyno
        </Button>
      </div>
    </header>
  );
}
