/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, TrendingUp, AlertCircle, CheckCircle2, Coins } from 'lucide-react';
import { toast } from 'sonner';

interface StakingModalProps {
    amount: number;
    phaseTitle: string;
    phaseDescription?: string;
    currentBalance?: number;
    onStake: () => void;
    onCancel: () => void;
}

export const StakingModal = ({
    amount,
    phaseTitle,
    phaseDescription,
    currentBalance = 1000,
    onStake,
    onCancel,
}: StakingModalProps) => {
    const [isStaking, setIsStaking] = useState(false);
    const [stakeComplete, setStakeComplete] = useState(false);
    const hasEnoughBalance = currentBalance >= amount;

    const handleStake = async () => {
        if (!hasEnoughBalance) {
            toast.error('Insufficient Balance', {
                description: `You need ${amount} $MFAI but only have ${currentBalance} $MFAI`,
            });
            return;
        }

        setIsStaking(true);

        // Simulate blockchain transaction
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setIsStaking(false);
        setStakeComplete(true);

        toast.success('Staking Successful', {
            description: `${amount} $MFAI staked for ${phaseTitle}`,
        });

        // Wait for animation then close
        setTimeout(() => {
            onStake();
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
                    className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 p-8 shadow-2xl"
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
                            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple shadow-lg"
                        >
                            <Lock size={32} className="text-white" />
                        </motion.div>
                        <h2 className="font-space text-2xl font-bold text-white">Stake $MFAI</h2>
                        <p className="mt-2 text-sm text-white/70">
                            Lock tokens to unlock {phaseTitle}
                        </p>
                    </div>

                    {/* Phase Info */}
                    <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-semibold text-white/60">Phase</span>
                            <span className="text-sm font-bold text-white">{phaseTitle}</span>
                        </div>
                        {phaseDescription && (
                            <p className="text-xs text-white/50">{phaseDescription}</p>
                        )}
                    </div>

                    {/* Staking Amount */}
                    <div className="mb-6 rounded-2xl border border-accent-cyan/30 bg-accent-cyan/10 p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-sm font-semibold text-white/70">Amount Required</span>
                            <div className="flex items-center gap-2">
                                <Coins size={20} className="text-accent-cyan" />
                                <span className="font-space text-3xl font-bold text-white">
                                    {amount.toLocaleString()}
                                </span>
                                <span className="text-lg font-semibold text-white/70">$MFAI</span>
                            </div>
                        </div>

                        {/* Balance Info */}
                        <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                            <span className="text-xs font-semibold text-white/60">Your Balance</span>
                            <span className={`text-sm font-bold ${hasEnoughBalance ? 'text-emerald-400' : 'text-red-400'}`}>
                                {currentBalance.toLocaleString()} $MFAI
                            </span>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="mb-6 space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-full bg-emerald-500/20 p-1">
                                <CheckCircle2 size={16} className="text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Unlock Phase Content</p>
                                <p className="text-xs text-white/60">Access exclusive missions and resources</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-full bg-accent-cyan/20 p-1">
                                <TrendingUp size={16} className="text-accent-cyan" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Earn Staking Rewards</p>
                                <p className="text-xs text-white/60">Receive additional $MFAI over time</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-full bg-accent-purple/20 p-1">
                                <Lock size={16} className="text-accent-purple" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Demonstrate Commitment</p>
                                <p className="text-xs text-white/60">Show skin in the game to the ecosystem</p>
                            </div>
                        </div>
                    </div>

                    {/* Warning if insufficient balance */}
                    {!hasEnoughBalance && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4"
                        >
                            <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-400" />
                            <div>
                                <p className="text-sm font-semibold text-red-400">Insufficient Balance</p>
                                <p className="text-xs text-red-300/80">
                                    You need {(amount - currentBalance).toLocaleString()} more $MFAI to stake
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
                            disabled={isStaking}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleStake}
                            disabled={isStaking || !hasEnoughBalance || stakeComplete}
                            className={`flex-1 rounded-xl px-6 py-3 font-semibold text-white transition-all ${
                                stakeComplete
                                    ? 'bg-emerald-500'
                                    : hasEnoughBalance
                                    ? 'bg-gradient-to-r from-accent-cyan to-accent-purple hover:shadow-lg hover:shadow-accent-cyan/50'
                                    : 'cursor-not-allowed bg-gray-600 opacity-50'
                            }`}
                        >
                            {isStaking ? (
                                <span className="flex items-center justify-center gap-2">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        className="h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                                    />
                                    Staking...
                                </span>
                            ) : stakeComplete ? (
                                <span className="flex items-center justify-center gap-2">
                                    <CheckCircle2 size={20} />
                                    Staked!
                                </span>
                            ) : (
                                `Stake ${amount.toLocaleString()} $MFAI`
                            )}
                        </button>
                    </div>

                    {/* Demo Mode Notice */}
                    <p className="mt-4 text-center text-xs text-white/40">
                        Demo Mode: No real tokens will be transferred
                    </p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
