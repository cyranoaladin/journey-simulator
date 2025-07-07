import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Lock, CheckCircle, ExternalLink, Download, Share2, Sparkles } from 'lucide-react';
import { useJourneyStore } from '../store/journeyStore';
import { Certification } from '../types/journey';
import { getProofType } from '../data/proofsData';
import NFTProofModal from './NFTProofModal';

interface ProofCertificationsProps {
  className?: string;
}

const ProofCertificationsBoard: React.FC<ProofCertificationsProps> = ({ className = '' }) => {
  const { userProgress, selectedPersona } = useJourneyStore();
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [hoveredCertId, setHoveredCertId] = useState<string | null>(null);

  // Generate mock certifications based on user progress
  const getCertifications = () => {
    if (!selectedPersona) return [];
    
    const certifications: Certification[] = [];
    
    // Add completed phase certifications
    userProgress.completedPhases.forEach(phaseIndex => {
      const phase = selectedPersona.phases[phaseIndex];
      if (phase.nftReward) {
        const proofType = getProofType(selectedPersona.id, phase.id);
        certifications.push({
          id: `${selectedPersona.id}-${phase.id}`,
          name: phase.nftReward,
          description: `This NFT certifies your mastery of ${phase.title} phase in the ${selectedPersona.title} journey.`,
          imageUrl: phase.nftDesign || `/images/${phase.id}.png`,
          rarity: phaseIndex === 4 ? 'legendary' : phaseIndex === 3 ? 'epic' : phaseIndex === 2 ? 'rare' : 'common',
          attributes: [
            { trait_type: 'Proof Type', value: `Proof-of-${proofType}™` },
            { trait_type: 'XP Earned', value: phase.xpReward },
            { trait_type: 'Phase', value: phase.title },
            { trait_type: 'Completion Date', value: new Date().toLocaleDateString() }
          ]
        });
      }
    });
    
    // Add locked future certifications
    for (let i = userProgress.completedPhases.length; i < selectedPersona.phases.length; i++) {
      const phase = selectedPersona.phases[i];
      if (phase.nftReward) {
        const proofType = getProofType(selectedPersona.id, phase.id);
        certifications.push({
          id: `${selectedPersona.id}-${phase.id}-locked`,
          name: phase.nftReward,
          description: `Complete the ${phase.title} phase to unlock this certification.`,
          imageUrl: phase.nftDesign || `/images/${phase.id}.png`,
          rarity: i === 4 ? 'legendary' : i === 3 ? 'epic' : i === 2 ? 'rare' : 'common',
          attributes: [
            { trait_type: 'Proof Type', value: `Proof-of-${proofType}™` },
            { trait_type: 'XP Reward', value: phase.xpReward },
            { trait_type: 'Phase', value: phase.title },
            { trait_type: 'Status', value: 'Locked' }
          ]
        });
      }
    }
    
    return certifications;
  };

  const certifications = getCertifications();

  const handleCertificationClick = (certification: Certification) => {
    if (certification.id.includes('locked')) return;
    
    setSelectedCertification(certification);
    setShowProofModal(true);
  };

  // Get persona-specific styling
  const getPersonaStyle = () => {
    if (!selectedPersona) return {}
    
    switch (selectedPersona.id) {
      case 'investor':
        return {
          bgGradient: 'from-green-400 to-gold-500',
          iconBg: 'bg-gold-500',
          textColor: 'text-gold-500'
        }
      case 'web3-developer':
        return {
          bgGradient: 'from-purple-400 to-pink-500',
          iconBg: 'bg-purple-500',
          textColor: 'text-purple-500'
        }
      case 'content-creator':
        return {
          bgGradient: 'from-pink-400 to-purple-500',
          iconBg: 'bg-pink-500',
          textColor: 'text-pink-500'
        }
      case 'community-communicator':
        return {
          bgGradient: 'from-orange-400 to-red-500',
          iconBg: 'bg-orange-500',
          textColor: 'text-orange-500'
        }
      case 'project-manager':
        return {
          bgGradient: 'from-indigo-400 to-blue-500',
          iconBg: 'bg-indigo-500',
          textColor: 'text-indigo-500'
        }
      case 'defi-explorer':
        return {
          bgGradient: 'from-cyan-400 to-blue-500',
          iconBg: 'bg-cyan-500',
          textColor: 'text-cyan-500'
        }
      case 'nft-creator':
        return {
          bgGradient: 'from-pink-400 to-orange-500',
          iconBg: 'bg-pink-500',
          textColor: 'text-pink-500'
        }
      default:
        return {
          bgGradient: 'from-blue-400 to-cyan-500',
          iconBg: 'bg-blue-500',
          textColor: 'text-blue-500'
        }
    }
  };

  const personaStyle = getPersonaStyle();

  // Get rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400 bg-yellow-400/20';
      case 'epic': return 'text-purple-400 bg-purple-400/20';
      case 'rare': return 'text-blue-400 bg-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-space font-semibold text-lg flex items-center">
          <Award className="mr-2 text-accent-gold" size={20} />
          Proof Certifications
        </h3>
        <span className="text-sm opacity-70">{userProgress.nfts.length} / {certifications.length}</span>
      </div>

      {certifications.length === 0 ? (
        <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
          <Award className="mx-auto mb-3 opacity-50" size={32} />
          <p className="text-lg opacity-80">No certifications yet</p>
          <p className="text-sm opacity-60">Complete journey phases to earn Proof-of-Skill™ NFTs</p>
        </div>
      ) : (
        <div className="space-y-3">
          {certifications.map((certification, index) => {
            const isLocked = certification.id.includes('locked');
            const isClaimed = userProgress.nfts.includes(certification.name);
            const proofType = getProofType(selectedPersona?.id || '', certification.id);
            const isHovered = hoveredCertId === certification.id;
            
            return (
              <motion.div
                key={certification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: isLocked ? 1 : 1.02 }}
                whileTap={{ scale: isLocked ? 1 : 0.98 }}
                onClick={() => !isLocked && handleCertificationClick(certification)}
                onHoverStart={() => setHoveredCertId(certification.id)}
                onHoverEnd={() => setHoveredCertId(null)}
                className={`relative overflow-hidden rounded-lg border ${isLocked ? 'border-white/10' : isClaimed ? 'border-green-500/30' : 'border-white/20'} bg-white/5 p-3 cursor-pointer transition-all`}
              >
                <div className="flex items-center space-x-3">
                  {/* NFT Icon */}
                  <div className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 ${isLocked ? 'bg-white/10' : `bg-gradient-to-br ${personaStyle.bgGradient}`}`}>
                    {isLocked ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Lock size={20} className="text-white/50" />
                      </div>
                    ) : certification.imageUrl ? (
                      <img 
                        src={certification.imageUrl} 
                        alt={certification.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback for image loading errors
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = 'https://images.pexels.com/photos/3109807/pexels-photo-3109807.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Award size={20} className="text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* NFT Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-semibold text-sm truncate ${isLocked ? 'opacity-50' : ''}`}>
                        {certification.name}
                      </h4>
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${getRarityColor(certification.rarity)}`}>
                        {certification.rarity}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${isLocked ? 'opacity-50' : 'opacity-80'}`}>
                        Proof-of-{proofType}™
                      </span>
                      
                      {isLocked ? (
                        <span className="text-xs flex items-center text-yellow-400">
                          <Lock size={10} className="mr-1" />
                          Locked
                        </span>
                      ) : isClaimed ? (
                        <span className="text-xs flex items-center text-green-400">
                          <CheckCircle size={10} className="mr-1" />
                          Claimed
                        </span>
                      ) : (
                        <span className="text-xs flex items-center text-accent-gold">
                          <Sparkles size={10} className="mr-1" />
                          Available
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Hover Card - Additional Details */}
                <AnimatePresence>
                  {isHovered && !isLocked && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute inset-0 bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-sm p-3 flex flex-col justify-between"
                    >
                      <div>
                        <h4 className="font-semibold text-sm text-white mb-1">{certification.name}</h4>
                        <p className="text-xs text-white/80 line-clamp-2">{certification.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <button className="p-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white flex items-center justify-center">
                          <Download size={10} className="mr-1" />
                          <span>Save</span>
                        </button>
                        <button className="p-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white flex items-center justify-center">
                          <Share2 size={10} className="mr-1" />
                          <span>Share</span>
                        </button>
                        <button className="p-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white flex items-center justify-center">
                          <ExternalLink size={10} className="mr-1" />
                          <span>View</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-primary opacity-0 hover:opacity-10 transition-opacity duration-300" />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* NFT Proof Modal */}
      <AnimatePresence>
        {showProofModal && selectedCertification && (
          <NFTProofModal
            proofType={getProofType(selectedPersona?.id || '', selectedCertification.id) as any}
            title={selectedCertification.name}
            description={selectedCertification.description}
            imageUrl={selectedCertification.imageUrl}
            xpEarned={selectedCertification.attributes.find(a => a.trait_type === 'XP Earned')?.value as number || 0}
            phase={selectedCertification.attributes.find(a => a.trait_type === 'Phase')?.value as string || ''}
            phaseNumber={userProgress.completedPhases.findIndex(p => selectedPersona?.phases[p].nftReward === selectedCertification.name) + 1}
            completionDate={selectedCertification.attributes.find(a => a.trait_type === 'Completion Date')?.value as string || new Date().toLocaleDateString()}
            rarity={selectedCertification.rarity}
            onClose={() => setShowProofModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProofCertificationsBoard;