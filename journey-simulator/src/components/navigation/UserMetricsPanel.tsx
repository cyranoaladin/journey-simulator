/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { motion } from 'framer-motion';
import { Crown, GaugeCircle, Gem, Gavel } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useJourneyStoreShallow } from '../../store/journeyStore';

interface Metric {
  id: string;
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
}

const UserMetricsPanel = () => {
  const { isDark } = useThemeStore();
  const { selectedPersona, userProgress } = useJourneyStoreShallow((state) => ({
    selectedPersona: state.selectedPersona,
    userProgress: state.userProgress,
  }));

  const totalXP = userProgress?.totalXP ?? 0;
  const mfaiTokens = userProgress?.mfaiTokens ?? 0;
  const stakedMfai = userProgress?.stakedMfai ?? 0;
  const votingPower = userProgress?.votingPower ?? 0;
  const daoProposals = userProgress?.daoProposals ?? 0;
  const passLevel = userProgress?.passLevel ?? 'Free';
  const completedPhases = userProgress?.completedPhases?.length ?? 0;

  const level = Math.max(1, Math.floor(totalXP / 200) + 1);

  const metrics: Metric[] = [
    {
      id: 'xp',
      label: 'Skillchain XP',
      value: totalXP,
      hint: `Level ${level}`,
      icon: GaugeCircle,
    },
    {
      id: 'mfai',
      label: '$MFAI Balance',
      value: mfaiTokens,
      hint: stakedMfai > 0
        ? `${stakedMfai.toLocaleString()} staked`
        : 'Ready to deploy',
      icon: Gem,
    },
    {
      id: 'vote',
      label: 'Voting Power',
      value: votingPower,
      hint: `${daoProposals} proposals`,
      icon: Gavel,
    },
  ];

  const totalPhases = selectedPersona?.phases?.length ?? 0;
  const completionRate = totalPhases > 0
    ? Math.round((completedPhases / totalPhases) * 100)
    : 0;

  const passBadgeStyles = {
    'Diamond': 'bg-gradient-accent text-white shadow-glow',
    'Platinum': 'bg-white/10 text-white border border-white/20',
    'Gold': 'bg-warning/15 text-warning border border-warning/30',
    'Free': 'bg-white/5 text-white/80 border border-white/10',
    'default': 'bg-white/5 text-white/80 border border-white/10',
  }[passLevel] || 'bg-white/5 text-white/80 border border-white/10';

  const metricLabelClass = isDark ? 'text-white/50' : 'text-slate-500';
  const metricValueClass = isDark ? 'text-white' : 'text-slate-900';

  return (
    <div
      className="flex items-center gap-3 px-3 py-2"
      aria-label="User metrics panel"
    >
      {/* Pass Level Badge - Compact */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-accent/20">
          <Crown size={14} className="text-accent-neon" aria-hidden="true" />
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${passBadgeStyles}`}>
          {userProgress.passLevel}
        </span>
      </div>

      {/* Vertical Divider */}
      <div className="h-8 w-px bg-white/10" />

      {/* Metrics - Horizontal Compact */}
      <div className="flex items-center gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.id}
              className="flex items-center gap-2"
              aria-label={`${metric.label}: ${metric.value.toLocaleString()}`}
            >
              <Icon size={14} className="text-accent-neon/60" aria-hidden="true" />
              <div className="flex flex-col">
                <span className={`text-[10px] font-medium ${metricLabelClass}`}>
                  {metric.label}
                </span>
                <span className={`font-mono text-xs font-semibold ${metricValueClass}`}>
                  {metric.value.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}

        {/* Journey Progress - Compact */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col min-w-[80px]">
            <div className={`flex items-center justify-between text-[10px] font-medium ${metricLabelClass}`}>
              <span>Journey</span>
              <span>{completionRate}%</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-white/10">
              <motion.div
                initial={false}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-accent"
                role="progressbar"
                aria-valuenow={completionRate}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMetricsPanel;
