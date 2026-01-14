/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, Sun, Moon, Crown, Sparkles, Waypoints, BrainCircuit, Atom, Vote, LibraryBig, LifeBuoy, GaugeCircle, Gem, Gavel, Award } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'
import { useAuth } from '../../contexts/AuthContext'
import { useJourneyStoreShallow } from '../../store/journeyStore'
import { useRunModeStore } from '../../store/runModeStore'
import { tokenStore } from '../../utils/tokenStore'
import UserMetricsPanel from './UserMetricsPanel'

import WalletButton from '../WalletButton'

type NavItem = {
  label: string
  href: string
  icon: LucideIcon
  badge?: string
  disabled?: boolean
  external?: string
}

const NAV_ITEMS: NavItem[] = [{ label: 'Journeys', href: '/journeys', icon: Waypoints }]

const MORE_ITEMS: NavItem[] = [
  { label: 'DAO', href: '/dao', icon: Vote, badge: 'Beta' },
  { label: 'Resources', href: '/resources', icon: LibraryBig, badge: 'New' },
  { label: 'Zyno Console', href: '/zyno', icon: BrainCircuit, badge: 'Live' },
  { label: 'Playground', href: '/playground', icon: Atom },
  { label: 'Help', href: '/support', icon: LifeBuoy, badge: 'Guide' },
]

type MainNavigationProps = {
  enableWallet?: boolean
}

type NavSharedProps = {
  readonly isDark: boolean
  readonly navSoonBadge: string
  readonly mobileMenuTone: string
  readonly mobileItemDefault: string
  readonly mobileItemDisabled: string
  readonly mobileItemActive: string
  readonly navActiveTone?: string
  readonly navDefaultTone?: string
  readonly navDisabledTone?: string
}

const waitMs = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))



const safeGetFromStorage = (storage: Storage | undefined, key: string) => {
  try {
    return storage?.getItem(key) || null
  } catch {
    return null
  }
}

const resolveZustandToken = () => {
  const storageStr = safeGetFromStorage(globalThis.localStorage, 'mfai-token-storage')
  if (!storageStr) return null
  try {
    const parsed = JSON.parse(storageStr)
    return parsed?.state?.accessToken || null
  } catch {
    return null
  }
}

const resolveCurrentToken = () => {
  const candidates = [
    tokenStore.getAccessToken(),
    safeGetFromStorage(globalThis.sessionStorage, 'accessToken'),
    safeGetFromStorage(globalThis.localStorage, 'accessToken'),
    resolveZustandToken(),
  ]
  return candidates.find((token) => token && token !== 'demo-token') || null
}

const shouldRequireLogin = (token: string | null, user: { id?: string } | null, isAuthenticated: boolean) =>
  !token || user?.id === 'demo-user-id' || !isAuthenticated

const navigateToLogin = (navigate: ReturnType<typeof useNavigate>, target: string) =>
  navigate(`/login?redirect=${encodeURIComponent(target)}`)

