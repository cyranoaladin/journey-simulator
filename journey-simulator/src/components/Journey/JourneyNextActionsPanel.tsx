import React, { useEffect, useState } from 'react';
import { getPhaseFromStepId } from '../../config/journeyPhases';
import { getRecentAgentRuns } from '../../api/agentRuns';
import { Lightbulb, Wrench, FileText, CheckCircle2, Bot } from 'lucide-react';

interface Props {
    personaId: string;
    currentStepId: string;
    journeyId?: string; // Optional for now, passed to fetch runs
    className?: string;
    onActionClick?: (actionType: string, actionId: string) => void;
}

export const JourneyNextActionsPanel: React.FC<Props> = ({
    personaId,
    currentStepId,
    journeyId,
    className = '',
    onActionClick
}) => {
    const currentPhase = getPhaseFromStepId(personaId, currentStepId);
    const [recentRuns, setRecentRuns] = useState<any[]>([]); // Using any for quick prototype, ideally inferred from API

    useEffect(() => {
        if (journeyId) {
            getRecentAgentRuns({ journeyId, limit: 3 }).then(setRecentRuns);
        }
    }, [journeyId]);

    if (!currentPhase) {
        return null;
    }

    return (
        <div
            className={`glass-effect rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg ${className}`}
            data-testid="journey-next-actions"
        >
            <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="text-accent-gold" size={20} />
                <h3 className="text-lg font-semibold text-white">Next Actions</h3>
            </div>

            <p className="text-sm text-white/70 mb-6">
                Recommended steps to complete the <span className="text-accent-cyan font-medium">{currentPhase.label}</span> phase.
            </p>

            <div className="space-y-4">
                {currentPhase.nextActions.map((action) => (
                    <button
                        key={action.id}
                        onClick={() => onActionClick?.(action.type, action.id)}
                        className="w-full text-left group relative flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-accent-cyan/30 active:scale-[0.98] outline-none focus:ring-2 focus:ring-accent-cyan/50"
                        data-testid={`journey-next-action-${action.id}`}
                    >
                        <div className="mt-1 flex-shrink-0">
                            {action.type === 'mission' && <CheckCircle2 size={18} className="text-accent-cyan" />}
                            {action.type === 'tool' && <Wrench size={18} className="text-accent-purple" />}
                            {action.type === 'outcome' && <FileText size={18} className="text-accent-gold" />}
                        </div>

                        <div className="flex-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-white/40 mb-1 block">
                                {action.type}
                            </span>
                            <p className="text-sm font-medium text-white group-hover:text-white/90">
                                {action.label}
                            </p>
                        </div>
                    </button>
                ))}

                {currentPhase.nextActions.length === 0 && (
                    <div className="p-4 text-center text-sm text-white/50 bg-white/5 rounded-xl border border-dashed border-white/10">
                        No specific actions listed for this phase.
                    </div>
                )}
            </div>

            {/* Recent Agent Outputs */}
            <div className="mt-8 pt-6 border-t border-white/10" data-testid="journey-recent-outputs">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3 flex items-center gap-2">
                    <Bot size={14} /> Agent Intel
                </h4>

                {recentRuns.length > 0 ? (
                    <div className="space-y-3">
                        {recentRuns.map((run) => (
                            <div key={run._id} className="rounded-xl bg-black/20 p-3 text-xs" data-testid="journey-recent-output-item">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-accent-cyan">{run.agentName}</span>
                                    <span className="text-white/30 text-[10px]">
                                        {run.createdAt ? new Date(run.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                </div>
                                <p className="text-white/70 italic line-clamp-3">
                                    {typeof run.output === 'string'
                                        ? run.output
                                        : JSON.stringify(run.output || '').slice(0, 150)}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl bg-black/20 p-4 text-xs text-white/60 italic">
                        Agents are monitoring your progress. Outputs will appear here.
                    </div>
                )}
            </div>
        </div>
    );
};
