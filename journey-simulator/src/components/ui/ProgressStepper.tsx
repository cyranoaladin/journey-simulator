import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import { clsx } from 'clsx';

export interface JourneyStep {
  id:       string;
  label:    string;
  sublabel: string;
  icon:     string;
  status:   'completed' | 'active' | 'locked';
}

interface ProgressStepperProps {
  steps:        JourneyStep[];
  orientation?: 'horizontal' | 'vertical';
  onStepClick?: (id: string) => void;
}

function StepIcon({ step, small = false }: { step: JourneyStep; small?: boolean }) {
  const size = small ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
  return (
    <motion.div
      whileHover={step.status !== 'locked' ? { scale: 1.1 } : {}}
      className={clsx(
        size, 'rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all duration-200',
        step.status === 'completed' && 'bg-gold-400 border-gold-400 text-void',
        step.status === 'active'    && 'bg-slate-100 border-gold-400 shadow-gold-glow text-gold-300',
        step.status === 'locked'    && 'bg-transparent border-white/12 text-ink-500',
      )}
    >
      {step.status === 'completed'
        ? <Check size={small ? 12 : 15} strokeWidth={3} />
        : step.status === 'locked'
          ? <Lock size={small ? 10 : 12} />
          : <span>{step.icon}</span>
      }
    </motion.div>
  );
}

function HorizontalStepper({ steps, onStepClick }: ProgressStepperProps) {
  return (
    <div className="flex items-start w-full">
      {steps.map((step, i) => (
        <div key={step.id} className={clsx('flex items-center', i < steps.length - 1 && 'flex-1')}>
          <button
            onClick={() => step.status !== 'locked' && onStepClick?.(step.id)}
            disabled={step.status === 'locked'}
            className={clsx(
              'flex flex-col items-center gap-2 group',
              step.status === 'locked' ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
            )}
          >
            <StepIcon step={step} />
            <div className="text-center">
              <p className={clsx(
                'text-xs font-semibold uppercase tracking-wide whitespace-nowrap',
                step.status === 'active'    && 'text-gold-300',
                step.status === 'completed' && 'text-ink-200',
                step.status === 'locked'    && 'text-ink-500',
              )}>{step.label}</p>
              <p className="text-2xs text-ink-500 mt-0.5">{step.sublabel}</p>
            </div>
          </button>

          {i < steps.length - 1 && (
            <div className="flex-1 mx-3 mt-[-20px]">
              <div className="relative h-px bg-white/10 overflow-hidden rounded-full">
                {step.status === 'completed' && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-gold-400 to-gold-300"
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, ease: [0.16,1,0.3,1], delay: i * 0.1 }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function VerticalStepper({ steps, onStepClick }: ProgressStepperProps) {
  return (
    <nav className="flex flex-col gap-0.5">
      {steps.map((step, i) => (
        <div key={step.id}>
          <button
            onClick={() => step.status !== 'locked' && onStepClick?.(step.id)}
            disabled={step.status === 'locked'}
            className={clsx(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150',
              step.status === 'active'    && 'bg-gold-400/10 hover:bg-gold-400/14',
              step.status === 'completed' && 'hover:bg-white/4',
              step.status === 'locked'    && 'opacity-35 cursor-not-allowed pointer-events-none',
            )}
          >
            <StepIcon step={step} small />

            <div className="flex-1 min-w-0">
              <p className={clsx(
                'text-sm font-medium leading-tight truncate',
                step.status === 'active'    && 'text-gold-300',
                step.status === 'completed' && 'text-ink-100',
                step.status === 'locked'    && 'text-ink-400',
              )}>{step.label}</p>
              <p className="text-2xs text-ink-500 truncate mt-0.5">{step.sublabel}</p>
            </div>

            {step.status === 'active' && (
              <div className="w-1.5 h-1.5 rounded-full bg-gold-400 flex-shrink-0 animate-pulse" />
            )}
          </button>

          {i < steps.length - 1 && (
            <div className="ml-[22px] pl-[11px] border-l border-white/8 h-3" />
          )}
        </div>
      ))}
    </nav>
  );
}

export function ProgressStepper({ steps, orientation = 'vertical', onStepClick }: ProgressStepperProps) {
  return orientation === 'horizontal'
    ? <HorizontalStepper steps={steps} onStepClick={onStepClick} />
    : <VerticalStepper   steps={steps} onStepClick={onStepClick} />;
}
