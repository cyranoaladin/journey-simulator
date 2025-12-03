import { CheckCircle2, Lock, PlayCircle } from 'lucide-react';

interface Phase {
  id: string;
  title: string;
  description: string;
  [key: string]: any;
}

interface JourneyTimelineProps {
  phases: Phase[];
  currentPhase: number;
  onPhaseChange?: (index: number) => void;
}

export default function JourneyTimeline({ phases, currentPhase, onPhaseChange }: JourneyTimelineProps) {
  return (
    <div className="space-y-3">
      {phases.map((phase, index) => {
        const isCompleted = index < currentPhase;
        const isActive = index === currentPhase;
        const isLocked = index > currentPhase;

        return (
          <div
            key={phase.id || index}
            className={`flex items-start ${!isLocked && onPhaseChange ? 'cursor-pointer' : 'cursor-default'}`}
            onClick={() => !isLocked && onPhaseChange && onPhaseChange(index)}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors
              ${isActive
                ? 'bg-accent-cyan/20 text-accent-cyan ring-2 ring-accent-cyan/50'
                : isCompleted
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-white/5 text-white/30'}`}
            >
              {isActive ? <PlayCircle size={16} /> : isCompleted ? <CheckCircle2 size={16} /> : <Lock size={16} />}
            </div>
            <div className="ml-3 flex-1 min-w-0 pt-1">
              <div className="flex items-baseline justify-between">
                <h4 className={`text-sm font-medium ${isActive ? 'text-accent-cyan' : isCompleted ? 'text-green-400' : 'text-white/50'}`}>
                  {phase.title}
                </h4>
              </div>
              <p className="text-xs text-white/40 mt-1 truncate">{phase.description}</p>
            </div>
          </div>
        );
      })}

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex justify-between text-xs text-white/40">
          <span>Progress</span>
          <span>{Math.min(currentPhase, phases.length)}/{phases.length}</span>
        </div>
        <progress
          className="timeline-progress mt-2"
          value={Math.min(currentPhase, phases.length)}
          max={phases.length}
        />
      </div>
    </div>
  );
}