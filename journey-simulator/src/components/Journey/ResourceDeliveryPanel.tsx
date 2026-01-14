import { GeneratedResource } from '../../types/journey';

type Props = {
  resources: GeneratedResource[];
};

export const ResourceDeliveryPanel = ({ resources }: Props) => {
  if (!resources || resources.length === 0) {
    return <p className="text-[11px] opacity-70">Aucune ressource générée pour l’instant.</p>;
  }

  return (
    <div className="space-y-2 max-h-56 overflow-auto">
      {resources.map((res, idx) => (
        <div key={idx} className="rounded-lg border border-white/10 bg-black/20 p-2">
          <div className="text-[12px] font-semibold text-white">{res.title}</div>
          {'kind' in res && <div className="text-[11px] text-white/60 mb-1">{res.kind}</div>}
          {'url' in res && res.url && (
            <a className="text-accent-cyan text-[11px]" href={res.url} target="_blank" rel="noreferrer">Ouvrir</a>
          )}
          {'code' in res && res.code && (
            <pre className="mt-1 whitespace-pre-wrap text-[11px] bg-black/40 p-2 rounded">{res.code}</pre>
          )}
          {'description' in res && res.description && <p className="text-[11px] text-white/70 mt-1">{res.description}</p>}
        </div>
      ))}
    </div>
  );
};
