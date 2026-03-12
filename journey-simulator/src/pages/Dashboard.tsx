import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Zap, Award, Activity,
  ArrowRight, Lock
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { clsx } from 'clsx';
import { useJourneyStore } from '../store/journeyStore';
import type { UserProgress } from '../types/journey';

// Default metrics when no real data available
const DEFAULT_METRICS = [
  { label: 'Score AEPO',        value: '74',    suffix: '/100', delta: '+8', icon: TrendingUp, color: 'gold' },
  { label: 'Agents actifs',     value: '…',     suffix: '',     delta: '+8', icon: Zap,        color: 'cyan' },
  { label: 'Missions complètes', value: '12',   suffix: '',     delta: '+3', icon: Award,      color: 'emerald' },
  { label: 'Tx on-chain',       value: '0',     suffix: '',     delta: '—',  icon: Activity,   color: 'ghost' },
];

const JOURNEY_STEPS = [
  { id: 'learn',    label: 'Learn',    sublabel: 'Fondamentaux',  icon: '📚', status: 'completed' as const },
  { id: 'build',    label: 'Build',    sublabel: 'En cours',      icon: '🔧', status: 'active' as const },
  { id: 'prove',    label: 'Prove',    sublabel: 'Certification', icon: '🏅', status: 'locked' as const },
  { id: 'activate', label: 'Activate', sublabel: 'Déploiement',   icon: '⚡', status: 'locked' as const },
  { id: 'scale',    label: 'Scale',    sublabel: 'Croissance',    icon: '📈', status: 'locked' as const },
  { id: 'launch',   label: 'Launch',   sublabel: 'Mainnet',       icon: '🚀', status: 'locked' as const },
];

