/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles, Trophy, Coins, Shield, GaugeCircle } from 'lucide-react'
import ResetProgressButton from '../ResetProgressButton'
import { useJourneyStore } from '../../store/journeyStore'
import { deriveJourneySignals } from '../../utils/journeySignals'

interface JourneyOverviewHeaderProps {
  onBack: () => void
}

const personaMessages: Record<string, string> = {
  'cognitive-activation-hub': 'Each completed ritual unlocks sharper decision capitalkeep the cadence steady.',
  'capital-foundry': 'Deal velocity loves clarity. Keep treasury health and launch runway visible to every contributor.',
  'system-architect': 'Blueprints are compasses. Capture each assumption so Guardian Agents can harden it.',
  'experience-studio': 'Design the feeling first, then layer incentives. Momentum follows immersion.',
  'impact-engine': 'Sovereignty needs transparent votes. Anchor each proposal with measurable impact.',
  'resilience-master': 'Stress drills are badges of honor. Practise containment before mainnet pressure arrives.'
}

const JourneyOverviewHeader = ({ onBack }: JourneyOverviewHeaderProps) => {
  const { selectedPersona, userProgress } = useJourneyStore()

  if (!selectedPersona) return null

  const totalPhases = selectedPersona.phases.length
  const completedPhases = userProgress.completedPhases.length
  const completionRate = totalPhases === 0 ? 0 : Math.round((completedPhases / totalPhases) * 100)
  const level = Math.max(1, Math.floor(userProgress.totalXP / 200) + 1)
  const xpToNextLevel = 200 - (userProgress.totalXP % 200 || 200)
  const { aepo, aeco, alignment } = deriveJourneySignals(userProgress, totalPhases)

  const message = personaMessages[selectedPersona.id] ??
    'Every mission feeds your Skillchain. Keep publishing artifacts so Zyno can compound them.'

  const statCards = [
    {
      label: 'Skillchain XP',
      value: userProgress.totalXP.toLocaleString(),
      hint: `Level ${level}  ${xpToNextLevel} XP to next`,
      icon: Trophy,
    },
    {
      label: '$MFAI Balance',
      value: userProgress.mfaiTokens.toLocaleString(),
      hint: userProgress.stakedMfai > 0
        ? `${userProgress.stakedMfai.toLocaleString()} staked`
        : 'Ready to stake',
      icon: Coins,
    },
    {
      label: 'Voting Power',
      value: userProgress.votingPower.toLocaleString(),
      hint: `${userProgress.daoProposals} proposals cast`,
      icon: Shield,
    },
    {
      label: 'Proof-of-Skill',
      value: userProgress.nfts.length.toString(),
      hint: 'Collect rare artifacts',
      icon: Sparkles,
    }
  ]

  const signalCards = [
    { label: 'AEPO Readiness', value: `${aepo}/100`, color: 'text-emerald-400', bar: aepo },
    { label: 'AECO Confidence', value: `${aeco}/100`, color: 'text-sky-400', bar: aeco },
    { label: 'Governance Alignment', value: `${alignment}/100`, color: 'text-fuchsia-400', bar: alignment }
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass-effect rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          data-testid="back-to-journeys"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-accent-cyan hover:text-accent-cyan"
          type="button"
        >
          <ArrowLeft size={16} />
          Back to journeys
        </button>
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
          <span>Active Persona: <span className="text-white/90">{selectedPersona.title}</span></span>
          <span className="hidden sm:inline-flex items-center gap-1 text-accent-cyan">
            <GaugeCircle size={14} /> {completionRate}% complete
          </span>
          <ResetProgressButton />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Zyno says</p>
            <div className="mt-3 rounded-2xl border border-accent-cyan/20 bg-accent-cyan/5 p-4">
              <div className="flex items-center gap-2 text-accent-cyan">
                <Sparkles size={16} />
                <span className="text-sm font-semibold">Stay in flow</span>
              </div>
              <p className="mt-2 text-base text-white/80">{message}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>Journey completion</span>
              <span>{completedPhases}/{totalPhases} phases</span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-white/10" aria-label="Journey completion">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-accent"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {signalCards.map((signal) => (
            <div key={signal.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/60">
                <span>{signal.label}</span>
                <span className={signal.color}>{signal.value}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${signal.bar}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-accent-cyan to-accent-purple"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-2">
                  <Icon size={18} className="text-accent-cyan" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60">{card.label}</p>
                  <p className="text-2xl font-semibold text-white">{card.value}</p>
                  <p className="text-xs text-white/60">{card.hint}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </motion.section>
  )
}

export default JourneyOverviewHeader
