/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, TrendingUp, Users, DollarSign, Sparkles, CheckCircle } from 'lucide-react';

interface LaunchMetrics {
    initialPrice: number;
    marketCap: number;
    holders: number;
    liquidityLocked: number;
    listingProgress: number;
}

interface MarketLaunchpadProps {
    tokenName?: string;
    tokenSymbol?: string;
    onComplete?: (metrics: LaunchMetrics) => void;
}

export default function MarketLaunchpad({
    tokenName = 'MFAI Token',
    tokenSymbol = 'MFAI',
    onComplete
}: MarketLaunchpadProps) {
    const [launched, setLaunched] = useState(false);
    const [launching, setLaunching] = useState(false);
    const [confetti, setConfetti] = useState<Array<{ id: number; x: number; delay: number }>>([]);
    const [metrics, setMetrics] = useState<LaunchMetrics>({
        initialPrice: 0,
        marketCap: 0,
        holders: 0,
        liquidityLocked: 0,
        listingProgress: 0
    });

    const handleLaunch = () => {
        setLaunching(true);

        // Generate confetti
        const confettiArray = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 0.5
        }));
        setConfetti(confettiArray);

        // Animate metrics
        const targetMetrics = {
            initialPrice: 0.15,
            marketCap: 1500000,
            holders: 247,
            liquidityLocked: 85,
            listingProgress: 100
        };

        // Simulate progressive metric updates
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;

            setMetrics({
                initialPrice: (targetMetrics.initialPrice * progress) / 100,
                marketCap: (targetMetrics.marketCap * progress) / 100,
                holders: Math.floor((targetMetrics.holders * progress) / 100),
                liquidityLocked: (targetMetrics.liquidityLocked * progress) / 100,
                listingProgress: progress
            });

            if (progress >= 100) {
                clearInterval(interval);
                setLaunching(false);
                setLaunched(true);

                if (onComplete) {
                    onComplete(targetMetrics);
                }
            }
        }, 50);
    };

    const formatNumber = (num: number, decimals: number = 2): string => {
        if (num >= 1000000) {
            return `$${(num / 1000000).toFixed(decimals)}M`;
        }
        if (num >= 1000) {
            return `$${(num / 1000).toFixed(decimals)}K`;
        }
        return `$${num.toFixed(decimals)}`;
    };

    return (
        <div className="relative bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl overflow-hidden">
            {/* Confetti Animation */}
            <AnimatePresence>
                {confetti.length > 0 && (
                    <>
                        {confetti.map(particle => (
                            <motion.div
                                key={particle.id}
                                initial={{ y: -20, x: `${particle.x}%`, opacity: 1, rotate: 0 }}
                                animate={{
                                    y: 400,
                                    rotate: 360,
                                    opacity: 0
                                }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    duration: 2,
                                    delay: particle.delay,
                                    ease: 'easeOut'
                                }}
                                className="absolute w-2 h-2 rounded-full"
                                style={{
                                    background: `hsl(${Math.random() * 360}, 70%, 60%)`
                                }}
                            />
                        ))}
                    </>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-accent-cyan flex items-center gap-2">
                    <Rocket size={18} className="text-accent-cyan" />
                    Token Market Launch
                </h3>
                <span className="text-[10px] font-mono text-white/40">DEX_LISTING_PROTOCOL</span>
            </div>

            {/* Token Info */}
            <div className="bg-gradient-to-br from-accent-cyan/10 to-accent-purple/10 rounded-lg p-4 mb-6 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h4 className="text-xl font-bold text-white">{tokenName}</h4>
                        <span className="text-sm text-white/60 font-mono">${tokenSymbol}</span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
                        <Sparkles size={24} className="text-white" />
                    </div>
                </div>

                {launched && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-green-400 text-sm font-semibold"
                    >
                        <CheckCircle size={16} />
                        Successfully Listed on DEX
                    </motion.div>
                )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <MetricCard
                    icon={<DollarSign size={16} />}
                    label="Initial Price"
                    value={`$${metrics.initialPrice.toFixed(4)}`}
                    color="text-green-400"
                    progress={metrics.listingProgress}
                />
                <MetricCard
                    icon={<TrendingUp size={16} />}
                    label="Market Cap"
                    value={formatNumber(metrics.marketCap)}
                    color="text-blue-400"
                    progress={metrics.listingProgress}
                />
                <MetricCard
                    icon={<Users size={16} />}
                    label="Holders"
                    value={metrics.holders.toString()}
                    color="text-purple-400"
                    progress={metrics.listingProgress}
                />
                <MetricCard
                    icon={<Sparkles size={16} />}
                    label="Liquidity Locked"
                    value={`${metrics.liquidityLocked.toFixed(0)}%`}
                    color="text-accent-cyan"
                    progress={metrics.listingProgress}
                />
            </div>

            {/* Listing Progress Bar */}
            {launching && (
                <div className="mb-6" data-testid="launchpad-progress-bar">
                    <div className="flex justify-between text-xs text-white/60 mb-2">
                        <span>Listing Progress</span>
                        <span>{metrics.listingProgress}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-[#00E5FF] via-accent-purple to-[#00E5FF] bg-[length:200%_100%]"
                            initial={{ width: '0%' }}
                            animate={{
                                width: `${metrics.listingProgress}%`,
                                backgroundPosition: ['0% 0%', '100% 0%']
                            }}
                            transition={{
                                width: { duration: 0.3 },
                                backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' }
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Launch Button */}
            {!launched && !launching && (
                <button
                    onClick={handleLaunch}
                    className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-[#00E5FF] to-accent-purple text-white font-bold text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-[#00E5FF]/20"
                >
                    <Rocket size={20} />
                    Launch to Market
                </button>
            )}

            {/* Success Message */}
            {launched && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4"
                >
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                            <CheckCircle size={20} className="text-green-400" />
                        </div>
                        <div>
                            <h5 className="font-semibold text-green-400 mb-1">Launch Successful!</h5>
                            <p className="text-xs text-white/70 leading-relaxed">
                                Your token is now live on the DEX. Initial liquidity has been locked, and trading is active. Monitor your metrics and engage with your community!
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Info Footer */}
            <div className="mt-6 pt-4 border-t border-white/5">
                <p className="text-[10px] text-white/40 leading-relaxed">
                    <strong className="text-white/60">DEX Listing:</strong> Automated market making with bonding curve mechanics ensures fair price discovery and sustainable liquidity for your token launch.
                </p>
            </div>
        </div>
    );
}

interface MetricCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
    progress: number;
}

function MetricCard({ icon, label, value, color, progress }: MetricCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: progress > 0 ? 1 : 0.3, y: 0 }}
            className="bg-black/60 rounded-lg p-3 border border-white/5"
        >
            <div className="flex items-center gap-2 mb-2">
                <div className={color}>{icon}</div>
                <span className="text-[10px] text-white/60 uppercase tracking-wide">{label}</span>
            </div>
            <div className={`text-lg font-bold ${color}`}>
                {value}
            </div>
        </motion.div>
    );
}
