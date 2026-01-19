/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Server, Shield, Zap, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Challenge {
    id: string;
    nonce: string;
    timestamp: number;
    difficulty: number;
}

interface NodeAttestationSimProps {
    onComplete?: (result: { verified: boolean; latency: number }) => void;
}

export default function NodeAttestationSim({ onComplete }: NodeAttestationSimProps) {
    const shouldReduceMotion = useReducedMotion();
    const [phase, setPhase] = useState<'idle' | 'challenging' | 'responding' | 'verifying' | 'complete'>('idle');
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [response, setResponse] = useState<string>('');
    const [latency, setLatency] = useState<number>(0);
    const [verified, setVerified] = useState<boolean>(false);
    const [startTime, setStartTime] = useState<number>(0);

    const generateChallenge = (): Challenge => {
        const nonce = Array.from({ length: 16 }, () =>
            Math.floor(Math.random() * 16).toString(16)
        ).join('');

        return {
            id: `challenge-${Date.now()}`,
            nonce,
            timestamp: Date.now(),
            difficulty: 3 // Number of leading zeros required in hash
        };
    };

    const simulateProofOfWork = (_nonce: string): string => {
        // Simulate hash computation (in reality, this would be SHA-256)
        let hash = '';
        for (let i = 0; i < 64; i++) {
            const char = Math.floor(Math.random() * 16).toString(16);
            hash += char;
        }
        // Ensure it starts with required zeros
        return '000' + hash.slice(3);
    };

    const handleStartAttestation = () => {
        setPhase('challenging');
        const newChallenge = generateChallenge();
        setChallenge(newChallenge);
        setStartTime(Date.now());

        // Simulate network delay for challenge transmission
        setTimeout(() => {
            setPhase('responding');

            // Simulate node computing proof-of-work
            setTimeout(() => {
                const computedResponse = simulateProofOfWork(newChallenge.nonce);
                setResponse(computedResponse);
                setPhase('verifying');

                // Simulate verification delay
                setTimeout(() => {
                    const endTime = Date.now();
                    const totalLatency = endTime - startTime;
                    setLatency(totalLatency);

                    // Verify response (check leading zeros)
                    const isValid = computedResponse.startsWith('0'.repeat(newChallenge.difficulty));
                    setVerified(isValid);
                    setPhase('complete');

                    if (onComplete) {
                        onComplete({ verified: isValid, latency: totalLatency });
                    }
                }, 800);
            }, 1500);
        }, 600);
    };

    const handleReset = () => {
        setPhase('idle');
        setChallenge(null);
        setResponse('');
        setLatency(0);
        setVerified(false);
        setStartTime(0);
    };

    const getPhaseColor = () => {
        switch (phase) {
            case 'challenging': return 'text-blue-400';
            case 'responding': return 'text-yellow-400';
            case 'verifying': return 'text-purple-400';
            case 'complete': return verified ? 'text-green-400' : 'text-red-400';
            default: return 'text-white/60';
        }
    };

    const getPhaseIcon = () => {
        switch (phase) {
            case 'challenging': return <Zap size={16} className="animate-pulse" />;
            case 'responding': return <Server size={16} className="animate-pulse" />;
            case 'verifying': return <Shield size={16} className="animate-pulse" />;
            case 'complete': return verified ? <CheckCircle size={16} /> : <XCircle size={16} />;
            default: return <Server size={16} />;
        }
    };

    return (
        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-accent-cyan flex items-center gap-2">
                    <Server size={18} className="text-accent-cyan" />
                    DePIN Node Attestation
                </h3>
                <span className="text-[10px] font-mono text-white/40">CHALLENGE_RESPONSE_V1</span>
            </div>

            {/* Status Indicator */}
            <div className="bg-black/60 rounded-lg p-4 mb-4 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <motion.div
                            animate={shouldReduceMotion ? {} : (phase !== 'idle' && phase !== 'complete' ? { scale: [1, 1.2, 1] } : {})}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            {getPhaseIcon()}
                        </motion.div>
                        <span className={`text-xs font-semibold uppercase tracking-wide ${getPhaseColor()}`}>
                            {phase === 'idle' && 'Ready to Attest'}
                            {phase === 'challenging' && 'Sending Challenge...'}
                            {phase === 'responding' && 'Node Computing Proof...'}
                            {phase === 'verifying' && 'Verifying Response...'}
                            {phase === 'complete' && (verified ? 'Attestation Verified' : 'Verification Failed')}
                        </span>
                    </div>
                    {latency > 0 && (
                        <div className="flex items-center gap-1 text-[10px] font-mono text-white/60">
                            <Clock size={12} />
                            {latency}ms
                        </div>
                    )}
                </div>

                {/* Challenge Details */}
                <AnimatePresence>
                    {challenge && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                        >
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <div>
                                    <span className="text-white/40">Challenge ID:</span>
                                    <div className="font-mono text-accent-cyan truncate">{challenge.id}</div>
                                </div>
                                <div>
                                    <span className="text-white/40">Difficulty:</span>
                                    <div className="font-mono text-white/80">{challenge.difficulty} leading zeros</div>
                                </div>
                            </div>

                            <div>
                                <span className="text-white/40 text-[11px]">Nonce:</span>
                                <div className="font-mono text-xs text-white/80 bg-white/5 rounded p-2 mt-1 break-all">
                                    {challenge.nonce}
                                </div>
                            </div>

                            {response && (
                                <div>
                                    <span className="text-white/40 text-[11px]">Response Hash:</span>
                                    <div className={`font-mono text-xs rounded p-2 mt-1 break-all ${verified
                                        ? 'text-green-400 bg-green-500/10 border border-green-500/20'
                                        : 'text-red-400 bg-red-500/10 border border-red-500/20'
                                        }`}>
                                        {response}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Progress Visualization */}
            {phase !== 'idle' && phase !== 'complete' && (
                <div className="mb-4">
                    <div className="flex justify-between text-[10px] text-white/40 mb-2">
                        <span>Challenge</span>
                        <span>Response</span>
                        <span>Verify</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple"
                            initial={{ width: '0%' }}
                            animate={{
                                width: phase === 'challenging' ? '33%' : phase === 'responding' ? '66%' : '100%'
                            }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>
            )}

            {/* Action Button */}
            {phase === 'idle' && (
                <button
                    onClick={handleStartAttestation}
                    className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-[var(--color-zyno)] to-accent-purple text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                    <Shield size={16} />
                    Start Attestation Protocol
                </button>
            )}

            {phase === 'complete' && (
                <div className="space-y-3">
                    {/* Result Summary */}
                    <div className={`p-4 rounded-lg border ${verified
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                        }`}>
                        <div className="flex items-center gap-2 mb-2">
                            {verified ? (
                                <CheckCircle size={20} className="text-green-400" />
                            ) : (
                                <XCircle size={20} className="text-red-400" />
                            )}
                            <span className={`font-semibold ${verified ? 'text-green-400' : 'text-red-400'}`}>
                                {verified ? 'Node Successfully Attested' : 'Attestation Failed'}
                            </span>
                        </div>
                        <p className="text-xs text-white/70">
                            {verified
                                ? `Node proved computational work in ${latency}ms. Hash meets difficulty requirement.`
                                : 'Node failed to provide valid proof-of-work response.'
                            }
                        </p>
                    </div>

                    {/* Reset Button */}
                    <button
                        onClick={handleReset}
                        className="w-full px-4 py-2 rounded-lg border border-white/10 text-white/80 text-sm hover:bg-white/5 transition-colors"
                    >
                        Run New Attestation
                    </button>
                </div>
            )}

            {/* Info Footer */}
            <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-[10px] text-white/40 leading-relaxed">
                    <strong className="text-white/60">DePIN Protocol:</strong> Decentralized Physical Infrastructure Networks use challenge-response mechanisms to verify node authenticity and computational capacity.
                </p>
            </div>
        </div>
    );
}
