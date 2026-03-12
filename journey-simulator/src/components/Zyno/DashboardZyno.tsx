/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { useMemo } from 'react';
import { motion, useReducedMotion, cubicBezier } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  GaugeCircle,
  Trophy,
  Coins,
  Flame,
  TrendingUp,
  CalendarDays,
  ArrowRight,
  Target,
} from 'lucide-react';
import { useJourneyStore } from '../../store/journeyStore';
import type { MissionSummary } from './MissionFeedbackSummary';
import { AEPO, AECO } from '../../content/aepoAeco';

interface DashboardZynoProps {
  missionSummary?: MissionSummary | null;
}

const cardEase = cubicBezier(0.23, 1, 0.32, 1);

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.08, duration: 0.45, ease: cardEase },
  }),
};

const quickActions = [
  {
    title: 'Relaunch a mission',
    description: 'Identify the next strategic step and send it to Zyno.',
    icon: Flame,
    href: '#zyno-console',
  },
  {
    title: 'Export to Notion',
    description: 'Centralize your AEPO (pathway) and AECO (cohort) signals in your knowledge base.',
    icon: TrendingUp,
    href: '#zyno-console',
  },
  {
    title: 'Prepare DAO Vote',
    description: 'Configure quorum, voting weights, and expected results.',
    icon: Target,
    href: '#zyno-console',
  },
];

