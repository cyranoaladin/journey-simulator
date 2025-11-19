import { useState } from "react";
import { motion } from "framer-motion";

interface Proposal {
    id: string;
    title: string;
    description: string;
    votesFor: number;
    votesAgainst: number;
    status: "active" | "passed" | "rejected";
    endDate: string;
}

interface DAODashboardProps {
    votingPower: number;
    proposals: Proposal[];
    onVote: (proposalId: string, vote: "for" | "against") => void;
}

export default function DAODashboard({
    votingPower,
    proposals,
    onVote,
}: DAODashboardProps) {
    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-xs opacity-70 uppercase tracking-wider mb-1">
                        Voting Power
                    </div>
                    <div className="text-2xl font-bold text-accent-cyan">
                        {votingPower.toLocaleString()} VP
                    </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-xs opacity-70 uppercase tracking-wider mb-1">
                        Active Proposals
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {proposals.filter((p) => p.status === "active").length}
                    </div>
                </div>
            </div>

            {/* Proposals List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Gouvernance Active</h3>
                {proposals.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-white/20 transition-colors"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="font-medium text-lg">{p.title}</h4>
                                <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide ${p.status === "active"
                                            ? "bg-green-500/20 text-green-400"
                                            : "bg-white/10 text-white/60"
                                        }`}
                                >
                                    {p.status}
                                </span>
                            </div>
                            <div className="text-xs opacity-60">Ends: {p.endDate}</div>
                        </div>
                        <p className="text-sm opacity-80 mb-4">{p.description}</p>

                        {/* Voting Bars */}
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-xs opacity-70">
                                <span>For: {p.votesFor}</span>
                                <span>Against: {p.votesAgainst}</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden flex">
                                <div
                                    className="bg-green-500 h-full"
                                    style={{
                                        width: `${(p.votesFor / (p.votesFor + p.votesAgainst || 1)) * 100
                                            }%`,
                                    }}
                                />
                                <div
                                    className="bg-red-500 h-full"
                                    style={{
                                        width: `${(p.votesAgainst / (p.votesFor + p.votesAgainst || 1)) *
                                            100
                                            }%`,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        {p.status === "active" && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => onVote(p.id, "for")}
                                    className="flex-1 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-medium transition-colors"
                                >
                                    Vote FOR
                                </button>
                                <button
                                    onClick={() => onVote(p.id, "against")}
                                    className="flex-1 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium transition-colors"
                                >
                                    Vote AGAINST
                                </button>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
