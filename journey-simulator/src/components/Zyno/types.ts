export type AgentResult = {
  agent: string;
  phase?: string;
  activationLevel?: number;
  ae_summary?: string;
  ae_outcome?: string;
  payload?: unknown;
  references?: Array<{ title?: string; content?: string }>;
  ragEnriched?: Array<{ title?: string; content?: string }>;
  checkpoint?: boolean;
};

export type OrchestrationResult = {
  intent: string;
  mode: string;
  executedAgents: string[];
  results: Record<string, AgentResult | undefined>;
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
  payload: unknown;
  ae_summary?: string;
  ae_outcome?: string;
  timestamp: string;
  ragSnippets?: string[];
};
