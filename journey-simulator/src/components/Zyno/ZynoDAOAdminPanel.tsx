/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { CheckCircle2, Lock, Plus, RefreshCw, ShieldCheck, ThumbsDown, ThumbsUp } from 'lucide-react';
import {
  api,
  DaoConfigResponse,
  DaoProposal,
  DaoVoter
} from '../../utils/api';
import { useAgentScoreboardContext } from './AgentScoreboardContext';

interface FetchState {
  loading: boolean;
  error: string | null;
}

const initialFetchState: FetchState = {
  loading: false,
  error: null
};

export default function ZynoDAOAdminPanel() {
  const [fetchState, setFetchState] = useState<FetchState>(initialFetchState);
  const [config, setConfig] = useState<DaoConfigResponse | null>(null);
  const [proposals, setProposals] = useState<DaoProposal[]>([]);
  const { apiKey, setApiKey } = useAgentScoreboardContext();
  const [newProposal, setNewProposal] = useState({ title: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [voteSubmitting, setVoteSubmitting] = useState<Record<string, boolean>>({});
  const [closing, setClosing] = useState<Record<string, boolean>>({});
  const [selectedVoter, setSelectedVoter] = useState<string>('');
  const adminKeyInputId = useId();
  const voterSelectId = useId();
  const voterHelpTextId = `${voterSelectId}-hint`;
  const voterLabelId = `${voterSelectId}-label`;
  const voterSelectLabel = 'Vote as';

  const loadData = useCallback(async () => {
    // Console log for E2E debugging
    console.log('[ZynoDAOAdminPanel] loadData called');
    setFetchState({ loading: true, error: null });
    try {
      const [daoConfig, daoProposals] = await Promise.all([
        api.getDaoConfig(),
        api.getDaoProposals()
      ]);
      console.log('[ZynoDAOAdminPanel] Data received', {
        config: daoConfig ? 'ok' : 'null',
        proposals: daoProposals?.proposals?.length
      });
      setConfig(daoConfig);
      setProposals(daoProposals?.proposals || []);
      if (!selectedVoter && daoConfig?.voters?.length > 0) {
        setSelectedVoter(daoConfig.voters[0].id);
      }
      setFetchState({ loading: false, error: null });
    } catch (error) {
      console.error('Failed to load DAO data:', error);
      setFetchState({
        loading: false,
        error: error instanceof Error ? error.message : 'Unable to load'
      });
    }
  }, [selectedVoter]);

  useEffect(() => {
    loadData();
    // E2E Requirement: Real-time updates
    const interval = setInterval(loadData, 500);
    return () => clearInterval(interval);
  }, [loadData]);

  const quorumSummary = useMemo(() => {
    if (!config) {
      return '';
    }
    return `${config.quorumPercent}% quorum  Total Power ${config.totalVotingPower}`;
  }, [config]);

  const handleCreateProposal = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!apiKey) {
      setFetchState((prev) => ({ ...prev, error: 'Admin API key required to create a proposal.' }));
      return;
    }
    if (!newProposal.title.trim()) {
      setFetchState((prev) => ({ ...prev, error: 'Proposal title is required.' }));
      return;
    }

    setCreating(true);
    setFetchState((prev) => ({ ...prev, error: null }));
    try {
      await api.createDaoProposal(
        {
          title: newProposal.title.trim(),
          description: newProposal.description.trim() || undefined
        },
        apiKey
      );
      setNewProposal({ title: '', description: '' });
      await loadData();
    } catch (error) {
      console.error('Failed to create DAO proposal:', error);
      setFetchState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Creation impossible'
      }));
    } finally {
      setCreating(false);
    }
  };

  const submitVote = async (proposalId: string, support: 'yes' | 'no') => {
    if (!selectedVoter) {
      setFetchState((prev) => ({ ...prev, error: 'Select a voter before voting.' }));
      return;
    }

    setVoteSubmitting((prev) => ({ ...prev, [proposalId]: true }));
    setFetchState((prev) => ({ ...prev, error: null }));
    try {
      await api.castDaoVote(proposalId, selectedVoter, support);
      await loadData();
    } catch (error) {
      console.error('Failed to vote on proposal:', error);
      setFetchState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Vote impossible'
      }));
    } finally {
      setVoteSubmitting((prev) => ({ ...prev, [proposalId]: false }));
    }
  };

  const closeProposal = async (proposalId: string) => {
    if (!apiKey) {
      setFetchState((prev) => ({ ...prev, error: 'Admin API key required to close.' }));
      return;
    }

    setClosing((prev) => ({ ...prev, [proposalId]: true }));
    setFetchState((prev) => ({ ...prev, error: null }));
    try {
      await api.closeDaoProposal(proposalId, apiKey);
      await loadData();
    } catch (error) {
      console.error('Failed to close proposal:', error);
      setFetchState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Closing impossible'
      }));
    } finally {
      setClosing((prev) => ({ ...prev, [proposalId]: false }));
    }
  };

  const renderVoterOption = (voter: DaoVoter) => {
    const label = voter.name ? `${voter.name}  ${voter.weight}` : `${voter.id}  ${voter.weight}`;
    return (
      <option key={voter.id} value={voter.id}>
        {label}
      </option>
    );
  };

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Zyno DAO Console</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Track proposals, quorum, and weighted votes</p>
          </div>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={fetchState.loading}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-400/60"
        >
          <RefreshCw size={16} className={fetchState.loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </header>

      {fetchState.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          {fetchState.error}
        </p>
      )}

      {config && (
        <div className="grid gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200">
          <p className="font-medium">DAO Settings</p>
          <p>{quorumSummary}</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-xs">
              <label
                className="text-xs font-semibold uppercase tracking-wider"
                htmlFor={adminKeyInputId}
              >
                Admin API Key
              </label>
              <input
                id={adminKeyInputId}
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="Used to create / close"
                className="mt-1 w-full rounded-md border border-emerald-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 dark:border-emerald-500/40 dark:bg-slate-900"
              />
            </div>
            <div className="w-full sm:max-w-xs">
              <label
                id={voterLabelId}
                className="text-xs font-semibold uppercase tracking-wider"
                htmlFor={voterSelectId}
              >
                {voterSelectLabel}
              </label>
              <p id={voterHelpTextId} className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Choose a voter profile before submitting a vote.
              </p>
              <select
                id={voterSelectId}
                name="dao-voter"
                value={selectedVoter}
                onChange={(event) => setSelectedVoter(event.target.value)}
                aria-label={voterSelectLabel}
                aria-labelledby={voterLabelId}
                aria-describedby={voterHelpTextId}
                title={voterSelectLabel}
                className="mt-2 w-full rounded-md border border-emerald-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 dark:border-emerald-500/40 dark:bg-slate-900"
              >
                <option value="">Select a voter</option>
                {config.voters?.map(renderVoterOption)}
              </select>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleCreateProposal} className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700/60">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <Plus size={16} />
          New Proposal
        </div>
        <input
          type="text"
          value={newProposal.title}
          onChange={(event) => setNewProposal((prev) => ({ ...prev, title: event.target.value }))}
          placeholder="Title (ex: MVP Token Issuance)"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 dark:border-slate-600 dark:bg-slate-900"
        />
        <textarea
          value={newProposal.description}
          onChange={(event) => setNewProposal((prev) => ({ ...prev, description: event.target.value }))}
          placeholder="Description / context"
          rows={3}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 dark:border-slate-600 dark:bg-slate-900"
        />
        <button
          type="submit"
          disabled={creating}
          className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-400/60"
        >
          {creating ? 'Creating' : 'Create Proposal'}
        </button>
      </form>

      <div className="space-y-3">
        {proposals.length === 0 && !fetchState.loading && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No active proposals at the moment.
          </p>
        )}

        {proposals.map((proposal) => {
          const voting = voteSubmitting[proposal.id];
          const closingProposal = closing[proposal.id];
          const statusBadgeClass = proposal.status === 'active'
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
            : 'bg-slate-200 text-slate-700 dark:bg-slate-700/70 dark:text-slate-300';

          return (
            <article
              key={proposal.id}
              className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700/60"
              data-testid={`admin-proposal-${proposal.id}`}
            >
              <header className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                    {proposal.title}
                  </h4>
                  {proposal.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {proposal.description}
                    </p>
                  )}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass}`}>
                  {proposal.status === 'active' ? 'Active' : 'Closed'}
                </span>
              </header>

              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div className="rounded-lg bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Votes Yes</p>
                  <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-300" data-testid={`vote-yes-count-${proposal.id}`}>{proposal.votes.yes}</p>
                </div>
                <div className="rounded-lg bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Votes No</p>
                  <p className="text-lg font-semibold text-red-500 dark:text-red-300" data-testid={`vote-no-count-${proposal.id}`}>{proposal.votes.no}</p>
                </div>
                <div className="rounded-lg bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Quorum</p>
                  <p className="text-lg font-semibold">
                    {proposal.quorumMet ? 'Reached' : 'In Progress'}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Outcome</p>
                  <p className="text-lg font-semibold">
                    {proposal.outcome ? proposal.outcome : 'Deliberating'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => submitVote(proposal.id, 'yes')}
                  disabled={proposal.status !== 'active' || voting}
                  className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-400/60"
                  data-testid={`vote-yes-btn-${proposal.id}`}
                >
                  <ThumbsUp size={16} />
                  Yes ({selectedVoter || '---'})
                </button>
                <button
                  type="button"
                  onClick={() => submitVote(proposal.id, 'no')}
                  disabled={proposal.status !== 'active' || voting}
                  className="inline-flex items-center gap-2 rounded-md bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:bg-slate-400/60"
                  data-testid={`vote-no-btn-${proposal.id}`}
                >
                  <ThumbsDown size={16} />
                  No
                </button>
                <button
                  type="button"
                  onClick={() => closeProposal(proposal.id)}
                  disabled={proposal.status !== 'active' || closingProposal}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
                >
                  <Lock size={16} />
                  Close
                </button>
              </div>

              {proposal.status === 'closed' && proposal.outcome === 'accepted' && (
                <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <CheckCircle2 size={16} />
                  Decision accepted  implementation recommended.
                </p>
              )}

              {proposal.status === 'closed' && proposal.outcome === 'rejected' && (
                <p className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
                  <ThumbsDown size={16} />
                  Proposal rejected  revise strategy.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
