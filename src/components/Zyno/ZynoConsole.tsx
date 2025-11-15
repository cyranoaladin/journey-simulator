import { useState } from 'react';
import AgentLogViewer from './AgentLogViewer';
import ZynoMissionFlow from './ZynoMissionFlow';
import MissionFeedbackSummary, { MissionSummary } from './MissionFeedbackSummary';
import type { OrchestrationResult } from './types';
import sampleMissionSummary from '../../data/sample_mission_feedback.json';
import ZynoAgentScoreboard from './ZynoAgentScoreboard';
import ZynoDAOAdminPanel from './ZynoDAOAdminPanel';
import AgentFeedbackForm from './AgentFeedbackForm.tsx';
import { API_BASE_URL } from '../../utils/api';

type Status = 'idle' | 'loading' | 'error';

export default function ZynoConsole() {
  const [userInput, setUserInput] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<OrchestrationResult | null>(null);
  const [missionSummary, setMissionSummary] = useState<MissionSummary | null>(
    sampleMissionSummary as MissionSummary
  );

  const buildSummaryFromResult = (payload: OrchestrationResult): MissionSummary => {
    const activationLevels = payload.executedAgents
      .map((agentName) => payload.results[agentName]?.activationLevel ?? 0)
      .filter((value) => typeof value === 'number');

    const aepoScore = activationLevels.length
      ? Math.round(
          (activationLevels.reduce((sum, value) => sum + value, 0) / activationLevels.length) * 100
        )
      : 50;

    const generatedTextLines = payload.executedAgents.map((agentName) => {
      const agentResult = payload.results[agentName];
      const summary = agentResult?.ae_summary ?? 'Résumé indisponible';
      return `• ${agentName} → ${summary}`;
    });

    return {
      userId: 'demo_user',
      timestamp: new Date().toISOString(),
      aepoScore,
      aecoPhase: payload.intent,
      agents: payload.executedAgents,
      generatedText: `Synthèse générée automatiquement :\n${generatedTextLines.join('\n')}`,
    };
  };

  const handleRunSimulation = async () => {
    if (userInput.trim().length === 0) {
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch(`${API_BASE_URL}/orchestration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: userInput, userId: 'demo_user' }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload: OrchestrationResult = await response.json();
      setResult(payload);
      setMissionSummary(buildSummaryFromResult(payload));
      setStatus('idle');
    } catch (error) {
      console.error('Simulation error:', error);
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <section className="flex-1 space-y-4">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold">🧪 Simulateur de Dialogue Agentique</h2>
          <p className="text-sm text-slate-500">
            Décrivez une mission à exécuter pour déclencher la sélection automatique des agents.
          </p>
        </header>

        <textarea
          className="w-full h-32 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Entrez une tâche ou une intention..."
          value={userInput}
          onChange={(event) => setUserInput(event.target.value)}
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition"
            onClick={handleRunSimulation}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Analyse en cours…' : '🚀 Lancer la simulation'}
          </button>
          {status === 'error' && (
            <span className="text-sm text-red-600">Une erreur est survenue, réessayez.</span>
          )}
        </div>

        {result && (
          <ZynoMissionFlow
            intent={result.intent}
            mode={result.mode}
            executedAgents={result.executedAgents}
            results={result.results}
          />
        )}
      </section>

      <aside className="flex-1 space-y-6">
        <MissionFeedbackSummary summary={missionSummary} />
        {result?.executedAgents?.length ? (
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
            <header className="space-y-1">
              <h3 className="text-lg font-semibold">Partagez votre expérience agentique</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Donnez une note AECO à chaque agent pour affiner les recommandations futures.
              </p>
            </header>
            <div className="space-y-4">
              {result.executedAgents.map((agentName) => (
                <AgentFeedbackForm
                  key={agentName}
                  agentName={agentName}
                  userId={missionSummary?.userId ?? 'demo_user'}
                  missionId={result?.parcoursTemplate?.templateId}
                />
              ))}
            </div>
          </div>
        ) : null}
        <AgentLogViewer />
        <ZynoAgentScoreboard />
        <ZynoDAOAdminPanel />
      </aside>
    </div>
  );
}
