/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 * 
 * Vault Synchronization Animation Component
 * Displays when Power Tool success triggers Knowledge Vault archiving
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Database, CheckCircle, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface VaultSyncAnimationProps {
    show: boolean;
    toolName?: string;
    onComplete?: () => void;
}

export default function VaultSyncAnimation({
    show,
    toolName = 'Power Tool',
    onComplete
}: VaultSyncAnimationProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (show) {
            setProgress(0);
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setTimeout(() => {
                            if (onComplete) onComplete();
                        }, 1000);
                        return 100;
                    }
                    return prev + 10;
                });
            }, 100);

            return () => clearInterval(interval);
        }
    }, [show, onComplete]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed top-4 right-4 z-50 bg-black/80 backdrop-blur-xl border border-white/20 rounded-lg p-4 shadow-2xl min-w-[300px]"
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                        <motion.div
                            animate={{ rotate: progress < 100 ? 360 : 0 }}
                            transition={{ duration: 2, repeat: progress < 100 ? Infinity : 0, ease: 'linear' }}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center"
                        >
                            {progress < 100 ? (
                                <Database size={20} className="text-white" />
                            ) : (
                                <CheckCircle size={20} className="text-white" />
                            )}
                        </motion.div>

                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                {progress < 100 ? 'Vault Synchronizing...' : 'Vault Synchronized'}
                                {progress === 100 && <Sparkles size={14} className="text-accent-cyan" />}
                            </h4>
                            <p className="text-xs text-white/60">
                                {toolName} → Knowledge Vault
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-cyan to-accent-purple"
                            initial={{ width: '0%' }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>

                    {/* Status Text */}
                    <div className="mt-2 text-[10px] font-mono text-white/40 text-right">
                        {progress < 100 ? `Archiving... ${progress}%` : 'Complete ✓'}
                    </div>

                    {/* Particle Effects */}
                    {progress === 100 && (
                        <div className="absolute inset-0 pointer-events-none">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-1 h-1 rounded-full bg-accent-cyan"
                                    initial={{
                                        x: '50%',
                                        y: '50%',
                                        opacity: 1,
                                        scale: 0
                                    }}
                                    animate={{
                                        x: `${50 + Math.cos(i * 45 * Math.PI / 180) * 100}%`,
                                        y: `${50 + Math.sin(i * 45 * Math.PI / 180) * 100}%`,
                                        opacity: 0,
                                        scale: 1
                                    }}
                                    transition={{ duration: 0.8, delay: i * 0.05 }}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
