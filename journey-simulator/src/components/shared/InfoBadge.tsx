/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { ReactNode } from 'react';

interface InfoBadgeProps {
  label: string;
  icon?: ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const toneClasses: Record<NonNullable<InfoBadgeProps['tone']>, string> = {
  default: 'border-white/10 bg-white/5 text-white/70',
  success: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  warning: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  danger: 'border-red-400/30 bg-red-400/10 text-red-200',
  info: 'border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan',
};

export const InfoBadge = ({ label, icon, tone = 'default', className = '' }: InfoBadgeProps) => {
  const variantClasses = toneClasses[tone];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${variantClasses} ${className}`.trim()}
    >
      {icon ? <span className="grid h-3.5 w-3.5 place-items-center text-current">{icon}</span> : null}
      <span className="truncate">{label}</span>
    </span>
  );
};

export default InfoBadge;
