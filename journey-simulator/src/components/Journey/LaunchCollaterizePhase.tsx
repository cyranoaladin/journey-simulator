import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useJourneyStore } from '../../store/journeyStore';
import { api } from '../../utils/api';
import { generateStableKey } from '../../utils/generateStableKey';

export interface LaunchCollaterizePhaseProps {
  onComplete?: () => void;
}

export const LaunchCollaterizePhase: React.FC<LaunchCollaterizePhaseProps> = ({ onComplete }) => {
  const apiJourneyId = useJourneyStore((state) => state.apiJourneyId);
  const ensureApiJourneyId = useJourneyStore((state) => state.ensureApiJourneyId);
  const setCollaterizeSimulation = useJourneyStore((state) => state.setCollaterizeSimulation);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const eligibilityBarRef = useRef<HTMLDivElement | null>(null);
  const communityBarRef = useRef<HTMLDivElement | null>(null);
  const riskBarRef = useRef<HTMLDivElement | null>(null);

  const handleSimulate = useCallback(async () => {
    const journeyId = apiJourneyId ?? ensureApiJourneyId();

    if (!journeyId) {
      setError('Journey ID is required');
      toast.error('Unable to start simulation');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.simulateCollaterizeLaunch(journeyId);

      if (response.ok && response.simulation) {
        setCollaterizeSimulation(response.simulation);
        setResults(response.simulation);
        toast.success('Launch simulation completed successfully');
      } else {
        throw new Error(response.error || 'Simulation failed');
      }
    } catch (err: any) {
      console.error('Collaterize simulation error:', err);
      setError(err.message || 'Failed to run simulation');
      toast.error(err.message || 'Launch simulation failed');
    } finally {
      setLoading(false);
    }
  }, [apiJourneyId, ensureApiJourneyId, setCollaterizeSimulation]);

  useEffect(() => {
    if (!apiJourneyId) {
      ensureApiJourneyId();
    }
  }, [apiJourneyId, ensureApiJourneyId]);

  useEffect(() => {
    if (!eligibilityBarRef.current || !communityBarRef.current || !riskBarRef.current) {
      return;
    }

    if (!results) {
      eligibilityBarRef.current.style.width = '0%';
      communityBarRef.current.style.width = '0%';
      riskBarRef.current.style.width = '0%';
      return;
    }

    const eligibility = Math.min(Math.max(results.eligibilityScore ?? 0, 0), 100);
    const community = Math.min(Math.max(results.communityScore ?? 70, 0), 100);
    const resilience = Math.min(Math.max((1 - (results.riskScore ?? 0.15)) * 100, 0), 100);

    eligibilityBarRef.current.style.width = `${eligibility}%`;
    communityBarRef.current.style.width = `${community}%`;
    riskBarRef.current.style.width = `${resilience}%`;
  }, [results]);

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-900 rounded-xl border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-4">Ready to Launch?</h2>
        <p className="text-gray-400 mb-8 text-center max-w-md">
          You have completed the preparation phases. Now, simulate your project launch with our partner <strong>Collaterize</strong> to see if you qualify for the Core Track.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSimulate}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span> Simulating...
            </>
          ) : (
            <>🚀 Simulate Launch with Collaterize</>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Launch Simulation Results</h2>
        <div className={`px-4 py-1 rounded-full text-sm font-bold ${results.accepted
          ? 'bg-green-900/50 text-green-400 border border-green-500'
          : 'bg-red-900/50 text-red-400 border border-red-500'
          }`}>
          {results.accepted ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score global */}
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Overall Eligibility</h3>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-bold text-white">{results.eligibilityScore}</span>
            <span className="text-gray-500 mb-1">/ 100</span>
          </div>
          <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
            <div
              ref={eligibilityBarRef}
              className={`h-full transition-all duration-500 ${results.eligibilityScore >= 80 ? 'bg-green-500' :
                results.eligibilityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
            />
          </div>
          <p className="mt-2 text-sm text-gray-400">
            Tier: <span className="text-white font-medium">{results.tier}</span>
          </p>
        </div>

        {/* Score communauté */}
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Community Score</h3>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-bold text-white">
              {Math.round(results.communityScore || 70)}
            </span>
            <span className="text-gray-500 mb-1">/ 100</span>
          </div>
          <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
            <div
              ref={communityBarRef}
              className="h-full bg-blue-500 transition-all duration-500"
            />
          </div>
        </div>

        {/* Score de risque */}
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Risk Assessment</h3>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-bold text-white">
              {Math.round((1 - (results.riskScore || 0.15)) * 100)}
            </span>
            <span className="text-gray-500 mb-1">/ 100</span>
          </div>
          <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
            <div
              ref={riskBarRef}
              className="h-full bg-purple-500 transition-all duration-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plan de lancement */}
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Launch Plan</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Target Raise</span>
              <span className="text-white font-mono">${results.targetRaiseUSD.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Soft Cap</span>
              <span className="text-white font-mono">${results.softCapUSD.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Hard Cap</span>
              <span className="text-white font-mono">${results.hardCapUSD.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Initial Liquidity</span>
              <span className="text-white font-mono">${results.liquidityUSD.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-gray-700 pt-2 mt-2">
              <span className="text-gray-400">Initial Price</span>
              <span className="text-white font-mono">${results.initialPriceUSD.toFixed(4)}</span>
            </div>
          </div>
        </div>

        {/* Notes et recommandations */}
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Recommendations</h3>
          <ul className="space-y-2">
            {results.notes.map((note: string) => {
              const noteKey = generateStableKey({ text: note }, 'recommendation-note', ['text']);
              return (
                <li key={noteKey} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-blue-400 mt-1">•</span>
                  {note}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* CTA finale */}
      <div className="flex flex-col items-center pt-4">
        <a
          href={results.simulatedLaunchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
        >
          🚀 Open Collaterize (Simulation)
        </a>
        <p className="text-center text-xs text-gray-500 mt-2 max-w-md">
          This is a simulation. In the production version, this will redirect to the actual Collaterize launchpad.
          The simulation provides a realistic assessment of your project's readiness for a real launch.
        </p>
      </div>
    </div>
  );
};
