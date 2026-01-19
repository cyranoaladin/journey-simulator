import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface BondingCurveVisualizerProps {
    currentSupply: number;
    maxSupply: number;
    reserveRatio: number; // 0 to 1
    basePrice: number;
    onMint?: () => void;
    onBurn?: () => void;
}

export default function BondingCurveVisualizer({
    currentSupply = 100000,
    maxSupply = 1000000,
    reserveRatio = 0.5,
    basePrice = 0.1,
    onMint,
    onBurn
}: BondingCurveVisualizerProps) {

    // High-precision math for the curve: P = basePrice * (supply ^ (1 / reserveRatio - 1))
    // Simplified for viz: P = basePrice + k * supply ^ 2
    const points = useMemo(() => {
        const pts = [];
        const steps = 50;
        const k = (1.0 - basePrice) / Math.pow(maxSupply, 2);

        for (let i = 0; i <= steps; i++) {
            const s = (maxSupply / steps) * i;
            const p = basePrice + k * Math.pow(s, 2);
            pts.push({ s, p });
        }
        return pts;
    }, [maxSupply, basePrice]);

    const svgPath = useMemo(() => {
        const margin = 40;
        const width = 400 - margin * 2;
        const height = 200 - margin * 2;

        const svgPts = points.map(pt => ({
            x: margin + (pt.s / maxSupply) * width,
            y: (height + margin) - (pt.p * height)
        }));

        return `M ${svgPts[0].x} ${svgPts[0].y} ` + svgPts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    }, [points, maxSupply]);

    const currentPoint = useMemo(() => {
        const margin = 40;
        const width = 400 - margin * 2;
        const height = 200 - margin * 2;
        const k = (1.0 - basePrice) / Math.pow(maxSupply, 2);
        const p = basePrice + k * Math.pow(currentSupply, 2);

        return {
            x: margin + (currentSupply / maxSupply) * width,
            y: (height + margin) - (p * height)
        };
    }, [currentSupply, maxSupply, basePrice]);

    return (
        <div data-testid="bonding-curve-visualizer" className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-accent-cyan flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse"></span>
                    Bonding Curve Logic: SYNC_ESTABLISHED
                </h3>
                <span className="text-[10px] font-mono text-white/40">LINEAR_CPMM_MODEL_V1</span>
            </div>

            <div className="relative w-full aspect-[2/1] overflow-visible">
                <svg className="w-full h-full" viewBox="0 0 400 200">
                    {/* Grid lines */}
                    <line x1="40" y1="160" x2="360" y2="160" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="40" y1="160" x2="40" y2="40" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                    {/* Dynamic Labels */}
                    <text x="360" y="175" textAnchor="end" className="fill-white/30 text-[8px] font-mono">SUPPLY: {(maxSupply / 1000).toFixed(0)}K</text>
                    <text x="35" y="45" textAnchor="end" className="fill-white/30 text-[8px] font-mono" transform="rotate(-90 35 45)">PRICE (SOL)</text>

                    {/* Curve */}
                    <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        d={svgPath}
                        fill="none"
                        stroke="url(#curveGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />

                    <defs>
                        <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#22d3ee" />
                            <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Current Supply Marker */}
                    <motion.circle
                        cx={currentPoint.x}
                        cy={currentPoint.y}
                        r="4"
                        fill="#fff"
                        filter="url(#glow)"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1, type: "spring" }}
                    />
                    <motion.line
                        x1={currentPoint.x} y1="160"
                        x2={currentPoint.x} y2={currentPoint.y}
                        stroke="rgba(34, 211, 238, 0.3)"
                        strokeDasharray="4 4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    />
                </svg>

                {/* Legend Overlay */}
                <div className="absolute top-4 right-4 flex flex-col gap-1 text-[9px] font-mono text-white/50 bg-black/50 p-2 rounded border border-white/5">
                    <div className="flex justify-between gap-4">
                        <span>CURR_PRICE:</span>
                        <span className="text-accent-cyan">{(basePrice + (1.0 - basePrice) * Math.pow(currentSupply / maxSupply, 2)).toFixed(4)} SOL</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span>RESERVE:</span>
                        <span className="text-accent-purple">{(reserveRatio * 100).toFixed(1)}%</span>
                    </div>
                </div>
            </div>

            {/* Simulated Actions */}
            <div className="mt-4 flex gap-3">
                <button
                    onClick={onMint}
                    className="flex-1 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2"
                >
                    Mint Tokens
                </button>
                <button
                    onClick={onBurn}
                    className="flex-1 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2"
                >
                    Burn Tokens
                </button>
            </div>
        </div>
    );
}
