/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { useMemo } from 'react';
import { Clock, Compass, MessageSquare, Route, Sparkles, Target } from 'lucide-react';
import type { AgentTimelineEntry } from './types';

interface ZynoDecisionPanelProps {
  currentStep: AgentTimelineEntry | null;
  timeline: AgentTimelineEntry[];
}

const formatDuration = (durationMs: number | null | undefined) => {
  if (!durationMs || durationMs < 0) {
    return '';
  }
  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }
  const seconds = durationMs / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(1)} s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
};

export default function ZynoDecisionPanel({ currentStep, timeline }: ZynoDecisionPanelProps) {
  const recentTimeline = useMemo(() => timeline.slice(-6).reverse(), [timeline]);

  return (
    <aside className="rounded-2xl border border-white/10 bg-slate-100/5 p-4 space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-accent" />
          <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-600 text-ink-50/70">
            Zyno Real-time Summary
          </h3>
        </div>
        <span className="text-xs text-slate-500 text-ink-50/60">
          {recentTimeline.length} steps tracked
        </span>
      </header>

      {currentStep ? (
        <div className="rounded-3xl border border-accent/40 bg-white/70 p-4 shadow-inner-glow dark:border-accent/30 bg-slate-100/5">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-accent">Active Phase</p>
          <div className="space-y-3 text-sm text-slate-700 text-ink-50/80">
            <div className="flex items-center gap-2 text-xs text-slate-500 text-ink-50/60">
              <Target size={14} />
              <span>{currentStep.intent ?? 'Deduced Intent'}</span>
            </div>
            <div className="grid gap-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 text-ink-50/60">
                  Agent
                </p>
                <p className="font-semibold text-slate-900 text-ink-50">
                  {currentStep.agent}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 text-ink-50/60">
                  Reasoning
                </p>
                <p className="text-sm leading-relaxed text-slate-700 text-ink-50/80">
                  {currentStep.reasoning ?? 'Waiting for explicit reasoning.'}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 text-ink-50/60">
                  Action
                </p>
                <p className="text-sm leading-relaxed text-slate-700 text-ink-50/80">
                  {currentStep.action ?? 'Action to confirm.'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 text-ink-50/60">
                <Clock size={14} />
                <span>Duration: {formatDuration(currentStep.durationMs ?? null)}</span>
              </div>
            </div>

            {currentStep.sources && currentStep.sources.length > 0 && (
              <div className="rounded-2xl bg-white/60 p-3 text-xs bg-slate-100/40">
                <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-slate-500 text-ink-50/60">
                  RAG Sources
                </p>
                <ul className="space-y-1">
                  {currentStep.sources.slice(0, 4).map((source, index) => (
                    <li key={`${source?.title ?? 'source'}-${index}`} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                      <span className="text-slate-600 text-ink-50/70">
                        {source?.title ?? source?.url ?? 'Anonymous Source'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300/60 p-4 text-sm text-slate-600 border-white/10 text-ink-50/70">
          No recent Zyno interaction  start a mission to see orchestration here.
        </div>
      )}

      <div>
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 text-ink-50/60">
          <Route size={14} /> Decision Timeline
        </p>
        {recentTimeline.length === 0 ? (
          <p className="text-sm text-slate-600 text-ink-50/70">No history available.</p>
        ) : (
          <ul className="space-y-3">
            {recentTimeline.map((entry, index) => (
              <li
                key={`${entry.agent}-${entry.startedAt ?? index}`}
                className="rounded-2xl border border-slate-200/70 bg-white/70 p-3 text-xs text-slate-600 border-white/10 bg-slate-100/5 text-ink-50/70"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 text-ink-50">{entry.agent}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${entry.status === 'completed'
                        ? 'bg-success/15 text-success'
                        : 'bg-danger/15 text-danger'
                      }`}
                  >
                    {entry.status === 'completed' ? 'Completed' : 'Error'}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 text-ink-50/60">
                  <Compass size={12} />
                  <span>{entry.intent ?? 'Deduced Intent'}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 text-ink-50/60">
                  <MessageSquare size={12} />
                  <span>{entry.summary ?? 'Summary unavailable'}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
