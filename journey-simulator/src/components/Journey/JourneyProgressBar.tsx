/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { motion } from 'framer-motion';
import { Check, Sparkles, Zap } from 'lucide-react';
import React from 'react';
import { getJourneyPhases } from '../../config/journeyPhases';
import EmptyState from '../shared/EmptyState';
import InfoBadge from '../shared/InfoBadge';

interface Props {
  personaId: string;
  currentStepId: string;
}

export const JourneyProgressBar: React.FC<Props> = ({ personaId, currentStepId }) => {
  const phases = getJourneyPhases(personaId);
  const currentPhaseIndex = phases.findIndex(p => p.id === currentStepId);
  const activeIndex = currentPhaseIndex === -1 ? 0 : currentPhaseIndex;
  const totalPhases = phases.length;
  const completedCount = Math.max(0, Math.min(activeIndex, totalPhases));
  const progressPercent = totalPhases === 0 ? 0 : Math.round((completedCount / totalPhases) * 100);

  const getNodeClasses = (isCompleted: boolean, isCurrent: boolean) => {
    if (isCompleted) {
      return 'border-accent-cyan bg-accent-cyan text-black shadow-[0_0_20px_rgba(34,211,238,0.4)]';
    }
    if (isCurrent) {
      return 'border-accent-cyan bg-[#0A0A1F] text-accent-cyan shadow-[0_0_30px_rgba(34,211,238,0.6)] ring-2 ring-accent-cyan/20 ring-offset-2 ring-offset-black';
    }
    return 'border-white/10 bg-[#0A0A1F] text-white/20';
  };

  const getLabelOpacityClass = (isCompleted: boolean, isCurrent: boolean) => {
    if (isCurrent) return 'opacity-100 translate-y-0';
    if (isCompleted) return 'opacity-60 hover:opacity-100';
    return 'opacity-30 hover:opacity-80';
  };

  const getLabelColorClass = (isCompleted: boolean, isCurrent: boolean) => {
    if (isCurrent) return 'text-accent-cyan drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]';
    if (isCompleted) return 'text-accent-cyan/80';
    return 'text-white/40';
  };

  const renderNodeContent = (isCompleted: boolean, isCurrent: boolean, index: number) => {
    if (isCompleted) return <Check size={18} strokeWidth={3} />;
    if (isCurrent) return <Zap size={18} className="fill-current" />;
    return <span className="text-xs font-mono">{index + 1}</span>;
  };

  const renderStatusBadge = (isCompleted: boolean, isCurrent: boolean) => {
    if (isCurrent) {
      return <InfoBadge label="In progress" tone="info" className="mt-2" />;
    }
    if (isCompleted) {
      return <InfoBadge label="Completed" tone="success" className="mt-2" />;
    }
    return null;
  };

  if (totalPhases === 0) {
    return (
      <div className="w-full rounded-2xl border border-dashed border-white/10 bg-white/5 p-4" data-testid="journey-progress-bar">
        <EmptyState
          dense
          tone="info"
          title="Journey not configured"
          description="Assign phases to this persona to surface progress guidance."
          icon={<Sparkles size={18} className="text-accent-cyan" />}
        />
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4" data-testid="journey-progress-bar">
      <div className="flex items-center justify-between text-xs text-white/60">
        <InfoBadge
          label={`Phase ${Math.min(activeIndex + 1, totalPhases)} of ${totalPhases}`}
          tone="info"
          icon={<Sparkles size={12} className="text-accent-cyan" />}
        />
        <span>{progressPercent}% complete</span>
      </div>

      <div className="relative mt-4 flex items-center justify-between min-h-[100px]">

        {/* Progress Track (Background) */}
        <div className="absolute left-0 top-[20px] h-1 w-full bg-white/5 rounded-full z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-full h-full opacity-30" />
        </div>

        {/* Active Progress Bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(activeIndex / (Math.max(1, phases.length - 1))) * 100}%` }}
          transition={{ duration: 1, ease: 'circOut' }}
          className="absolute left-0 top-[20px] h-1 bg-gradient-to-r from-accent-blue via-accent-cyan to-accent-cyan shadow-[0_0_15px_rgba(34,211,238,0.5)] z-0 rounded-full"
        />

        {phases.map((phase, index) => {
          const isCompleted = index < activeIndex;
          const isCurrent = index === activeIndex;
          const nodeClasses = getNodeClasses(isCompleted, isCurrent);
          const labelOpacityClass = getLabelOpacityClass(isCompleted, isCurrent);
          const labelColorClass = getLabelColorClass(isCompleted, isCurrent);

          return (
            <div
              key={phase.id}
              className="relative z-10 flex flex-col items-center group w-24"
              data-testid={`journey-progress-step-${phase.id}`}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: isCurrent ? 1.1 : 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500 ${nodeClasses}`}
              >
                {renderNodeContent(isCompleted, isCurrent, index)}
                {isCurrent && (
                  <div className="absolute inset-0 rounded-full border border-accent-cyan animate-ping opacity-20" />
                )}
              </motion.div>

              <div
                className={`absolute top-14 w-32 flex flex-col items-center text-center transition-all duration-500 ${labelOpacityClass}`}
              >
                <span className={`text-[10px] uppercase tracking-widest font-bold leading-tight ${labelColorClass}`}>
                  {phase.label}
                </span>
                {renderStatusBadge(isCompleted, isCurrent)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
