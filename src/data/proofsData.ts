import { Certification } from '../types/journey';

// Define proof types
export type ProofType = 'Skill' | 'Vision' | 'Yield' | 'Build' | 'Creation' | 'Orchestration' | 'Design' | 'Invest' | 'Security';

// Interface for proof data
export interface ProofData {
  id: string;
  type: ProofType;
  name: string;
  description: string;
  imageUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
}

// Mapping of persona IDs to proof types
const personaProofTypeMap: Record<string, ProofType> = {
  'cognitive-activation-hub': 'Skill',
  'capital-foundry': 'Yield',
  'system-architect': 'Build',
  'experience-studio': 'Creation',
  'impact-engine': 'Orchestration',
  'resilience-master': 'Security'
};

// Mapping of phase IDs to proof types (overrides persona default)
const phaseProofTypeMap: Record<string, ProofType> = {
  'ecosystem-engagement': 'Skill',
  'capital-launchpad': 'Yield',
  'synaptic-rollout': 'Build',
  'experience-launch': 'Creation',
  'synaptic-impact': 'Orchestration',
  'redblue-evolution': 'Security'
};

// Helper function to get persona-specific proof data
export const getPersonaProofData = (
  personaId: string,
  phaseId: string,
  proofType: ProofType,
  xpEarned: number,
  phase: string,
  phaseNumber: number
): Certification => {
  // Base URL for proof images
  const baseImageUrl = 'https://images.pexels.com/photos/';
  
  // Default image fallbacks by persona
  const personaImages = {
    'cognitive-activation-hub': '3109807/pexels-photo-3109807.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'capital-foundry': '3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'system-architect': '1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'experience-studio': '214610/pexels-photo-214610.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'impact-engine': '3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'resilience-master': '3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  };

  // Get persona-specific descriptions
  const getProofDescription = () => {
    switch (personaId) {
      case 'cognitive-activation-hub':
        return `This NFT certifies your mastery of foundational Web3 cognition and successful completion of the ${phase} phase.`;
      case 'capital-foundry':
        return `This NFT validates your Solana DeFi engineering capabilities and completion of the ${phase} phase.`;
      case 'system-architect':
        return `This NFT certifies your decentralized infrastructure expertise and completion of the ${phase} phase.`;
      case 'experience-studio':
        return `This NFT recognizes your creative systems design and successful completion of the ${phase} phase.`;
      case 'impact-engine':
        return `This NFT validates your governance and impact architecture mastery earned in the ${phase} phase.`;
      case 'resilience-master':
        return `This NFT certifies your security leadership in safeguarding Solana protocols through the ${phase} phase.`;
      default:
        return `This NFT certifies your successful completion of the ${phase} phase.`;
    }
  };

  // Generate a unique ID
  const uniqueId = `${personaId}-${phaseId}-${Date.now()}`;

  // Get image URL based on persona and phase
  const getImageUrl = () => {
    // In a real implementation, this would be a mapping to specific images
    // For now, we'll use placeholder images from Pexels
    return baseImageUrl + (personaImages[personaId as keyof typeof personaImages] || personaImages['cognitive-activation-hub']);
  };

  // Get rarity based on phase
  const getRarity = () => {
    switch (phaseNumber) {
      case 5: return 'legendary';
      case 4: return 'epic';
      case 3: return 'rare';
      default: return 'common';
    }
  };

  return {
    id: uniqueId,
    name: `Proof-of-${proofType}™: ${phase}`,
    description: getProofDescription(),
    imageUrl: getImageUrl(),
    rarity: getRarity(),
    attributes: [
      { trait_type: 'Proof Type', value: `Proof-of-${proofType}™` },
      { trait_type: 'XP Earned', value: xpEarned },
      { trait_type: 'Phase', value: phase },
      { trait_type: 'Completion Date', value: new Date().toLocaleDateString() },
      { trait_type: 'Persona', value: personaId }
    ]
  };
};

// Helper function to get proof type based on persona and phase
export const getProofType = (personaId: string, phaseId: string): ProofType => {
  // First check if there's a specific mapping for this phase
  if (phaseId && phaseProofTypeMap[phaseId]) {
    return phaseProofTypeMap[phaseId];
  }
  
  // Otherwise use the persona's default proof type
  if (personaId && personaProofTypeMap[personaId]) {
    return personaProofTypeMap[personaId];
  }
  
  // Default fallback
  return 'Skill';
};

// Get metadata for NFT minting
export const getNFTMetadata = (
  personaId: string,
  phaseId: string,
  title: string,
  description: string,
  xpEarned: number,
  phase: string
) => {
  const proofType = getProofType(personaId, phaseId);
  
  return {
    name: title,
    description: description,
    image: "https://moneyfactory.ai/nft/proof.png", // Placeholder
    attributes: [
      { trait_type: "Proof Type", value: `Proof-of-${proofType}™` },
      { trait_type: "XP Earned", value: xpEarned },
      { trait_type: "Phase", value: phase },
      { trait_type: "Completion Date", value: new Date().toLocaleDateString() },
      { trait_type: "Persona", value: personaId }
    ],
    properties: {
      files: [
        {
          uri: "https://moneyfactory.ai/nft/proof.png",
          type: "image/png"
        }
      ],
      category: "image",
      creators: [
        {
          address: "MFAI1111111111111111111111111111111111111",
          share: 100
        }
      ]
    }
  };
};

// Get explorer URL for NFT
export const getExplorerUrl = (mintAddress: string) => {
  return `https://explorer.solana.com/address/${mintAddress}?cluster=devnet`;
};