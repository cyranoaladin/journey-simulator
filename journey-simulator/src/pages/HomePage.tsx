/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, GaugeCircle, Trophy } from 'lucide-react'
import missionFlowIcon from '@/assets/svg/mission-flow.svg'
import multiAgentsIcon from '@/assets/svg/multi-agents.svg'
import feedbackStarsIcon from '@/assets/svg/feedback-stars.svg'
import daoLaunchpadIcon from '@/assets/svg/dao-launchpad.svg'
import zynoReactions, { type ZynoPhaseKey } from '@/data/zynoReactions'
import Button from '@/components/shared/Button'
import MainNavigation from '@/components/navigation/MainNavigation'
import { AECO, AEPO } from '@/content/aepoAeco'

const featureCards = [
  {
    title: 'Mission Flow Charts',
    description: 'Plot every phase from concept to shipping with dependency maps, speed indicators, and on-chain readiness checkpoints.',
    icon: missionFlowIcon,
    accent: 'from-indigo-500/40 via-purple-500/40 to-blue-500/40'
  },
  {
    title: 'Agent Collective',
    description: 'Builder, Growth, and Treasury agents synchronize research, planning, and community pulses to maintain launch velocity.',
    icon: multiAgentsIcon,
    accent: 'from-blue-500/40 via-cyan-500/40 to-purple-500/40'
  },
  {
    title: 'AEPO / AECO Telemetry',
    description: 'Strategic AI orchestration scores every milestone, with AECO distributing staking incentives for quality execution.',
    icon: feedbackStarsIcon,
    accent: 'from-purple-500/40 via-violet-500/40 to-amber-400/40'
  },
  {
    title: 'DAO Launchpad',
    description: 'Spin up governance, token design, and treasury flows ready for token generation events and liquidity provisioning.',
    icon: daoLaunchpadIcon,
    accent: 'from-blue-500/40 via-indigo-500/40 to-fuchsia-500/40'
  }
] as const

const heroHighlights = [
  {
    icon: Sparkles,
    title: 'Protocol-Grade Launches',
    description: 'Simulate token drops, liquidity funnels, and DAO governance on Solana rails.'
  },
  {
    icon: GaugeCircle,
    title: 'AEPO Strategizes',
    description: 'AI-Enhanced Pathway Orchestration generates and updates your personalized roadmap.'
  },
  {
    icon: Trophy,
    title: 'AECO Rewards',
    description: 'AI-Enhanced Cohort Orchestration coordinates group programs and shared milestones.'
  }
] as const

const phases: { key: ZynoPhaseKey; label: string }[] = [
  { key: 'ideation', label: 'Ideation' },
  { key: 'validation', label: 'Validation' },
  { key: 'launch', label: 'Launch' },
  { key: 'growth', label: 'Growth' }
]

const phaseDescriptions: Record<ZynoPhaseKey, string> = {
  ideation: 'Your vision receives its first on-chain pulse.',
  validation: 'We stress-test the signal against Solana market noise.',
  launch: 'Communities align. Treasury ignition sequences are armed.',
  growth: 'Staking loops compounding. Liquidity engines stay online.'
}

const heroTitleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 }
}

const quoteVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
}

const AnimatedBackground = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div
      className="absolute inset-[-35%] rounded-full opacity-50 blur-3xl motion-safe:animate-[spin_60s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,rgba(34,211,238,0.2),rgba(114,9,183,0.35),rgba(14,165,233,0.3),transparent)]"
      aria-hidden="true"
    />
    <div className="absolute inset-0 bg-gradient-to-b from-void via-slate-50/20 to-void opacity-90" aria-hidden="true" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(67,97,238,0.35),transparent_65%)] opacity-80" aria-hidden="true" />
  </div>
)

