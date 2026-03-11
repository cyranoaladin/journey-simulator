import { Menu, Zap, Bell } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface TopBarProps {
  onToggleSidebar: () => void;
}

export function TopBar({ onToggleSidebar }: TopBarProps) {
  return (
    <header className="h-14 flex items-center gap-4 px-5 border-b border-white/7 flex-shrink-0 bg-void/60 backdrop-blur-sm">
      <button
        onClick={onToggleSidebar}
        className="text-ink-400 hover:text-ink-200 transition-colors"
      >
        <Menu size={18} />
      </button>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-ink-400 text-sm">Mon Parcours</span>
        <span className="text-ink-500">/</span>
        <span className="text-ink-100 text-sm font-medium truncate">Phase Build</span>
        <Badge variant="gold" className="ml-1">Étape 3/6</Badge>
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
