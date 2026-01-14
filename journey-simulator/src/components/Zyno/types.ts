// Minimal shared types for Zyno components

export interface ParcoursTemplate {
  templateId?: string;
  fileName?: string;
  name?: string;
  phases?: string[];
}

export interface AgentTimelineEntry {
  agent: string;
  intent?: string;
  phase?: string;
  summary?: string;
  reasoning?: string;
  action?: string;
  status?: 'completed' | 'failed' | 'running' | string;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  sources?: { title?: string; url?: string; description?: string; snippet?: string }[];
  feedback?: { ae_summary?: string; ae_outcome?: string; aepo?: number | null; aeco?: number | null };
  [key: string]: any;
}

export interface AgentResult {
  agent?: string;
  agentId?: string;
  summary?: string;
  output?: string | object;
  actions?: string[];
  findings?: string[];
  ragEnriched?: { title?: string; url?: string }[];
  payload?: any;
  activationLevel?: number;
  ae_summary?: string;
  feedback?: { ae_summary?: string; ae_outcome?: string; aepo?: number | null; aeco?: number | null };
  [key: string]: any;
}

export interface AgentLogEntry extends AgentResult {
  userId?: string;
  agentName?: string;
  timestamp?: string;
  createdAt?: string;
  intent?: string;
  phaseId?: string;
  ae_summary?: string;
}

export interface EnrichedAgent {
  agentId: string;
  summary?: string;
  executiveSummary?: string;
  actions?: string[];
  findings?: string[];
  feedback?: { ae_summary?: string };
  [key: string]: any;
}

export interface OrchestrationResult {
  intent: string;
  mode: string;
  parcoursTemplate?: ParcoursTemplate;
  executedAgents?: string[];
  agents?: string[];
  results?: Record<string, AgentResult>;
  timeline?: AgentTimelineEntry[];
  currentStep?: AgentTimelineEntry | null;
  summary?: string;
  output?: string | object;
  ui_blocks?: any[];
  success?: boolean;
}
