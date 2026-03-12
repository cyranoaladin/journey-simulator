import { useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, Clock, CheckCircle2 } from 'lucide-react';
import { Card, Badge, ProgressStepper } from '../components/ui';
import { useToast } from '../contexts/ToastContext';
import type { JourneyStep } from '../components/ui/ProgressStepper';

interface Proposal {
  id:          string;
  title:       string;
  description: string;
  status:      'active' | 'passed' | 'rejected' | 'pending';
  votesFor:    number;
  votesAgainst: number;
  endDate:     string;
  quorum:      number;
}

// TODO Phase 3 : connecter useDAOProposals() quand SPL Governance est déployé
const MOCK_PROPOSALS: Proposal[] = [
  {
    id: '1',
    title: 'Increase Treasury Allocation to DeFi',
    description: 'Propose to increase the treasury allocation to automated DeFi strategies from 40% to 60%',
    status: 'active',
    votesFor: 1250000,
    votesAgainst: 350000,
    endDate: '2025-01-20',
    quorum: 2000000,
  },
  {
    id: '2',
    title: 'New Agent Strategy: Cross-Chain Arbitrage',
    description: 'Deploy a new AI agent focused on cross-chain arbitrage opportunities',
    status: 'active',
    votesFor: 890000,
    votesAgainst: 120000,
    endDate: '2025-01-18',
    quorum: 1500000,
  },
  {
    id: '3',
    title: 'Reduce Protocol Fees by 25%',
    description: 'Reduce protocol fees to attract more users and increase TVL',
    status: 'passed',
    votesFor: 2100000,
    votesAgainst: 200000,
    endDate: '2025-01-10',
    quorum: 2000000,
  },
];

const GOVERNANCE_STEPS: JourneyStep[] = [
  { id: '1', label: 'Submit Proposal', sublabel: 'Create proposal', icon: '📝', status: 'completed' as const },
  { id: '2', label: 'Discussion', sublabel: 'Community review', icon: '💬', status: 'completed' as const },
  { id: '3', label: 'Voting Period', sublabel: 'Token holders vote', icon: '🗳️', status: 'active' as const },
  { id: '4', label: 'Execution', sublabel: 'Proposal executed', icon: '✅', status: 'locked' as const },
];

