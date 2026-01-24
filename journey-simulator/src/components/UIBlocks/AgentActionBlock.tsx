/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { motion } from 'framer-motion';
import { Bot, Sparkles, Code, Shield, Zap, Brain, Users, Rocket } from 'lucide-react';

interface AgentActionBlockProps {
    agent_name: string;
    action: string;
    reason: string;
    parameters?: Record<string, any>;
}

const AGENT_CONFIGS: Record<string, { icon: any; color: string; gradient: string }> = {
    // Core Agents
    GuideAgent: {
        icon: Sparkles,
        color: 'text-blue-400',
        gradient: 'from-blue-500 to-cyan-500',
    },
    HubAgent: {
        icon: Brain,
        color: 'text-purple-400',
        gradient: 'from-purple-500 to-pink-500',
    },
    ZynoOrchestrator: {
        icon: Sparkles,
        color: 'text-accent-cyan',
        gradient: 'from-accent-cyan to-accent-purple',
    },
    CollaterizeAgent: {
        icon: Rocket,
        color: 'text-green-400',
        gradient: 'from-green-500 to-emerald-500',
    },
    
    // Capital Foundry Agents
    CapitalAgent: {
        icon: Zap,
        color: 'text-emerald-400',
        gradient: 'from-emerald-500 to-teal-500',
    },
    RiskAgent: {
        icon: Shield,
        color: 'text-orange-400',
        gradient: 'from-orange-500 to-red-500',
    },
    
    // System Architect Agents
    InfrastructureAgent: {
        icon: Code,
        color: 'text-cyan-400',
        gradient: 'from-cyan-500 to-blue-500',
    },
    DePINAgent: {
        icon: Rocket,
        color: 'text-indigo-400',
        gradient: 'from-indigo-500 to-purple-500',
    },
    AIProvenanceAgent: {
        icon: Brain,
        color: 'text-fuchsia-400',
        gradient: 'from-fuchsia-500 to-pink-500',
    },
    GuardianAgent: {
        icon: Shield,
        color: 'text-blue-400',
        gradient: 'from-blue-500 to-indigo-500',
    },
    
    // Experience Studio Agents
    CreativeAgent: {
        icon: Sparkles,
        color: 'text-pink-400',
        gradient: 'from-pink-500 to-rose-500',
    },
    NFTArchitectAgent: {
        icon: Zap,
        color: 'text-purple-400',
        gradient: 'from-purple-500 to-violet-500',
    },
    GameplayAgent: {
        icon: Brain,
        color: 'text-indigo-400',
        gradient: 'from-indigo-500 to-blue-500',
    },
    UXAgent: {
        icon: Users,
        color: 'text-cyan-400',
        gradient: 'from-cyan-500 to-teal-500',
    },
    
    // Impact Engine Agents
    GovernanceAgent: {
        icon: Users,
        color: 'text-violet-400',
        gradient: 'from-violet-500 to-purple-500',
    },
    DaoGovernanceAgent: {
        icon: Users,
        color: 'text-violet-400',
        gradient: 'from-violet-500 to-purple-500',
    },
    PhilanthropyAgent: {
        icon: Sparkles,
        color: 'text-amber-400',
        gradient: 'from-amber-500 to-yellow-500',
    },
    ReputationAgent: {
        icon: Shield,
        color: 'text-lime-400',
        gradient: 'from-lime-500 to-green-500',
    },
    
    // Resilience Master Agents
    SecurityAgent: {
        icon: Shield,
        color: 'text-red-400',
        gradient: 'from-red-500 to-orange-500',
    },
    ExploitHunterAgent: {
        icon: Zap,
        color: 'text-rose-400',
        gradient: 'from-rose-500 to-red-500',
    },
    DefenseAgent: {
        icon: Shield,
        color: 'text-blue-400',
        gradient: 'from-blue-500 to-cyan-500',
    },
    IncidentResponseAgent: {
        icon: Brain,
        color: 'text-orange-400',
        gradient: 'from-orange-500 to-amber-500',
    },
    
    // Shared Agents
    CommunityAgent: {
        icon: Users,
        color: 'text-amber-400',
        gradient: 'from-amber-500 to-orange-500',
    },
    Web3LegalAgent: {
        icon: Shield,
        color: 'text-slate-400',
        gradient: 'from-slate-500 to-gray-500',
    },
};

export const AgentActionBlock = ({
    agent_name,
    action,
    reason,
    parameters,
}: AgentActionBlockProps) => {
    const agentConfig = AGENT_CONFIGS[agent_name] || {
        icon: Bot,
        color: 'text-white',
        gradient: 'from-gray-500 to-slate-500',
    };

    const Icon = agentConfig.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:shadow-lg"
        >
            {/* Background Gradient Effect */}
            <div
                className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-10 bg-gradient-to-br ${agentConfig.gradient}`}
            />

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <div className="mb-4 flex items-start gap-4">
                    {/* Agent Avatar */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${agentConfig.gradient} shadow-lg`}
                    >
                        <Icon size={24} className="text-white" />
                    </motion.div>

                    {/* Agent Info */}
                    <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                            <h3 className={`font-space text-lg font-bold ${agentConfig.color}`}>
                                {agent_name}
                            </h3>
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"
                            />
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                            AI Agent
                        </p>
                    </div>
                </div>

                {/* Action */}
                <div className="mb-3">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/40">
                        Action
                    </div>
                    <p className="font-semibold text-white">
                        {action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </p>
                </div>

                {/* Reason */}
                <div className="mb-4">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/40">
                        Reason
                    </div>
                    <p className="text-sm leading-relaxed text-white/70">{reason}</p>
                </div>

                {/* Parameters */}
                {parameters && Object.keys(parameters).length > 0 && (
                    <div>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                            Parameters
                        </div>
                        <div className="space-y-2">
                            {Object.entries(parameters).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="flex items-start justify-between gap-4 rounded-lg bg-black/20 px-3 py-2"
                                >
                                    <span className="text-xs font-semibold text-white/60">
                                        {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                    </span>
                                    <span className="text-xs font-mono text-white/80">
                                        {typeof value === 'object'
                                            ? JSON.stringify(value, null, 2)
                                            : String(value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Decorative Corner */}
            <div className="absolute right-0 top-0 h-20 w-20 opacity-20">
                <div
                    className={`h-full w-full bg-gradient-to-br ${agentConfig.gradient} blur-2xl`}
                />
            </div>
        </motion.div>
    );
};
