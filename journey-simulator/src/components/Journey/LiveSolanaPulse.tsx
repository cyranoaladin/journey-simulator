import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, ArrowUpRight, Globe, Box } from 'lucide-react';

interface NetworkEvent {
    id: string;
    type: 'JITO' | 'PRICE' | 'GOV' | 'TPS';
    message: string;
    timestamp: Date;
}

const SAMPLE_EVENTS = [
    { type: 'JITO', message: 'Mev Bundle Validated (Slot 245999)' },
    { type: 'PRICE', message: 'SOL/USDC Route Optimized via Jupiter' },
    { type: 'GOV', message: 'Realms Proposal #445 Passed' },
    { type: 'TPS', message: 'Mainnet-Beta TPS: 3450' },
    { type: 'JITO', message: 'Validator 8899..ff Reward Payout' },
];

export default function LiveSolanaPulse() {
    const [events, setEvents] = useState<NetworkEvent[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const randomEvent = SAMPLE_EVENTS[Math.floor(Math.random() * SAMPLE_EVENTS.length)];
            const newEvent = {
                id: Date.now().toString(),
                type: randomEvent.type as any,
                message: randomEvent.message,
                timestamp: new Date()
            };
            setEvents(prev => [newEvent, ...prev].slice(0, 5)); // Keep last 5
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'JITO': return <Box size={12} className="text-yellow-400" />;
            case 'PRICE': return <ArrowUpRight size={12} className="text-green-400" />;
            case 'GOV': return <Globe size={12} className="text-blue-400" />;
            default: return <Radio size={12} className="text-purple-400" />;
        }
    };

    return (
        <div className="w-full bg-slate-900/50 border-t border-white/5 p-2 font-mono">
            <div className="flex items-center gap-2 mb-2 px-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] uppercase text-white/50 tracking-wider">Solana Live Pulse</span>
            </div>

            <div className="space-y-1">
                <AnimatePresence initial={false}>
                    {events.map((evt) => (
                        <motion.div
                            key={evt.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2 text-[10px] text-slate-300 p-1 hover:bg-white/5 rounded"
                        >
                            {getIcon(evt.type)}
                            <span className="truncate">{evt.message}</span>
                            <span className="ml-auto text-slate-600">
                                {evt.timestamp.getSeconds()}s ago
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
