import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function MintMission() {
    const shouldReduceMotion = useReducedMotion();

    const [_status, _setStatus] = useState('IDLE');

    return (
        <div className="mint-mission-container p-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                cNFT Minting Interface
            </h2>
            {/* Mobile Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="preview-card bg-neutral-900 rounded-xl p-4">
                    {/* Placeholder Logic for Image */}
                    <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center text-white/20">
                        NFT PREVIEW
                    </div>
                </div>
                <div className="controls space-y-4">
                    {/* Reduced Motion Applied */}
                    <motion.button
                        whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                        className="w-full py-3 bg-white text-black font-mono font-bold rounded-lg hover:bg-gray-100 transition-colors animate-shimmer relative overflow-hidden ring-2 ring-white/50"
                    >
                        Confirm Mint (0.000005 SOL)
                    </motion.button>
                    <div className="text-xs text-center text-white/40 font-mono">
                        COMPRESSION_ENABLED: TRUE
                    </div>
                </div>
            </div>
        </div>
    );
}