const HomePage = () => {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const navigate = useNavigate()
  const activePhase = phases[phaseIndex]
  const reaction = zynoReactions[activePhase.key]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % phases.length)
    }, 7000)

    return () => window.clearInterval(timer)
  }, [])

  const phaseBadges = useMemo(
    () => phases.map((phase) => phase.label),
    []
  )

  const scrollToJourneys = useCallback(() => {
    const section = document.getElementById('journeys')
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-void text-white">
      <AnimatedBackground />

      <MainNavigation enableWallet={false} />

      <main className="relative z-10 flex flex-col gap-24 pb-24 pt-[calc(var(--header-height,4rem)+1.5rem)]">
        <section id="hero" className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pt-24 sm:px-6 lg:px-12 lg:flex-row lg:items-center">
          <div className="relative z-10 max-w-3xl space-y-8">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={heroTitleVariants}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-white/70"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-white/80">
                <span className="flex h-2 w-2 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-green-400" />
                Solana Powered
              </span>
              <span className="hidden text-white/60 sm:inline">Internet Capital Markets  Coordinated by AI</span>
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={heroTitleVariants}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl font-extrabold leading-tight text-white sm:text-6xl"
            >
              Launch Like a Protocol.
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={heroTitleVariants}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-xl text-lg text-white/80"
            >
              Build, simulate, and deploy Web3 businesses on Solana while{' '}
              <abbr title={AEPO.tooltip} className="cursor-help border-b border-dashed border-white/30 text-white">
                AEPO
              </abbr>{' '}
              orchestrates your pathway and{' '}
              <abbr title={AECO.tooltip} className="cursor-help border-b border-dashed border-white/30 text-white">
                AECO
              </abbr>{' '}
              coordinates cohort execution.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={heroTitleVariants}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col gap-4 sm:flex-row"
            >
              <Button size="lg" className="w-full sm:w-auto" onClick={() => navigate('/register')}>
                Start Launch Sequence
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
                onClick={scrollToJourneys}
              >
                Explore Launch Modules
              </Button>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={heroTitleVariants}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="rounded-3xl border border-white/10 bg-white/5/70 p-5 backdrop-blur-xl"
            >
              <div className="grid gap-4 sm:grid-cols-3">
                {heroHighlights.map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.title}
                      className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 shadow-inner shadow-indigo-500/10"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 text-white">
                        <Icon size={18} />
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="text-xs leading-relaxed text-white/70">{item.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={heroTitleVariants}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col gap-2 text-xs text-white/60 sm:flex-row sm:items-center sm:gap-6"
            >
              <span className="font-medium uppercase tracking-[0.3em] text-white/50">
                <abbr title={AEPO.tooltip} className="cursor-help border-b border-dashed border-white/30 text-white/70 hover:text-white">
                  AEPO
                </abbr>{' '}
                directs.{' '}
                <abbr title={AECO.tooltip} className="cursor-help border-b border-dashed border-white/30 text-white/70 hover:text-white">
                  AECO
                </abbr>{' '}
                coordinates. You build.
              </span>
              <span>
                Wallet-ready staking loops, contributor reputation, and DAO readiness tracked in real time.
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative ml-auto flex w-full max-w-md flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-3xl"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-indigo-500/10 to-purple-500/10 blur-3xl" aria-hidden="true" />
            <div className="relative z-10 space-y-4 text-sm text-white/80">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-white/50">
                <span>Mission control  Solana devnet/testnet</span>
                <span>DAO readiness 76%</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-50/80 p-5">
                <span className="text-xs font-semibold uppercase tracking-[0.4em] text-white/40">
                  <abbr title={AECO.tooltip} className="cursor-help border-b border-dashed border-white/30">
                    AECO
                  </abbr>{' '}
                  Execution Signal
                </span>
                <p className="mt-3 text-3xl font-bold text-white">92.8</p>
                <p className="mt-3 text-sm text-white/70">Reward window open; contributor staking yields boosted for flawless completion signals.</p>
                <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/40">AECO feeds treasury and reputation oracles.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-slate-50/80 p-4">
                  <p className="text-xs text-white/50">Builder Agent</p>
                  <p className="mt-2 text-xl font-semibold text-white">Calibrating sprint map</p>
                  <p className="text-xs text-white/40">Next sync: backlog finalization</p>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/30">
                    <abbr title={AEPO.tooltip} className="cursor-help border-b border-dashed border-white/30">
                      AEPO
                    </abbr>{' '}
                    directive
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-50/80 p-4">
                  <p className="text-xs text-white/50">Growth Agent</p>
                  <p className="mt-2 text-xl font-semibold text-white">Deploying market loops</p>
                  <p className="text-xs text-white/40">Channels: Solana DeFi, creator hubs</p>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/30">
                    <abbr title={AEPO.tooltip} className="cursor-help border-b border-dashed border-white/30">
                      AEPO
                    </abbr>{' '}
                    directive
                  </p>
                </div>
              </div>
              <div className="space-y-2 rounded-2xl border border-white/10 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
                  <span>Mission timeline</span>
                  <span>T-08 days</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" />
                </div>
                <p className="text-xs text-white/50">DAO launch kit, liquidity simulations, and community staking are in flight.</p>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">
                  <abbr title={AECO.tooltip} className="cursor-help border-b border-dashed border-white/30">
                    AECO
                  </abbr>{' '}
                  telemetry stable
                </p>
              </div>
              <Button variant="secondary" className="w-full" onClick={() => navigate('/zyno')}>
                Open Command Console
              </Button>
            </div>
          </motion.div>
        </section>

        <section id="journeys" className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-12">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={heroTitleVariants}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-white sm:text-4xl"
          >
            Journey Intelligence Stack
          </motion.h2>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={heroTitleVariants}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 max-w-2xl text-white/70"
          >
            Every module is orchestrated by AEPO so operations, capital, and community stay synchronized across your Solana launch.
          </motion.p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {featureCards.map((card, index) => (
              <motion.article
                key={card.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={cardVariants}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition-transform hover:-translate-y-1 hover:border-white/20`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} aria-hidden="true" />
                <div className="relative z-10 flex flex-col gap-4">
                  <img src={card.icon} alt="" className="h-14 w-14" />
                  <h3 className="text-xl font-semibold text-white">{card.title}</h3>
                  <p className="text-white/70">{card.description}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="console" className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-12">
          <div className="rounded-3xl border border-white/10 bg-slate-50/80 p-8 shadow-2xl shadow-surface-lg">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
              <div className="flex-1 space-y-6">
                <motion.h3
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={heroTitleVariants}
                  transition={{ duration: 0.5 }}
                  className="text-3xl font-bold text-white"
                >
                  Zyno Mission Control Feed
                </motion.h3>
                <p className="text-white/70">
                  Zyno surfaces live intent signals, composable RAG intel, and AEPO directives as you progress from ideation to growth.
                </p>
                <div className="flex flex-wrap gap-3">
                  {phaseBadges.map((label, index) => {
                    const isActive = index === phaseIndex
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setPhaseIndex(index)}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${isActive
                            ? 'border-white/40 bg-white/15 text-white'
                            : 'border-white/10 bg-transparent text-white/60 hover:border-white/30 hover:text-white'
                          }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="relative flex-1">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-blue-500/20 blur-3xl" aria-hidden="true" />
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-50/80 p-6">
                  <AnimatePresence mode="wait">
                    <motion.blockquote
                      key={activePhase.key}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, y: -12 }}
                      variants={quoteVariants}
                      transition={{ duration: 0.4 }}
                      className="space-y-4 text-white/80"
                    >
                      <p className="text-lg leading-relaxed">{reaction}</p>
                      <p className="text-xs uppercase tracking-[0.3em] text-white/40">Phase cue  {phaseDescriptions[activePhase.key]}</p>
                      <footer className="text-sm uppercase tracking-[0.3em] text-white/40">Mission Phase  {activePhase.label}</footer>
                    </motion.blockquote>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="playground" className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-4 text-center sm:px-6 lg:px-12">
          <motion.h3
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={heroTitleVariants}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-white"
          >
            Internet Capital Markets, On Demand
          </motion.h3>
          <p className="max-w-2xl text-lg text-white/70">
            Graduate from simulation to live liquidity with staking funnels, tokenomics orchestration, and governance automation wired to Solanas high-performance rails.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto" onClick={() => navigate('/journeys')}>
              Open Incubation Flightpath
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => navigate('/dao')}
            >
              Activate Governance Stack
            </Button>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-void/80 py-10 text-center text-sm text-white/50">
        <p className="font-semibold uppercase tracking-[0.3em] text-white/40">Internet Capital Markets for builders. Powered by Solana. Coordinated by AI.</p>
        <p className="mt-3">Money Factory AI Journey Simulator  {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}

export default HomePage
