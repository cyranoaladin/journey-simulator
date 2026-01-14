/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { BrainCircuit, MessageSquare, Sparkles } from 'lucide-react';
import { memo } from 'react';
import type { AgentTimelineEntry } from '../Zyno/types';

interface PhaseInteractionBlockProps {
  phaseId: string;
  currentStep: AgentTimelineEntry | null;
  onFeedback?: (step: AgentTimelineEntry) => void;
}

const PhaseInteractionBlock = ({ phaseId, currentStep, onFeedback }: PhaseInteractionBlockProps) => {
  const isActivePhase = currentStep?.phase === phaseId || (!currentStep?.phase && !!currentStep);

  if (!currentStep) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-400/40 bg-slate-900/30 p-4 text-xs text-slate-300">
        <p className="flex items-center gap-2 font-medium text-slate-200">
          <BrainCircuit size={14} className="text-accent-cyan" />
          Zyno standby
        </p>
        <p className="mt-2">Trigger the phase to activate the agentic assistant.</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border p-4 transition-colors ${isActivePhase
        ? 'border-accent-cyan/60 bg-accent-cyan/10 shadow-neon-ring'
        : 'border-slate-700/50 bg-slate-900/40'
        }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent-cyan">Zyno Insight</p>
          <h5 className="mt-1 text-sm font-semibold text-slate-100">{currentStep.agent}</h5>
        </div>
        {onFeedback && (
          <button
            type="button"
            onClick={() => onFeedback(currentStep)}
            className="inline-flex items-center gap-2 rounded-full border border-accent-cyan/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-cyan transition hover:bg-accent-cyan/10"
          >
            <MessageSquare size={12} />
            Feedback
          </button>
        )}
      </div>

      <div className="mt-3 space-y-3 text-xs text-slate-200">
        <div>
          <p className="mb-1 font-semibold text-slate-100">Reasoning</p>
          <p className="leading-relaxed text-slate-300">
            {currentStep.reasoning ?? 'No reasoning communicated.'}
          </p>
        </div>
        <div>
          <p className="mb-1 font-semibold text-slate-100">Proposed Action</p>
          <p className="leading-relaxed text-slate-300">
            {currentStep.action ?? 'Action pending validation.'}
          </p>
        </div>
        {currentStep.sources && currentStep.sources.length > 0 && (
          <div>
            <p className="mb-1 font-semibold text-slate-100">Sources</p>
            <ul className="space-y-1">
              {currentStep.sources.slice(0, 3).map((source: { id?: string; title?: string; url?: string }) => {
                const sourceKey = String(
                  source?.id ?? source?.title ?? source?.url ?? `source-${source?.title ?? 'unknown'}`
                );
                return (
                  <li key={sourceKey} className="flex items-center gap-2 text-slate-300">
                    <Sparkles size={12} className="text-accent-cyan" />
                    <span>{source?.title ?? source?.url ?? 'Anonymous source'}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <span>Intent : {currentStep.intent ?? ''}</span>
        <span>Duration : {currentStep.durationMs ? `${(currentStep.durationMs / 1000).toFixed(1)}s` : ''}</span>
      </div>
    </div>
  );
};

export default memo(PhaseInteractionBlock);
