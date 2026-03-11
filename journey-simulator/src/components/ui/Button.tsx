import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

export type ButtonVariant = 'gold' | 'cyan' | 'ghost' | 'danger' | 'glass';
export type ButtonSize    = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  loading?:  boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const VARIANTS: Record<ButtonVariant, string> = {
  gold:  'bg-gold-400 text-void hover:bg-gold-300 shadow-gold-glow font-semibold',
  cyan:  'bg-cyan-300 text-void hover:bg-cyan-200 shadow-cyan-glow font-semibold',
  ghost: 'bg-transparent text-ink-100 hover:bg-slate-50 border border-[rgba(255,255,255,0.10)]',
  danger:'bg-coral-500 text-white hover:bg-coral-400',
  glass: 'glass text-ink-100 hover:bg-[rgba(255,255,255,0.08)]',
};

const SIZES: Record<ButtonSize, string> = {
  xs: 'h-7  px-3   text-xs  gap-1.5',
  sm: 'h-8  px-4   text-sm  gap-2',
  md: 'h-10 px-5   text-sm  gap-2',
  lg: 'h-12 px-7   text-base gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'ghost',
  size    = 'md',
  loading = false,
  leftIcon, rightIcon, fullWidth,
  className, children, disabled, ...props
}, ref) => (
  <button
    ref={ref}
    className={clsx(
      'inline-flex items-center justify-center rounded-lg',
      'transition-all duration-150',
      'select-none cursor-pointer',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-void',
      'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
      VARIANTS[variant],
      SIZES[size],
      fullWidth && 'w-full',
      className
    )}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? (
      <svg className="animate-spin" width={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} height={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    ) : leftIcon}
    {children}
    {!loading && rightIcon}
  </button>
));
Button.displayName = 'Button';
