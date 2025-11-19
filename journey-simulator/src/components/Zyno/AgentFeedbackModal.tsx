import { useEffect, useMemo, useRef } from 'react';
import { Clock, MessageSquare, X } from 'lucide-react';
import { useJourneyStore } from '../../store/journeyStore';
import AgentFeedbackForm from './AgentFeedbackForm';
import type { AgentTimelineEntry } from './types';

interface AgentFeedbackModalProps {
  step: AgentTimelineEntry;
  userId: string;
  missionId?: string | null;
}

const formatDuration = (durationMs: number | null | undefined) => {
  if (!durationMs || durationMs <= 0) {
    return 'Non mesure';
  }

  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  const seconds = durationMs / 1000;

  if (seconds < 60) {
    return `${seconds.toFixed(1)} s`;
  }

  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return `${minutes} min ${rest} s`;
};

export default function AgentFeedbackModal({ step, userId, missionId }: AgentFeedbackModalProps) {
  const { closeModal } = useJourneyStore();
  const closeTimerRef = useRef<number | null>(null);

  const sources = useMemo(() => {
    if (!Array.isArray(step.sources)) {
      return [];
    }

    return step.sources.slice(0, 3);
  }, [step.sources]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, []);

  const handleSuccess = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      closeModal();
    }, 1500);
  };

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl dark:bg-slate-900 dark:text-white">
      <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Retour agentique</p>
          <h2 className="mt-1 text-xl font-semibold">Partagez votre avis sur {step.agent}</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Phase : {step.phase ?? 'Non specifiee'} • Intent : {step.intent ?? 'Indefinie'}
          </p>
        </div>
        <button
          type="button"
          onClick={closeModal}
          className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-slate-100"
          aria-label="Fermer le module de feedback"
        >
          <X size={18} />
        </button>
      </header>

      <div className="grid gap-6 px-6 py-5 sm:grid-cols-[1.2fr_1fr]">
        <section className="space-y-4">
          <article className="rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-700">
            <header className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              <MessageSquare size={14} /> Contexte propose par Zyno
            </header>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Raisonnement</p>
                <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-200">
                  {step.reasoning ?? 'Aucun raisonnement transmis.'}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Action proposee</p>
                <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-200">
                  {step.action ?? 'Action en attente.'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Clock size={14} /> Duree d'execution : {formatDuration(step.durationMs ?? null)}
              </div>
              {sources.length > 0 ? (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Sources</p>
                  <ul className="mt-1 space-y-1">
                    {sources.map((source, index) => (
                      <li key={`${source?.title ?? 'source'}-${index}`} className="text-xs text-slate-600 dark:text-slate-300">
                        {source?.title ?? source?.url ?? 'Source non nommee'}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </article>
        </section>

        <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <AgentFeedbackForm
            agentName={step.agent}
            userId={userId}
            missionId={missionId ?? undefined}
            onSuccess={handleSuccess}
          />
        </section>
      </div>
    </div>
  );
}
