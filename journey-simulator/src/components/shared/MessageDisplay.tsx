/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  showIcon?: boolean;
  autoDismiss?: number; // temps en millisecondes pour auto-dismiss, undefined pour ne pas auto-dismiss
}

const MessageDisplay = ({ type, message, onClose, showIcon = true }: MessageProps) => {
  // Define colors and icons according to type
  const config = {
    success: {
      bg: 'bg-green-500/20',
      border: 'border-green-500/30',
      text: 'text-green-300',
      icon: '',
      iconColor: 'text-green-400'
    },
    error: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/30',
      text: 'text-red-300',
      icon: '',
      iconColor: 'text-red-400'
    },
    warning: {
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/30',
      text: 'text-yellow-300',
      icon: '',
      iconColor: 'text-yellow-400'
    },
    info: {
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/30',
      text: 'text-blue-300',
      icon: '',
      iconColor: 'text-blue-400'
    }
  };

  const { bg, border, text, icon, iconColor } = config[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`p-4 rounded-lg ${bg} ${border} border flex items-start`}
        role="alert"
        aria-live="polite"
      >
        {showIcon && (
          <span className={`mr-3 text-xl ${iconColor}`} aria-hidden="true">
            {icon}
          </span>
        )}
        <div className="flex-1">
          <p className={`text-sm ${text}`}>{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-4 ${iconColor} hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white rounded`}
            aria-label="Close this message"
          >
            <X size={16} />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default MessageDisplay;