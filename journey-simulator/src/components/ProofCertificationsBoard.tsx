/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Lock, CheckCircle, ExternalLink, Download, Share2, Sparkles } from 'lucide-react';
import { useJourneyStore } from '../store/journeyStore';
import { Certificate } from '../types/journey';
import { getProofType, getPersonaProofData } from '../data/proofsData';
import NFTProofModal from './NFTProofModal';
import { getPersonaStyle } from '../utils/personaStyles';

interface ProofCertificationsProps {
  className?: string;
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'legendary': return 'text-yellow-400 bg-yellow-400/20';
    case 'epic': return 'text-purple-400 bg-purple-400/20';
    case 'rare': return 'text-blue-400 bg-blue-400/20';
    default: return 'text-gray-400 bg-gray-400/20';
  }
};

const getStatusMeta = (isLocked: boolean, isClaimed: boolean) => {
  if (isLocked) {
    return { label: 'Locked', className: 'text-yellow-400', icon: <Lock size={10} className="mr-1" /> };
  }
  if (isClaimed) {
    return { label: 'Claimed', className: 'text-green-400', icon: <CheckCircle size={10} className="mr-1" /> };
  }
  return { label: 'Available', className: 'text-accent-gold', icon: <Sparkles size={10} className="mr-1" /> };
};

const getBorderClass = (isLocked: boolean, isClaimed: boolean) => {
  if (isLocked) return 'border-white/10';
  if (isClaimed) return 'border-green-500/30';
  return 'border-white/20';
};

const getIconContainerClass = (isLocked: boolean, gradient: string) => {
  if (isLocked) return 'bg-white/10';
  return `bg-gradient-to-br ${gradient}`;
};

