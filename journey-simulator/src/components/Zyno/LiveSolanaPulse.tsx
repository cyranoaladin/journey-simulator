/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 * 
 * Live Solana Pulse - Global Network Events
 * Real-time blockchain event simulation for Zyno Pulse panel
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, Vote, Activity } from 'lucide-react';

interface NetworkEvent {
    id: string;
    type: 'jito' | 'jupiter' | 'realms' | 'general';
    message: string;
    timestamp: Date;
    priority: 'high' | 'medium' | 'low';
}

export default function LiveSolanaPulse() {
    const [events, setEvents] = useState<NetworkEvent[]>([]);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (!isPaused) {
            const interval = setInterval(() => {
                generateNetworkEvent();
            }, Math.random() * 5000 + 5000); // 5-10 seconds per requirement

            return () => clearInterval(interval);
        }
    }, [isPaused]);

    const generateNetworkEvent = () => {
        const eventTypes = [
            {
                type: 'jito' as const,
                messages: [
                    'Jito Bundle Validated: 47 transactions compressed',
                    'Jito MEV Auction: 2.3 SOL captured',
                    'Jito Block Engine: Optimized transaction ordering',
                    'Jito Bundle Success: 99.2% inclusion rate'
                ],
                priority: 'high' as const
            },
            {
                type: 'jupiter' as const,
                messages: [
                    'Jupiter Price Route Optimized: USDC→SOL via 3 hops',
                    'Jupiter Swap Executed: $125K volume, 0.08% slippage',
                    'Jupiter Limit Order Filled: 500 SOL @ $98.50',
                    'Jupiter DCA Strategy: Auto-buy triggered'
                ],
                priority: 'medium' as const
            },
            {
                type: 'realms' as const,
                messages: [
                    'New Realms Proposal Detected: Treasury Allocation #142',
                    'Realms Vote Active: Governance Parameter Update',
                    'Realms Proposal Passed: 87% approval, 4.2M votes',
                    'Realms DAO Created: "Solana Builders Collective"'
                ],
                priority: 'medium' as const
            },
            {
                type: 'general' as const,
                messages: [
                    'Network TPS: 3,247 transactions/sec',
                    'Validator Stake Increased: +125K SOL',
                    'New Program Deployed: Token Vesting v2.1',
                    'Epoch Transition: Rewards distributed',
                    'NFT Mint Surge: 1,250 mints in last minute',
                    'Metaplex Candy Machine: New collection launched'
                ],
                priority: 'low' as const
            }
        ];

        const selectedType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const message = selectedType.messages[Math.floor(Math.random() * selectedType.messages.length)];

        const newEvent: NetworkEvent = {
            id: `event-${Date.now()}-${Math.random()}`,
            type: selectedType.type,
            message,
            timestamp: new Date(),
            priority: selectedType.priority
        };

        setEvents(prev => [newEvent, ...prev].slice(0, 10)); // Keep last 10 events
    };

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'jito': return <Zap size={14} className="text-yellow-400" />;
            case 'jupiter': return <TrendingUp size={14} className="text-blue-400" />;
            case 'realms': return <Vote size={14} className="text-purple-400" />;
            default: return <Activity size={14} className="text-accent-cyan" />;
        }
    };

    const getEventColor = (type: string) => {
        switch (type) {
            case 'jito': return 'border-yellow-500/30 bg-yellow-500/10';
            case 'jupiter': return 'border-blue-500/30 bg-blue-500/10';
            case 'realms': return 'border-purple-500/30 bg-purple-500/10';
            default: return 'border-accent-cyan/30 bg-accent-cyan/10';
        }
    };

    return (
        <div className="bg-black/40 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-accent-cyan flex items-center gap-2">
                    <Activity size={16} className="text-accent-cyan animate-pulse" />
                    Live Solana Pulse
                </h3>
                <button
                    onClick={() => setIsPaused(!isPaused)}
                    className={`text-[10px] px-2 py-1 rounded border ${isPaused
                            ? 'border-red-500/40 text-red-400 bg-red-500/10'
                            : 'border-green-500/40 text-green-400 bg-green-500/10'
                        }`}
                >
                    {isPaused ? 'PAUSED' : 'LIVE'}
                </button>
            </div>

            {/* Event Stream */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
                <AnimatePresence>
                    {events.map(event => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -20, height: 0 }}
                            animate={{ opacity: 1, x: 0, height: 'auto' }}
                            exit={{ opacity: 0, x: 20, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`border rounded-lg p-3 ${getEventColor(event.type)}`}
                        >
                            <div className="flex items-start gap-2">
                                <div className="mt-0.5">{getEventIcon(event.type)}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-white/90 leading-relaxed">{event.message}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-white/40 font-mono">
                                            {event.timestamp.toLocaleTimeString()}
                                        </span>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold ${event.priority === 'high'
                                                ? 'bg-red-500/20 text-red-400'
                                                : event.priority === 'medium'
                                                    ? 'bg-yellow-500/20 text-yellow-400'
                                                    : 'bg-white/10 text-white/60'
                                            }`}>
                                            {event.priority}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {events.length === 0 && (
                    <div className="text-center py-8 text-white/40 text-sm">
                        Listening for network events...
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-[10px] text-white/40 leading-relaxed">
                    <strong className="text-white/60">Simulated Events:</strong> Real-time blockchain activity from Jito, Jupiter, and Realms protocols.
                </p>
            </div>
        </div>
    );
}