const RunModeSelector = ({
  runMode,
  setRunModePersisted,
  isDark,
}: {
  readonly runMode: 'demo' | 'simulation' | 'real'
  readonly setRunModePersisted: (mode: 'demo' | 'simulation' | 'real') => void
  readonly isDark: boolean
}) => {
  const runModeTone = useMemo(() => {
    if (runMode === 'real') return 'bg-emerald-600 text-white border-emerald-300/50'
    if (runMode === 'simulation') return isDark ? 'bg-amber-500/30 text-amber-100 border-amber-200/30' : 'bg-amber-50 text-amber-700 border-amber-200'
    return isDark ? 'bg-blue-500/25 text-blue-100 border-blue-200/30' : 'bg-blue-50 text-blue-700 border-blue-200'
  }, [isDark, runMode])

  const renderButton = (mode: 'demo' | 'simulation' | 'real', label: string, activeClass: string, inactiveClass: string) => (
    <button
      type="button"
      data-testid={`mode-switch-${mode}`}
      onClick={() => setRunModePersisted(mode)}
      className={`rounded-full border px-3 py-1 font-semibold transition ${runMode === mode ? activeClass : inactiveClass}`}
    >
      {label}
    </button>
  )

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs backdrop-blur md:text-sm">
      <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-semibold shadow-sm ${runModeTone}`}>
        <span>Mode</span>
        <span data-testid="mode-badge" className="uppercase tracking-wide">{runMode}</span>
        {runMode === 'real' && <Crown size={14} aria-hidden="true" />}
        {runMode === 'simulation' && <Sparkles size={14} aria-hidden="true" />}
        {runMode === 'demo' && <Atom size={14} aria-hidden="true" />}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-muted-foreground">Select:</span>
        {renderButton('demo', 'Demo (mock)', 'border-blue-500 bg-blue-500 text-white', 'border-transparent bg-white/5 text-muted-foreground hover:border-blue-200 hover:text-blue-600')}
        {renderButton('simulation', 'Simulation (dry-run)', 'border-amber-500 bg-amber-500 text-white', 'border-transparent bg-white/5 text-muted-foreground hover:border-amber-200 hover:text-amber-600')}
        {renderButton('real', 'Launch with Zyno (real)', 'border-emerald-600 bg-emerald-600 text-white', 'border-transparent bg-white/5 text-muted-foreground hover:border-emerald-200 hover:text-emerald-700')}
      </div>
    </div>
  )
}

const BrandButton = ({ navigate, mutedCaptionClass }: { readonly navigate: ReturnType<typeof useNavigate>; readonly mutedCaptionClass: string }) => (
  <button
    onClick={() => navigate('/dashboard')}
    className="flex items-center gap-3 text-left focus:outline-none focus:ring-2 focus:ring-accent-cyan rounded-lg p-2"
    aria-label="Return to home page"
  >
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-accent shadow-lg shadow-primary-500/30" aria-hidden="true">
      <img src="/images/logo_mfai.png" alt="Logo Money Factory AI" className="h-8 w-8" />
    </div>
    <div className="flex flex-col">
      <span className="font-space text-lg font-semibold tracking-wide">Money Factory AI</span>
      <span className={`text-xs font-medium uppercase tracking-[0.2em] ${mutedCaptionClass}`}>Cognitive Activation Protocol</span>
    </div>
  </button>
)

// Extracted components to reduce MainNavigation complexity
// Removed unused props: isDark, enableWallet
const UserAuthButtons = ({ user, navigate, logout }: { user: any, navigate: any, logout: any }) => (
  <div className="hidden lg:flex items-center gap-3">
    <div className="w-px h-6 bg-white/20" />
    {!user ? (
      <>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => navigate('/login?demo=1')} className="btn-primary flex items-center justify-center">
          <span>Demo Mode</span>
        </motion.button>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => navigate('/login')} className="btn-secondary flex items-center justify-center">
          <span>Sign In</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/register')}
          className="rounded-2xl border-2 border-accent-cyan/50 bg-transparent px-6 py-3 text-base font-semibold text-accent-cyan transition-all duration-300 hover:bg-accent-cyan hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan"
        >
          <span>Sign Up</span>
        </motion.button>
      </>
    ) : (
      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => { logout(); navigate('/'); }} className="btn-secondary flex items-center justify-center" data-testid="logout-button">
        <span>Logout</span>
      </motion.button>
    )}
  </div>
);

const MobileStatsBlock = ({ completionRate, userProgress, passBadgeStyles, mutedCaptionClass, metricLabelClass, metricHintClass }: { completionRate: number, userProgress: any, passBadgeStyles: string, mutedCaptionClass: string, metricLabelClass: string, metricHintClass: string }) => (
  <div className="flex items-center justify-between gap-3 lg:hidden" aria-label="Mobile journey progress">
    <div className="glass-effect flex items-center gap-3 rounded-2xl px-4 py-3">
      <Crown size={16} className="text-accent-neon" aria-hidden="true" />
      <div className="flex flex-col">
        <span className={`text-[10px] uppercase tracking-[0.2em] ${mutedCaptionClass}`}>Pass Level</span>
        <span className={`mt-1 inline-flex items-center self-start rounded-full px-2 py-0.5 text-xs font-semibold ${passBadgeStyles}`}>{userProgress.passLevel}</span>
      </div>
    </div>

    <div className="flex w-36 flex-col gap-1">
      <span className={`text-[10px] uppercase tracking-[0.2em] ${metricLabelClass}`}>Journey</span>
      <div className="h-2 rounded-full bg-white/10" aria-label={`Barre de progression: ${completionRate}%`}>
        <motion.div initial={false} animate={{ width: `${completionRate}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} className="h-full rounded-full bg-gradient-accent" role="progressbar" aria-valuenow={completionRate} aria-valuemin={0} aria-valuemax={100} />
      </div>
      <span className={`text-[11px] ${metricHintClass}`}>{completionRate}% complete</span>
    </div>
  </div>
);

