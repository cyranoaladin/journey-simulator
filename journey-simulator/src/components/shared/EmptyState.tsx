/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  dense?: boolean;
  tone?: 'default' | 'info' | 'success' | 'warning' | 'danger';
}

export const EmptyState = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className = '',
  dense = false,
  tone = 'default',
}: EmptyStateProps) => {
  const spacing = dense ? 'p-4' : 'p-6';
  const gap = dense ? 'gap-2' : 'gap-3';
  const toneClasses: Record<NonNullable<EmptyStateProps['tone']>, string> = {
    default: 'border-white/10 bg-white/5 text-white/70',
    info: 'border-accent-cyan/30 bg-accent-cyan/5 text-accent-cyan',
    success: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    warning: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
    danger: 'border-red-500/30 bg-red-500/10 text-red-200',
  };
  const iconTone: Record<NonNullable<EmptyStateProps['tone']>, string> = {
    default: 'bg-black/20 text-white/70',
    info: 'bg-accent-cyan/10 text-accent-cyan',
    success: 'bg-emerald-500/10 text-emerald-200',
    warning: 'bg-amber-500/10 text-amber-200',
    danger: 'bg-red-500/10 text-red-200',
  };
  const appliedTone = toneClasses[tone];
  const appliedIconTone = iconTone[tone];

  return (
    <output
      className={`flex flex-col items-center text-center rounded-2xl border ${appliedTone} ${spacing} ${gap} ${className}`.trim()}
      aria-live="polite"
    >
      {icon ? (
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${appliedIconTone}`}>
          {icon}
        </div>
      ) : null}
      <p className="text-sm font-semibold text-white">{title}</p>
      {description ? (
        <p className="max-w-xs text-xs text-white/60">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:border-white/20 hover:bg-white/20"
        >
          {actionLabel}
        </button>
      ) : null}
    </output>
  );
};

export default EmptyState;
