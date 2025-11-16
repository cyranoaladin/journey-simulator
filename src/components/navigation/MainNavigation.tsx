import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  Crown,
  Sparkles,
  Waypoints,
  BrainCircuit,
  Atom,
  Vote,
  LibraryBig,
  LifeBuoy,
  GaugeCircle,
  Gem,
  Gavel
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import WalletButton from '../WalletButton'
import { useThemeStore } from '../../store/themeStore'
import { useAuth } from '../../contexts/AuthContext'
import { useJourneyStore } from '../../store/journeyStore'

type NavItem = {
  label: string
  href: string
  icon: LucideIcon
  badge?: string
  disabled?: boolean
  external?: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/', icon: Sparkles },
  { label: 'Journeys', href: '/journeys', icon: Waypoints },
  { label: 'Zyno Console', href: '/zyno', icon: BrainCircuit, badge: 'Live' },
  { label: 'Playground', href: '/playground', icon: Atom },
  { label: 'DAO', href: '/dao', icon: Vote, badge: 'Beta' },
  { label: 'Resources', href: '/resources', icon: LibraryBig, badge: 'New' },
  { label: 'Help', href: '/support', icon: LifeBuoy, badge: 'Guide' },
]

const MainNavigation = () => {
  const { isDark, toggleTheme } = useThemeStore()
  const { logout, user } = useAuth()
  const { selectedPersona, userProgress } = useJourneyStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement | null>(null)

  const totalPhases = selectedPersona?.phases?.length ?? 0
  const completedPhases = userProgress.completedPhases.length
  const completionRate = totalPhases > 0
    ? Math.round((completedPhases / totalPhases) * 100)
    : 0

  const level = useMemo(
    () => Math.max(1, Math.floor(userProgress.totalXP / 200) + 1),
    [userProgress.totalXP]
  )

  const passBadgeStyles = useMemo(() => {
    switch (userProgress.passLevel) {
      case 'Diamond':
        return 'bg-gradient-accent text-white shadow-glow'
      case 'Platinum':
        return 'bg-white/10 text-white border border-white/20'
      case 'Gold':
        return 'bg-warning/15 text-warning border border-warning/30'
      default:
        return 'bg-white/5 text-white/80 border border-white/10'
    }
  }, [userProgress.passLevel])

  const metrics = useMemo(
    () => [
      {
        id: 'xp',
        label: 'Skillchain XP',
        value: userProgress.totalXP,
        hint: `Level ${level}`,
        icon: GaugeCircle,
      },
      {
        id: 'mfai',
        label: '$MFAI Balance',
        value: userProgress.mfaiTokens,
        hint: userProgress.stakedMfai > 0
          ? `${userProgress.stakedMfai.toLocaleString()} staked`
          : 'Ready to deploy',
        icon: Gem,
      },
      {
        id: 'vote',
        label: 'Voting Power',
        value: userProgress.votingPower,
        hint: `${userProgress.daoProposals} proposals`,
        icon: Gavel,
      },
    ],
    [userProgress.daoProposals, userProgress.mfaiTokens, userProgress.stakedMfai, userProgress.totalXP, userProgress.votingPower, level]
  )

  const headerTone = isDark
    ? 'border-white/10 bg-background/80 text-white'
    : 'border-surface-200/80 bg-white/85 text-surface-900'

  const navSoonBadge = isDark
    ? 'bg-white/10 text-white/70'
    : 'bg-surface-200 text-surface-600'

  const navDefaultTone = isDark
    ? 'text-white/70 hover:text-white'
    : 'text-surface-600 hover:text-surface-900'

  const navDisabledTone = isDark
    ? 'text-white/40'
    : 'text-surface-300'

  const navActiveTone = isDark
    ? 'bg-white/10 text-white shadow-glow'
    : 'bg-surface-200/80 text-surface-900 shadow-glow'

  const metricLabelClass = isDark ? 'text-white/50' : 'text-surface-500'
  const metricValueClass = isDark ? 'text-white' : 'text-surface-900'
  const metricHintClass = isDark ? 'text-white/60' : 'text-surface-500'
  const mutedCaptionClass = isDark ? 'text-white/60' : 'text-surface-500'
  const mobileMenuTone = isDark
    ? 'border-white/10 bg-background/95 text-white'
    : 'border-surface-200/80 bg-white/95 text-surface-900'
  const mobileItemDefault = isDark
    ? 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
    : 'bg-surface-100 text-surface-600 hover:bg-surface-200 hover:text-surface-900'
  const mobileItemDisabled = isDark
    ? 'bg-white/5 text-white/40'
    : 'bg-surface-100 text-surface-300'
  const mobileItemActive = isDark
    ? 'bg-white/15 text-white'
    : 'bg-surface-200 text-surface-900'

  const getBadgeClasses = (badge: string) => {
    switch (badge) {
      case 'Live':
        return 'bg-success/20 text-success'
      case 'Beta':
        return 'bg-warning/20 text-warning'
      case 'New':
        return 'bg-primary-400/20 text-primary-500'
      case 'Guide':
        return 'bg-info/15 text-info'
      default:
        return navSoonBadge
    }
  }

  const updateHeaderHeight = useCallback(() => {
    if (!headerRef.current) return
    const { height } = headerRef.current.getBoundingClientRect()
    document.documentElement.style.setProperty('--header-height', `${Math.ceil(height)}px`)
  }, [])

  useLayoutEffect(() => {
    updateHeaderHeight()
    const handleResize = () => updateHeaderHeight()
    window.addEventListener('resize', handleResize)

    let observer: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => updateHeaderHeight())
      if (headerRef.current) {
        observer.observe(headerRef.current)
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize)
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
      window.open(item.external, '_blank', 'noopener')
    } else {
      navigate(item.href)
    }

    setIsMobileMenuOpen(false)
  }

  return (
    <motion.header
      ref={headerRef}
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-2xl shadow-glass ${headerTone}`}
    >
      <div className="flex w-full flex-col gap-3 px-2 py-3 sm:px-3 lg:px-4">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => handleNavigate(NAV_ITEMS[0])}
            className="flex items-center gap-3 text-left focus:outline-none"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-accent shadow-lg shadow-primary-500/30">
              <img src="/images/logo_mfai.png" alt="MFAI" className="h-8 w-8" />
            </div>
            <div className="flex flex-col">
              <span className="font-space text-lg font-semibold tracking-wide">Money Factory AI</span>
              <span className={`text-xs font-medium uppercase tracking-[0.2em] ${mutedCaptionClass}`}>
                Cognitive Activation Protocol™
              </span>
            </div>
          </button>

          <div className="hidden flex-1 items-center justify-center gap-6 lg:flex">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = !item.disabled && location.pathname === item.href
              return (
                <motion.button
                  key={item.label}
                  whileHover={{ y: -2 }}
                  type="button"
                  onClick={() => handleNavigate(item)}
                  className={`relative flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? navActiveTone
                      : item.disabled
                        ? `${navDisabledTone} cursor-not-allowed`
                        : navDefaultTone
                  }`}
                  disabled={item.disabled}
                >
                  <Icon size={16} className="opacity-80" />
                  {item.label}
                  {item.badge && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getBadgeClasses(item.badge)}`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute -bottom-2 left-1/2 h-0.5 w-10 -translate-x-1/2 rounded-full bg-gradient-accent"
                    />
                  )}
                </motion.button>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 lg:flex">
              <div className="glass-effect flex items-center gap-3 rounded-2xl px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-accent/30 text-accent-neon">
                  <Crown size={18} />
                </div>
                <div className="flex flex-col">
                  <span className={`text-[10px] uppercase tracking-[0.3em] ${mutedCaptionClass}`}>Pass Level</span>
                  <span className={`mt-1 inline-flex items-center self-start rounded-full px-3 py-1 text-xs font-semibold shadow-inner-glow ${passBadgeStyles}`}>
                    {userProgress.passLevel}
                  </span>
                </div>
              </div>

              <ul className="flex flex-wrap items-center gap-3">
                {metrics.map((metric) => {
                  const Icon = metric.icon
                  return (
                    <li
                      key={metric.id}
                      className="glass-effect flex min-w-[160px] flex-col gap-1 rounded-2xl px-4 py-3"
                    >
                      <span className={`flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.3em] ${metricLabelClass}`}>
                        <Icon size={14} className="text-accent-neon" />
                        {metric.label}
                      </span>
                      <span className={`font-mono text-sm ${metricValueClass}`}>
                        {metric.value.toLocaleString()}
                      </span>
                      <span className={`text-[11px] ${metricHintClass}`}>
                        {metric.hint}
                      </span>
                    </li>
                  )
                })}
                <li className="glass-effect flex min-w-[160px] flex-col gap-2 rounded-2xl px-4 py-3">
                  <div className={`flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.3em] ${metricLabelClass}`}>
                    <span>Journey</span>
                    <span>{completionRate}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <motion.div
                      initial={false}
                      animate={{ width: `${completionRate}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-accent"
                    />
                  </div>
                  <span className={`text-[11px] ${metricHintClass}`}>
                    {completedPhases}/{totalPhases || '—'} phases
                  </span>
                </li>
              </ul>
            </div>

            <WalletButton />

            {user && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className={`hidden rounded-full border p-2 transition-colors lg:inline-flex ${
                  isDark
                    ? 'border-white/10 text-white/70 hover:text-white'
                    : 'border-surface-200 text-surface-500 hover:text-surface-900'
                }`}
                aria-label="Log out"
              >
                <LogOut size={18} />
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className={`rounded-full border p-2 transition-colors ${
                isDark
                  ? 'border-white/10 text-white'
                  : 'border-surface-200 text-surface-600 hover:text-surface-900'
              }`}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className={`inline-flex rounded-full border p-2 lg:hidden ${
                isDark
                  ? 'border-white/10 text-white'
                  : 'border-surface-200 text-surface-600'
              }`}
              aria-label={isMobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 lg:hidden">
          <div className="glass-effect flex items-center gap-3 rounded-2xl px-4 py-3">
            <Crown size={16} className="text-accent-neon" />
            <div className="flex flex-col">
              <span className={`text-[10px] uppercase tracking-[0.2em] ${mutedCaptionClass}`}>Pass Level</span>
              <span className={`mt-1 inline-flex items-center self-start rounded-full px-2 py-0.5 text-xs font-semibold ${passBadgeStyles}`}>
                {userProgress.passLevel}
              </span>
            </div>
          </div>

          <div className="flex w-36 flex-col gap-1">
            <span className={`text-[10px] uppercase tracking-[0.2em] ${metricLabelClass}`}>Journey</span>
            <div className="h-2 rounded-full bg-white/10">
              <motion.div
                initial={false}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-accent"
              />
            </div>
            <span className={`text-[11px] ${metricHintClass}`}>{completionRate}% complete</span>
          </div>
        </div>
      </div>

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
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = !item.disabled && location.pathname === item.href
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleNavigate(item)}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                      isActive
                        ? mobileItemActive
                        : item.disabled
                          ? mobileItemDisabled
                          : mobileItemDefault
                    }`}
                    disabled={item.disabled}
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={18} />
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getBadgeClasses(item.badge)}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
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
                  <motion.div
                    initial={false}
                    animate={{ width: `${completionRate}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-accent"
                  />
                </div>
                <span className={`text-[11px] ${metricHintClass}`}>
                  {completedPhases}/{totalPhases || '—'} phases
                </span>
              </div>
            </div>

            {user && (
              <div className={`mt-6 rounded-2xl p-4 text-sm ${
                isDark ? 'bg-white/5 text-white/70' : 'bg-surface-100 text-surface-600'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className={`text-xs uppercase tracking-[0.2em] ${isDark ? 'text-white/40' : 'text-surface-400'}`}>Signed in as</span>
                    <span className={`mt-1 font-medium ${isDark ? 'text-white' : 'text-surface-900'}`}>{user.email}</span>
                  </div>
                  <button
                    onClick={logout}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
                      isDark
                        ? 'border-white/20 text-white/60 hover:text-white'
                        : 'border-surface-300 text-surface-500 hover:text-surface-900'
                    }`}
                  >
                    Log out
                  </button>
                </div>
              </div>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

export default MainNavigation
