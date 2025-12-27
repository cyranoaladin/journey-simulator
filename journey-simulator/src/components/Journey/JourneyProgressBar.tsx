import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import React from 'react';
import { getJourneyPhases } from '../../config/journeyPhases';

interface Props {
  personaId: string;
  currentStepId: string;
}

export const JourneyProgressBar: React.FC<Props> = ({ personaId, currentStepId }) => {
  const phases = getJourneyPhases(personaId);
  const currentPhaseIndex = phases.findIndex(p => p.id === currentStepId);
  const activeIndex = currentPhaseIndex === -1 ? 0 : currentPhaseIndex;

  return (
    <div className="w-full py-2 px-4 mb-2" data-testid="journey-progress-bar">
      {/* Container ensures spacing for labels below */}
      <div className="relative flex items-center justify-between min-h-[100px]">

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

          return (
            <div
              key={phase.id}
              className="relative z-10 flex flex-col items-center group w-24" // Fixed width container to center label
              data-testid={`journey-progress-step-${phase.id}`}
            >
              {/* Node Circle */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: isCurrent ? 1.1 : 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500
                  ${(() => {
                    // Extract nested ternary into explicit variable
                    if (isCompleted) {
                      return 'border-accent-cyan bg-accent-cyan text-black shadow-[0_0_20px_rgba(34,211,238,0.4)]';
                    }
                    if (isCurrent) {
                      return 'border-accent-cyan bg-[#0A0A1F] text-accent-cyan shadow-[0_0_30px_rgba(34,211,238,0.6)] ring-2 ring-accent-cyan/20 ring-offset-2 ring-offset-black';
                    }
                    return 'border-white/10 bg-[#0A0A1F] text-white/20';
                  })()}
                `}
              >
                {(() => {
                  if (isCompleted) {
                    return <Check size={18} strokeWidth={3} />;
                  }
                  if (isCurrent) {
                    return <Zap size={18} className="fill-current" />;
                  }
                  return <span className="text-xs font-mono">{index + 1}</span>;
                })()}

                {/* Pulse Effect for Current */}
                {isCurrent && (
                  <div className="absolute inset-0 rounded-full border border-accent-cyan animate-ping opacity-20" />
                )}
              </motion.div>

              {/* Label */}
              <div
                className={`
                  absolute top-14 w-32 flex flex-col items-center text-center transition-all duration-500
                  ${(() => {
                    // Extract nested ternary into explicit variable
                    if (isCurrent) {
                      return 'opacity-100 translate-y-0';
                    }
                    if (isCompleted) {
                      return 'opacity-60 hover:opacity-100';
                    }
                    return 'opacity-30 hover:opacity-80';
                  })()}
                `}
              >
                {(() => {
                  // Determine label color based on phase state (extracted to avoid conditional returning same value)
                  let labelColorClass = 'text-white/40'; // Default: future phase
                  if (isCurrent) {
                    labelColorClass = 'text-accent-cyan drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]';
                  } else if (isCompleted) {
                    labelColorClass = 'text-accent-cyan/80';
                  }
                  return (
                    <span className={`text-[10px] uppercase tracking-widest font-bold leading-tight ${labelColorClass}`}>
                      {phase.label}
                    </span>
                  );
                })()}

                {index === activeIndex && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-[9px] text-accent-cyan/60 font-mono bg-accent-cyan/10 px-2 py-0.5 rounded border border-accent-cyan/20"
                  >
                    IN PROGRESS
                  </motion.span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
