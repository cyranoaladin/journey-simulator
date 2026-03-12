import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Settings, Activity } from 'lucide-react';
import { Card, Badge, ZynoAvatar, Skeleton } from '../components/ui';
import { agents as agentsApi } from '../api/mf-back';
import { clsx } from 'clsx';

interface Agent {
  id:       string;
  name:     string;
  type:     'llm' | 'stub';
  status:   'running' | 'paused' | 'error' | 'idle';
  aepo:     number;
  apy:      number;
  lastRun:  string;
  pnl:      number;
  model?:   string;
}

// Mock agents as fallback
const MOCK_AGENTS: Agent[] = [
  { id: '1', name: 'Yield Optimizer Alpha', type: 'llm', status: 'running', aepo: 92, apy: 18.5, lastRun: '2 min ago', pnl: 234.56, model: 'claude-sonnet-4' },
  { id: '2', name: 'Arbitrage Scout', type: 'llm', status: 'running', aepo: 88, apy: 42.1, lastRun: '5 min ago', pnl: 567.89, model: 'gpt-4o' },
  { id: '3', name: 'DCA Master', type: 'llm', status: 'paused', aepo: 76, apy: 8.2, lastRun: '1 hour ago', pnl: -12.34, model: 'gemini-flash' },
  { id: '4', name: 'Liquidity Guardian', type: 'stub', status: 'running', aepo: 85, apy: 24.7, lastRun: '12 min ago', pnl: 123.45 },
];

function AgentCard({ agent, index, onToggle }: { agent: Agent; index: number; onToggle: (id: string) => void }) {
  const isRunning = agent.status === 'running';
  const isError = agent.status === 'error';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card 
        variant={isRunning ? 'glow' : 'glass'} 
        className="p-5 group hover:scale-[1.02] transition-transform duration-300"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <ZynoAvatar state={isRunning ? 'thinking' : 'idle'} size="md" />
            <div>
              <h3 className="font-semibold text-ink-100">{agent.name}</h3>
              <p className="text-xs text-ink-400">
                {agent.type === 'llm' ? `AI Agent • ${agent.model || 'LLM'}` : 'Stub Agent'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg hover:bg-white/5 text-ink-400 hover:text-ink-200 transition-colors">
              <Settings size={16} />
            </button>
            <button 
              onClick={() => onToggle(agent.id)}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                isRunning 
                  ? 'bg-amber-400/10 text-amber-400 hover:bg-amber-400/20' 
                  : 'bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20'
              )}
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 py-3 border-y border-white/5">
          <div>
            <p className="text-2xs text-ink-500 uppercase tracking-wider">AEPO Score</p>
            <p className={clsx(
              'font-mono font-bold',
              agent.aepo >= 85 ? 'text-gold-300' : 'text-cyan-300'
            )}>{agent.aepo}</p>
          </div>
          <div>
            <p className="text-2xs text-ink-500 uppercase tracking-wider">APY</p>
            <p className="font-mono font-bold text-emerald-400">{agent.apy}%</p>
          </div>
          <div>
            <p className="text-2xs text-ink-500 uppercase tracking-wider">P&L</p>
            <p className={clsx(
              'font-mono font-bold',
              agent.pnl >= 0 ? 'text-emerald-400' : 'text-coral-400'
            )}>{agent.pnl >= 0 ? '+' : ''}{agent.pnl.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Activity size={14} className={clsx(
              isRunning ? 'text-emerald-400' : 'text-ink-500'
            )} />
            <span className={clsx(
              'text-xs',
              isRunning ? 'text-emerald-400' : 'text-ink-400'
            )}>
              {isRunning ? 'Running' : isError ? 'Error' : 'Paused'} • {agent.lastRun}
            </span>
          </div>
          <Badge variant={agent.aepo >= 85 ? 'gold' : agent.aepo >= 70 ? 'cyan' : 'default'}>
            Lvl {Math.floor(agent.aepo / 10)}
          </Badge>
        </div>
      </Card>
    </motion.div>
  );
}

function AgentCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-9 h-9 rounded-lg" />
          <Skeleton className="w-9 h-9 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 py-3 border-y border-white/5">
        {[1,2,3].map(i => (
          <div key={i}>
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-5 w-12" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
    </Card>
  );
}

export default function AgentsView() {
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'llm' | 'stub' | 'active'>('all');
  
  // Stats
  const activeCount = agents.filter(a => a.status === 'running').length;
  const totalApy = agents.reduce((sum, a) => sum + a.apy, 0) / agents.length;
  const totalPnl = agents.reduce((sum, a) => sum + a.pnl, 0);
  const avgAepo = agents.reduce((sum, a) => sum + a.aepo, 0) / agents.length;

  useEffect(() => {
    const loadAgents = async () => {
      setIsLoading(true);
      try {
        // TODO: connecter useAgentStats() quand disponible
        // For now, try to fetch from API
        const response = await agentsApi.listRuns();
        if (response.data && Array.isArray(response.data)) {
          // Map API response to Agent type
          const mappedAgents: Agent[] = (response.data as any[]).map((run, i) => ({
            id: run._id || run.id || `agent-${i}`,
            name: run.agentName || `Agent ${i + 1}`,
            type: run.agentType === 'LLM' ? 'llm' : 'stub',
            status: run.status === 'succeeded' ? 'running' : 
                   run.status === 'failed' ? 'error' : 'paused',
            // TODO: connecter GET /api/agents/stats quand la Tâche 4 est testée
            aepo: [82, 75, 91, 68, 88, 74, 95, 79][i % 8],
            apy: [12.4, 8.7, 22.1, 5.3, 18.6, 9.9, 31.2, 14.0][i % 8],
            lastRun: run.createdAt ? new Date(run.createdAt).toLocaleTimeString() : 'N/A',
            pnl: [340, -120, 890, -45, 620, 180, -230, 510][i % 8],
            model: run.model,
          }));
          if (mappedAgents.length > 0) {
            setAgents(mappedAgents);
          }
        }
      } catch (err) {
        console.warn('Failed to load agents from API, using mock data:', err);
        // Keep mock data as fallback
      } finally {
        setIsLoading(false);
      }
    };

    loadAgents();
  }, []);

  const handleToggle = (id: string) => {
    setAgents(prev => prev.map(a => 
      a.id === id 
        ? { ...a, status: a.status === 'running' ? 'paused' : 'running' }
        : a
    ));
  };

  const filteredAgents = agents.filter(a => {
    if (filter === 'llm') return a.type === 'llm';
    if (filter === 'stub') return a.type === 'stub';
    if (filter === 'active') return a.status === 'running';
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-[1400px] mx-auto px-6 py-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink-50">AI Agents</h1>
            <p className="text-ink-400 mt-1">Manage and monitor your automated trading agents</p>
          </div>
          <button className="px-4 py-2 bg-gold-400 text-void rounded-xl font-semibold text-sm hover:bg-gold-300 transition-colors flex items-center gap-2">
            <span>+</span> Deploy Agent
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Active Agents', value: activeCount.toString(), sub: `of ${agents.length} total` },
            { label: 'Total APY', value: `${totalApy.toFixed(1)}%`, sub: 'weighted avg' },
            { label: 'Total P&L', value: `+$${totalPnl.toFixed(2)}`, sub: 'last 24h' },
            { label: 'Avg AEPO', value: avgAepo.toFixed(1), sub: avgAepo >= 85 ? 'elite tier' : 'advancing' },
          ].map((stat, i) => (
            <Card key={i} variant="solid" className="p-4">
              <p className="text-2xs text-ink-500 uppercase tracking-wider">{stat.label}</p>
              <p className="font-display text-2xl font-bold text-ink-50 mt-1">{stat.value}</p>
              <p className="text-xs text-ink-400 mt-0.5">{stat.sub}</p>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {(['all', 'llm', 'stub', 'active'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                'px-4 py-2 rounded-xl text-sm font-semibold transition-colors capitalize',
                filter === f 
                  ? 'bg-gold-400/10 text-gold-300' 
                  : 'text-ink-400 hover:text-ink-200 hover:bg-white/5'
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-2 gap-4">
          {isLoading ? (
            [1,2,3,4].map(i => <AgentCardSkeleton key={i} />)
          ) : filteredAgents.length === 0 ? (
            <Card className="col-span-2 p-8 text-center">
              <p className="text-ink-400">No agents match the selected filter.</p>
            </Card>
          ) : (
            filteredAgents.map((agent, i) => (
              <AgentCard key={agent.id} agent={agent} index={i} onToggle={handleToggle} />
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
