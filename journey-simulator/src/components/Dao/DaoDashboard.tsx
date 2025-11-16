import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Gavel,
  Loader2,
  ShieldCheck,
  Sparkles,
  Users
} from 'lucide-react'
import { api, DaoConfigResponse, DaoProposal } from '../../utils/api'
import { useJourneyStore } from '../../store/journeyStore'
import ZynoDAOAdminPanel from '../Zyno/ZynoDAOAdminPanel'
import { AgentScoreboardProvider } from '../Zyno/AgentScoreboardContext'

const formatRelativeTime = (isoString: string) => {
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  const diff = date.getTime() - Date.now()
  const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' })
  const absolute = Math.abs(diff)

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day

  if (absolute < hour) {
    return rtf.format(Math.round(diff / minute), 'minute')
  }
  if (absolute < day) {
    return rtf.format(Math.round(diff / hour), 'hour')
  }
  if (absolute < week) {
    return rtf.format(Math.round(diff / day), 'day')
  }
  return rtf.format(Math.round(diff / week), 'week')
}

const statusStyles: Record<DaoProposal['status'], string> = {
  active: 'bg-success/15 text-success border border-success/30',
  closed: 'bg-surface-200/60 text-surface-800 border border-surface-300/60 dark:bg-white/5 dark:text-white/70 dark:border-white/10'
}

const outcomeCopy: Record<string, string> = {
  accepted: 'Adoptée — mise en oeuvre recommandée',
  rejected: 'Rejetée — à réviser',
  quorum_failed: 'Quorum non atteint'
}

