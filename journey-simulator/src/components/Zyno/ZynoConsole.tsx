import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Activity,
  Bot,
  ClipboardList,
  History,
  Lightbulb,
  Loader2,
  RefreshCw,
  Rocket,
  ScanLine,
  Send,
  Sparkles,
  Target,
  TimerReset,
} from 'lucide-react';
import AgentLogViewer from './AgentLogViewer';
import ZynoMissionFlow from './ZynoMissionFlow';
import MissionFeedbackSummary, { MissionSummary } from './MissionFeedbackSummary';
import type { OrchestrationResult } from './types';
import sampleMissionSummary from '../../data/sample_mission_feedback.json';
import ZynoAgentScoreboard from './ZynoAgentScoreboard';
import ZynoDAOAdminPanel from './ZynoDAOAdminPanel';
import AgentFeedbackForm from './AgentFeedbackForm';
import { API_BASE_URL } from '../../utils/api';
import { AgentScoreboardProvider } from './AgentScoreboardContext';
import ResourceUploader from './ResourceUploader';
import ZynoDecisionPanel from './ZynoDecisionPanel';

const quickIntents = [
  {
    label: 'Pitch deck synthesis',
    value: 'Analyze my current mission and generate an investor pitch deck ready for Synaptic DAO.',
    icon: Rocket,
  },
  {
    label: 'Tokenomics Audit',
    value: 'Evaluate the viability of my token by identifying weaknesses, dilution risks, and retention scenarios.',
    icon: Activity,
  },
  {
    label: 'DAO Plan',
    value: 'Build a DAO voting plan with quorum, power levels, and AEPO/AECO tracking.',
    icon: Target,
  },
  {
    label: 'Investor Memo',
    value: 'Produce a clear investor memo with traction, roadmap, and liquidity needs.',
    icon: Lightbulb,
  },
] as const;

const consoleMotion = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] },
  },
} as const;

type ProbeStatus = 'unknown' | 'passing' | 'failing';

interface ProbeState {
  status: ProbeStatus;
  latencyMs: number | null;
  lastChecked: string | null;
  error: string | null;
}

const HEALTH_POLL_INTERVAL_MS = 60000;

const probeConfig = {
  healthz: { label: 'Live', path: '/healthz' },
  readyz: { label: 'Ready', path: '/readyz' },
} as const;

type ProbeKey = keyof typeof probeConfig;
const probeKeys = Object.keys(probeConfig) as ProbeKey[];

const createProbeState = (): ProbeState => ({
  status: 'unknown',
  latencyMs: null,
  lastChecked: null,
  error: null,
});

const getProbeBadgeClasses = (status: ProbeStatus) => {
  if (status === 'passing') {
    return 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200';
  }
  if (status === 'failing') {
    return 'border-rose-400/50 bg-rose-500/15 text-rose-200';
  }
  return 'border-slate-300/60 bg-slate-500/10 text-slate-200';
};

type Status = 'idle' | 'loading' | 'error';
type PromptStatus = 'pending' | 'success' | 'error';

interface PromptHistoryEntry {
  id: string;
  text: string;
  createdAt: string;
  status: PromptStatus;
}

const generatePromptId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `prompt-${Math.random().toString(36).slice(2, 11)}`;
};

interface ZynoConsoleProps {
  onMissionUpdate?: (summary: MissionSummary | null) => void;
}

