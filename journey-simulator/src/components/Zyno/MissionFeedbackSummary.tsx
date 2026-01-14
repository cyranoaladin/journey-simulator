/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { useMemo, useState } from 'react';
import { Download, PenSquare } from 'lucide-react';
import { api } from '../../utils/api';
import { useAgentScoreboardContext } from './AgentScoreboardContext';
import { sendToNotion } from '../../utils/sendToNotion';
import { AEPO, AECO } from '../../content/aepoAeco';

export type MissionSummary = {
  userId: string;
  timestamp: string;
  aepoScore: number;
  aecoPhase: string;
  agents: string[];
  generatedText: string;
  title?: string;
  actions?: string[];
};

type Props = {
  readonly summary?: MissionSummary | null;
};

export default function MissionFeedbackSummary({ summary }: Props) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { apiKey, setApiKey } = useAgentScoreboardContext();

  const formattedTimestamp = useMemo(() => {
    if (!summary?.timestamp) {
      return '';
    }
    try {
      return new Date(summary.timestamp).toLocaleString();
    } catch {
      return summary.timestamp;
    }
  }, [summary?.timestamp]);

  if (!summary) {
    return <p className="text-sm text-slate-500">No summary available.</p>;
  }

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
  };

  const exportSummary = async (format: 'pdf' | 'notion') => {
    if (!apiKey) {
      setError('Enter the admin API key (also used by the scoreboard).');
      return;
    }

    setIsExporting(true);
    setError(null);
    setSuccessMessage(null);

    const payload = {
      title: summary.title || `Mission ${summary.aecoPhase}`,
      userId: summary.userId,
      timestamp: summary.timestamp,
      aepo: summary.aepoScore,
      aecoPhase: summary.aecoPhase,
      agents: summary.agents,
      generatedText: summary.generatedText,
      actions: summary.actions,
    };

    try {
      const result = await api.exportMissionSummary({ ...payload, format });

      if (format === 'pdf') {
        const blob = result as Blob;
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'mission-report.pdf';
        anchor.click();
        URL.revokeObjectURL(url);
      } else {
        const content = result as string;
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'mission-report-notion.md';
        anchor.click();
        URL.revokeObjectURL(url);

        try {
          await sendToNotion({
            userId: payload.userId,
            personaId: payload.aecoPhase,
            personaTitle: payload.title,
            summary: summary.generatedText,
            markdownContent: content,
            metadata: {
              agents: summary.agents,
              aepoScore: summary.aepoScore,
              aecoPhase: summary.aecoPhase,
              exportedAt: new Date().toISOString(),
              actions: summary.actions
            }
          });
          setSuccessMessage('Summary sent to Notion.');
        } catch (notionError) {
          console.error('Notion webhook failed:', notionError);
          const notionMessage = notionError instanceof Error ? notionError.message : 'Unable to send to Notion.';
          setError(notionMessage);
        }
      }
    } catch (exportError) {
      console.error('Mission export failed:', exportError);
      setError(exportError instanceof Error ? exportError.message : 'Export impossible.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="space-y-3 rounded-lg bg-white p-4 shadow dark:bg-slate-900/70">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold"> Mission Summary</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportSummary('pdf')}
            disabled={isExporting || !summary}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-400/60"
          >
            <Download size={16} />
            PDF
          </button>
          <button
            type="button"
            onClick={() => exportSummary('notion')}
            disabled={isExporting || !summary}
            className="inline-flex items-center gap-2 rounded-md border border-indigo-200 px-3 py-1.5 text-sm font-medium text-indigo-600 transition hover:border-indigo-500 hover:text-indigo-700 dark:border-indigo-500/40 dark:text-indigo-300"
          >
            <PenSquare size={16} />
            Notion
          </button>
        </div>
      </div>

      <div className="grid gap-1 text-sm">
        <p>
          <strong>User:</strong> {summary.userId}
        </p>
        <p>
          <strong>Date:</strong> {formattedTimestamp}
        </p>
        <p>
          <strong title={AEPO.tooltip} className="cursor-help border-b border-dashed border-slate-300/70 dark:border-slate-700">
            AEPO Score:
          </strong>{' '}
          {summary.aepoScore} / 100
        </p>
        <p>
          <strong title={AECO.tooltip} className="cursor-help border-b border-dashed border-slate-300/70 dark:border-slate-700">
            AECO Signal:
          </strong>{' '}
          {summary.aecoPhase}
        </p>
        <p>
          <strong>Activated Agents:</strong> {summary.agents.join(', ')}
        </p>
      </div>

      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <span>Admin API Key</span>
        <input
          type="password"
          value={apiKey}
          onChange={(event) => handleApiKeyChange(event.target.value)}
          placeholder="Enter x-api-key"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-800"
        />
      </label>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}

      {successMessage && (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300">
          {successMessage}
        </p>
      )}

      <div>
        <h4 className="text-sm font-semibold"> Generated Summary:</h4>
        <pre className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-md bg-slate-900 p-3 text-xs text-slate-100">
          {summary.generatedText}
        </pre>
      </div>
    </section>
  );
}
