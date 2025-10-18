import { Certification } from '../types/journey';

// Define proof types
export type ProofType = 'Skill' | 'Vision' | 'Yield' | 'Build' | 'Creation' | 'Orchestration' | 'Design' | 'Invest';

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
  'curious-student': 'Skill',
  'web2-entrepreneur': 'Vision',
  'web3-developer': 'Build',
  'content-creator': 'Creation',
  'community-communicator': 'Orchestration',
  'project-manager': 'Orchestration',
  'defi-explorer': 'Yield',
  'nft-creator': 'Design',
  'investor': 'Invest'
};

// Mapping of phase IDs to proof types (overrides persona default)
const phaseProofTypeMap: Record<string, ProofType> = {
  'student-prove': 'Skill',
  'entrepreneur-prove': 'Vision',
  'developer-prove': 'Build',
  'creator-prove': 'Creation',
  'communicator-prove': 'Orchestration',
  'manager-prove': 'Orchestration',
  'defi-prove': 'Yield',
  'nft-prove': 'Design',
  'investor-prove': 'Invest'
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
    'curious-student': '3109807/pexels-photo-3109807.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'web2-entrepreneur': '3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'web3-developer': '2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'content-creator': '3888585/pexels-photo-3888585.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'community-communicator': '3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'project-manager': '3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'defi-explorer': '844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'nft-creator': '3222686/pexels-photo-3222686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'investor': '3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  };

  // Get persona-specific descriptions
  const getProofDescription = () => {
    switch (personaId) {
      case 'curious-student':
        return `This NFT certifies your mastery of Web3 fundamentals and proves your journey through the ${phase} phase.`;
      case 'web2-entrepreneur':
        return `This NFT validates your business tokenization strategy and successful completion of the ${phase} phase.`;
      case 'web3-developer':
        return `This NFT certifies your technical expertise in blockchain development and completion of the ${phase} phase.`;
      case 'content-creator':
        return `This NFT recognizes your creative contributions to the protocol and completion of the ${phase} phase.`;
      case 'community-communicator':
        return `This NFT validates your coordination skills and successful completion of the ${phase} phase.`;
      case 'project-manager':
        return `This NFT certifies your operational excellence and successful completion of the ${phase} phase.`;
      case 'defi-explorer':
        return `This NFT validates your DeFi expertise and successful completion of the ${phase} phase.`;
      case 'nft-creator':
        return `This NFT recognizes your NFT creation skills and successful completion of the ${phase} phase.`;
      case 'investor':
        return `This NFT certifies your investment acumen and successful completion of the ${phase} phase.`;
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
    return baseImageUrl + (personaImages[personaId as keyof typeof personaImages] || personaImages['curious-student']);
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