const DaoDashboard = () => {
  const { userProgress } = useJourneyStore()
  const [config, setConfig] = useState<DaoConfigResponse | null>(null)
  const [proposals, setProposals] = useState<DaoProposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAdminPanel, setShowAdminPanel] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadDaoSnapshot = async () => {
      setLoading(true)
      setError(null)
      try {
        const [daoConfig, daoProposals] = await Promise.all([
          api.getDaoConfig(),
          api.getDaoProposals()
        ])

        if (!mounted) {
          return
        }

        setConfig(daoConfig)
        setProposals(daoProposals.proposals)
      } catch (err) {
        if (!mounted) {
          return
        }
        console.error('Unable to load DAO data', err)
        setError(err instanceof Error ? err.message : 'Chargement DAO impossible')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadDaoSnapshot()

    return () => {
      mounted = false
    }
  }, [])

  const participationRate = useMemo(() => {
    if (!config || proposals.length === 0) {
      return 0
    }

    const totalVotes = proposals.reduce((acc, proposal) => {
      return acc + proposal.votes.yes + proposal.votes.no
    }, 0)

    if (!config.totalVotingPower) {
      return 0
    }

    return Math.min(100, Math.round((totalVotes / config.totalVotingPower) * 100))
  }, [config, proposals])

  const activeProposals = useMemo(
    () => proposals.filter((proposal) => proposal.status === 'active'),
    [proposals]
  )

  const metrics = useMemo(() => [
    {
      id: 'voting-power',
      label: 'Voting Power',
      value: userProgress.votingPower,
      hint: userProgress.stakedMfai > 0
        ? `${userProgress.stakedMfai.toLocaleString()} MFAI stakés`
        : 'Booste-le via staking',
      icon: ShieldCheck
    },
    {
      id: 'dao-proposals',
      label: 'Votes effectués',
      value: userProgress.daoProposals,
      hint: activeProposals.length > 0
        ? `${activeProposals.length} propositions actives`
        : 'Reste informé des prochains votes',
      icon: ClipboardList
    },
    {
      id: 'participation',
      label: 'Participation réseau',
      value: participationRate,
      suffix: '%',
      hint: config
        ? `${config.quorumPercent}% de quorum requis`
        : 'Chargement du quorum…',
      icon: Users
    },
    {
      id: 'mfai',
      label: 'Solde $MFAI',
      value: userProgress.mfaiTokens,
      hint: userProgress.mfaiTokens > 0 ? 'Prêt à être déployé' : 'Alimente ton trésor',
      icon: BarChart3
    }
  ], [activeProposals.length, config, participationRate, userProgress.daoProposals, userProgress.mfaiTokens, userProgress.stakedMfai, userProgress.votingPower])

  return (
    <AgentScoreboardProvider>
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 lg:px-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-primary-500/20 via-primary-500/10 to-primary-500/5 p-8 shadow-glass"
      >
        <div className="absolute -right-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
              <ShieldCheck size={14} />
              Money Factory Governance
            </span>
            <h1 className="text-3xl font-semibold text-white lg:text-4xl">
              Consolide ton influence dans la DAO Zyno
            </h1>
            <p className="text-sm text-white/75 lg:text-base">
              Suis l&apos;activité du protocole, vote sur les propositions critiques et
              assure-toi que le futur de MFAI reste aligné avec les builders et la trésorerie communautaire.
            </p>
            {config && (
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/75">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1">
                  <Users size={14} />
                  {config.voters.length} électeurs pondérés
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1">
                  <Gavel size={14} />
                  Quorum global {config.quorumPercent}%
                </div>
              </div>
            )}
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="glass-effect flex max-w-sm flex-col gap-3 rounded-2xl border border-white/10 bg-white/10 p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-white/70">Engagement</span>
              <Sparkles size={18} className="text-accent-neon" />
            </div>
            <div className="text-4xl font-semibold tracking-tight">
              {participationRate}%
            </div>
            <p className="text-sm text-white/75">
              Participation réseau sur les {proposals.length} dernières propositions.
            </p>
            <button
              type="button"
              onClick={() => setShowAdminPanel((prev) => !prev)}
              className="inline-flex items-center justify-between rounded-2xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/25"
            >
              Ouvrir la console admin
              {showAdminPanel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </motion.div>
        </div>
      </motion.div>

      <section className="grid gap-4 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <motion.article
              key={metric.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.35 }}
              className="glass-effect flex flex-col gap-2 rounded-2xl border border-white/5 p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                  {metric.label}
                </span>
                <Icon size={18} className="text-accent-neon" />
              </div>
              <div className="text-2xl font-semibold text-white">
                {metric.value.toLocaleString()} {metric.suffix ?? ''}
              </div>
              <p className="text-xs text-white/60">{metric.hint}</p>
            </motion.article>
          )
        })}
      </section>

      <section className="space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">Propositions de gouvernance</h2>
            <p className="text-sm text-white/60">
              Analyse les signaux stratégiques et vote quand ton influence peut faire basculer le quorum.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
            <BarChart3 size={14} />
            {activeProposals.length} actives
          </div>
        </header>

        {loading && (
          <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white/70">
            <Loader2 size={18} className="animate-spin" />
            Synchronisation des décisions communautaires…
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {!loading && !error && proposals.length === 0 && (
          <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-6 text-center text-sm text-white/70">
            Aucune proposition récente. Reste en veille, les prochaines missions de gouvernance arrivent.
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          {proposals.map((proposal) => {
            const totalVotes = proposal.votes.yes + proposal.votes.no
            const yesRatio = totalVotes > 0 ? Math.round((proposal.votes.yes / totalVotes) * 100) : 0
            const statusClass = statusStyles[proposal.status]
            const outcomeLabel = proposal.outcome ? outcomeCopy[proposal.outcome] ?? proposal.outcome : null

            return (
              <motion.article
                key={proposal.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.35 }}
                className="flex h-full flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <header className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] ${statusClass}`}>
                      {proposal.status === 'active' ? 'Active' : 'Clôturée'}
                    </span>
                    <span className="text-xs text-white/50">
                      Lancée {formatRelativeTime(proposal.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{proposal.title}</h3>
                  {proposal.description && (
                    <p className="text-sm text-white/70">{proposal.description}</p>
                  )}
                </header>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-white/70">
                    <span>Votes pour</span>
                    <span className="font-semibold text-success">{proposal.votes.yes.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${yesRatio}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-accent"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-white/70">
                    <span>Votes contre</span>
                    <span className="font-semibold text-red-400">{proposal.votes.no.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-white/50">
                    Quorum {proposal.quorumMet ? 'atteint' : 'en cours'} • Total {totalVotes.toLocaleString()} voix
                  </div>
                </div>

                <footer className="flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
                    <CheckCircle2 size={14} />
                    {outcomeLabel ?? 'En vote'}
                  </span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/20"
                  >
                    Voir les détails
                    <ArrowRight size={14} />
                  </button>
                </footer>
              </motion.article>
            )
          })}
        </div>
      </section>

      <AnimatePresence initial={false}>
        {showAdminPanel && (
          <motion.section
            key="dao-admin"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Console avancée</h2>
                <p className="text-sm text-white/60">
                  Gestion complète des propositions, votes pondérés et clôtures manuelles.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminPanel(false)}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:border-white/40 hover:text-white"
              >
                Réduire
                <ChevronUp size={14} />
              </button>
            </div>
            <ZynoDAOAdminPanel />
          </motion.section>
        )}
      </AnimatePresence>
      </section>
    </AgentScoreboardProvider>
  )
}

export default DaoDashboard
