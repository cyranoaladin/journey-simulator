/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { type KeyboardEvent } from 'react';
import { CheckCircle2, Lock, PlayCircle, Sparkles } from 'lucide-react';
import EmptyState from '../shared/EmptyState';
import InfoBadge from '../shared/InfoBadge';

interface Phase {
  id: string;
  title: string;
  description: string;
  [key: string]: any;
}

interface JourneyTimelineProps {
  readonly phases: Phase[];
  readonly currentPhase: number;
  readonly onPhaseChange?: (index: number) => void;
}

const getStatusLabel = (isActive: boolean, isCompleted: boolean) => {
  if (isActive) return 'In progress';
  if (isCompleted) return 'Completed';
  return 'Locked';
};

const getStatusTone = (isActive: boolean, isCompleted: boolean): 'default' | 'success' | 'info' => {
  if (isCompleted) return 'success';
  if (isActive) return 'info';
  return 'default';
};

const getNodeClasses = (isActive: boolean, isCompleted: boolean) => {
  if (isActive) {
    return 'border-accent-cyan text-accent-cyan bg-accent-cyan/10 shadow-[0_0_24px_rgba(34,211,238,0.25)]';
  }
  if (isCompleted) {
    return 'border-green-400/80 text-green-300 bg-green-500/10';
  }
  return 'border-white/10 text-white/30 bg-white/5';
};

const getButtonClasses = (isSelectable: boolean) =>
  `group flex w-full items-start gap-3 rounded-xl border border-transparent p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40 ${
    isSelectable ? 'cursor-pointer hover:border-accent-cyan/30 hover:bg-white/5 active:scale-[0.99]' : 'cursor-default opacity-80'
  }`;

const getTitleClass = (isActive: boolean, isCompleted: boolean) => {
  if (isActive) return 'text-white';
  if (isCompleted) return 'text-white/80';
  return 'text-white/60';
};

const getDescriptionClass = (isActive: boolean) => (isActive ? 'text-white/80' : 'text-white/50');

export default function JourneyTimeline({ phases, currentPhase, onPhaseChange }: JourneyTimelineProps) {
  const totalPhases = phases.length;
  const activeIndex = totalPhases === 0 ? 0 : Math.min(currentPhase, totalPhases - 1);
  const completedCount = Math.min(currentPhase, totalPhases);
  const progressPercent = totalPhases === 0 ? 0 : Math.round((completedCount / totalPhases) * 100);
  const progressAriaLabel = `Journey progress: ${completedCount} of ${totalPhases} phases completed`;

  if (totalPhases === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-6">
        <EmptyState
          dense
          tone="info"
          title="No phases configured"
          description="Define the journey phases to unlock navigation and guidance."
          icon={<Sparkles size={18} className="text-accent-cyan" />}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="journey-timeline">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/50">
        <InfoBadge
          label={`Phase ${activeIndex + 1} of ${totalPhases}`}
          tone="info"
          icon={<Sparkles size={12} className="text-accent-cyan" />}
        />
        <span className="font-semibold text-white/60">{progressPercent}% complete</span>
      </div>

      <ol className="relative space-y-4 pl-5 before:absolute before:left-[15px] before:top-6 before:h-[calc(100%-1.5rem)] before:w-px before:bg-white/10">
        {phases.map((phase, index) => {
          const isCompleted = index < completedCount;
          const isActive = index === activeIndex;
          const isLocked = index > completedCount;
          const phaseKey = phase.id || `phase-${index}-${phase.name || phase.title || 'unknown'}`;
          const statusLabel = getStatusLabel(isActive, isCompleted);
          const statusTone = getStatusTone(isActive, isCompleted);

          const handleSelect = () => {
            if (onPhaseChange) {
              onPhaseChange(index);
            }
          };

          const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
            if (onPhaseChange && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault();
              onPhaseChange(index);
            }
          };

          const NodeIcon = (() => {
            if (isActive) return PlayCircle;
            if (isCompleted) return CheckCircle2;
            return Lock;
          })();
          const nodeClasses = getNodeClasses(isActive, isCompleted);
          const isSelectable = Boolean(onPhaseChange) && !isLocked;

          return (
            <li key={phaseKey} className="relative flex gap-3 pl-3">
              {index < totalPhases - 1 && (
                <span className="absolute left-[15px] top-10 h-[calc(100%-2.5rem)] w-px bg-white/10" aria-hidden="true" />
              )}

              <button
                type="button"
                onClick={isSelectable ? handleSelect : undefined}
                onKeyDown={isSelectable ? handleKeyDown : undefined}
                disabled={!isSelectable}
                className={getButtonClasses(isSelectable)}
                aria-current={isActive ? 'step' : undefined}
                aria-disabled={isSelectable ? undefined : 'true'}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm transition ${nodeClasses}`}>
                  <NodeIcon size={18} aria-hidden="true" />
                  {isActive && <span className="absolute inset-0 rounded-full border border-accent-cyan/50 opacity-30 blur-[1px]" />}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className={`text-sm font-semibold leading-tight ${getTitleClass(isActive, isCompleted)}`}>
                        {phase.title}
                      </h4>
                      <InfoBadge label={statusLabel} tone={statusTone} />
                    </div>
                    {phase.mission && (
                      <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">{phase.mission}</p>
                    )}
                    <p className={`text-xs leading-relaxed ${getDescriptionClass(isActive)} line-clamp-3`}>
                      {phase.description || 'No description provided yet.'}
                    </p>
                  </div>

                  {phase.outcomes && Array.isArray(phase.outcomes) && phase.outcomes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {phase.outcomes.slice(0, 2).map((outcome: string) => (
                        <InfoBadge key={outcome} tone="default" label={outcome} />
                      ))}
                      {phase.outcomes.length > 2 && (
                        <InfoBadge tone="default" label={`+${phase.outcomes.length - 2} more`} />
                      )}
                    </div>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between text-xs text-white/50">
          <span>Progress</span>
          <span className="font-semibold text-white/80">{completedCount}/{totalPhases}</span>
        </div>
        <progress
          className="timeline-progress mt-2"
          value={completedCount}
          max={totalPhases}
          aria-label={progressAriaLabel}
        />
      </div>
    </div>
  );
}
