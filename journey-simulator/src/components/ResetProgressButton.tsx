/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useJourneyStore } from '../store/journeyStore';

interface ResetProgressButtonProps {
  className?: string;
}

const ResetProgressButton: React.FC<ResetProgressButtonProps> = ({ className = '' }) => {
  const { resetProgress } = useJourneyStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  const handleReset = async () => {
    await resetProgress();
    setShowConfirm(false);
    setResetComplete(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setResetComplete(false);
    }, 3000);
  };

  const renderInitial = (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setShowConfirm(true)}
      className="flex items-center space-x-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-medium transition-all"
    >
      <RefreshCw size={16} />
      <span>Reset Progress</span>
    </motion.button>
  );

  const renderConfirm = (
    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
      <div className="flex items-start space-x-2 mb-3">
        <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
        <p className="text-sm">This will reset all your progress, including XP, NFTs, tokens, and completed phases. This action cannot be undone.</p>
      </div>
      <div className="flex space-x-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          className="flex-1 bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
        >
          Reset Everything
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowConfirm(false)}
          className="flex-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
        >
          Cancel
        </motion.button>
      </div>
    </div>
  );

  const renderSuccess = (
    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
      <div className="flex items-center space-x-2">
        <CheckCircle className="text-green-400" size={16} />
        <p className="text-sm">Progress reset complete! You can now start fresh.</p>
      </div>
    </div>
  );

  let content = renderInitial;
  if (showConfirm) {
    content = renderConfirm;
  } else if (resetComplete) {
    content = renderSuccess;
  }

  return <div className={`relative ${className}`}>{content}</div>;
};

export default ResetProgressButton;