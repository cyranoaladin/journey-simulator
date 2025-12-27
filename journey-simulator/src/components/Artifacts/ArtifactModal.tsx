import { AnimatePresence, motion } from 'framer-motion';
import { Check, Download, Share2, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface ArtifactModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  title: string;
}

export const ArtifactModal: React.FC<ArtifactModalProps> = ({ isOpen, onClose, fileUrl, title }) => {
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared' | 'error'>('idle');
  const resolvedUrl = useMemo(() => {
    if (!fileUrl) return '';
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }

    if (globalThis.window !== undefined) {
      try {
        return new URL(fileUrl, globalThis.window.location.origin).href;
      } catch (error) {
        console.error('Failed to resolve artifact URL', error);
        return fileUrl;
      }
    }

    return fileUrl;
  }, [fileUrl]);

  const handleDownload = () => {
    if (!resolvedUrl) return;

    try {
      const anchor = document.createElement('a');
      anchor.href = resolvedUrl;
      const urlWithoutQuery = resolvedUrl.split('?')[0];
      const extension = urlWithoutQuery.includes('.') ? urlWithoutQuery.split('.').pop() : 'pdf';
      // Normalize title: lowercase, replace non-alphanumeric with dashes, remove leading/trailing dashes
      // Group regex parts to make operator precedence explicit: (^-+)|(-+$)
      // Normalize title: lowercase, replace non-alphanumeric with dashes, remove leading/trailing dashes
      // Note: Using replace() with regex is appropriate here (not replaceAll) as we need pattern matching
      const normalizedTitle = title
        ? title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-+)|(-+$)/g, '')
        : 'mfai-artifact';
      anchor.download = `${normalizedTitle || 'mfai-artifact'}.${extension}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } catch (error) {
      console.error('Artifact download failed', error);
    }
  };

  const handleShare = async () => {
    if (!resolvedUrl) return;

    try {
      if (navigator.share) {
        await navigator.share({ title, url: resolvedUrl });
        setShareStatus('shared');
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(resolvedUrl);
        setShareStatus('copied');
        return;
      }

      setShareStatus('error');
    } catch (error) {
      console.error('Artifact share failed', error);
      setShareStatus('error');
    }
  };

  const resetShareStatus = () => {
    if (shareStatus !== 'idle') {
      setTimeout(() => setShareStatus('idle'), 3000);
    }
  };

  React.useEffect(resetShareStatus, [shareStatus]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-full h-full max-w-[95vw] max-h-[92vh] bg-[#0A0A1F] border border-purple-500/30 rounded-2xl flex flex-col shadow-2xl overflow-hidden relative"
          data-testid="artifact-modal"
        >
          {/* Header */}
          <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#13132B]">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <h3 className="font-display font-bold text-white tracking-wide">{title}</h3>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleDownload}
                className="text-gray-400 hover:text-white transition-colors"
                title="Download artifact"
                aria-label="Download artifact"
              >
                <Download size={18} />
              </button>
              <button
                type="button"
                onClick={handleShare}
                className={`text-gray-400 transition-colors ${shareStatus === 'error' ? 'hover:text-red-400' : 'hover:text-white'}`}
                aria-label="Share artifact"
              >
                {shareStatus === 'copied' ? <Check size={18} className="text-emerald-400" /> : <Share2 size={18} />}
              </button>
              {shareStatus !== 'idle' && (
                <span className={`text-xs ${shareStatus === 'error' ? 'text-red-400' : 'text-emerald-300'}`}>
                  {shareStatus === 'copied' && 'Link copied'}
                  {shareStatus === 'shared' && 'Share sent'}
                  {shareStatus === 'error' && 'Share unavailable'}
                </span>
              )}
              <div className="w-px h-6 bg-white/10 mx-2"></div>
              <button
                type="button"
                onClick={onClose}
                className="text-white hover:text-red-400 transition-colors bg-white/5 p-2 rounded-lg"
                aria-label="Close artifact viewer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Iframe Viewer */}
          <div className="flex-1 bg-black relative">
            {fileUrl ? (
              <iframe
                src={fileUrl}
                className="w-full h-full border-none"
                title="Artifact Viewer"
                data-testid="artifact-iframe"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/50">
                No document source available
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
