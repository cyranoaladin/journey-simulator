import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Share2, Award, Calendar, Wallet } from 'lucide-react';
import { Card, Badge } from '../ui';
import { cnftService, ProofOfSkillNFT } from '../../services/cnftService';
import { useToast } from '../../contexts/ToastContext';
import { clsx } from 'clsx';

interface ProofOfSkillCardProps {
  nft: ProofOfSkillNFT;
  index?: number;
  isNew?: boolean;
  cluster?: 'devnet' | 'mainnet';
}

export function ProofOfSkillCard({ 
  nft, 
  index = 0, 
  isNew = false,
  cluster = 'devnet'
}: ProofOfSkillCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showGlow, setShowGlow] = useState(isNew);
  const { addToast } = useToast();

  // Masquer la glow après 3 secondes si c'est un nouveau mint
  if (isNew && showGlow) {
    setTimeout(() => setShowGlow(false), 3000);
  }

  const handleShare = () => {
    const blinkUrl = cnftService.getProofOfSkillBlinkUrl(nft.mintAddress);
    
    // Copier dans le presse-papiers
    navigator.clipboard.writeText(blinkUrl).then(() => {
      addToast({
        type: 'success',
        title: 'Link copied!',
        message: 'Le lien Blink est dans votre presse-papiers',
      });
    });

    // Open in new tab
    window.open(blinkUrl, '_blank');
  };

  const handleViewExplorer = () => {
    const explorerUrl = cnftService.getExplorerUrl(nft.mintAddress, cluster);
    window.open(explorerUrl, '_blank');
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-gold-300';
    if (score >= 75) return 'text-cyan-300';
    if (score >= 60) return 'text-emerald-400';
    return 'text-amber-400';
  };

  const getScoreBadgeVariant = (score: number): 'gold' | 'cyan' | 'emerald' | 'amber' => {
    if (score >= 90) return 'gold';
    if (score >= 75) return 'cyan';
    if (score >= 60) return 'emerald';
    return 'amber';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      {/* Glow d'animation pour nouveau mint */}
      {showGlow && (
        <motion.div
          className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-gold-400 via-cyan-300 to-gold-400 opacity-75 blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      
      <Card 
        variant={showGlow ? 'glow' : 'glass'} 
        className="relative overflow-hidden group"
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-xl mb-4 bg-void">
          {!imageLoaded && (
            <div className="absolute inset-0 shimmer" />
          )}
          <img
            src={nft.image}
            alt={nft.name}
            className={clsx(
              'w-full h-full object-cover transition-all duration-500',
              imageLoaded ? 'opacity-100' : 'opacity-0',
              'group-hover:scale-105'
            )}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Overlay avec score */}
          <div className="absolute top-3 right-3">
            <Badge 
              variant={getScoreBadgeVariant(nft.score)}
              className="text-xs font-bold"
            >
              {nft.score}/100
            </Badge>
          </div>

          {/* Badge Phase */}
          <div className="absolute top-3 left-3">
            <div className="px-2 py-1 rounded-lg bg-void/80 backdrop-blur-sm border border-white/10">
              <span className="text-xs font-semibold text-ink-100">
                Phase {nft.phaseNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="space-y-3">
          <div>
            <h3 className="font-display text-lg font-bold text-ink-100 line-clamp-1">
              {nft.name}
            </h3>
            <p className="text-sm text-ink-400 line-clamp-2 mt-1">
              {nft.description}
            </p>
          </div>

          {/* Métadonnées */}
          <div className="flex flex-wrap gap-2 text-xs text-ink-500">
            <div className="flex items-center gap-1">
              <Award size={12} />
              <span className={getScoreColor(nft.score)}>
                {nft.score >= 90 ? 'Elite' : nft.score >= 75 ? 'Advanced' : 'Intermediate'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{new Date(nft.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1 truncate">
              <Wallet size={12} />
              <span className="font-mono truncate">
                {nft.walletAddress.slice(0, 4)}...{nft.walletAddress.slice(-4)}
              </span>
            </div>
          </div>

          {/* Attributs */}
          {nft.attributes && nft.attributes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {nft.attributes.slice(0, 3).map((attr, i) => (
                <span 
                  key={i}
                  className="px-2 py-0.5 rounded-full bg-white/5 text-2xs text-ink-400 border border-white/5"
                >
                  {attr.trait_type}: {attr.value}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-3">
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gold-400/10 text-gold-300 text-sm font-semibold hover:bg-gold-400/20 transition-colors"
            >
              <Share2 size={14} />
              Partager
            </button>
            <button
              onClick={handleViewExplorer}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 text-ink-300 text-sm font-semibold hover:bg-white/10 transition-colors border border-white/10"
            >
              <ExternalLink size={14} />
              Explorer
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default ProofOfSkillCard;
