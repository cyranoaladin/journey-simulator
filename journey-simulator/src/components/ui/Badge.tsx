import { clsx } from 'clsx';
import { ReactNode } from 'react';

type BadgeVariant = 'gold' | 'cyan' | 'emerald' | 'amber' | 'coral' | 'ghost' | 'passLevel';
type PassLevel = 'STARTER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';

interface BadgeProps {
  variant?: BadgeVariant;
  passLevel?: PassLevel;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

const VARIANTS: Record<BadgeVariant, string> = {
  gold:      'bg-gold-400/15    text-gold-300   border-gold-400/30',
  cyan:      'bg-cyan-300/15    text-cyan-300   border-cyan-300/30',
  emerald:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  amber:     'bg-amber-500/15   text-amber-400  border-amber-500/30',
  coral:     'bg-coral-500/15   text-coral-400  border-coral-500/30',
  ghost:     'bg-white/5        text-ink-200    border-white/10',
  passLevel: '',
};

const PASS_LEVEL_STYLES: Record<PassLevel, string> = {
  STARTER:      'bg-slate-100/20 text-ink-200 border-white/15',
  INTERMEDIATE: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  ADVANCED:     'bg-cyan-300/15  text-cyan-300  border-cyan-300/30',
  ELITE:        'bg-gold-400/20  text-gold-300  border-gold-400/40 shadow-gold-glow',
};

const PASS_LEVEL_DOT: Record<PassLevel, string> = {
  STARTER:      'bg-ink-300',
  INTERMEDIATE: 'bg-amber-400',
  ADVANCED:     'bg-cyan-300',
  ELITE:        'bg-gold-400',
};

export function Badge({ variant = 'ghost', passLevel, dot, children, className }: BadgeProps) {
  const styles = passLevel
    ? PASS_LEVEL_STYLES[passLevel]
    : VARIANTS[variant];

  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5',
      'text-2xs font-semibold uppercase tracking-wider',
      'rounded-full border',
      'font-mono',
      styles,
      className
    )}>
      {(dot || passLevel) && (
        <span className={clsx(
          'w-1.5 h-1.5 rounded-full flex-shrink-0',
          passLevel ? PASS_LEVEL_DOT[passLevel] : 'bg-current opacity-80'
        )} />
      )}
      {children}
    </span>
  );
}
