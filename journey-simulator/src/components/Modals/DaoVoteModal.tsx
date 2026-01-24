/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Vote, ThumbsUp, ThumbsDown, Users, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface DaoVoteModalProps {
    proposal: {
        title: string;
        description: string;
        votesFor?: number;
        votesAgainst?: number;
        endDate?: string;
    };
    votingPower?: number;
    onVote: (vote: 'yes' | 'no') => void;
    onCancel: () => void;
}

export const DaoVoteModal = ({
    proposal,
    votingPower = 100,
    onVote,
    onCancel,
}: DaoVoteModalProps) => {
    const [selectedVote, setSelectedVote] = useState<'yes' | 'no' | null>(null);
    const [isVoting, setIsVoting] = useState(false);
    const [voteComplete, setVoteComplete] = useState(false);

    const totalVotes = (proposal.votesFor || 0) + (proposal.votesAgainst || 0);
    const forPercentage = totalVotes > 0 ? ((proposal.votesFor || 0) / totalVotes) * 100 : 0;
    const againstPercentage = totalVotes > 0 ? ((proposal.votesAgainst || 0) / totalVotes) * 100 : 0;

    const handleVote = async (vote: 'yes' | 'no') => {
        setSelectedVote(vote);
        setIsVoting(true);

        // Simulate blockchain transaction
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setIsVoting(false);
        setVoteComplete(true);

        toast.success('Vote Recorded', {
            description: `You voted ${vote === 'yes' ? 'FOR' : 'AGAINST'} the proposal`,
        });

        // Wait for animation then close
        setTimeout(() => {
            onVote(vote);
        }, 1500);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={onCancel}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25 }}
                    className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 p-8 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onCancel}
                        className="absolute right-4 top-4 rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>

                    {/* Header */}
                    <div className="mb-6 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent-purple to-accent-cyan shadow-lg"
                        >
                            <Vote size={32} className="text-white" />
                        </motion.div>
                        <h2 className="font-space text-2xl font-bold text-white">DAO Governance Vote</h2>
                        <p className="mt-2 text-sm text-white/70">
                            Your voice shapes the ecosystem
                        </p>
                    </div>

                    {/* Proposal Details */}
                    <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6">
                        <h3 className="mb-3 text-lg font-bold text-white">{proposal.title}</h3>
                        <p className="mb-4 text-sm leading-relaxed text-white/70">
                            {proposal.description}
                        </p>

                        {/* Metadata */}
                        <div className="flex flex-wrap gap-4 text-xs">
                            <div className="flex items-center gap-2 text-white/60">
                                <Users size={14} />
                                <span>{totalVotes.toLocaleString()} votes cast</span>
                            </div>
                            {proposal.endDate && (
                                <div className="flex items-center gap-2 text-white/60">
                                    <Clock size={14} />
                                    <span>Ends in {proposal.endDate}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Current Results */}
                    <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6">
                        <h4 className="mb-4 text-sm font-semibold text-white/70">Current Results</h4>
                        
                        {/* For Votes */}
                        <div className="mb-4">
                            <div className="mb-2 flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 font-semibold text-emerald-400">
                                    <ThumbsUp size={16} />
                                    For
                                </span>
                                <span className="font-bold text-white">
                                    {proposal.votesFor?.toLocaleString() || 0} ({forPercentage.toFixed(1)}%)
                                </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${forPercentage}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                                />
                            </div>
                        </div>

                        {/* Against Votes */}
                        <div>
                            <div className="mb-2 flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 font-semibold text-red-400">
                                    <ThumbsDown size={16} />
                                    Against
                                </span>
                                <span className="font-bold text-white">
                                    {proposal.votesAgainst?.toLocaleString() || 0} ({againstPercentage.toFixed(1)}%)
                                </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${againstPercentage}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                                    className="h-full bg-gradient-to-r from-red-500 to-red-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Voting Power */}
                    <div className="mb-6 rounded-2xl border border-accent-cyan/30 bg-accent-cyan/10 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-white/70">Your Voting Power</span>
                            <div className="flex items-center gap-2">
                                <TrendingUp size={18} className="text-accent-cyan" />
                                <span className="font-space text-2xl font-bold text-white">
                                    {votingPower.toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-white/50">
                            Based on your staked $MFAI and reputation score
                        </p>
                    </div>

                    {/* Vote Buttons */}
                    {!voteComplete ? (
                        <div className="mb-6 grid grid-cols-2 gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleVote('yes')}
                                disabled={isVoting}
                                className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-6 font-semibold transition-all ${
                                    selectedVote === 'yes'
                                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                                        : 'border-white/20 bg-white/5 text-white hover:border-emerald-500/50 hover:bg-emerald-500/10'
                                } ${isVoting ? 'cursor-not-allowed opacity-50' : ''}`}
                            >
                                <ThumbsUp size={32} />
                                <span className="text-lg">Vote For</span>
                                {selectedVote === 'yes' && isVoting && (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        className="h-5 w-5 rounded-full border-2 border-emerald-400 border-t-transparent"
                                    />
                                )}
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleVote('no')}
                                disabled={isVoting}
                                className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-6 font-semibold transition-all ${
                                    selectedVote === 'no'
                                        ? 'border-red-500 bg-red-500/20 text-red-400'
                                        : 'border-white/20 bg-white/5 text-white hover:border-red-500/50 hover:bg-red-500/10'
                                } ${isVoting ? 'cursor-not-allowed opacity-50' : ''}`}
                            >
                                <ThumbsDown size={32} />
                                <span className="text-lg">Vote Against</span>
                                {selectedVote === 'no' && isVoting && (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        className="h-5 w-5 rounded-full border-2 border-red-400 border-t-transparent"
                                    />
                                )}
                            </motion.button>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-6 flex items-center justify-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6"
                        >
                            <CheckCircle2 size={32} className="text-emerald-400" />
                            <div>
                                <p className="text-lg font-bold text-emerald-400">Vote Recorded!</p>
                                <p className="text-sm text-white/70">
                                    You voted {selectedVote === 'yes' ? 'FOR' : 'AGAINST'} the proposal
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Info */}
                    <div className="space-y-2 text-xs text-white/50">
                        <p className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>Your vote is recorded on-chain and cannot be changed</span>
                        </p>
                        <p className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>Voting power is calculated from staked tokens and reputation</span>
                        </p>
                        <p className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>Proposals pass with simple majority after voting period ends</span>
                        </p>
                    </div>

                    {/* Demo Mode Notice */}
                    <p className="mt-4 text-center text-xs text-white/40">
                        Demo Mode: Simulated governance voting
                    </p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
