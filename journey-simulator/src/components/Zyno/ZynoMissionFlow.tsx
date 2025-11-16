import AgentCard from './agent-card';
import type { OrchestrationResult } from './types';

type Props = Pick<OrchestrationResult, 'intent' | 'mode' | 'executedAgents' | 'results'>;

export default function ZynoMissionFlow({ intent, mode, executedAgents, results }: Props) {
  if (!executedAgents || executedAgents.length === 0) {
    return (
      <section className="border border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-500">
        No agents executed yet. Submit a mission to start the orchestration.
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">🧠 Zyno Orchestration Overview</h2>
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
            <dd>{executedAgents.join(', ')}</dd>
          </div>
        </dl>
      </div>

      <div className="grid gap-3">
        {executedAgents.map((agentName) => {
          const agentResult = results[agentName];
          if (!agentResult) {
            return null;
          }
          return <AgentCard key={agentName} agent={agentResult} />;
        })}
      </div>
    </section>
  );
}
