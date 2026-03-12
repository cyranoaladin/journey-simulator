import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { clsx } from 'clsx';

interface AEPODimension {
  key:   string;
  label: string;
  score: number;
  icon:  string;
}

interface AEPOScoreProps {
  global:          number;
  dimensions?:     AEPODimension[];
  size?:           'sm' | 'md' | 'lg';
  showBreakdown?:  boolean;
  className?:      string;
}

function scoreColor(s: number) {
  if (s >= 85) return 'text-gold-300';
  if (s >= 70) return 'text-cyan-300';
  if (s >= 50) return 'text-amber-400';
  return 'text-ink-300';
}

function scoreBarColor(s: number) {
  if (s >= 85) return 'linear-gradient(90deg,#FFD966,#FFB300)';
  if (s >= 70) return 'linear-gradient(90deg,#64FFFB,#00E5FF)';
  return 'rgba(255,255,255,0.2)';
}

function scoreLabel(s: number) {
  if (s >= 85) return 'ELITE';
  if (s >= 70) return 'ADVANCED';
  if (s >= 50) return 'INTERMEDIATE';
  return 'STARTER';
}

function CircularProgress({ score, size }: { score: number; size: number }) {
  const r        = (size - 14) / 2;
  const circ     = 2 * Math.PI * r;
  const offset   = circ - (score / 100) * circ;
  const ref      = useRef<HTMLDivElement>(null);
  const inView   = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const dur = 1200;
    let start: number | null = null;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      setCount(Math.round(p * score));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, score]);

  return (
    <div ref={ref} className="relative inline-flex items-center justify-center"
         style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
        <motion.circle cx={size/2} cy={size/2} r={r}
          fill="none" strokeWidth={7}
          stroke="url(#aepo-grad)"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={inView ? { strokeDashoffset: offset } : {}}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
        <defs>
          <linearGradient id="aepo-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#FFD966" />
            <stop offset="100%" stopColor="#FFB300" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className={clsx(
          'font-mono font-bold leading-none',
          size >= 140 ? 'text-4xl' : size >= 100 ? 'text-2xl' : 'text-lg',
          scoreColor(score)
        )}>{count}</span>
        <span className="text-2xs text-ink-400 uppercase tracking-widest font-mono">AEPO</span>
      </div>
    </div>
  );
}

export function AEPOScore({
  global, dimensions, size = 'md', showBreakdown = true, className
}: AEPOScoreProps) {
  const px = size === 'lg' ? 160 : size === 'sm' ? 88 : 120;

  return (
    <div className={clsx('flex flex-col items-center gap-5', className)}>
      <CircularProgress score={global} size={px} />

      <div className="text-center space-y-0.5">
        <p className={clsx('text-xs font-mono font-bold uppercase tracking-widest', scoreColor(global))}>
          {scoreLabel(global)}
        </p>
        <p className="text-2xs text-ink-500">Cognitive Activation Protocol™</p>
      </div>

      {showBreakdown && dimensions && (
        <div className="w-full space-y-3">
          {dimensions.map((d, i) => (
            <motion.div key={d.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.3, ease: [0.16,1,0.3,1] }}
              className="flex items-center gap-3"
            >
              <span className="text-sm w-5 flex-shrink-0 leading-none">{d.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-ink-300 truncate">{d.label}</span>
                  <span className={clsx('text-xs font-mono font-semibold ml-2 flex-shrink-0', scoreColor(d.score))}>
                    {d.score}
                  </span>
                </div>
                <div className="h-1 rounded-full bg-white/6 overflow-hidden">
                  <motion.div className="h-full rounded-full"
                    style={{ background: scoreBarColor(d.score) }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${d.score}%` }}
                    transition={{ duration: 0.9, ease: [0.16,1,0.3,1], delay: 0.1 + i * 0.06 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
