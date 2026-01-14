/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import AgentCard from './agent-card';
import type { OrchestrationResult, EnrichedAgent } from './types';

type Props = Pick<OrchestrationResult, 'intent' | 'mode' | 'executedAgents' | 'agents' | 'results'>;

export default function ZynoMissionFlow({ intent, mode, executedAgents, agents, results }: Props) {
  // Prioritize new agents[] structure if available AND valid (contains objects)
  const hasEnrichedAgents = Array.isArray(agents) && agents.length > 0 && typeof agents[0] === 'object' && 'agentId' in (agents[0] as any);
  const agentsToDisplay = hasEnrichedAgents ? (agents as unknown as EnrichedAgent[]) : null;
  const legacyMode = !agentsToDisplay && executedAgents && executedAgents.length > 0;

  if (!agentsToDisplay && !legacyMode) {
    return (
      <section className="border border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-500">
        No agents executed yet. Submit a mission to start the orchestration.
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold"> Zyno Orchestration Overview</h2>
        <dl className="grid gap-1 text-sm text-slate-600">
          <div>
            <dt className="font-semibold text-slate-700">Intent detected</dt>
            <dd>{intent}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-700">Execution mode</dt>
            <dd>{mode}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-700">Agents triggered</dt>
            <dd>{agentsToDisplay ? agentsToDisplay.map((a) => a.agentId).join(', ') : (executedAgents ?? []).join(', ')}</dd>
          </div>
        </dl>
      </div>

      <div className="grid gap-3">
        {agentsToDisplay ? (
          // New structure: Display enriched agents with summaries and actions
          agentsToDisplay.map((agent: EnrichedAgent) => (
            <div key={agent.agentId} className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
              <h3 className="font-bold text-lg mb-2 text-accent-cyan">{agent.agentId}</h3>

              {agent.summary && (
                <div className="mb-3">
                  <h4 className="text-xs font-semibold text-slate-600 uppercase mb-1">Analysis</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{agent.summary}</p>
                </div>
              )}

              {agent.actions && agent.actions.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-xs font-semibold text-slate-600 uppercase mb-1">Recommended Actions</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    {agent.actions?.map((action: string, idx: number) => (
                      <li key={idx}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}

              {agent.executiveSummary && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500 italic">{agent.executiveSummary}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          // Legacy fallback: Use executedAgent names + results map
          (executedAgents ?? []).map((agentName) => {
            const agentResult = (results ?? {})[agentName];
            if (!agentResult) return null;
            return <AgentCard key={agentName} agent={agentResult} />;
          })
        )}
      </div>
    </section>
  );
}
