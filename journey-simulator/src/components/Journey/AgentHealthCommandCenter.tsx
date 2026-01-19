import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Database } from 'lucide-react';

interface AgentStatus {
    id: string;
    name: string;
    role: 'CORE' | 'SECURITY' | 'PRODUCT' | 'ANALYSIS';
    status: 'ACTIVE' | 'IDLE' | 'ERROR';
    latency: number; // ms
    ragUsage: boolean;
    load: number; // 0-100 token load
}

// Generate 51 mocked agents
const GENERATED_AGENTS: AgentStatus[] = Array.from({ length: 51 }).map((_, i) => ({
    id: `agt_${i}`,
    name: i === 0 ? 'ZynoCore' : i === 1 ? 'SecuritySentinel' : `SubNode_${i}`,
    role: i < 5 ? 'CORE' : i < 15 ? 'SECURITY' : 'PRODUCT',
    status: Math.random() > 0.9 ? 'ERROR' : Math.random() > 0.3 ? 'ACTIVE' : 'IDLE',
    latency: Math.floor(Math.random() * 1000) + 200,
    ragUsage: Math.random() > 0.7,
    load: Math.floor(Math.random() * 100)
}));

export default function AgentHealthCommandCenter() {
    const [agents, setAgents] = useState<AgentStatus[]>(GENERATED_AGENTS);

    // Simulate "Live" updates
    useEffect(() => {
        const interval = setInterval(() => {
            setAgents(prev => prev.map(a => ({
                ...a,
                status: Math.random() > 0.95 ? 'ERROR' : Math.random() > 0.4 ? 'ACTIVE' : 'IDLE',
                latency: Math.max(100, a.latency + (Math.random() * 50 - 25)),
                ragUsage: a.status === 'ACTIVE' && Math.random() > 0.6,
                load: a.status === 'ACTIVE' ? Math.min(100, Math.max(0, a.load + (Math.random() * 20 - 10))) : 0
            })));
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (agent: AgentStatus) => {
        if (agent.status === 'ERROR') return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]';
        if (agent.ragUsage) return 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] animate-pulse'; // RAG
        if (agent.latency < 500) return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'; // Fast
        return 'bg-emerald-800'; // Idle/Normal
    };

    const activeCount = agents.filter(a => a.status === 'ACTIVE').length;
    const errorCount = agents.filter(a => a.status === 'ERROR').length;
    const totalLoad = agents.reduce((acc, a) => acc + a.load, 0);

    return (
        <div className="bg-black/80 backdrop-blur-md rounded-xl border border-white/10 p-4 w-full h-full overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Activity size={18} className="text-cyan-400" />
                    <h3 className="text-sm font-mono font-bold text-white uppercase">Swarm Health</h3>
                </div>
                <div className="flex gap-4 text-xs font-mono">
                    <span className="text-green-400">ONLINE: {activeCount}</span>
                    <span className="text-red-400">CRITICAL: {errorCount}</span>
                    <span className="text-blue-400">LOAD: {Math.round(totalLoad / 51)}%</span>
                </div>
            </div>

            {/* LED Grid */}
            <div className="grid grid-cols-10 gap-1.5 auto-rows-min overflow-y-auto pr-1">
                {agents.map((agent) => (
                    <motion.div
                        key={agent.id}
                        layout
                        initial={false}
                        className={`aspect-square rounded-sm ${getStatusColor(agent)} relative group cursor-pointer transition-colors duration-300`}
                    >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-slate-900 border border-white/20 p-2 rounded text-[10px] hidden group-hover:block z-50 pointer-events-none">
                            <div className="text-white font-bold">{agent.name}</div>
                            <div className="text-gray-400">{agent.latency}ms</div>
                            {agent.ragUsage && <div className="text-blue-400 flex items-center gap-1"><Database size={8} /> RAG ACTIVE</div>}
                            {agent.status === 'ERROR' && <div className="text-red-400 flex items-center gap-1"><AlertTriangle size={8} /> TIMEOUT</div>}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-auto pt-2 text-[10px] text-white/30 font-mono text-center">
                SYSTEM_SOVEREIGNTY_LEVEL: 99.9%
            </div>
        </div>
    );
}