const DesktopNav = ({
  location,
  handleNavigate,
  navActiveTone,
  navDefaultTone,
  navDisabledTone,
  navSoonBadge,
  mobileMenuTone,
  isMoreOpen,
  setIsMoreOpen,
  moreRef,
}: {
  readonly location: ReturnType<typeof useLocation>
  readonly handleNavigate: (item: NavItem) => void
  readonly navActiveTone: string
  readonly navDefaultTone: string
  readonly navDisabledTone: string
  readonly navSoonBadge: string
  readonly mobileMenuTone: string
  readonly isMoreOpen: boolean
  readonly setIsMoreOpen: (v: (val: boolean) => boolean) => void
  readonly moreRef: RefObject<HTMLDivElement | null>
}) => {
  const getBadgeClass = (badge?: string) => {
    switch (badge) {
      case 'Live': return 'bg-success/20 text-success';
      case 'Beta': return 'bg-warning/20 text-warning';
      case 'New': return 'bg-primary-400/20 text-primary-500';
      case 'Guide': return 'bg-gray-900/60 border border-violet-500/50 text-violet-300 shadow-[0_0_15px_-5px_rgba(168,85,247,0.5)] animate-pulse'; // Mini MissionCard style
      default: return navSoonBadge;
    }
  };

  const renderBadge = (badge?: string) => {
    if (!badge) return null;
    return (
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getBadgeClass(badge)}`} aria-label={`Badge ${badge}`}>
        {badge}
      </span>
    );
  };

  return (
    <nav aria-label="Main navigation" className="hidden flex-1 items-center justify-center gap-6 lg:flex">
      <ul className="flex items-center gap-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = !item.disabled && location.pathname === item.href
          const stateClass = isActive ? navActiveTone : item.disabled ? `${navDisabledTone} cursor-not-allowed` : navDefaultTone
          return (
            <li key={item.label}>
              <motion.button
                whileHover={{ y: -2 }}
                type="button"
                onClick={() => handleNavigate(item)}
                className={`relative flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${stateClass}`}
                disabled={item.disabled}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.disabled ? `${item.label} (indisponible)` : item.label}
              >
                <Icon size={16} className="opacity-80" aria-hidden="true" />
                <span>{item.label}</span>
                {renderBadge(item.badge)}
                {isActive && (
                  <motion.span layoutId="nav-indicator" className="absolute -bottom-2 left-1/2 h-0.5 w-10 -translate-x-1/2 rounded-full bg-gradient-accent" aria-hidden="true" />
                )}
              </motion.button>
            </li>
          )
        })}
      </ul>

      <div ref={moreRef} className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => setIsMoreOpen((v) => !v)}
          className={`relative flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold transition-all duration-300 hover:border-accent-cyan/50 hover:bg-white/5 hover:text-accent-cyan hover:shadow-neon-ring ${navDefaultTone}`}
          aria-haspopup="menu"
          aria-expanded={isMoreOpen}
        >
          <Menu size={16} className="opacity-80" aria-hidden="true" />
          <span>Menu</span>
        </motion.button>

        <AnimatePresence>
          {isMoreOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              role="menu"
              className={`absolute left-0 mt-2 w-56 overflow-hidden rounded-2xl border shadow-glass backdrop-blur-2xl ${mobileMenuTone}`}
            >
              <div className="p-2">
                {MORE_ITEMS.map((item) => {
                  const Icon = item.icon
                  const isActive = !item.disabled && location.pathname === item.href
                  const stateClass = isActive ? 'bg-white/10 text-white' : item.disabled ? 'text-white/40' : 'text-white'
                  return (
                    <button
                      key={item.label}
                      type="button"
                      role="menuitem"
                      onClick={() => handleNavigate(item)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${stateClass}`}
                      disabled={item.disabled}
                      data-testid={`nav-menu-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon size={16} aria-hidden="true" />
                        {item.label}
                      </span>
                      {renderBadge(item.badge)}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

const MobileMenu = ({
  isMobileMenuOpen,
  location,
  handleNavigate,
  navItems,
  moreItems,
  mobileMenuTone,
  mobileItemActive,
  mobileItemDisabled,
  mobileItemDefault,
  metrics,
  metricLabelClass,
  metricValueClass,
  metricHintClass,
  completionRate,
  completedPhases,
  totalPhases,
  isDark,
  user,
  logout,
  navigate,
  navSoonBadge,
}: NavSharedProps & {
  readonly isMobileMenuOpen: boolean
  readonly location: ReturnType<typeof useLocation>
  readonly handleNavigate: (item: NavItem) => void
  readonly navItems: NavItem[]
  readonly moreItems: NavItem[]
  readonly metrics: { id: string; label: string; value: number; hint: string; icon: LucideIcon }[]
  readonly metricLabelClass: string
  readonly metricValueClass: string
  readonly metricHintClass: string
  readonly completionRate: number
  readonly completedPhases: number
  readonly totalPhases: number
  readonly user: ReturnType<typeof useAuth>['user']
  readonly logout: () => void
  readonly navigate: ReturnType<typeof useNavigate>
}) => (
  <AnimatePresence>
    {isMobileMenuOpen && (
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.2 }}
        className={`px-4 pb-6 pt-4 lg:hidden ${mobileMenuTone}`}
      >
        <div className="flex flex-col gap-3">
          {[...navItems, ...moreItems].map((item) => {
            const Icon = item.icon
            const isActive = !item.disabled && location.pathname === item.href
            const stateClass = isActive ? mobileItemActive : item.disabled ? mobileItemDisabled : mobileItemDefault
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNavigate(item)}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${stateClass}`}
                disabled={item.disabled}
                data-testid={`nav-menu-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <span className="flex items-center gap-2">
                  <Icon size={18} />
                  {item.label}
                </span>
                {item.badge && <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${navSoonBadge}`}>{item.badge}</span>}
              </button>
            )
          })}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3">
          {!user ? (
            <>
              <button type="button" className="btn-primary w-full" onClick={() => navigate('/login?demo=1')}>
                Demo Mode
              </button>
              <button type="button" className="btn-secondary w-full" onClick={() => navigate('/login')}>
                Sign In
              </button>
              <button
                type="button"
                className="w-full rounded-2xl border-2 border-accent-cyan/50 bg-transparent px-6 py-3 text-base font-semibold text-accent-cyan transition-all duration-300 hover:bg-accent-cyan hover:text-black"
                onClick={() => navigate('/register')}
              >
                Sign Up
              </button>
            </>
          ) : (
            <button type="button" className="btn-secondary w-full" onClick={logout} data-testid="logout-button">
              Logout
            </button>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <div key={metric.id} className="glass-effect flex flex-col gap-1 rounded-2xl px-4 py-3">
                <span className={`flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] ${metricLabelClass}`}>
                  <Icon size={14} className="text-accent-neon" />
                  {metric.label}
                </span>
                <span className={`font-mono text-sm ${metricValueClass}`}>{metric.value.toLocaleString()}</span>
                <span className={`text-[11px] ${metricHintClass}`}>{metric.hint}</span>
              </div>
            )
          })}
          <div className="glass-effect col-span-2 flex flex-col gap-2 rounded-2xl px-4 py-3">
            <div className={`flex items-center justify-between text-[10px] uppercase tracking-[0.3em] ${metricLabelClass}`}>
              <span>Journey Completion</span>
              <span>{completionRate}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <motion.div initial={false} animate={{ width: `${completionRate}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} className="h-full rounded-full bg-gradient-accent" />
            </div>
            <span className={`text-[11px] ${metricHintClass}`}>
              {completedPhases}/{totalPhases || ''} phases
            </span>
          </div>
        </div>

        {user && (
          <div className={`mt-6 rounded-2xl p-4 text-sm ${isDark ? 'bg-white/5 text-white/70' : 'bg-surface-100 text-surface-600'}`}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className={`text-xs uppercase tracking-[0.2em] ${isDark ? 'text-white/40' : 'text-surface-400'}`}>Signed in as</span>
                <span className={`mt-1 font-medium ${isDark ? 'text-white' : 'text-surface-900'}`}>{user.email}</span>
              </div>
              <button
                onClick={logout}
                data-testid="logout-button"
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${isDark ? 'border-white/20 text-white/60 hover:text-white' : 'border-surface-300 text-surface-500 hover:text-surface-900'}`}
              >
                Log out
              </button>
            </div>
          </div>
        )}
      </motion.nav>
    )}
  </AnimatePresence>
)

