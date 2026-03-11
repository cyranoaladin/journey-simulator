import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Compass, Bot, Vote,
  Rocket, Settings, LogOut, ChevronLeft,
  Wallet, ExternalLink,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Badge } from '../ui/Badge';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard',  icon: LayoutDashboard, label: 'Dashboard',  sublabel: "Vue d'ensemble" },
  { id: 'journey',    icon: Compass,          label: 'Mon Parcours', sublabel: 'Progression AEPO' },
  { id: 'agents',     icon: Bot,              label: 'Agents IA',  sublabel: '30 actifs' },
  { id: 'dao',        icon: Vote,             label: 'DAO',        sublabel: 'Gouvernance' },
  { id: 'launchpad',  icon: Rocket,           label: 'Launchpad',  sublabel: 'Projets' },
] as const;

export function SidebarNew({ open, onToggle }: SidebarProps) {
  const walletAddress = '8xKt...mR9f';
  const passLevel = 'INTERMEDIATE' as const;
  const aepoScore = 74;

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.aside
          initial={{ x: -260, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -260, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-[260px] flex-shrink-0 h-full flex flex-col bg-slate-50 border-r border-white/7 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center text-void font-bold text-sm shadow-gold-glow">
                M
              </div>
              <div>
                <p className="text-sm font-bold text-ink-50 font-display tracking-tight">Money Factory</p>
                <p className="text-2xs text-ink-400 -mt-0.5">AI Protocol</p>
              </div>
            </div>
            <button onClick={onToggle} className="text-ink-400 hover:text-ink-200 transition-colors p-1">
              <ChevronLeft size={16} />
            </button>
          </div>

          <div className="mx-4 mb-4 p-3 rounded-xl bg-gradient-to-br from-gold-400/8 to-transparent border border-gold-400/15">
            <div className="flex items-center justify-between mb-2">
              <Badge passLevel={passLevel}>{passLevel}</Badge>
              <span className="font-mono text-xs font-semibold text-gold-300">{aepoScore}/100</span>
            </div>
            <div className="h-1 rounded-full bg-white/8 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-300"
                initial={{ width: '0%' }}
                animate={{ width: `${aepoScore}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              />
            </div>
            <p className="text-2xs text-ink-400 mt-1.5">Score AEPO — Niveau intermédiaire</p>
          </div>

          <nav className="px-3 flex-1 overflow-y-auto space-y-0.5">
            <p className="text-2xs text-ink-400 uppercase tracking-widest px-2 mb-2 font-semibold">Navigation</p>
            {NAV_ITEMS.map((item) => {
              const isActive = item.id === 'journey';
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className={clsx(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left',
                    'transition-colors duration-150 group',
                    isActive
                      ? 'bg-gold-400/10 text-gold-300'
                      : 'text-ink-300 hover:text-ink-100 hover:bg-white/4'
                  )}
                >
                  <item.icon size={16} className={clsx('flex-shrink-0', isActive && 'text-gold-400')} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight">{item.label}</p>
                    <p className="text-2xs text-ink-400 truncate">{item.sublabel}</p>
                  </div>
                  {isActive && <div className="w-1 h-5 rounded-full bg-gold-400 flex-shrink-0" />}
                </motion.button>
              );
            })}
          </nav>

          <div className="px-3 pb-4 pt-2 border-t border-white/7 space-y-0.5 mt-2">
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-cyan-300/8 border border-cyan-300/15">
              <Wallet size={14} className="text-cyan-300 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-2xs text-ink-400">Wallet connecté</p>
                <p className="text-xs font-mono text-cyan-300 truncate">{walletAddress}</p>
              </div>
              <a href="#" className="text-ink-400 hover:text-cyan-300 transition-colors">
                <ExternalLink size={12} />
              </a>
            </div>

            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-ink-300 hover:text-ink-100 hover:bg-white/4 transition-colors text-sm">
              <Settings size={15} />
              Paramètres
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-coral-400 hover:bg-coral-500/10 transition-colors text-sm">
              <LogOut size={15} />
              Déconnexion
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