function ProposalCard({ proposal, index, onVote }: { proposal: Proposal; index: number; onVote: (id: string, forVote: boolean) => void }) {
  const totalVotes = proposal.votesFor + proposal.votesAgainst;
  const forPercent = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
  const quorumPercent = totalVotes / proposal.quorum * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card variant="glass" className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={
                proposal.status === 'active' ? 'cyan' :
                proposal.status === 'passed' ? 'success' :
                proposal.status === 'rejected' ? 'coral' : 'default'
              }>
                {proposal.status.toUpperCase()}
              </Badge>
              <span className="text-2xs text-ink-500 flex items-center gap-1">
                <Clock size={12} /> Ends {proposal.endDate}
              </span>
            </div>
            <h3 className="font-display text-lg font-semibold text-ink-100">{proposal.title}</h3>
            <p className="text-sm text-ink-400 mt-1 line-clamp-2">{proposal.description}</p>
          </div>
        </div>

        {/* Vote Progress */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs">
            <span className="text-emerald-400 flex items-center gap-1">
              <ThumbsUp size={12} /> For: {(proposal.votesFor / 1000000).toFixed(2)}M
            </span>
            <span className="text-coral-400 flex items-center gap-1">
              Against: {(proposal.votesAgainst / 1000000).toFixed(2)}M <ThumbsUp size={12} className="rotate-180" />
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden flex">
            <div 
              className="bg-emerald-400/80 h-full transition-all duration-500"
              style={{ width: `${forPercent}%` }}
            />
            <div 
              className="bg-coral-400/80 h-full transition-all duration-500"
              style={{ width: `${100 - forPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-2xs text-ink-500">
            <span>{forPercent.toFixed(1)}% For</span>
            <span>Quorum: {quorumPercent.toFixed(1)}%</span>
          </div>
        </div>

        {/* Actions */}
        {proposal.status === 'active' && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
            <button 
              onClick={() => onVote(proposal.id, true)}
              className="flex-1 py-2 bg-emerald-400/10 text-emerald-400 rounded-xl text-sm font-semibold hover:bg-emerald-400/20 transition-colors"
            >
              Vote For
            </button>
            <button 
              onClick={() => onVote(proposal.id, false)}
              className="flex-1 py-2 bg-coral-400/10 text-coral-400 rounded-xl text-sm font-semibold hover:bg-coral-400/20 transition-colors"
            >
              Vote Against
            </button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

export default function DAOView() {
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [proposals, setProposals] = useState<Proposal[]>(MOCK_PROPOSALS);
  const { addToast } = useToast();

  // TODO: connecter useDAOProposals() quand SPL Governance est déployé
  // const { proposals: realProposals, isLoading } = useDAOProposals();

  const handleVote = (proposalId: string, forVote: boolean) => {
    // Simulate vote - TODO: POST /api/blinks/dao-vote
    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal) return;

    // Update local state (simulation)
    setProposals(prev => prev.map(p => {
      if (p.id === proposalId) {
        return {
          ...p,
          votesFor: forVote ? p.votesFor + 100000 : p.votesFor,
          votesAgainst: !forVote ? p.votesAgainst + 100000 : p.votesAgainst,
        };
      }
      return p;
    }));

    addToast({
      type: 'success',
      title: 'Vote enregistré',
      message: `Votre vote ${forVote ? 'pour' : 'contre'} "${proposal.title}" est confirmé (simulation)`,
    });
  };

  const handleCreateProposal = () => {
    addToast({
      type: 'info',
      title: 'Création de proposal',
      message: 'Feature à venir dans Phase 3 — SPL Governance',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-[1400px] mx-auto px-6 py-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink-50">DAO Governance</h1>
            <p className="text-ink-400 mt-1">Shape the future of Money Factory through community voting</p>
          </div>
          <button 
            onClick={handleCreateProposal}
            className="px-4 py-2 bg-gold-400 text-void rounded-xl font-semibold text-sm hover:bg-gold-300 transition-colors"
          >
            Create Proposal
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Proposals', value: '24', sub: 'all time' },
            { label: 'Voting Power', value: '12.5K', sub: 'MFAI tokens' },
            { label: 'Participation', value: '78%', sub: 'avg turnout' },
            { label: 'Your Votes', value: '18', sub: 'participated' },
          ].map((stat, i) => (
            <Card key={i} variant="solid" className="p-4">
              <p className="text-2xs text-ink-500 uppercase tracking-wider">{stat.label}</p>
              <p className="font-display text-2xl font-bold text-ink-50 mt-1">{stat.value}</p>
              <p className="text-xs text-ink-400 mt-0.5">{stat.sub}</p>
            </Card>
          ))}
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-[1fr_300px] gap-6">
          {/* Proposals List */}
          <div className="space-y-4">
            <div className="flex gap-2 border-b border-white/5 pb-3">
              <button 
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === 'active' 
                    ? 'bg-gold-400/10 text-gold-300' 
                    : 'text-ink-400 hover:text-ink-200'
                }`}
              >
                Active
              </button>
              <button 
                onClick={() => setActiveTab('past')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === 'past' 
                    ? 'bg-gold-400/10 text-gold-300' 
                    : 'text-ink-400 hover:text-ink-200'
                }`}
              >
                Past Proposals
              </button>
            </div>

            {proposals
              .filter(p => activeTab === 'active' ? p.status === 'active' : p.status !== 'active')
              .map((proposal, i) => (
                <ProposalCard key={proposal.id} proposal={proposal} index={i} onVote={handleVote} />
              ))}
          </div>

          {/* Sidebar - Process */}
          <div className="space-y-4">
            <Card variant="solid" className="p-5">
              <h3 className="font-display text-lg font-semibold text-ink-50 mb-4">Governance Process</h3>
              <ProgressStepper steps={GOVERNANCE_STEPS} orientation="vertical" />
            </Card>

            <Card variant="info" className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="text-cyan-300" size={20} />
                <h4 className="font-semibold text-ink-50">Why Participate?</h4>
              </div>
              <p className="text-sm text-ink-300 leading-relaxed">
                Active voters earn AEPO points and influence protocol rewards. Your voice shapes DeFi strategies, fee structures, and treasury allocations.
              </p>
            </Card>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