const ProgressTicker = ({
  tickerTone,
  zynoTicker,
  navBadges,
  badgeChipBase,
}: {
  readonly tickerTone: string
  readonly zynoTicker: string
  readonly navBadges: { id: string; label: string; value: string; icon: LucideIcon }[]
  readonly badgeChipBase: string
}) => (
  <div className={`hidden items-center justify-between gap-4 rounded-2xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] ${tickerTone} lg:flex`}>
    <div className="flex items-center gap-2 text-[11px]">
      <Sparkles size={14} className="text-accent-cyan" aria-hidden="true" />
      <span className="tracking-normal">{zynoTicker}</span>
    </div>
    <div className="flex items-center gap-2">
      {navBadges.map((badge) => {
        const Icon = badge.icon
        return (
          <span key={badge.id} className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] tracking-normal ${badgeChipBase}`}>
            <Icon size={12} aria-hidden="true" />
            <span className="font-medium">{badge.value}</span>
          </span>
        )
      })}
    </div>
  </div>
)

/* 
 * Updated setRunModePersisted to handle authenticating/switching modes explicitly.
 * This ensures "Demo" logs you in as demo, and "Real" requires real login.
 */
const MainNavigation = ({ enableWallet = false }: MainNavigationProps) => {
  const { isDark, toggleTheme } = useThemeStore()
  const { logout, user, loginAsDemo, isAuthenticated } = useAuth()
  const { selectedPersona, userProgress } = useJourneyStoreShallow((state) => ({
    selectedPersona: state.selectedPersona,
    userProgress: state.userProgress,
  }))
  const { runMode, setRunMode } = useRunModeStore((state) => ({ runMode: state.runMode, setRunMode: state.setRunMode }))
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  // 🛡️ runMode hydration is handled by journeyStore persist middleware
  // No need for duplicate hydration logic here
  const headerRef = useRef<HTMLElement | null>(null)
  const moreRef = useRef<HTMLDivElement | null>(null)

  /* 
   * Updated setRunModePersisted to handle authenticating/switching modes explicitly.
   * This ensures "Demo" logs you in as demo, and "Real" requires real login.
   */

  const totalPhases = selectedPersona?.phases?.length ?? 0
  const completedPhases = userProgress.completedPhases?.length ?? 0
  const completionRate = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0
  const level = useMemo(() => Math.max(1, Math.floor(userProgress.totalXP / 200) + 1), [userProgress.totalXP])

  const passBadgeStyles = useMemo(() => {
    switch (userProgress.passLevel) {
      case 'Diamond': return 'bg-gradient-accent text-white shadow-glow';
      case 'Platinum': return 'bg-white/10 text-white border border-white/20';
      case 'Gold': return 'bg-warning/15 text-warning border border-warning/30';
      default: return 'bg-white/5 text-white/80 border border-white/10';
    }
  }, [userProgress.passLevel])

  const metrics = useMemo(
    () => [
      { id: 'xp', label: 'Skillchain XP', value: userProgress.totalXP, hint: `Level ${level}`, icon: GaugeCircle },
      { id: 'mfai', label: '$MFAI Balance', value: userProgress.mfaiTokens, hint: userProgress.stakedMfai > 0 ? `${userProgress.stakedMfai.toLocaleString()} staked` : 'Ready to deploy', icon: Gem },
      { id: 'vote', label: 'Voting Power', value: userProgress.votingPower, hint: `${userProgress.daoProposals} proposals`, icon: Gavel },
    ],
    [userProgress.daoProposals, userProgress.mfaiTokens, userProgress.stakedMfai, userProgress.totalXP, userProgress.votingPower, level]
  )

  const navBadges = useMemo(
    () => [
      { id: 'xp', label: 'Skillchain XP', value: `${userProgress.totalXP?.toLocaleString?.() ?? '0'} XP`, icon: GaugeCircle },
      { id: 'mfai', label: '$MFAI', value: userProgress.mfaiTokens?.toLocaleString?.() ?? '0', icon: Gem },
      { id: 'nft', label: 'Proof NFTs', value: (userProgress.nfts?.length ?? 0).toString(), icon: Award },
      { id: 'vote', label: 'Voting Power', value: userProgress.votingPower?.toLocaleString?.() ?? '0', icon: Gavel },
    ],
    [userProgress.mfaiTokens, userProgress.nfts?.length ?? 0, userProgress.totalXP, userProgress.votingPower]
  )

  const headerTone = isDark ? 'border-white/5 bg-background/60 text-white supports-[backdrop-filter]:bg-background/40' : 'border-surface-200/80 bg-white/70 text-surface-900 supports-[backdrop-filter]:bg-white/50'
  const navSoonBadge = isDark ? 'bg-white/10 text-white/70' : 'bg-surface-200 text-surface-600'
  const navDefaultTone = isDark ? 'text-white/70 hover:text-white' : 'text-surface-600 hover:text-surface-900'
  const navDisabledTone = isDark ? 'text-white/40' : 'text-surface-300'
  const navActiveTone = isDark ? 'bg-white/10 text-white shadow-glow' : 'bg-surface-200/80 text-surface-900 shadow-glow'
  const badgeChipBase = isDark ? 'border-white/10 bg-white/10 text-white' : 'border-surface-200 bg-surface-50 text-surface-700'
  const tickerTone = isDark ? 'border-white/10 bg-white/5 text-white/75' : 'border-surface-200/70 bg-white text-surface-600'

  const setRunModePersisted = useCallback(async (mode: 'demo' | 'simulation' | 'real') => {
    setRunMode(mode)

    if (mode === 'demo') {
      if (user?.id !== 'demo-user-id') {
        await loginAsDemo()
        await waitMs(50)
      }
      navigate('/journeys/demo')
      return
    }

    if (mode === 'real') {
      const target = '/journeys'
      const token = resolveCurrentToken()
      if (shouldRequireLogin(token, user, isAuthenticated)) {
        navigateToLogin(navigate, target)
        return
      }
      navigate(target)
      return
    }

    if (!isAuthenticated && user?.id !== 'demo-user-id') {
      await loginAsDemo()
      await waitMs(50)
    }
    navigate('/journeys')
  }, [isAuthenticated, loginAsDemo, navigate, setRunMode, user])

  const metricLabelClass = isDark ? 'text-white/50' : 'text-surface-500'
  const metricValueClass = isDark ? 'text-white' : 'text-surface-900'
  const metricHintClass = isDark ? 'text-white/60' : 'text-surface-500'
  const mutedCaptionClass = isDark ? 'text-white/60' : 'text-surface-500'
  const mobileMenuTone = isDark ? 'border-white/10 bg-background/95 text-white' : 'border-surface-200/80 bg-white/95 text-surface-900'
  const mobileItemDefault = isDark ? 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200 hover:text-surface-900'
  const mobileItemDisabled = isDark ? 'bg-white/5 text-white/40' : 'bg-surface-100 text-surface-300'
  const mobileItemActive = isDark ? 'bg-white/15 text-white' : 'bg-surface-200 text-surface-900'

  const activePhaseTitle = selectedPersona?.phases?.[Math.min(userProgress.completedPhases?.length ?? 0, Math.max((selectedPersona?.phases?.length ?? 1) - 1, 0))]?.title
  const zynoTicker = selectedPersona ? `Zyno says: ${activePhaseTitle || 'Journey ready'}  ${completionRate}% complete` : 'Zyno syncs once you choose a journey.'

  const updateHeaderHeight = useCallback(() => {
    if (!headerRef.current) return
    const { height } = headerRef.current.getBoundingClientRect()
    document.documentElement.style.setProperty('--header-height', `${Math.ceil(height)}px`)
  }, [])

  useLayoutEffect(() => {
    updateHeaderHeight()
    const handleResize = () => updateHeaderHeight()
    globalThis.window.addEventListener('resize', handleResize)
    let observer: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => updateHeaderHeight())
      if (headerRef.current) observer.observe(headerRef.current)
    }
    return () => {
      globalThis.window.removeEventListener('resize', handleResize)
      observer?.disconnect()
    }
  }, [updateHeaderHeight])

  useLayoutEffect(() => {
    updateHeaderHeight()
  }, [isMobileMenuOpen, updateHeaderHeight])

  const handleNavigate = (item: NavItem) => {
    if (item.disabled) {
      setIsMobileMenuOpen(false)
      return
    }
    if (item.external) {
      globalThis.window.open(item.external, '_blank', 'noopener')
    } else {
      navigate(item.href)
    }
    setIsMobileMenuOpen(false)
    setIsMoreOpen(false)
  }

  useEffect(() => {
    if (!isMoreOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMoreOpen(false)
    }
    const onPointerDown = (e: MouseEvent | PointerEvent) => {
      const target = e.target as Node | null
      if (!target || !moreRef.current) return
      if (!moreRef.current.contains(target)) setIsMoreOpen(false)
    }
    globalThis.window.addEventListener('keydown', onKeyDown)
    globalThis.window.addEventListener('pointerdown', onPointerDown)
    return () => {
      globalThis.window.removeEventListener('keydown', onKeyDown)
      globalThis.window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [isMoreOpen])

  return (
    <motion.header
      ref={headerRef}
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl shadow-2xl ${headerTone}`}
      role="banner"
    >
      <div className="flex w-full flex-col gap-3 px-2 py-3 sm:px-3 lg:px-4">
        <RunModeSelector runMode={runMode} setRunModePersisted={setRunModePersisted} isDark={isDark} />

        <div className="flex items-center justify-between gap-3">
          <BrandButton navigate={navigate} mutedCaptionClass={mutedCaptionClass} />

          {runMode === 'demo' && (
            <span
              className="rounded-full border border-red-300/60 bg-red-600/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-glow"
              aria-label="Demo mode actif"
            >
              DEMO MODE
            </span>
          )}

          <DesktopNav
            location={location}
            handleNavigate={handleNavigate}
            navActiveTone={navActiveTone}
            navDefaultTone={navDefaultTone}
            navDisabledTone={navDisabledTone}
            navSoonBadge={navSoonBadge}
            mobileMenuTone={mobileMenuTone}
            isMoreOpen={isMoreOpen}
            setIsMoreOpen={setIsMoreOpen}
            moreRef={moreRef}
          />

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex">
              <UserMetricsPanel />
            </div>

            {enableWallet ? (
              <WalletButton />
            ) : null}

            <UserAuthButtons user={user} navigate={navigate} logout={logout} />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className={`rounded-full border p-2 transition-colors ${isDark ? 'border-white/10 text-white' : 'border-surface-200 text-surface-600 hover:text-surface-900'}`}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className={`inline-flex rounded-full border p-2 lg:hidden ${isDark ? 'border-white/10 text-white' : 'border-surface-200 text-surface-600'}`}
              aria-label={isMobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </div>
        </div>

        <ProgressTicker tickerTone={tickerTone} zynoTicker={zynoTicker} navBadges={navBadges} badgeChipBase={badgeChipBase} />

        <MobileStatsBlock
          completionRate={completionRate}
          userProgress={userProgress}
          passBadgeStyles={passBadgeStyles}
          mutedCaptionClass={mutedCaptionClass}
          metricLabelClass={metricLabelClass}
          metricHintClass={metricHintClass}
        />
      </div>

      <MobileMenu
        isMobileMenuOpen={isMobileMenuOpen}
        location={location}
        handleNavigate={handleNavigate}
        navItems={NAV_ITEMS}
        moreItems={MORE_ITEMS}
        navActiveTone={navActiveTone}
        navDefaultTone={navDefaultTone}
        navDisabledTone={navDisabledTone}
        navSoonBadge={navSoonBadge}
        mobileMenuTone={mobileMenuTone}
        mobileItemActive={mobileItemActive}
        mobileItemDisabled={mobileItemDisabled}
        mobileItemDefault={mobileItemDefault}
        metrics={metrics}
        metricLabelClass={metricLabelClass}
        metricValueClass={metricValueClass}
        metricHintClass={metricHintClass}
        completionRate={completionRate}
        completedPhases={completedPhases}
        totalPhases={totalPhases}
        isDark={isDark}
        user={user}
        logout={logout}
        navigate={navigate}

      />
    </motion.header>
  )
}

export default MainNavigation
