import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export type CardVariant = 
  | 'default' | 'elevated' | 'glass' | 'bordered' 
  | 'gold' | 'cyan' | 'emerald' | 'coral'
  | 'glow' | 'solid' | 'info' | 'success';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const VARIANTS: Record<CardVariant, string> = {
  default:  'bg-slate-50 border border-[rgba(255,255,255,0.07)]',
  elevated: 'bg-slate-100 border border-[rgba(255,255,255,0.09)] shadow-surface',
  glass:    'glass',
  bordered: 'bg-slate-50 border border-[rgba(255,255,255,0.12)]',
  gold:     'bg-gradient-to-br from-gold-400/8 to-transparent border border-gold-400/20',
  cyan:     'bg-gradient-to-br from-cyan-300/8 to-transparent border border-cyan-300/20',
  emerald:  'bg-gradient-to-br from-emerald-500/8 to-transparent border border-emerald-500/20',
  coral:    'bg-gradient-to-br from-coral-500/8 to-transparent border border-coral-500/20',
  glow:     'bg-slate-50 border border-gold-400/25 shadow-gold-glow',
  solid:    'bg-slate-100 border border-white/10',
  info:     'bg-cyan-400/5 border border-cyan-400/20',
  success:  'bg-emerald-400/5 border border-emerald-400/20',
};

const PADDING: Record<string, string> = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  variant  = 'default',
  hoverable = false,
  padding  = 'md',
  className, children, ...props
}, ref) => {
  const base = (
    <div
      ref={ref}
      className={clsx(
        'rounded-2xl',
        VARIANTS[variant],
        PADDING[padding],
        hoverable && 'transition-all duration-200 hover:border-white/15 hover:shadow-surface',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );

  return hoverable ? (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {base}
    </motion.div>
  ) : base;
});
Card.displayName = 'Card';