function MetricCard({ label, value, suffix, delta, icon: Icon, color, isLoading }: typeof DEFAULT_METRICS[0] & { isLoading?: boolean }) {
  if (isLoading) {
    return (
      <Card className="p-5">
        <Skeleton className="h-9 w-9 rounded-xl mb-4" />
        <Skeleton className="h-8 w-20 mb-1" />
        <Skeleton className="h-4 w-24" />
      </Card>
    );
  }

  return (
    <Card hoverable className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={clsx(
          'w-9 h-9 rounded-xl flex items-center justify-center',
          color === 'gold'    && 'bg-gold-400/15 text-gold-300',
          color === 'cyan'    && 'bg-cyan-300/15 text-cyan-300',
          color === 'emerald' && 'bg-emerald-500/15 text-emerald-400',
          color === 'ghost'   && 'bg-white/5 text-ink-300',
        )}>
          <Icon size={18} />
        </div>
        {delta !== '—' && (
          <Badge variant={delta.startsWith('+') ? 'emerald' : 'ghost'} className="text-2xs">
            {delta}
          </Badge>
        )}
      </div>
      <p className="text-2xl font-bold font-mono text-ink-50 leading-none">
        {value}
        {suffix && <span className="text-sm text-ink-400 ml-1">{suffix}</span>}
      </p>
      <p className="text-xs text-ink-400 mt-1.5">{label}</p>
    </Card>
  );
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [agentStats, setAgentStats] = useState<{ active: number; total: number } | null>(null);
  
  // Connect to journeyStore for real data
  const storeUserProgress = useJourneyStore(state => state.userProgress);
  const loadUserProgress = useJourneyStore(state => state.loadUserProgress);

  useEffect(() => {
    // Load user progress from store/API
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Try to load from API via store
        const progress = await loadUserProgress();
        if (progress) {
          setUserProgress(progress);
        } else {
          // Fallback to store state
          setUserProgress(storeUserProgress);
        }
      } catch (err) {
        console.warn('Failed to load user progress:', err);
        // Use store state as fallback
        setUserProgress(storeUserProgress);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [loadUserProgress, storeUserProgress]);

  // Load agent stats from API
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3002'}/api/agents/stats`, {
      headers: { 'Content-Type': 'application/json' },
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => { 
        if (d?.data) {
          setAgentStats({ active: d.data.active, total: d.data.total });
        }
      })
      .catch(() => {}); // fail-safe
  }, []);

  // Build metrics from real data if available
  const metrics = userProgress ? [
    { 
      label: 'Score AEPO', 
      value: Math.min(100, Math.floor((userProgress.totalXP || 0) / 10) + 50).toString(), 
      suffix: '/100', 
      delta: '+8', 
      icon: TrendingUp, 
      color: 'gold' as const 
    },
    { 
      label: 'Agents actifs', 
      value: agentStats ? agentStats.active.toString() : '30',
      suffix: agentStats ? `/${agentStats.total}` : '/57',
      delta: '+8', 
      icon: Zap, 
      color: 'cyan' as const 
    },
    { 
      label: 'Missions complètes', 
      value: (userProgress.completedPhases?.length || 0).toString(), 
      suffix: '', 
      delta: '+3', 
      icon: Award, 
      color: 'emerald' as const 
    },
    { 
      label: 'Tx on-chain', 
      value: (userProgress.nftMints?.length || 0).toString(), 
      suffix: '', 
      delta: '—', 
      icon: Activity, 
      color: 'ghost' as const 
    },
  ] : DEFAULT_METRICS;

  // Determine AEPO score from user progress
  const aepoScore = userProgress 
    ? Math.min(100, Math.floor((userProgress.totalXP || 0) / 10) + 50)
    : 74;

  const getAepoLabel = (score: number) => {
    if (score >= 85) return 'ELITE';
    if (score >= 70) return 'ADVANCED';
    if (score >= 50) return 'INTERMEDIATE';
    return 'STARTER';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-[1400px] mx-auto px-6 py-6 space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-start justify-between gap-6"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-ink-50 tracking-tight mb-1">
            Tableau de bord
          </h1>
          <p className="text-ink-400 text-sm">
            Protocole actif · Phase Build · devnet
            <span className="inline-flex items-center gap-1 ml-3 text-emerald-400 text-2xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Solana devnet
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Button variant="ghost" size="sm" leftIcon={<Activity size={14} />}>
            Rapport AEPO
          </Button>
          <Button variant="gold" size="sm" rightIcon={<ArrowRight size={14} />}>
            Continuer le parcours
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-4 gap-4 stagger">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <MetricCard {...m} isLoading={isLoading} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-4">
        <Card padding="lg">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold font-display text-ink-50">Progression du parcours</h2>
              <p className="text-xs text-ink-400 mt-0.5">
                Cognitive Activation Protocol™ — Phase {userProgress?.completedPhases?.length || 0}/6
              </p>
            </div>
            <Badge variant="gold">En cours</Badge>
          </div>
          <div className="flex items-center gap-0 w-full">
            {JOURNEY_STEPS.map((step, i) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className={clsx(
                  'flex flex-col items-center gap-1.5 flex-shrink-0',
                  step.status === 'locked' ? 'opacity-40' : ''
                )}>
                  <div className={clsx(
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm border-2 transition-all duration-200',
                    step.status === 'completed' && 'bg-gold-400 border-gold-400 text-void',
                    step.status === 'active'    && 'bg-slate-100 border-gold-400 shadow-gold-glow',
                    step.status === 'locked'    && 'bg-transparent border-white/15 text-ink-400',
                  )}>
                    {step.status === 'completed' ? '✓' : <span>{step.icon}</span>}
                  </div>
                  <span className={clsx(
                    'text-2xs font-semibold uppercase tracking-wider whitespace-nowrap',
                    step.status === 'active'    && 'text-gold-300',
                    step.status === 'completed' && 'text-ink-200',
                    step.status === 'locked'    && 'text-ink-400',
                  )}>
                    {step.label}
                  </span>
                </div>

                {i < JOURNEY_STEPS.length - 1 && (
                  <div className="flex-1 h-px mx-2 bg-white/10 relative">
                    {step.status === 'completed' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-gold-400 to-gold-300" />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card padding="lg">
          <h2 className="text-base font-semibold font-display text-ink-50 mb-4">Score AEPO</h2>
          <div className="flex flex-col items-center">
            {isLoading ? (
              <>
                <Skeleton className="h-14 w-24 mb-2" />
                <Skeleton className="h-4 w-20" />
              </>
            ) : (
              <>
                <div className={clsx(
                  "text-5xl font-mono font-bold",
                  aepoScore >= 85 ? 'text-gold-300' : 
                  aepoScore >= 70 ? 'text-cyan-300' : 'text-amber-400'
                )}>
                  {aepoScore}
                </div>
                <p className="text-2xs text-ink-400 mt-2 uppercase tracking-wider">
                  {getAepoLabel(aepoScore)}
                </p>
              </>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4 stagger">
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ink-50">Agents actifs</h3>
            <Badge variant="cyan" dot>30 LLM réels</Badge>
          </div>
          <div className="space-y-2.5">
            {[
              { name: 'EvaluationAgent',    status: 'active' },
              { name: 'SolanaAnchorAgent',  status: 'active' },
              { name: 'InvestorDemoAgent',  status: 'idle' },
              { name: 'TokenomicsAgent',    status: 'active' },
            ].map((a) => (
              <div key={a.name} className="flex items-center gap-2.5">
                <div className={clsx(
                  'w-2 h-2 rounded-full',
                  a.status === 'active' ? 'bg-emerald-400' : 'bg-ink-400'
                )} />
                <p className="text-xs text-ink-200 flex-1 font-mono truncate">{a.name}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ink-50">Prochaines missions</h3>
            <Badge variant="amber">3 en attente</Badge>
          </div>
          <div className="space-y-2">
            {[
              { title: 'Créer un compte PDA',      xp: 150, locked: false },
              { title: 'Implémenter une instruction', xp: 200, locked: false },
              { title: 'Test de sécurité Anchor',   xp: 300, locked: true },
            ].map((mission, i) => (
              <div key={i} className={clsx(
                'flex items-center gap-3 p-3 rounded-xl border',
                mission.locked ? 'border-white/5 opacity-40' : 'border-white/8'
              )}>
                <div className={clsx(
                  'w-6 h-6 rounded-lg flex items-center justify-center text-xs',
                  mission.locked ? 'bg-white/5 text-ink-500' : 'bg-gold-400/15 text-gold-300'
                )}>
                  {mission.locked ? <Lock size={10} /> : i + 1}
                </div>
                <p className="text-xs text-ink-200 flex-1">{mission.title}</p>
                <span className="text-2xs font-mono text-gold-300">+{mission.xp} XP</span>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="gold" padding="md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-void flex items-center justify-center text-xl">
              ⚡
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-50">Zyno recommande</p>
              <p className="text-2xs text-ink-400">Mise à jour il y a 8min</p>
            </div>
          </div>
          <p className="text-xs text-ink-200 leading-relaxed mb-4">
            Votre score de maîtrise Web3 ({aepoScore}/100) est {aepoScore >= 70 ? 'excellent' : 'en progression'}. 
            Concentrez-vous sur la collaboration DAO.
          </p>
          <Button variant="gold" size="sm" fullWidth rightIcon={<Zap size={12} />}>
            Activer le protocole
          </Button>
        </Card>
      </div>
    </motion.div>
  );
}
