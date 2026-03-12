/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, CheckCircle, XCircle, Sparkles } from 'lucide-react';

interface Concept {
    id: string;
    label: string;
    category: 'core' | 'advanced' | 'expert';
}

interface Connection {
    from: string;
    to: string;
    correct: boolean;
}

interface MentalModelMapperProps {
    onComplete?: (result: { score: number; correctConnections: number }) => void;
}

const CONCEPTS: Concept[] = [
    { id: 'account', label: 'Account Model', category: 'core' },
    { id: 'pda', label: 'PDA', category: 'advanced' },
    { id: 'sealevel', label: 'Sealevel Runtime', category: 'expert' },
    { id: 'parallel', label: 'Parallel Execution', category: 'core' },
    { id: 'rent', label: 'Rent Mechanism', category: 'advanced' },
    { id: 'cpi', label: 'Cross-Program Invocation', category: 'expert' },
];

const CORRECT_CONNECTIONS: Connection[] = [
    { from: 'account', to: 'pda', correct: true },
    { from: 'pda', to: 'cpi', correct: true },
    { from: 'sealevel', to: 'parallel', correct: true },
    { from: 'account', to: 'rent', correct: true },
];

export default function MentalModelMapper({ onComplete }: MentalModelMapperProps) {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [dragging, setDragging] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const handleDragStart = (conceptId: string) => {
        setDragging(conceptId);
    };

    const handleDragEnd = () => {
        setDragging(null);
    };

    const handleDrop = (targetId: string) => {
        if (!dragging || dragging === targetId) return;

        // Check if connection already exists
        const exists = connections.some(
            conn => (conn.from === dragging && conn.to === targetId) ||
                (conn.from === targetId && conn.to === dragging)
        );

        if (!exists) {
            const isCorrect = CORRECT_CONNECTIONS.some(
                conn => (conn.from === dragging && conn.to === targetId) ||
                    (conn.from === targetId && conn.to === dragging)
            );

            setConnections([...connections, { from: dragging, to: targetId, correct: isCorrect }]);
        }

        setDragging(null);
    };

    const handleSubmit = () => {
        const correctCount = connections.filter(conn => conn.correct).length;
        const calculatedScore = Math.round((correctCount / CORRECT_CONNECTIONS.length) * 100);
        setScore(calculatedScore);
        setSubmitted(true);

        if (onComplete) {
            onComplete({ score: calculatedScore, correctConnections: correctCount });
        }
    };

    const handleReset = () => {
        setConnections([]);
        setSubmitted(false);
        setScore(0);
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'core': return 'bg-blue-500/20 border-blue-500/40 text-blue-300';
            case 'advanced': return 'bg-purple-500/20 border-purple-500/40 text-purple-300';
            case 'expert': return 'bg-accent-cyan/20 border-accent-cyan/40 text-accent-cyan';
            default: return 'bg-white/10 border-white/20 text-white/80';
        }
    };

    return (
        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-accent-cyan flex items-center gap-2">
                    <Brain size={18} className="text-accent-cyan" />
                    Solana Mental Model Mapper
                </h3>
                <span className="text-[10px] font-mono text-white/40">COGNITIVE_SCAFFOLDING_V1</span>
            </div>

            {/* Instructions */}
            {!submitted && (
                <div className="bg-accent-purple/10 border border-accent-purple/20 rounded-lg p-3 mb-4">
                    <p className="text-xs text-white/80 leading-relaxed">
                        <strong className="text-accent-purple">Task:</strong> Drag and drop concepts to create connections that represent how Solana's architecture components relate to each other. Build your mental model!
                    </p>
                </div>
            )}

            {/* Concept Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {CONCEPTS.map(concept => {
                    const isConnected = connections.some(
                        conn => conn.from === concept.id || conn.to === concept.id
                    );

                    return (
                        <motion.div
                            key={concept.id}
                            draggable={!submitted}
                            onDragStart={() => handleDragStart(concept.id)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(concept.id)}
                            whileHover={!submitted ? { scale: 1.05 } : {}}
                            whileTap={!submitted ? { scale: 0.95 } : {}}
                            className={`
                relative p-4 rounded-lg border-2 transition-all cursor-move
                ${getCategoryColor(concept.category)}
                ${dragging === concept.id ? 'opacity-50 scale-95' : ''}
                ${isConnected ? 'ring-2 ring-white/20' : ''}
              `}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold">{concept.label}</span>
                                {isConnected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring' }}
                                    >
                                        <Sparkles size={14} className="text-white/60" />
                                    </motion.div>
                                )}
                            </div>
                            <div className="text-[10px] uppercase tracking-wide opacity-60 mt-1">
                                {concept.category}
                            </div>

                            {/* Connection count indicator */}
                            {isConnected && (
                                <div className="absolute -top-2 -right-2 w-5 h-5 bg-accent-cyan rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-black/40">
                                    {connections.filter(c => c.from === concept.id || c.to === concept.id).length}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Connections Summary */}
            {connections.length > 0 && (
                <div className="bg-black/60 rounded-lg p-4 mb-4 border border-white/5">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-white/70 mb-3">
                        Your Connections ({connections.length})
                    </h4>
                    <div className="space-y-2">
                        {connections.map((conn, idx) => {
                            const fromConcept = CONCEPTS.find(c => c.id === conn.from);
                            const toConcept = CONCEPTS.find(c => c.id === conn.to);

                            return (
                                <motion.div
                                    key={`${conn.from}-${conn.to}-${idx}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex items-center gap-2 text-xs p-2 rounded border ${submitted
                                        ? conn.correct
                                            ? 'bg-green-500/10 border-green-500/30 text-green-300'
                                            : 'bg-red-500/10 border-red-500/30 text-red-300'
                                        : 'bg-white/5 border-white/10 text-white/80'
                                        }`}
                                >
                                    {submitted && (
                                        conn.correct ? <CheckCircle size={14} /> : <XCircle size={14} />
                                    )}
                                    <span className="font-mono">
                                        {fromConcept?.label} ↔ {toConcept?.label}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {!submitted ? (
                <div className="flex gap-2">
                    <button
                        onClick={handleSubmit}
                        disabled={connections.length === 0}
                        className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-[#00E5FF] to-accent-purple text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Submit Mental Model
                    </button>
                    {connections.length > 0 && (
                        <button
                            onClick={handleReset}
                            className="px-4 py-3 rounded-lg border border-white/10 text-white/80 text-sm hover:bg-white/5 transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Score Display */}
                    <div className={`p-4 rounded-lg border ${score >= 75
                        ? 'bg-green-500/10 border-green-500/30'
                        : score >= 50
                            ? 'bg-yellow-500/10 border-yellow-500/30'
                            : 'bg-red-500/10 border-red-500/30'
                        }`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-white">Mental Model Score</span>
                            <span className={`text-2xl font-bold ${score >= 75 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                {score}%
                            </span>
                        </div>
                        <p className="text-xs text-white/70">
                            {score >= 75
                                ? 'Excellent! You have a strong understanding of Solana architecture.'
                                : score >= 50
                                    ? 'Good progress! Review the incorrect connections to strengthen your model.'
                                    : 'Keep learning! Understanding these relationships is key to Solana mastery.'
                            }
                        </p>
                    </div>

                    {/* Reset Button */}
                    <button
                        onClick={handleReset}
                        className="w-full px-4 py-2 rounded-lg border border-white/10 text-white/80 text-sm hover:bg-white/5 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Hint */}
            {!submitted && connections.length === 0 && (
                <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-[10px] text-white/40 leading-relaxed">
                        <strong className="text-white/60">Hint:</strong> Think about how PDAs enable state management, how Sealevel enables parallelism, and how accounts require rent to persist.
                    </p>
                </div>
            )}
        </div>
    );
}
