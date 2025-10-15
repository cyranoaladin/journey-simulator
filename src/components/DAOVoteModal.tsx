import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Vote,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { JourneyPhase } from "../types/journey";
import { useJourneyStore } from "../store/journeyStore";

interface DAOVoteModalProps {
  onClose: () => void;
  phase: JourneyPhase;
  votingPower: number;
  onVote?: (vote: "approve" | "reject") => void;
}

const DAOVoteModal: React.FC<DAOVoteModalProps> = ({
  onClose,
  phase,
  votingPower,
  onVote,
}) => {
  const [selectedVote, setSelectedVote] = useState<"approve" | "reject" | null>(
    null,
  );
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const { updateVotingPower } = useJourneyStore();

  // Mock proposal data based on phase type
  const getProposalData = () => {
    if (phase.isIncubation) {
      return {
        title: "Project Incubation Proposal",
        description:
          "Validation of your project for incubation in the MFAI ecosystem",
        type: "Incubation",
        requiredVotes: 100,
        currentVotes: { approve: 67, reject: 23 },
        timeLeft: "2 days 14h",
        quorum: 80,
      };
    } else if (phase.isLaunchpad) {
      return {
        title: "MFAI Launchpad Access",
        description:
          "Authorization to launch your project on the official Launchpad",
        type: "Launchpad",
        requiredVotes: 200,
        currentVotes: { approve: 145, reject: 34 },
        timeLeft: "1 day 8h",
        quorum: 150,
      };
    } else {
      return {
        title: "Phase Validation",
        description: "Community validation of your progression in this phase",
        type: "Phase",
        requiredVotes: 50,
        currentVotes: { approve: 32, reject: 8 },
        timeLeft: "3 days 2h",
        quorum: 40,
      };
    }
  };

  const proposal = getProposalData();
  const totalVotes =
    proposal.currentVotes.approve + proposal.currentVotes.reject;
  const approvePercentage = (proposal.currentVotes.approve / totalVotes) * 100;
  const rejectPercentage = (proposal.currentVotes.reject / totalVotes) * 100;

  const handleVote = async (vote: "approve" | "reject") => {
    setSelectedVote(vote);
    setIsVoting(true);

    // Simulate voting transaction
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Update voting power and DAO participation
    updateVotingPower(votingPower + 10);
    setHasVoted(true);
    setIsVoting(false);

    if (onVote) {
      onVote(vote);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-primary-900 rounded-2xl p-6 max-w-lg w-full border border-white/20"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Vote className="text-accent-purple" size={24} />
            <h2 className="text-xl font-space font-bold">DAO Vote</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Proposal Info */}
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">{proposal.title}</h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                proposal.type === "Incubation"
                  ? "bg-purple-500/20 text-purple-400"
                  : proposal.type === "Launchpad"
                    ? "bg-gold-500/20 text-gold-400"
                    : "bg-blue-500/20 text-blue-400"
              }`}
            >
              {proposal.type}
            </span>
          </div>
          <p className="text-sm opacity-90 mb-4">{proposal.description}</p>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm opacity-70">Time remaining</div>
              <div className="font-semibold flex items-center justify-center">
                <Clock size={14} className="mr-1" />
                {proposal.timeLeft}
              </div>
            </div>
            <div>
              <div className="text-sm opacity-70">Quorum</div>
              <div className="font-semibold">{proposal.quorum} votes</div>
            </div>
            <div>
              <div className="text-sm opacity-70">Your power</div>
              <div className="font-semibold text-accent-purple">
                {votingPower}
              </div>
            </div>
          </div>
        </div>

        {/* Current Results */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 flex items-center">
            <TrendingUp size={16} className="mr-2" />
            Current Results
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center">
                  <CheckCircle size={14} className="mr-1 text-green-400" />
                  Approve
                </span>
                <span>
                  {proposal.currentVotes.approve} votes (
                  {approvePercentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="h-full bg-green-400 rounded-full transition-all duration-500"
                  style={{ width: `${approvePercentage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center">
                  <XCircle size={14} className="mr-1 text-red-400" />
                  Reject
                </span>
                <span>
                  {proposal.currentVotes.reject} votes (
                  {rejectPercentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="h-full bg-red-400 rounded-full transition-all duration-500"
                  style={{ width: `${rejectPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quorum Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm opacity-70">Quorum:</span>
            <span
              className={`text-sm font-semibold ${totalVotes >= proposal.quorum ? "text-green-400" : "text-yellow-400"}`}
            >
              {totalVotes}/{proposal.quorum}
            </span>
            {totalVotes >= proposal.quorum && (
              <CheckCircle size={14} className="text-green-400" />
            )}
          </div>
          <div className="text-sm opacity-70">Total votes: {totalVotes}</div>
        </div>

        {/* Voting Buttons */}
        {!hasVoted ? (
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleVote("approve")}
              disabled={isVoting}
              className="py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-500 text-white disabled:opacity-50"
            >
              {isVoting && selectedVote === "approve" ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <CheckCircle size={16} />
              )}
              <span>Approve</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleVote("reject")}
              disabled={isVoting}
              className="py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-500 text-white disabled:opacity-50"
            >
              {isVoting && selectedVote === "reject" ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <XCircle size={16} />
              )}
              <span>Reject</span>
            </motion.button>
          </div>
        ) : (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
            <CheckCircle className="mx-auto mb-2 text-green-400" size={24} />
            <h3 className="font-semibold mb-1">Vote recorded!</h3>
            <p className="text-sm opacity-80">
              Your "{selectedVote === "approve" ? "Approve" : "Reject"}" vote
              has been counted.
            </p>
            <p className="text-xs opacity-60 mt-2">
              Voting power increased by +10 points
            </p>
          </div>
        )}

        {/* Voting Power Info */}
        <div className="mt-4 p-3 bg-white/5 rounded-lg">
          <div className="flex justify-between text-xs">
            <span className="opacity-70">Your voting power:</span>
            <span className="font-semibold text-accent-purple">
              {votingPower} points
            </span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="opacity-70">DAO status:</span>
            <span
              className={
                votingPower >= 100 ? "text-green-400" : "text-yellow-400"
              }
            >
              {votingPower >= 100 ? "Active Member" : "Observer"}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DAOVoteModal;
