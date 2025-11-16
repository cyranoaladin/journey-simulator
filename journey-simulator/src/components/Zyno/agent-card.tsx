import type { AgentResult } from './types';

const renderReferenceLabel = (entry: { title?: string; content?: string } | undefined, index: number) => {
  if (!entry) {
    return `Reference ${index + 1}`;
  }

  if (entry.title && entry.title.trim().length > 0) {
    return entry.title;
  }

  if (entry.content) {
    return `${entry.content.slice(0, 60)}…`;
  }

  return `Reference ${index + 1}`;
};

type Props = {
  agent: AgentResult;
};

export default function AgentCard({ agent }: Props) {
  return (
    <article className="border border-slate-200 rounded-xl p-4 shadow-sm bg-white space-y-3">
      <header className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">🤖 {agent.agent}</h3>
        {typeof agent.activationLevel === 'number' && (
          <span className="text-xs font-medium text-slate-500">
            Activation level: {Math.round(agent.activationLevel * 100) / 100}
          </span>
        )}
      </header>

      {agent.ae_summary && (
        <p className="text-sm text-slate-700">
          <span className="font-semibold">Summary:</span> {agent.ae_summary}
        </p>
      )}

      <section className="text-xs">
        <p className="font-semibold text-slate-700">Payload</p>
        <pre className="bg-slate-900 text-slate-100 rounded-md p-3 overflow-x-auto whitespace-pre-wrap">
          {typeof agent.payload === 'string'
            ? agent.payload
            : JSON.stringify(agent.payload, null, 2)}
        </pre>
      </section>

      {Array.isArray(agent.ragEnriched) && agent.ragEnriched.length > 0 && (
        <section className="text-xs">
          <p className="font-semibold text-slate-700">RAG references</p>
          <ul className="list-disc list-inside space-y-1">
            {agent.ragEnriched.map((entry, index) => (
              <li key={index}>{renderReferenceLabel(entry, index)}</li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
