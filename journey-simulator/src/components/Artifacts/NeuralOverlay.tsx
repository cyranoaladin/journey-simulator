import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isVisible: boolean;
  agentName: string; // ex: "CFO Agent"
  taskName: string;  // ex: "calculating bonding curve..."
}

export const NeuralOverlay: React.FC<Props> = ({ isVisible, agentName, taskName }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm rounded-3xl overflow-hidden"
        >
          {/* Iframe vers le Canvas HTML */}
          <iframe 
            src="/generated/neural_swarm.html" 
            className="w-full h-full absolute inset-0 border-none opacity-80 pointer-events-none"
          />
          
          {/* Texte Informatif au premier plan */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative z-10 text-center space-y-2 mt-32"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-mono text-green-400 uppercase tracking-widest">
                Neural Swarm Active
              </span>
            </div>
            <h3 className="text-2xl font-display font-bold text-white">
              {agentName} is working...
            </h3>
            <p className="text-gray-400 font-mono text-sm animate-pulse">
              {'>'} {taskName}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
