import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export type ZynoState = 'idle' | 'thinking' | 'speaking' | 'success' | 'error';
type ZynoSize  = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<ZynoSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-xl',
  xl: 'w-20 h-20 text-3xl',
};

const RINGS: Record<ZynoState, string> = {
  idle:     'border-white/20',
  thinking: 'border-cyan-300/70',
  speaking: 'border-gold-400',
  success:  'border-emerald-400/70',
  error:    'border-coral-400/70',
};

export function ZynoAvatar({
  state = 'idle', size = 'md', className
}: { state?: ZynoState; size?: ZynoSize; className?: string }) {

  const thinkingAnim = state === 'thinking' ? {
    borderColor: ['rgba(0,229,255,0.3)','rgba(0,229,255,0.9)','rgba(0,229,255,0.3)'],
  } : {};

  const speakingAnim = state === 'speaking' ? {
    scale: [1, 1.05, 1],
    boxShadow: [
      '0 0 0px rgba(255,179,0,0)',
      '0 0 24px rgba(255,179,0,0.45)',
      '0 0 0px rgba(255,179,0,0)',
    ],
  } : {};

  return (
    <motion.div
      animate={{ ...thinkingAnim, ...speakingAnim }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      className={clsx(
        SIZES[size],
        'rounded-full border-2 flex items-center justify-center relative overflow-hidden flex-shrink-0',
        'bg-gradient-to-br from-slate-100 to-void',
        RINGS[state],
        'transition-[border-color] duration-300',
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gold-400/10 to-cyan-300/10" />
      <span className="relative z-10 select-none leading-none">⚡</span>

      {state === 'speaking' && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-gold-400/35"
          animate={{ scale: [1, 1.5, 2], opacity: [0.6, 0.2, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      {state === 'thinking' && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-cyan-300/25"
          animate={{ scale: [1, 1.3, 1.6], opacity: [0.4, 0.15, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
    </motion.div>
  );
}
