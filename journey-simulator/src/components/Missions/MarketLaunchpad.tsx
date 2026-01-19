/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Rocket, Check, AlertTriangle, Globe } from 'lucide-react';

export default function MarketLaunchpad() {
    const [launched, setLaunched] = useState(false);
    const [checklist, setChecklist] = useState({
        compliance: false,
        liquidity: false,
        audit: false
    });

    const allChecked = Object.values(checklist).every(Boolean);

    const handleLaunch = () => {
        if (!allChecked) return;
        setLaunched(true);
        fireConfetti();
    };

    const fireConfetti = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    };

    const toggleCheck = (key: keyof typeof checklist) => {
        if (launched) return;
        setChecklist(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="relative overflow-hidden rounded-2xl bg-black/60 border border-gold-500/30 p-8 shadow-glow-gold backdrop-blur-xl">
            {/* Header */}
            <div className="text-center mb-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-xs font-mono mb-4"
                >
                    <Rocket size={14} />
                    PHASE 5: MAINNET_LAUNCH_SEQUENCE
                </motion.div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                    {launched ? "PROTOCOL LIVE ON MAINNET" : "Market Launchpad"}
                </h2>
                <p className="text-white/60 mt-2 text-sm max-w-md mx-auto">
                    Final verification checks before irreversible deployment. Ensure all security parameters are green.
                </p>
            </div>

            {/* Checklist */}
            <div className="grid gap-3 max-w-md mx-auto mb-8">
                {[
                    { key: 'compliance', label: 'R1 Compliance & Impact Audit' },
                    { key: 'liquidity', label: 'Initial Liquidity Provisioned' },
                    { key: 'audit', label: 'Smart Contract Audit Signed' }
                ].map((item) => (
                    <div
                        key={item.key}
                        onClick={() => toggleCheck(item.key as keyof typeof checklist)}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${checklist[item.key as keyof typeof checklist]
                            ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-100'
                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                            }`}
                    >
                        <span className="font-mono text-sm">{item.label}</span>
                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${checklist[item.key as keyof typeof checklist]
                            ? 'bg-yellow-500 border-yellow-500'
                            : 'border-white/20'
                            }`}>
                            {checklist[item.key as keyof typeof checklist] && <Check size={14} className="text-black" />}
                        </div>
                    </div>
                ))}
            </div>

            {/* Launch Button */}
            <div className="flex justify-center">
                {!launched ? (
                    <motion.button
                        whileHover={allChecked ? { scale: 1.05 } : {}}
                        whileTap={allChecked ? { scale: 0.95 } : {}}
                        onClick={handleLaunch}
                        disabled={!allChecked}
                        className={`group relative px-8 py-4 rounded-xl font-bold text-lg tracking-wide transition-all ${allChecked
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg shadow-orange-500/20'
                            : 'bg-white/10 text-white/20 cursor-not-allowed'
                            }`}
                    >
                        {allChecked ? (
                            <span className="flex items-center gap-2">
                                <Rocket className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                                INITIATE LAUNCH
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <AlertTriangle size={18} />
                                AWAITING CHECKS
                            </span>
                        )}
                    </motion.button>
                ) : (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center space-y-4"
                    >
                        <div className="inline-block p-4 rounded-full bg-green-500/20 border border-green-500/40 text-green-400">
                            <Globe size={32} />
                        </div>
                        <div className="text-sm font-mono text-green-400">
                            TX_HASH: 5Hy...9Xz <br />
                            STATUS: FINALIZED
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
