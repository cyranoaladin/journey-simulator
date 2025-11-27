import { useState } from 'react';
import { motion } from 'framer-motion';
import { useJourneyStore } from '../../store/journeyStore';

interface NarrativeChoiceBlock {
  kind: 'narrative_choice_block';
  id: string;
  title: string;
  description: string;
  choices: Array<{
    id: string;
    label: string;
    description: string;
    outcomeSummary: string; // Summary of what happens if this choice is selected
  }>;
}

interface NarrativeChoiceBlockProps {
  block: NarrativeChoiceBlock;
}

export default function NarrativeChoice({ block }: NarrativeChoiceBlockProps) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureApiJourneyId = useJourneyStore((s) => s.ensureApiJourneyId);
  const selectedPersona = useJourneyStore((s) => s.selectedPersona);
  const lastStep = useJourneyStore((s) => s.lastStep);
  const updateProgress = useJourneyStore((s) => s.updateProgress);

  const handleSubmit = async () => {
    if (!selectedChoice) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const id = ensureApiJourneyId();
      const base = (import.meta as any).env?.VITE_API_BASE_URL || "http://127.0.0.1:3000";

      const response = await fetch(`${base}/api/journeys/${id}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: `choice_id=${selectedChoice}`,
          actionId: selectedChoice,
          phaseId: lastStep?.metadata?.phase_id || 'learn',
          trackId: selectedPersona?.id || 'builder',
          language: lastStep?.metadata?.language || 'en',
          mode: lastStep?.metadata?.mode || 'discovery',
          tone: lastStep?.metadata?.tone || 'pedagogical',
          journeyState: useJourneyStore.getState().userProgress,
        })
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();

      // Update last step in store
      useJourneyStore.setState({ lastStep: data });

      // Optionally apply XP delta
      const xpDelta = Number(data?.next_state?.xp_delta || 0);
      if (typeof updateProgress === 'function' && !isNaN(xpDelta) && xpDelta > 0) {
        await updateProgress(xpDelta);
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err?.message || 'An error occurred');
      console.error('Error submitting narrative choice:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <h4 className="font-semibold mb-2 flex items-center">
        <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
        {block.title}
      </h4>

      <p className="text-sm opacity-90 mb-4">{block.description}</p>

      <div className="space-y-3 mb-4">
        {block.choices.map((choice) => (
          <motion.div
            key={choice.id}
            whileHover={{ scale: 1.01 }}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedChoice === choice.id
              ? 'border-cyan-500/50 bg-cyan-500/10'
              : 'border-white/10 hover:border-white/20 hover:bg-white/5'
              }`}
            onClick={() => {
              if (!isSubmitted) {
                setSelectedChoice(choice.id);
              }
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h5 className="font-medium">{choice.label}</h5>
                <p className="text-xs opacity-75 mt-1">{choice.description}</p>
              </div>
              {selectedChoice === choice.id && !isSubmitted && (
                <span className="text-cyan-400 text-lg">✓</span>
              )}
              {selectedChoice === choice.id && isSubmitted && (
                <span className="text-green-400 text-lg">✓</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {selectedChoice && !isSubmitted && (
        <div className="p-3 bg-black/30 rounded-lg mb-4 text-sm">
          <div className="text-cyan-400 font-medium mb-1">Consequence of your choice:</div>
          <div>{block.choices.find(c => c.id === selectedChoice)?.outcomeSummary}</div>
        </div>
      )}

      {error && (
        <div className="text-red-400 text-sm mb-3">{error}</div>
      )}

      {!isSubmitted ? (
        <button
          onClick={handleSubmit}
          disabled={!selectedChoice || isSubmitting}
          className={`px-4 py-2 rounded-lg font-medium ${selectedChoice && !isSubmitting
            ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700'
            : 'bg-gray-700/50 cursor-not-allowed'
            }`}
        >
          {isSubmitting ? 'Sending...' : 'Confirm this choice'}
        </button>
      ) : (
        <div className="text-green-400 text-sm flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Choice recorded! AI is adapting your journey accordingly.
        </div>
      )}
    </div>
  );
}