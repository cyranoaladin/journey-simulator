import { useMemo } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import type { AgentScoreboardEntry } from '../../utils/api';
import { useAgentScoreboardContext } from './AgentScoreboardContext';

export default function ZynoAgentScoreboard() {
  const { state, apiKey, setApiKey, fetchScoreboard } = useAgentScoreboardContext();

  const totalAgents = state.data.length;
  const averageAepo = useMemo(() => {
    if (!totalAgents) return 0;
    const sum = state.data.reduce<number>((acc, entry) => acc + entry.aepo, 0);
    return Math.round(sum / totalAgents);
  }, [state.data, totalAgents]);

  const averageAeco = useMemo(() => {
    if (!totalAgents) return 0;
    const sum = state.data.reduce<number>((acc, entry) => acc + entry.aeco, 0);
    return Math.round(sum / totalAgents);
  }, [state.data, totalAgents]);

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <BarChart3 size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Agent AEPO / AECO</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Classement dynamique des profils accompagnés par Zyno
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => fetchScoreboard(apiKey)}
          disabled={state.loading || !apiKey}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-400/60"
        >
          <RefreshCw size={16} className={state.loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </header>

      <div className="grid gap-3 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Profils suivis</p>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">{totalAgents}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">AEPO moyen</p>
            <p className="text-xl font-semibold text-indigo-600 dark:text-indigo-300">{averageAepo}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">AECO moyen</p>
            <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-300">{averageAeco}</p>
          </div>
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          fetchScoreboard(apiKey);
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <input
          type="password"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          placeholder="Clé API admin"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-600 dark:bg-slate-800"
        />
        <button
          type="submit"
          className="rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-600 transition hover:border-indigo-500 hover:text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300"
        >
          Charger
        </button>
      </form>

      {state.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          {state.error}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700/60">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/80 dark:text-slate-400">
            <tr>
              <th className="px-3 py-2 text-left">Profil</th>
              <th className="px-3 py-2">AEPO</th>
              <th className="px-3 py-2">AECO</th>
              <th className="px-3 py-2">Missions</th>
              <th className="px-3 py-2">Dernière mise à jour</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700/40">
            {state.data.map((entry: AgentScoreboardEntry) => {
              const profileName = (() => {
                const details = entry.profile as { name?: unknown } | undefined;
                return typeof details?.name === 'string' ? details.name : entry.userId;
              })();
              const lastUpdate = entry.updatedAt
                ? new Date(entry.updatedAt).toLocaleString()
                : '—';

              return (
                <tr key={entry.userId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-3 py-2 font-medium text-slate-900 dark:text-slate-100">{profileName}</td>
                  <td className="px-3 py-2 text-center font-semibold text-indigo-600 dark:text-indigo-300">{entry.aepo}</td>
                  <td className="px-3 py-2 text-center font-semibold text-emerald-600 dark:text-emerald-300">{entry.aeco}</td>
                  <td className="px-3 py-2 text-center">{entry.historyCount}</td>
                  <td className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">{lastUpdate}</td>
                </tr>
              );
            })}

            {!state.loading && state.data.length === 0 && !state.error && (
              <tr>
                <td
                  className="px-3 py-4 text-center text-sm text-slate-500 dark:text-slate-400"
                  colSpan={5}
                >
                  Aucun profil n&apos;est encore suivi.
                </td>
              </tr>
            )}

            {state.loading && (
              <tr>
                <td
                  className="px-3 py-4 text-center text-sm text-slate-500 dark:text-slate-400"
                  colSpan={5}
                >
                  Chargement des métriques…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
