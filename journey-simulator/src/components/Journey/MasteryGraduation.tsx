/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 * 
 * Mastery Graduation Component
 * Displays at Phase 5 completion with Radar Chart showing validator scores
 */

import { motion } from 'framer-motion';
import { Award, Download, Trophy, Sparkles } from 'lucide-react';
import * as React from 'react';
import { useState, useEffect, Suspense } from 'react';

// LAZY LOADING OPTIMIZATION
const RadarChart = React.lazy(() => import('./charts/RadarChart'));
const MasteryConfetti = React.lazy(() => import('./effects/MasteryConfetti'));

interface MasteryScore {
    dimension: string;
    score: number; // 0-100
    maxScore: number;
}

interface MasteryGraduationProps {
    personaName: string;
    trackName: string;
    scores: MasteryScore[];
    totalXP: number;
    completionDate?: Date;
    onClose?: () => void;
}

export default function MasteryGraduation({
    personaName,
    trackName,
    scores,
    totalXP,
    completionDate = new Date(),
    onClose
}: MasteryGraduationProps) {
    const [animationComplete, setAnimationComplete] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setAnimationComplete(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    // Calculate overall mastery percentage
    const overallMastery = Math.round(
        scores.reduce((sum, s) => sum + (s.score / s.maxScore) * 100, 0) / scores.length
    );

    const getMasteryLevel = () => {
        if (overallMastery >= 90) return { level: 'SOVEREIGN', color: 'text-yellow-400' };
        if (overallMastery >= 75) return { level: 'MASTER', color: 'text-accent-cyan' };
        if (overallMastery >= 60) return { level: 'PROFICIENT', color: 'text-purple-400' };
        return { level: 'DEVELOPING', color: 'text-blue-400' };
    };

    const mastery = getMasteryLevel();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative max-w-3xl w-full bg-gradient-to-br from-black/80 to-accent-purple/20 border border-white/20 rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
                {/* Lazy Loaded Confetti */}
                <Suspense fallback={null}>
                    <MasteryConfetti />
                </Suspense>

                {/* Header */}
                <div className="relative text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple mb-4"
                    >
                        <Trophy size={40} className="text-white" />
                    </motion.div>

                    <h1 className="text-4xl font-bold text-white mb-2">
                        Mastery Achieved!
                    </h1>
                    <p className="text-white/60 text-lg">
                        {personaName} • {trackName}
                    </p>
                </div>

                {/* Lazy Loaded Radar Chart */}
                <div className="mb-8 min-h-[300px]">
                    <Suspense fallback={<div className="animate-pulse w-64 h-64 bg-white/5 rounded-full mx-auto" />}>
                        <RadarChart scores={scores} />
                    </Suspense>
                </div>

                {/* Mastery Level Badge */}
                <div className="text-center mb-6">
                    <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/20 ${mastery.color}`}>
                        <Award size={20} />
                        <span className="text-xl font-bold">{mastery.level}</span>
                        <span className="text-sm opacity-75">({overallMastery}%)</span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="text-white/60 text-sm mb-1">Total XP Earned</div>
                        <div className="text-2xl font-bold text-accent-cyan">{totalXP.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="text-white/60 text-sm mb-1">Completion Date</div>
                        <div className="text-2xl font-bold text-white">{completionDate.toLocaleDateString()}</div>
                    </div>
                </div>

                {/* Score Breakdown */}
                <div className="mb-8">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70 mb-3">
                        Dimension Scores
                    </h3>
                    <div className="space-y-2">
                        {scores.map((score, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 + 1 }}
                                className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10"
                            >
                                <span className="text-white text-sm font-medium">{score.dimension}</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple"
                                            initial={{ width: '0%' }}
                                            animate={{ width: `${(score.score / score.maxScore) * 100}%` }}
                                            transition={{ delay: index * 0.1 + 1.2, duration: 0.8 }}
                                        />
                                    </div>
                                    <span className="text-accent-cyan font-mono text-sm w-16 text-right">
                                        {score.score}/{score.maxScore}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            // Generate certificate download
                            console.log('Downloading certificate...');
                        }}
                        className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-accent-cyan to-accent-purple text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        <Download size={18} />
                        Download Certificate
                    </button>

                    <button
                        onClick={() => {
                            const metadata = {
                                protocol: "Money Factory AI",
                                type: "Soulbound Mastery",
                                persona: personaName,
                                track: trackName,
                                mastery_level: mastery.level,
                                score: overallMastery,
                                dimensions: scores,
                                timestamp: completionDate.toISOString(),
                                signature: "0x(Simulated_Zyno_Seal)"
                            };
                            const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `MFAI_SOULBOUND_${personaName.replace(/\s+/g, '_').toUpperCase()}.json`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                        }}
                        className="px-6 py-3 rounded-lg border border-accent-cyan/50 text-accent-cyan hover:bg-accent-cyan/10 transition-colors flex items-center justify-center gap-2"
                    >
                        <Download size={18} />
                        Metadata
                    </button>

                    {onClose && (
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors"
                        >
                            Continue
                        </button>
                    )}
                </div>

                {/* Sparkles Effect */}
                {animationComplete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute top-4 right-4"
                    >
                        <Sparkles size={24} className="text-accent-cyan" />
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
