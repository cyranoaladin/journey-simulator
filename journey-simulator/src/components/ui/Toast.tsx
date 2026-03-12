import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'warning' | 'error' | 'info' | 'onchain';

export interface Toast {
  id:      string;
  type:    ToastType;
  title:   string;
  message?: string;
  txHash?: string;
}

interface ToastItemProps {
  toast:    Toast;
  onClose:  (id: string) => void;
}

const CONFIG: Record<ToastType, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  success:  { icon: CheckCircle2,  color: 'text-emerald-400', bg: 'border-emerald-500/25 bg-emerald-500/10' },
  warning:  { icon: AlertTriangle, color: 'text-amber-400',   bg: 'border-amber-500/25 bg-amber-500/10' },
  error:    { icon: XCircle,       color: 'text-coral-400',   bg: 'border-coral-500/25 bg-coral-500/10' },
  info:     { icon: Info,          color: 'text-cyan-300',    bg: 'border-cyan-300/25 bg-cyan-300/10' },
  onchain:  { icon: CheckCircle2,  color: 'text-gold-300',    bg: 'border-gold-400/25 bg-gold-400/10' },
};

export function ToastItem({ toast, onClose }: ToastItemProps) {
  const { icon: Icon, color, bg } = CONFIG[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), toast.txHash ? 8000 : 5000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.txHash, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 48, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 48, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={clsx(
        'relative flex items-start gap-3 p-4 rounded-2xl border',
        'shadow-surface max-w-sm w-full',
        bg
      )}
    >
      <Icon size={18} className={clsx(color, 'flex-shrink-0 mt-0.5')} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink-50 leading-tight">{toast.title}</p>
        {toast.message && <p className="text-xs text-ink-300 mt-1 leading-relaxed">{toast.message}</p>}
        {toast.txHash && (
          <a href={`https://explorer.solana.com/tx/${toast.txHash}?cluster=devnet`}
            target="_blank" rel="noopener noreferrer"
            className="text-2xs font-mono text-gold-300 hover:text-gold-200 mt-1.5 block truncate"
          >
            ⛓ {toast.txHash.slice(0, 8)}...{toast.txHash.slice(-8)}
          </a>
        )}
      </div>
      <button onClick={() => onClose(toast.id)} className="flex-shrink-0 text-ink-400 hover:text-ink-200 transition-colors p-0.5">
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onClose={onClose} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
