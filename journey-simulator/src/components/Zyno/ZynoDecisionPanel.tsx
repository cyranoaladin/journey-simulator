import { useMemo } from 'react';
import { Clock, Compass, MessageSquare, Route, Sparkles, Target } from 'lucide-react';
import type { AgentTimelineEntry } from './types';

interface ZynoDecisionPanelProps {
  currentStep: AgentTimelineEntry | null;
  timeline: AgentTimelineEntry[];
}

const formatDuration = (durationMs: number | null | undefined) => {
  if (!durationMs || durationMs < 0) {
    return '—';
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
    <aside className="mfai-console-panel space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-accent" />
          <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-mfai-text/70">
            Résumé temps réel de Zyno
          </h3>
        </div>
        <span className="text-xs text-slate-500 dark:text-mfai-text/60">
          {recentTimeline.length} étapes suivies
        </span>
      </header>

      {currentStep ? (
        <div className="rounded-3xl border border-accent/40 bg-white/70 p-4 shadow-inner-glow dark:border-accent/30 dark:bg-mfai-surfaceAlt/30">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-accent">Phase active</p>
          <div className="space-y-3 text-sm text-slate-700 dark:text-mfai-text/80">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-mfai-text/60">
              <Target size={14} />
              <span>{currentStep.intent ?? 'Intent déduite'}</span>
            </div>
            <div className="grid gap-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 dark:text-mfai-text/60">
                  Agent
                </p>
                <p className="font-semibold text-slate-900 dark:text-mfai-text">
                  {currentStep.agent}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 dark:text-mfai-text/60">
                  Raisonnement
                </p>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-mfai-text/80">
                  {currentStep.reasoning ?? 'En attente de raisonnement explicite.'}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 dark:text-mfai-text/60">
                  Action
                </p>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-mfai-text/80">
                  {currentStep.action ?? 'Action à confirmer.'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-mfai-text/60">
                <Clock size={14} />
                <span>Durée : {formatDuration(currentStep.durationMs ?? null)}</span>
              </div>
            </div>

            {currentStep.sources && currentStep.sources.length > 0 && (
              <div className="rounded-2xl bg-white/60 p-3 text-xs dark:bg-mfai-surface/40">
                <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-slate-500 dark:text-mfai-text/60">
                  Sources RAG
                </p>
                <ul className="space-y-1">
                  {currentStep.sources.slice(0, 4).map((source, index) => (
                    <li key={`${source?.title ?? 'source'}-${index}`} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                      <span className="text-slate-600 dark:text-mfai-text/70">
                        {source?.title ?? source?.url ?? 'Source anonyme'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300/60 p-4 text-sm text-slate-600 dark:border-mfai-border/60 dark:text-mfai-text/70">
          Aucune interaction Zyno récente – lancez une mission pour voir l’orchestration ici.
        </div>
      )}

      <div>
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-mfai-text/60">
          <Route size={14} /> Timeline des décisions
        </p>
        {recentTimeline.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-mfai-text/70">Aucun historique disponible.</p>
        ) : (
          <ul className="space-y-3">
            {recentTimeline.map((entry, index) => (
              <li
                key={`${entry.agent}-${entry.startedAt ?? index}`}
                className="rounded-2xl border border-slate-200/70 bg-white/70 p-3 text-xs text-slate-600 dark:border-mfai-border/60 dark:bg-mfai-surfaceAlt/40 dark:text-mfai-text/70"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-mfai-text">{entry.agent}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                      entry.status === 'completed'
                        ? 'bg-success/15 text-success'
                        : 'bg-danger/15 text-danger'
                    }`}
                  >
                    {entry.status === 'completed' ? 'Terminé' : 'Erreur'}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 dark:text-mfai-text/60">
                  <Compass size={12} />
                  <span>{entry.intent ?? 'Intent déduite'}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 dark:text-mfai-text/60">
                  <MessageSquare size={12} />
                  <span>{entry.summary ?? 'Résumé non disponible'}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
