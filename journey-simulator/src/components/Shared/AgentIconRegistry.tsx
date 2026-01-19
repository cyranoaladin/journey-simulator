import { Bot, Shield, Brain, Coins, Gavel, Eye, Activity, Database, Server, Code, Layers, Users, TrendingUp, Zap, Lock, Terminal } from 'lucide-react';
import React from 'react';

export const AgentIconRegistry: Record<string, React.ElementType> = {
    // Core Swarm
    ZynoAgent: Brain,
    SynthetizerAgent: Bot, // UNIQUE BOT ICON as requested

    // Hub
    HubAgent: Server,
    GuideAgent: Key,

    // Foundry
    DeFiAgent: Coins,
    TokenomicsAgent: TrendingUp,

    // Security
    SecurityAuditAgent: Shield,
    SecurityAgent: Lock,
    RiskFraudAgent: Eye,

    // Governance
    GovernanceDAOAgent: Gavel,
    DAOAgent: Users,

    // Product
    ProductAgent: Layers,
    CreativeAgent: Zap,

    // DevOps
    DevOpsAgent: Terminal,
    ObservabilityAgent: Activity,
    RAGOpsAgent: Database,
    CodeAuditor: Code
};

export const getAgentIcon = (agentName: string) => {
    return AgentIconRegistry[agentName] || Bot; // Default to Bot if unsure
};

// Start of dummy Key component for GuideAgent if not imported (lucide might not have Key everywhere, using Lock as fallback if needed, but Key exists in lucide-react)
import { Key } from 'lucide-react'; 
