import { ActiveAgent } from '../../types/journey';

type Props = {
  agents: ActiveAgent[];
};

export const ActiveAgentsPanel = ({ agents }: Props) => {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {agents.map((agent) => (
        <div key={agent.id} className="flex flex-col md:flex-row items-start gap-2 rounded-lg border border-white/10 bg-black/20 p-2">
          <div
            aria-label={`${agent.status}-indicator`}
            className={`h-3 w-3 rounded-full mt-1 ${agent.status === 'done'
              ? 'bg-emerald-400'
              : agent.status === 'analyzing'
                ? 'bg-amber-400 animate-pulse'
                : 'bg-white/40'
              }`}
          />
          <div className="flex-1">
            <div className="text-[12px] font-semibold text-white">{agent.name}</div>
            <div className="text-[11px] text-white/60">{agent.role}</div>
            <div className="text-[11px] text-white/70">{agent.bio}</div>
          </div>
        </div>
      ))}
      {agents.length === 0 && <p className="text-[11px] opacity-70 text-white">No agents active.</p>}
    </div>
  );
};
