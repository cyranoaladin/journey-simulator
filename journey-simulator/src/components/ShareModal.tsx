import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Twitter as XIcon, Linkedin, MessageSquare, Copy, CheckCircle } from 'lucide-react';

interface ShareModalProps {
  proofType: string;
  title: string;
  explorerUrl?: string;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({
  proofType,
  title,
  explorerUrl,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  const shareText = `I just earned my Proof-of-${proofType}™ NFT "${title}" on Money Factory AI! #MoneyFactoryAI #ProofEconomy`;
  const shareUrl = explorerUrl || 'https://moneyfactory.ai';

  const shareToX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-primary-900 rounded-2xl p-6 max-w-md w-full border border-white/20"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-space font-bold">Share Your Achievement</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Share Text Preview */}
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2 text-sm">Share Message</h3>
          <p className="text-sm">{shareText}</p>
          {explorerUrl && (
            <div className="mt-2 text-xs text-blue-400 break-all">
              {explorerUrl}
            </div>
          )}
        </div>

        {/* Share Options */}
        <div className="space-y-3 mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={shareToX}
            className="w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 bg-black text-white border border-white/20"
          >
            <XIcon size={16} />
            <span>Share on X</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={shareToLinkedIn}
            className="w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 bg-[#0077B5] text-white"
          >
            <Linkedin size={16} />
            <span>Share on LinkedIn</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => copyToClipboard(`${shareText} ${shareUrl}`)}
            className="w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 bg-[#5865F2] text-white"
          >
            <MessageSquare size={16} />
            <span>Copy for Discord</span>
          </motion.button>
        </div>

        {/* Copy Link */}
        <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-3">
          <div className="flex-1 truncate text-sm opacity-80">
            {shareUrl}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => copyToClipboard(shareUrl)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            {copied ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} />}
          </motion.button>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-center"
            >
              <p className="text-sm text-green-400">Copied to clipboard!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default ShareModal;