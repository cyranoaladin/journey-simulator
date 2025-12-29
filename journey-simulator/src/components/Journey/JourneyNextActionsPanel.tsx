import React, { useEffect, useMemo, useState } from 'react';
import { getPhaseFromStepId } from '../../config/journeyPhases';
import { getRecentAgentRuns } from '../../api/agentRuns';
import {
    Bot,
    CheckCircle2,
    FileText,
    Lightbulb,
    Loader2,
    Sparkles,
    Wrench
} from 'lucide-react';
import EmptyState from '../shared/EmptyState';
import InfoBadge from '../shared/InfoBadge';

interface Props {
    personaId: string;
    currentStepId: string;
    journeyId?: string; // Optional for now, passed to fetch runs
    className?: string;
    onActionClick?: (actionType: string, actionId: string) => void;
}

const formatActionType = (type: string) => {
    if (type === 'mission') return 'Mission';
    if (type === 'tool') return 'Tool';
    if (type === 'outcome') return 'Outcome';
    return 'Action';
};

const renderActionIcon = (type: string) => {
    if (type === 'mission') return <CheckCircle2 size={18} className="text-accent-cyan" />;
    if (type === 'tool') return <Wrench size={18} className="text-accent-purple" />;
    return <FileText size={18} className="text-accent-gold" />;
};

export const JourneyNextActionsPanel: React.FC<Props> = ({
    personaId,
    currentStepId,
    journeyId,
    className = '',
    onActionClick,
}) => {
    const currentPhase = getPhaseFromStepId(personaId, currentStepId);
    const [recentRuns, setRecentRuns] = useState<any[]>([]);
    const [isLoadingRuns, setIsLoadingRuns] = useState(false);

    useEffect(() => {
        let isMounted = true;
        if (!journeyId) {
            setRecentRuns([]);
            return () => { isMounted = false; };
        }

        setIsLoadingRuns(true);
        getRecentAgentRuns({ journeyId, limit: 3 })
            .then((runs) => {
                if (isMounted) {
                    setRecentRuns(runs ?? []);
                }
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoadingRuns(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [journeyId]);

    const primaryAction = currentPhase?.nextActions?.[0] ?? null;
    const auxiliaryActions = (currentPhase?.nextActions ?? []).slice(1, 4);
    const hasActions = Boolean(currentPhase?.nextActions && currentPhase.nextActions.length > 0);

    const primaryHelperCopy = useMemo(() => {
        if (!primaryAction) return 'Stay focused on recommended steps to advance this phase.';
        if (primaryAction.type === 'mission') {
            return 'Complete this mission to unlock the Zyno evaluation and rewards for this phase.';
        }
        if (primaryAction.type === 'tool') {
            return 'Launch this tool to gather the insights needed before submitting your mission.';
        }
        if (primaryAction.type === 'outcome') {
            return 'Review this outcome to ensure all deliverables are aligned before submission.';
        }
        return 'Act on this recommendation to keep your momentum.';
    }, [primaryAction]);

    if (!currentPhase) {
        return (
            <div className={`glass-effect rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg ${className}`}>
                <EmptyState
                    dense
                    tone="info"
                    title="No phase selected"
                    description="Select a phase on the journey timeline to view the recommended next actions."
                    icon={<Lightbulb size={20} className="text-accent-cyan" />}
                />
            </div>
        );
    }

    const handleAction = (type: string, id: string) => {
        if (onActionClick) {
            onActionClick(type, id);
        }
    };

    return (
        <div
            className={`glass-effect rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg ${className}`}
            data-testid="journey-next-actions"
        >
            <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <Lightbulb className="text-accent-gold" size={20} />
                    <h3 className="text-lg font-semibold text-white">Next Actions</h3>
                </div>
                <InfoBadge
                    label={`Phase ${currentPhase.order}`}
                    tone="default"
                    icon={<Sparkles size={12} className="text-accent-cyan" />}
                />
            </div>

            <p className="text-sm text-white/70 mb-6">
                Stay on course to complete <span className="text-accent-cyan font-medium">{currentPhase.label}</span>. Zyno aligns these steps with the journey requirements.
            </p>

            {primaryAction ? (
                <div className="rounded-2xl border border-accent-cyan/30 bg-accent-cyan/10 p-5 mb-5 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white">
                                {renderActionIcon(primaryAction.type)}
                            </div>
                            <div>
                                <span className="text-[11px] font-semibold uppercase tracking-widest text-white/60 block">
                                    {formatActionType(primaryAction.type)}
                                </span>
                                <h4 className="text-base font-semibold text-white">{primaryAction.label}</h4>
                                <p className="text-xs text-white/70 mt-1 max-w-md">{primaryHelperCopy}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleAction(primaryAction.type, primaryAction.id)}
                            className="inline-flex items-center gap-2 rounded-full bg-accent-cyan px-4 py-2 text-xs font-bold text-black transition hover:bg-accent-cyan/90 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                        >
                            Start now
                        </button>
                    </div>
                </div>
            ) : (
                <EmptyState
                    dense
                    title="No primary action"
                    description="Zyno will surface missions or tools here once this phase unlocks them."
                    icon={<Lightbulb size={18} className="text-accent-cyan" />}
                />
            )}

            {hasActions && auxiliaryActions.length > 0 ? (
                <div className="space-y-3 mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Also recommended</h4>
                    {auxiliaryActions.map((action) => (
                        <button
                            key={action.id}
                            onClick={() => handleAction(action.type, action.id)}
                            className="w-full text-left group flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-accent-cyan/30 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent-cyan/40"
                            data-testid={`journey-next-action-${action.id}`}
                        >
                            <div className="mt-1 flex-shrink-0">
                                {renderActionIcon(action.type)}
                            </div>
                            <div className="flex-1">
                                <span className="text-[11px] font-semibold uppercase tracking-widest text-white/40 block mb-1">
                                    {formatActionType(action.type)}
                                </span>
                                <p className="text-sm font-medium text-white group-hover:text-white/90">
                                    {action.label}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            ) : null}

            {!hasActions && (
                <EmptyState
                    dense
                    title="No recommended steps"
                    description="This phase does not expose targeted next actions yet. Review the mission brief to continue."
                    icon={<Lightbulb size={18} className="text-accent-gold" />}
                />
            )}

            {/* Recent Agent Outputs */}
            <div className="mt-8 pt-6 border-t border-white/10" data-testid="journey-recent-outputs">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3 flex items-center gap-2">
                    <Bot size={14} /> Agent Intel
                </h4>

                {isLoadingRuns ? (
                    <EmptyState
                        dense
                        tone="info"
                        title="Refreshing agent insights"
                        description="Zyno agents are compiling the latest observations for this journey."
                        icon={<Loader2 size={18} className="animate-spin" />}
                    />
                ) : recentRuns.length > 0 ? (
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
                    <EmptyState
                        dense
                        title="No agent intel yet"
                        description="Once agents provide updates for this journey, their summaries will appear here."
                        icon={<Bot size={18} className="text-accent-cyan" />}
                    />
                )}
            </div>
        </div>
    );
};
