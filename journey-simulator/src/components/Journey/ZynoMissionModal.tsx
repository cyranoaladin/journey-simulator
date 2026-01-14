import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BrainCircuit, Send, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';
import { useSubmitMission } from '../../hooks/useSubmitMission';

interface ZynoMissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    missionTitle: string;
    missionId: string;
}

const ZynoMissionModal: React.FC<ZynoMissionModalProps> = ({
    isOpen,
    onClose,
    missionTitle,
    missionId
}) => {
    const [deliverable, setDeliverable] = useState('');
    const {
        submitDeliverable,
        isBusy,
        currentStep,
        progress,
        feedback,
        error
    } = useSubmitMission();

    const handleSubmit = async () => {
        await submitDeliverable(missionId, deliverable);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={!isBusy ? onClose : undefined}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-gray-900/90 shadow-2xl backdrop-blur-xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/10 p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600/20 text-violet-400">
                                <BrainCircuit size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Mission Uplink</h3>
                                <p className="text-xs text-gray-400">{missionTitle}</p>
                            </div>
                        </div>
                        {!isBusy && (
                            <button
                                onClick={onClose}
                                className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        {!feedback ? (
                            // Input Mode
                            <div className="space-y-4">
                                <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Mission Deliverable / Proof of Work
                                    </label>
                                    <textarea
                                        value={deliverable}
                                        onChange={(e) => setDeliverable(e.target.value)}
                                        disabled={isBusy}
                                        className="min-h-[200px] w-full rounded-lg bg-transparent p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                        placeholder="Enter your mission findings, decentralized architecture analysis, or code snippets here for Zyno to analyze..."
                                    />
                                    {error && (
                                        <div className="mt-2 flex items-center gap-2 text-xs text-red-400">
                                            <AlertTriangle size={12} />
                                            <span>{error}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Agent Progress */}
                                {isBusy && (
                                    <div className="space-y-2 rounded-lg bg-violet-900/10 p-4 border border-violet-500/20">
                                        <div className="flex justify-between text-xs text-violet-300">
                                            <span>{currentStep}</span>
                                            <span>{Math.round(progress)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full rounded-full bg-gray-800 overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-violet-500 to-cyan-400"
                                                animate={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Success / Feedback Mode
                            <div className="space-y-6 text-center">
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-400 ring-4 ring-green-500/5">
                                    <CheckCircle size={40} />
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-white">Objective Complete</h2>
                                    <div className="flex justify-center gap-4">
                                        <span className="rounded-full bg-violet-500/20 px-3 py-1 text-sm font-bold text-violet-300 border border-violet-500/30">
                                            Score: {feedback.score}/100
                                        </span>
                                        <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-sm font-bold text-cyan-300 border border-cyan-500/30">
                                            +60 XP
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-white/5 bg-white/5 p-4 text-left">
                                    <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
                                        <Sparkles size={14} className="text-yellow-400" />
                                        Zyno Analysis
                                    </h4>
                                    <ul className="space-y-1 text-sm text-gray-400">
                                        {feedback.analysis.strengths.map((str, i) => (
                                            <li key={i} className="flex gap-2">
                                                <span className="text-green-400">+</span> {str}
                                            </li>
                                        ))}
                                        <li className="mt-2 text-xs italic text-gray-500 border-t border-white/5 pt-2">
                                            Next: {feedback.analysis.nextSteps}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-white/10 p-6 bg-black/20">
                        {!feedback ? (
                            <button
                                onClick={handleSubmit}
                                disabled={isBusy}
                                className={`
                  flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold uppercase tracking-wider text-white transition-all
                  ${isBusy
                                        ? 'cursor-not-allowed bg-gray-800 text-gray-500'
                                        : 'bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-900/20 hover:shadow-violet-600/40 hover:scale-[1.01]'
                                    }
                `}
                            >
                                {isBusy ? 'Processing...' : (
                                    <>
                                        <Send size={16} /> Submit for Analysis
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={onClose}
                                className="w-full rounded-xl bg-white/10 py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-all"
                            >
                                Continue Mission
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ZynoMissionModal;
