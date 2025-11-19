export type AgentSource = {
  title?: string;
  content?: string;
  url?: string;
  snippet?: string;
  [key: string]: unknown;
};

export type AgentResult = {
  agent: string;
  phase?: string | null;
  intent?: string | null;
  prompt?: string | null;
  reasoning?: string | null;
  action?: string | null;
  ae_summary?: string | null;
  ae_outcome?: string | null;
  output?: unknown;
  response?: unknown;
  sources?: AgentSource[];
  references?: AgentSource[];
  ragSnippets?: AgentSource[];
  ragEnriched?: AgentSource[];
  activationLevel?: number | null;
  feedback?: {
    ae_summary?: string | null;
    ae_outcome?: string | null;
    aepo?: number | null;
    aeco?: number | null;
  };
  payload?: unknown;
  metrics?: {
    aepo?: number | null;
    aeco?: number | null;
    durationMs?: number | null;
    startedAt?: string | null;
    completedAt?: string | null;
    success?: boolean;
    errorCount?: number;
    [key: string]: unknown;
  } | null;
  raw?: unknown;
};

export type AgentTimelineEntry = {
  agent: string;
  phase: string | null;
  intent: string | null;
  status: 'completed' | 'failed';
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  prompt: string | null;
  reasoning: string | null;
  action: string | null;
  summary: string | null;
  sources: AgentSource[];
  feedback?: AgentResult['feedback'];
};

export type OrchestrationResult = {
  intent: string;
  mode: string;
  executedAgents: string[];
  results: Record<string, AgentResult | undefined>;
  timeline: AgentTimelineEntry[];
  currentStep: AgentTimelineEntry | null;
  parcoursTemplate?: {
    templateId?: string;
    name?: string;
    description?: string;
    [key: string]: unknown;
  } | null;
};

export type AgentLogEntry = {
  userId: string;
  agentName: string;
  intent?: string;
  phaseId?: string | null;
  promptSent?: string | null;
  reasoning?: string | null;
  actionTaken?: string | null;
  response?: unknown;
  output?: unknown;
  sources?: AgentSource[];
  metrics?: AgentResult['metrics'];
  feedback?: AgentResult['feedback'];
  payload: unknown;
  ae_summary?: string;
  ae_outcome?: string;
  timestamp: string;
  ragSnippets?: AgentSource[];
};