export function ZynoConsole({ onMissionUpdate }: ZynoConsoleProps) {
  const [userInput, setUserInput] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<OrchestrationResult | null>(null);
  const [missionSummary, setMissionSummary] = useState<MissionSummary | null>(
    sampleMissionSummary as MissionSummary,
  );
  const [history, setHistory] = useState<PromptHistoryEntry[]>([]);
  const [healthProbes, setHealthProbes] = useState<Record<ProbeKey, ProbeState>>(() => ({
    healthz: createProbeState(),
    readyz: createProbeState(),
  }));
  const [healthRefreshState, setHealthRefreshState] = useState<'idle' | 'refreshing'>('idle');
  const shouldReduceMotion = useReducedMotion();

  const refreshHealthStatus = useCallback(async () => {
    setHealthRefreshState('refreshing');
    try {
      const updates = await Promise.all(
        probeKeys.map(async (key) => {
          const started = typeof performance !== 'undefined' ? performance.now() : Date.now();
          try {
            const response = await fetch(`${API_BASE_URL}${probeConfig[key].path}`);
            const ended = typeof performance !== 'undefined' ? performance.now() : Date.now();
            const latencyMs = Math.round(ended - started);
            return [
              key,
              {
                status: response.ok ? 'passing' : 'failing',
                latencyMs,
                lastChecked: new Date().toISOString(),
                error: response.ok ? null : `HTTP ${response.status}`,
              } as ProbeState,
            ];
          } catch (error) {
            const ended = typeof performance !== 'undefined' ? performance.now() : Date.now();
            const latencyMs = Math.round(ended - started);
            return [
              key,
              {
                status: 'failing',
                latencyMs,
                lastChecked: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Request failed',
              } as ProbeState,
            ];
          }
        }),
      );

      setHealthProbes((previous) => {
        const next = { ...previous };
        updates.forEach(([key, state]) => {
          next[key as ProbeKey] = state as ProbeState;
        });
        return next;
      });
    } finally {
      setHealthRefreshState('idle');
    }
  }, []);

  useEffect(() => {
    refreshHealthStatus();
    const interval = setInterval(refreshHealthStatus, HEALTH_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refreshHealthStatus]);

  const buildSummaryFromResult = (payload: OrchestrationResult): MissionSummary => {
    const timeline = payload.timeline ?? [];
    const agentScores = timeline
      .map((entry) => entry.feedback?.aepo ?? payload.results[entry.agent]?.feedback?.aepo ?? null)
      .filter((value): value is number => typeof value === 'number');

    const aepoScore = agentScores.length
      ? Math.min(
        100,
        Math.round(
          agentScores.reduce((sum, value) => sum + value, 0) / agentScores.length
        )
      )
      : 50;

    const generatedTextLines = timeline.map((entry) => {
      const reasoning = entry.reasoning ?? payload.results[entry.agent]?.feedback?.ae_summary ?? 'Summary unavailable';
      return `• ${entry.agent} → ${reasoning}`;
    });

    return {
      userId: 'demo_user',
      timestamp: new Date().toISOString(),
      aepoScore,
      aecoPhase: payload.intent,
      agents: timeline.length ? timeline.map((entry) => entry.agent) : payload.executedAgents,
      generatedText: `Automatically generated synthesis:\n${generatedTextLines.join('\n')}`,
    };
  };

  const handleRunSimulation = async (prompt?: string) => {
    const intent = prompt ?? userInput;
    const trimmed = intent.trim();
    if (!trimmed) {
      return;
    }

    const entryId = generatePromptId();
    setHistory((prev) => [
      { id: entryId, text: trimmed, createdAt: new Date().toISOString(), status: 'pending' },
      ...prev,
    ]);

    setStatus('loading');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

    try {
      const response = await fetch(`${API_BASE_URL}/orchestration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: trimmed, userId: 'demo_user' }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload: OrchestrationResult = await response.json();
      const summary = buildSummaryFromResult(payload);
      setResult(payload);
      setMissionSummary(summary);
      setStatus('idle');
      setHistory((prev) =>
        prev.map((entry) =>
          entry.id === entryId ? { ...entry, status: 'success' } : entry,
        ),
      );

      if (!prompt) {
        setUserInput('');
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('Simulation error:', error);

      let errorMessage = 'An unexpected error occurred.';
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setStatus('error');
      setMissionSummary(null);
      setHistory((prev) =>
        prev.map((entry) =>
          entry.id === entryId ? { ...entry, status: 'error', text: `${entry.text} (Error: ${errorMessage})` } : entry,
        ),
      );
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setResult(null);
    setMissionSummary(null);
  };

  useEffect(() => {
    onMissionUpdate?.(missionSummary);
  }, [missionSummary, onMissionUpdate]);

  const missionHighlights = useMemo(() => {
    if (!missionSummary) {
      return {
        aepo: 0,
        agents: 0,
        timestamp: null as string | null,
      };
    }

    return {
      aepo: missionSummary.aepoScore,
      agents: missionSummary.agents.length,
      timestamp: new Date(missionSummary.timestamp).toLocaleString(),
    };
  }, [missionSummary]);

  const latestHealthCheck = useMemo(() => {
    const epochs = probeKeys
      .map((key) => healthProbes[key].lastChecked)
      .filter((value): value is string => Boolean(value))
      .map((value) => Date.parse(value));

    if (!epochs.length) {
      return 'Pending';
    }

    const freshest = Math.max(...epochs.filter((value) => Number.isFinite(value)));
    if (!Number.isFinite(freshest)) {
      return 'Pending';
    }
    return new Date(freshest).toLocaleTimeString();
  }, [healthProbes]);

  const failingProbe = useMemo(() => {
    return probeKeys
      .map((key) => healthProbes[key])
      .find((probe) => probe.status === 'failing');
  }, [healthProbes]);

  const currentTimeline = result?.timeline ?? [];
  const currentStep = result?.currentStep ?? null;

  return (
    <AgentScoreboardProvider>
      <motion.section
        variants={shouldReduceMotion ? undefined : consoleMotion}
        initial={shouldReduceMotion ? false : 'hidden'}
        whileInView={shouldReduceMotion ? undefined : 'visible'}
        viewport={shouldReduceMotion ? undefined : { once: true, margin: '-120px' }}
        className="space-y-8"
      >
        <header className="mfai-console-panel flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-accent text-white shadow-neon-ring">
                <Bot size={22} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-mfai-text/60">
                  Zyno Mission Control
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-mfai-text md:text-3xl">
                  Interactive Agentic Console
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 dark:text-mfai-text/80 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-2 shadow-inner-glow dark:border-mfai-border/50 dark:bg-mfai-surfaceAlt/40">
                <span className="text-[11px] uppercase tracking-[0.3em] text-slate-500 dark:text-mfai-text/50">
                  AEPO Score
                </span>
                <p className="mt-1 text-lg font-semibold text-accent">
                  {missionHighlights.aepo || '—'}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-2 shadow-inner-glow dark:border-mfai-border/50 dark:bg-mfai-surfaceAlt/40">
                <span className="text-[11px] uppercase tracking-[0.3em] text-slate-500 dark:text-mfai-text/50">
                  Agents Activated
                </span>
                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-mfai-text">
                  {missionHighlights.agents}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-2 shadow-inner-glow dark:border-mfai-border/50 dark:bg-mfai-surfaceAlt/40">
                <span className="text-[11px] uppercase tracking-[0.3em] text-slate-500 dark:text-mfai-text/50">
                  Last Sync
                </span>
                <p className="mt-1 text-xs text-slate-600 dark:text-mfai-text/70">
                  {missionHighlights.timestamp ?? 'Never'}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-2 shadow-inner-glow dark:border-mfai-border/50 dark:bg-mfai-surfaceAlt/40">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-[0.3em] text-slate-500 dark:text-mfai-text/50">
                    Stack Health
                  </span>
                  <button
                    type="button"
                    onClick={refreshHealthStatus}
                    disabled={healthRefreshState === 'refreshing'}
                    className="inline-flex items-center rounded-full border border-slate-200/60 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-600 transition hover:border-accent/50 hover:text-accent disabled:opacity-60 dark:border-mfai-border/50 dark:text-mfai-text/70"
                    title="Refresh health probes"
                  >
                    {healthRefreshState === 'refreshing' ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <RefreshCw size={12} />
                    )}
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {probeKeys.map((key) => {
                    const probe = healthProbes[key];
                    const label = probeConfig[key].label;
                    return (
                      <span
                        key={key}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${getProbeBadgeClasses(probe.status)}`}
                      >
                        {label}
                        <span className="text-[10px] opacity-70">
                          {typeof probe.latencyMs === 'number' ? `${probe.latencyMs}ms` : '—'}
                        </span>
                      </span>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-slate-500 dark:text-mfai-text/50">
                  Last check: {latestHealthCheck}
                </p>
                {failingProbe?.error ? (
                  <p className="mt-1 text-xs text-rose-400">
                    {failingProbe.error}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
          <p className="max-w-3xl text-sm text-slate-600 dark:text-mfai-text/80 md:text-base">
            Describe your missions, relaunch agents, or trigger DAO exports. The quick templates below
            accelerate interactions and ensure complete guidance for your Web3 journey.
          </p>
        </header>

        <div className="console-response-grid gap-6">
          <div className="flex flex-col gap-5">
            <motion.form
              onSubmit={(event) => {
                event.preventDefault();
                handleRunSimulation();
              }}
              className="mfai-console-panel space-y-4"
            >
              <label
                htmlFor="zyno-console-input"
                className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-mfai-text/80"
              >
                <Sparkles size={16} className="text-accent" />
                Mission Input / Intent
              </label>
              <textarea
                id="zyno-console-input"
                className="min-h-[140px] w-full rounded-3xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-inner-glow focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 dark:border-mfai-border/60 dark:bg-mfai-surfaceAlt/50 dark:text-mfai-text"
                placeholder="Ex: Orchestrate the launch roadmap for my DeFi protocol and identify critical risks."
                value={userInput}
                onChange={(event) => setUserInput(event.target.value)}
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-mfai-text/70">
                  <ClipboardList size={14} />
                  <span>History stored locally — your prompts remain private.</span>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    whileHover={shouldReduceMotion || status === 'loading' ? undefined : { scale: 1.05 }}
                    whileTap={shouldReduceMotion || status === 'loading' ? undefined : { scale: 0.97 }}
                    disabled={status === 'loading'}
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-accent/40 hover:text-accent dark:border-mfai-border/60 dark:text-mfai-text/70"
                  >
                    <TimerReset size={14} />
                    Reset
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={shouldReduceMotion || status === 'loading' || !userInput.trim() ? undefined : { scale: 1.03 }}
                    whileTap={shouldReduceMotion || status === 'loading' || !userInput.trim() ? undefined : { scale: 0.97 }}
                    disabled={status === 'loading' || !userInput.trim()}
                    className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2 text-sm font-semibold transition duration-300 ease-out-quart focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${status === 'loading' || !userInput.trim()
                        ? 'cursor-not-allowed border border-slate-200/70 bg-slate-100 text-slate-500 dark:border-mfai-border/60 dark:bg-mfai-surfaceMuted dark:text-mfai-text/50 opacity-70'
                        : 'bg-gradient-accent text-white shadow-neon-ring'
                      }`}
                  >
                    {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {status === 'loading' ? 'Analyzing...' : 'Start Simulation'}
                  </motion.button>
                </div>
              </div>
            </motion.form>

            <div className="mfai-console-panel space-y-3">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-mfai-text/60">
                Quick Templates
              </p>
              <div className="flex flex-wrap gap-2">
                {quickIntents.map((intent) => (
                  <motion.button
                    type="button"
                    key={intent.label}
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                    onClick={() => {
                      setUserInput(intent.value);
                      handleRunSimulation(intent.value);
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl border border-accent/40 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-accent transition-colors hover:bg-accent/10 dark:bg-mfai-surface/60"
                  >
                    <intent.icon size={14} />
                    {intent.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="mfai-console-panel space-y-4">
              <header className="flex items-center justify-between text-sm text-slate-600 dark:text-mfai-text/70">
                <div className="flex items-center gap-2">
                  <History size={16} />
                  Request History
                </div>
                <button
                  type="button"
                  className="text-xs text-accent underline-offset-4 hover:underline"
                  onClick={() => setHistory([])}
                >
                  Clear
                </button>
              </header>
              {history.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-mfai-text/60">
                  No missions recorded yet.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {history.map((entry) => (
                    <li
                      key={entry.id}
                      className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm text-slate-700 dark:border-mfai-border/60 dark:bg-mfai-surfaceAlt/40 dark:text-mfai-text/80"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-mfai-text/60">
                        <span>{new Date(entry.createdAt).toLocaleTimeString()}</span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${entry.status === 'success'
                            ? 'bg-success/15 text-success'
                            : entry.status === 'error'
                              ? 'bg-danger/15 text-danger'
                              : 'bg-info/15 text-info'
                            }`}
                        >
                          {entry.status === 'success' && 'Completed'}
                          {entry.status === 'error' && 'Error'}
                          {entry.status === 'pending' && 'Pending'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-800 dark:text-mfai-text">{entry.text}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <motion.button
                          type="button"
                          whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                          whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                          className="rounded-full border border-slate-200/70 px-3 py-1 text-xs text-slate-600 hover:border-accent/60 hover:text-accent dark:border-mfai-border/60 dark:text-mfai-text/70"
                          onClick={() => setUserInput(entry.text)}
                        >
                          Reuse
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                          whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                          className="rounded-full border border-accent/40 px-3 py-1 text-xs text-accent hover:bg-accent/10"
                          onClick={() => handleRunSimulation(entry.text)}
                        >
                          Relaunch
                        </motion.button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <ZynoDecisionPanel currentStep={currentStep} timeline={currentTimeline} />

            <MissionFeedbackSummary summary={missionSummary} />

            {result ? (
              <div className="mfai-console-panel space-y-4">
                <header className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-mfai-text/80">
                    <ScanLine size={16} className="text-accent" />
                    Mission Flow
                  </div>
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-mfai-text/60">
                    {result.mode} Mode
                  </span>
                </header>
                <ZynoMissionFlow
                  intent={result.intent}
                  mode={result.mode}
                  executedAgents={result.executedAgents}
                  results={result.results}
                />
              </div>
            ) : (
              <div className="mfai-console-panel text-sm text-slate-600 dark:text-mfai-text/60">
                Launch a simulation to visualize agent sequencing and deliverables.
              </div>
            )}

            {result?.executedAgents?.length ? (
              <div className="mfai-console-panel space-y-3">
                <header className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-800 dark:text-mfai-text">
                    Share your agentic experience
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-mfai-text/70">
                    Give an AECO rating to each agent to refine future recommendations.
                  </p>
                </header>
                <div className="grid gap-4 md:grid-cols-2">
                  {result.executedAgents.map((agentName: string) => (
                    <AgentFeedbackForm
                      key={agentName}
                      agentName={agentName}
                      userId={missionSummary?.userId ?? 'demo_user'}
                      missionId={result?.parcoursTemplate?.templateId}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <ZynoAgentScoreboard />
            <ResourceUploader />
            <ZynoDAOAdminPanel />
            <AgentLogViewer />
          </div>
        </div>
      </motion.section>
    </AgentScoreboardProvider>
  );
}
