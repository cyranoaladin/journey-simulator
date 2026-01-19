
import React from 'react';
import { AgentAction, ResourceItem } from '../types/uiBlocks';
import { FileText, Bot, Box, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface AgentDeliverablesProps {
    actions?: AgentAction[];
    resources?: ResourceItem[];
}

export const AgentDeliverables: React.FC<AgentDeliverablesProps> = ({ actions = [], resources = [] }) => {
    if (actions.length === 0 && resources.length === 0) return null;

    return (
        <div className="my-4 space-y-3 rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-cyan">
                <Bot size={14} />
                <span>Agent Activity & Deliverables</span>
            </div>

            {/* ACTIONS PULSE */}
            <div className="space-y-2">
                {actions.map((action, idx) => (
                    <div key={idx} className="flex items-start gap-3 rounded-lg bg-white/5 p-2 transition hover:bg-white/10">
                        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-purple/20 text-accent-purple">
                            <CheckCircle2 size={12} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-white">{action.agent_name}</span>
                                <span className="text-[10px] uppercase text-white/40">{action.action}</span>
                            </div>
                            <p className="text-xs text-white/70">{action.reason}</p>
                            {action.parameters && Object.keys(action.parameters).length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                    {Object.entries(action.parameters).map(([k, v]) => (
                                        <span key={k} className="rounded bg-black/40 px-1.5 py-0.5 text-[10px] text-white/50">
                                            {k}: {String(v)}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* RESOURCES (DELIVERABLES) */}
            {resources.length > 0 && (
                <div className="mt-4 border-t border-white/10 pt-3">
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                        <Box size={14} />
                        <span>Generated Resources</span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                        {resources.map((res) => {
                            // Only treat as valid URL if it starts with http/https
                            const hasValidUrl = res.url && res.url.startsWith('http');
                            const handleClick = (e: React.MouseEvent) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('[AgentDeliverables] Resource clicked:', res.label);
                                const content = `${res.label}\n${res.description || ''}\nType: ${res.resource_type || 'document'}`;
                                navigator.clipboard.writeText(content).then(() => {
                                    toast.success('Resource copied to clipboard!', {
                                        description: res.label,
                                        duration: 2000
                                    });
                                }).catch((err) => {
                                    console.error('[AgentDeliverables] Clipboard error:', err);
                                    toast.error('Failed to copy resource');
                                });
                            };
                            
                            return hasValidUrl ? (
                                <a
                                    key={res.id}
                                    href={res.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-2 transition hover:border-emerald-500/30 hover:bg-emerald-500/10"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition">
                                        <FileText size={16} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="truncate text-xs font-medium text-white group-hover:text-emerald-300">{res.label}</div>
                                        <div className="flex items-center gap-2 text-[10px] text-white/50">
                                            <span>{res.resource_type}</span>
                                            {res.agent_owner && <span>• {res.agent_owner}</span>}
                                        </div>
                                    </div>
                                </a>
                            ) : (
                                <button
                                    key={res.id}
                                    type="button"
                                    onClick={handleClick}
                                    className="group flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-2 transition hover:border-emerald-500/30 hover:bg-emerald-500/10 text-left cursor-pointer active:scale-95"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition">
                                        <FileText size={16} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="truncate text-xs font-medium text-white group-hover:text-emerald-300">{res.label}</div>
                                        <div className="flex items-center gap-2 text-[10px] text-white/50">
                                            <span>{res.resource_type}</span>
                                            {res.agent_owner && <span>• {res.agent_owner}</span>}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