const DashboardZyno = ({ missionSummary }: DashboardZynoProps) => {
  const { userProgress, selectedPersona } = useJourneyStore();
  const shouldReduceMotion = useReducedMotion();

  const personaPhases = selectedPersona?.phases ?? [];
  const totalPhases = personaPhases.length;
  const completedCount = userProgress.completedPhases.length;
  const completionRate = totalPhases > 0 ? Math.round((completedCount / totalPhases) * 100) : 0;
  const nextPhase = personaPhases[Math.min(completedCount, Math.max(totalPhases - 1, 0))];

  const stats = useMemo(
    () => [
      {
        label: 'Total XP',
        value: userProgress.totalXP.toLocaleString(),
        icon: Trophy,
        tone: 'text-accent',
      },
      {
        label: '$MFAI Balance',
        value: userProgress.mfaiTokens.toLocaleString(),
        icon: Coins,
        tone: 'text-ink-50',
      },
      {
        label: 'AEPO Score',
        value: missionSummary?.aepoScore ?? '',
        icon: GaugeCircle,
        tone: 'text-success',
      },
      {
        label: 'Active Agents',
        value: missionSummary?.agents?.length ?? 0,
        icon: Flame,
        tone: 'text-warning',
      },
    ],
    [missionSummary?.aepoScore, missionSummary?.agents?.length, userProgress.mfaiTokens, userProgress.totalXP],
  );

  const containerInitial = shouldReduceMotion ? false : 'hidden';
  const containerWhileInView = shouldReduceMotion ? undefined : 'visible';
  const containerViewport = shouldReduceMotion ? undefined : { once: true, margin: '-80px' };

  const getStatDescription = (label: string) => {
    if (label === 'AEPO Score') {
      return 'AEPO measures how well your personalized roadmap is orchestrated (signals from missions, progress, and agent outputs).';
    }
    if (label === 'Active Agents') {
      return 'Number of agents solicited during the last mission.';
    }
    if (label === 'Total XP') {
      return 'Cumulative XP via missions, staking, and DAO votes.';
    }
    return 'Current $MFAI balance, excluding staking.';
  };

  const getPhaseCardClass = (isComplete: boolean, isCurrent: boolean) => {
    const base = 'relative flex h-full flex-col gap-3 rounded-2xl border px-5 py-4 text-sm transition-colors duration-300 ';
    if (isComplete) {
      return `${base}border-success/40 bg-success/10 text-success`;
    }
    if (isCurrent) {
      return `${base}border-accent/50 bg-accent/10 text-accent`;
    }
    return `${base}border-white/10 bg-slate-100/5 text-ink-50/75`;
  };

  return (
    <section className="space-y-8">
      <motion.div initial={containerInitial} whileInView={containerWhileInView} viewport={containerViewport} className="grid gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              custom={shouldReduceMotion ? undefined : index}
              variants={shouldReduceMotion ? undefined : cardVariants}
              className="card-surface-layer relative overflow-hidden rounded-3xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-ink-50/60">{stat.label}</p>
                  <p className={`mt-3 text-2xl font-semibold text-ink-50 ${stat.tone ?? ''}`}>{stat.value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100/5 text-accent shadow-inner-glow">
                  <Icon size={20} />
                </div>
              </div>
              <div className="h-px bg-white/10 my-3 mt-4" />
              <p className="mt-3 text-xs text-ink-50/70">
                {getStatDescription(stat.label)}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div initial={containerInitial} whileInView={containerWhileInView} viewport={containerViewport} className="card-surface-layer rounded-3xl p-6 shadow-glass">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-ink-50/60">Journey Progress</p>
            <h3 className="mt-2 text-xl font-semibold text-ink-50 md:text-2xl">
              {selectedPersona?.title ?? 'Select a persona to start your simulation'}
            </h3>
            <p className="mt-2 max-w-2xl text-sm text-ink-50/75">
              Follow key phases orchestrated by Zyno. Each step unlocks resources, guided missions, and
              {' '}
              <span title={AEPO.tooltip} className="cursor-help border-b border-dashed border-slate-300/60 border-white/10">
                AEPO
              </span>
              {' '}
              /
              {' '}
              <span title={AECO.tooltip} className="cursor-help border-b border-dashed border-slate-300/60 border-white/10">
                AECO
              </span>
              {' '}
              signals.
            </p>
          </div>
          <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-slate-100/5 p-4 shadow-inner-glow border-white/10 bg-slate-100/5">
            <div className="flex items-center justify-between text-sm text-ink-50/80">
              <span>{completionRate}% completed</span>
              <span>
                {completedCount}/{totalPhases || ''} phases
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200/70 bg-slate-100Muted">
              <motion.div
                initial={shouldReduceMotion ? undefined : { width: 0 }}
                animate={shouldReduceMotion ? undefined : { width: `${completionRate}%` }}
                style={shouldReduceMotion ? { width: `${completionRate}%` } : undefined}
                transition={shouldReduceMotion ? undefined : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-gradient-accent"
              />
            </div>
            <p className="mt-3 text-xs text-ink-50/65">
              Next phase: {nextPhase?.title ?? 'To be defined'}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {personaPhases.map((phase, index) => {
            const isComplete = userProgress.completedPhases.includes(index);
            const isCurrent = index === completedCount;
            return (
              <motion.div
                key={phase.id}
                custom={shouldReduceMotion ? undefined : index}
                variants={shouldReduceMotion ? undefined : cardVariants}
                className={getPhaseCardClass(isComplete, isCurrent)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-[0.3em] text-ink-50/50">
                    Phase {index + 1}
                  </span>
                  <CalendarDays size={16} className="text-ink-50/60" />
                </div>
                <h4 className="text-base font-semibold text-ink-50">{phase.title}</h4>
                <p className="text-xs text-ink-50/70">{phase.mission}</p>
                <div className="mt-auto flex flex-wrap gap-2 text-xs text-ink-50/60">
                  <span className="rounded-full border border-white/5 px-2 py-0.5">XP {phase.xpReward}</span>
                  {phase.mfaiReward ? (
                    <span className="rounded-full border border-white/5 px-2 py-0.5">$MFAI {phase.mfaiReward}</span>
                  ) : null}
                  {phase.daoVoteRequired && (
                    <span className="rounded-full border border-warning/40 px-2 py-0.5 text-warning">DAO Vote</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div initial={containerInitial} whileInView={containerWhileInView} viewport={containerViewport} className="grid gap-4 md:grid-cols-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.a
              key={action.title}
              href={action.href}
              custom={shouldReduceMotion ? undefined : index}
              variants={shouldReduceMotion ? undefined : cardVariants}
              className={`group relative flex flex-col justify-between gap-4 rounded-3xl border p-6 transition-transform duration-300 hover:border-accent/50 hover:shadow-neon-ring ${shouldReduceMotion ? '' : 'hover:-translate-y-1'
                } border-white/10 bg-slate-100/5 border-white/10 bg-slate-100/5`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100/5 text-accent shadow-inner-glow">
                  <Icon size={18} />
                </div>
                <h4 className="text-base font-semibold text-ink-50">{action.title}</h4>
              </div>
              <p className="text-sm text-ink-50/75">{action.description}</p>
              <span className="mt-auto inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent">
                Access
                <ArrowRight size={14} className={`transition-transform ${shouldReduceMotion ? '' : 'group-hover:translate-x-1'}`} />
              </span>
            </motion.a>
          );
        })}
      </motion.div>
    </section>
  );
};

export default DashboardZyno;