const ProofCertificationsBoard: React.FC<ProofCertificationsProps> = ({ className = '' }) => {
  const { userProgress, selectedPersona } = useJourneyStore();
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [hoveredCertId, setHoveredCertId] = useState<string | null>(null);

  // Generate mock certifications based on user progress
  const personaCertificateImage = selectedPersona ? `/images/certificates/${selectedPersona.id}.png` : '/images/logo_mfai.png';

  const getCertifications = () => {
    if (!selectedPersona) return [];

    const personaId = selectedPersona.id;
    const certificates: Certificate[] = [];

    selectedPersona.phases.forEach((phase, index) => {
      if (!phase.nftReward) return;

      const phaseNumber = index + 1;
      const proofType = getProofType(personaId, phase.id);
      const proofData = getPersonaProofData(
        personaId,
        phase.id,
        proofType,
        phase.xpReward,
        phase.title,
        phaseNumber
      );

      const baseCertificate: Certificate = {
        id: `${personaId}-${phase.id}`,
        name: proofData.name,
        description: proofData.description,
        imageUrl: proofData.imageUrl || personaCertificateImage,
        rarity: proofData.rarity,
        phaseId: phase.id,
        attributes: proofData.attributes,
      };

      if (userProgress.completedPhases.includes(index)) {
        certificates.push({
          ...baseCertificate,
          earnedAt: new Date(),
        });
        return;
      }

      certificates.push({
        ...baseCertificate,
        id: `${personaId}-${phase.id}-locked`,
        description: `Complete the ${phase.title} phase to unlock this certificate.`,
        attributes: [
          { trait_type: 'Proof Type', value: `Proof-of-${proofType}` },
          { trait_type: 'XP Reward', value: phase.xpReward },
          { trait_type: 'Phase', value: phase.title },
          { trait_type: 'Status', value: 'Locked' },
        ],
      });
    });

    return certificates;
  };

  const certificates = getCertifications();

  const handleCertificateClick = (certificate: Certificate) => {
    if (certificate.id.includes('locked')) return;

    setSelectedCertificate(certificate);
    setShowProofModal(true);
  };

  // Use shared persona style utility
  const personaStyle = getPersonaStyle(selectedPersona?.id);

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-space font-semibold text-lg flex items-center">
          <Award className="mr-2 text-accent-gold" size={20} />
          Proof Certifications
        </h3>
        <span className="text-sm opacity-70">{userProgress.nfts.length} / {certificates.length}</span>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
          <Award className="mx-auto mb-3 opacity-50" size={32} />
          <p className="text-lg opacity-80">No certificates yet</p>
          <p className="text-sm opacity-60">Complete journey phases to earn Proof-of-Skill NFTs</p>
        </div>
      ) : (
        <div className="space-y-3">
          {certificates.map((certificate, index) => {
            const isLocked = certificate.id.includes('locked');
            const isClaimed = userProgress.nfts.includes(certificate.name);
            const proofType = getProofType(selectedPersona?.id || '', certificate.phaseId || certificate.id);
            const isHovered = hoveredCertId === certificate.id;
            const borderClass = getBorderClass(isLocked, isClaimed);
            const statusMeta = getStatusMeta(isLocked, isClaimed);

            const renderVisual = () => {
              if (isLocked) {
                return (
                  <div className="w-full h-full flex items-center justify-center">
                    <Lock size={20} className="text-white/50" />
                  </div>
                );
              }
              if (certificate.imageUrl) {
                return (
                  <img
                    src={certificate.imageUrl}
                    alt={certificate.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/images/logo_mfai.png';
                    }}
                  />
                );
              }
              return (
                <div className="w-full h-full flex items-center justify-center">
                  <Award size={20} className="text-white" />
                </div>
              );
            };

            return (
              <motion.div
                key={certificate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: isLocked ? 1 : 1.02 }}
                whileTap={{ scale: isLocked ? 1 : 0.98 }}
                onClick={() => !isLocked && handleCertificateClick(certificate)}
                onHoverStart={() => setHoveredCertId(certificate.id)}
                onHoverEnd={() => setHoveredCertId(null)}
                className={`relative overflow-hidden rounded-lg border ${borderClass} bg-white/5 p-3 cursor-pointer transition-all`}
              >
                <div className="flex items-center space-x-3">
                  {/* NFT Icon */}
                  <div className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 ${getIconContainerClass(isLocked, personaStyle.bgGradient)}`}>
                    {renderVisual()}
                  </div>

                  {/* NFT Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-semibold text-sm truncate ${isLocked ? 'opacity-50' : ''}`}>
                        {certificate.name}
                      </h4>
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${getRarityColor(certificate.rarity)}`}>
                        {certificate.rarity}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${isLocked ? 'opacity-50' : 'opacity-80'}`}>
                        Proof-of-{proofType}
                      </span>
                      <span className={`text-xs flex items-center ${statusMeta.className}`}>
                        {statusMeta.icon}
                        {statusMeta.label}
                      </span>
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
                        <h4 className="font-semibold text-sm text-white mb-1">{certificate.name}</h4>
                        <p className="text-xs text-white/80 line-clamp-2">{certificate.description}</p>
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
        {showProofModal && selectedCertificate && (
          (() => {
            const proofType = getProofType(selectedPersona?.id || '', selectedCertificate.phaseId || selectedCertificate.id)
            const xpAttribute = selectedCertificate.attributes.find((a) => a.trait_type === 'XP Earned')
            const phaseAttribute = selectedCertificate.attributes.find((a) => a.trait_type === 'Phase')
            const completionAttr = selectedCertificate.attributes.find((a) => a.trait_type === 'Completion Date')

            const xpValue = typeof xpAttribute?.value === 'number'
              ? xpAttribute.value
              : Number(xpAttribute?.value ?? 0)

            const phaseValue = typeof phaseAttribute?.value === 'string'
              ? phaseAttribute.value
              : String(phaseAttribute?.value ?? '')

            const completionValue = typeof completionAttr?.value === 'string'
              ? completionAttr.value
              : new Date().toLocaleDateString()

            const phaseNumber = (() => {
              if (selectedPersona && selectedCertificate.phaseId) {
                const index = selectedPersona.phases.findIndex((phase) => phase.id === selectedCertificate.phaseId)
                if (index !== -1) {
                  return index + 1
                }
              }
              return 1
            })()

            return (
              <NFTProofModal
                personaId={selectedPersona?.id}
                phaseId={selectedCertificate.phaseId}
                proofType={proofType}
                title={selectedCertificate.name}
                description={selectedCertificate.description}
                imageUrl={selectedCertificate.imageUrl}
                xpEarned={xpValue}
                phase={phaseValue}
                phaseNumber={phaseNumber}
                completionDate={completionValue}
                rarity={selectedCertificate.rarity}
                onClose={() => setShowProofModal(false)}
              />
            )
          })()
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProofCertificationsBoard;