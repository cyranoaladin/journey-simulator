import { useId, useState } from 'react';
import { API_BASE_URL } from '../../utils/api';

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

type AgentFeedbackFormProps = {
  agentName: string;
  userId: string;
  missionId?: string | null;
  onSuccess?: () => void;
};

const AgentFeedbackForm = ({ agentName, userId, missionId, onSuccess }: AgentFeedbackFormProps) => {
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [error, setError] = useState('');
  const ratingFieldId = useId();
  const commentFieldId = useId();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('submitting');
    setError('');

    const payload = {
      agentName,
      userId,
      missionId,
      rating: Number(rating || 0),
      comment
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const message = await response.json().catch(() => ({ error: 'Envoi du retour impossible' }));
        throw new Error(message?.error || 'Envoi du retour impossible');
      }

      setStatus('success');
      onSuccess?.();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Erreur inattendue');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
        Merci pour votre retour sur {agentName} !
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <header>
        <h3 className="text-base font-semibold">Votre retour sur {agentName}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Partagez votre confiance et vos impressions sur l&apos;assistant.
        </p>
      </header>

      <div>
        <label className="block text-xs font-medium text-slate-600" htmlFor={ratingFieldId}>
          Note (0 à 100)
        </label>
        <input
          type="number"
          min={0}
          max={100}
          value={rating}
          onChange={(event) => setRating(event.target.value)}
          id={ratingFieldId}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600" htmlFor={commentFieldId}>
          Commentaire
        </label>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          id={commentFieldId}
          className="mt-1 h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          placeholder="Un mot sur votre ressenti..."
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-400/60"
      >
        {status === 'submitting' ? 'Envoi en cours…' : 'Envoyer'}
      </button>
    </form>
  );
};

export default AgentFeedbackForm;
