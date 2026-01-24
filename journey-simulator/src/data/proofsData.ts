/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { Certificate } from '../types/journey';

const LOGO_IMAGE_PATH = '/images/logo_mfai.png';

const personaImageConfigs: Record<string, {
  extension: string;
  phaseOverrides?: Record<string, string>;
}> = {
  'cognitive-activation-hub': {
    extension: 'png',
    phaseOverrides: {
      'launch-collaterize': 'launch_collaterize'
    }
  },
  'capital-foundry': {
    extension: 'png',
    phaseOverrides: {
      'launch-collaterize': 'launch-collaterize'
    }
  },
  'system-architect': {
    extension: 'png',
    phaseOverrides: {
      'launch-collaterize': 'launch-collaterize'
    }
  },
  'experience-studio': {
    extension: 'png',
    phaseOverrides: {
      'launch-collaterize': 'launch-collaterize'
    }
  },
  'impact-engine': {
    extension: 'png',
    phaseOverrides: {
      'launch-collaterize': 'launch-collaterize'
    }
  },
  'resilience-master': {
    extension: 'png',
    phaseOverrides: {
      'launch-collaterize': 'launch-collaterize'
    }
  }
};

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
): Certificate => {
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

  const getImageUrl = () => {
    // Use persona-specific configuration to resolve filenames consistently across mixed asset formats.
    const config = personaImageConfigs[personaId];
    const fileExtension = config?.extension ?? 'svg';
    const phaseFile = config?.phaseOverrides?.[phaseId] ?? phaseId;

    return `/images/nfts/${personaId}/${phaseFile}.${fileExtension}`;
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
    name: `Proof-of-${proofType}: ${phase}`,
    description: getProofDescription(),
    imageUrl: getImageUrl(),
    rarity: getRarity(),
    attributes: [
      { trait_type: 'Proof Type', value: `Proof-of-${proofType}` },
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
  phase: string,
  phaseNumber?: number
) => {
  const proofType = getProofType(personaId, phaseId);
  const proofData = getPersonaProofData(
    personaId,
    phaseId,
    proofType,
    xpEarned,
    phase,
    phaseNumber ?? 1
  );

  return {
    name: proofData.name || title,
    description: proofData.description || description,
    image: proofData.imageUrl || LOGO_IMAGE_PATH,
    attributes: [
      { trait_type: "Proof Type", value: `Proof-of-${proofType}` },
      { trait_type: "XP Earned", value: xpEarned },
      { trait_type: "Phase", value: phase },
      { trait_type: "Completion Date", value: new Date().toLocaleDateString() },
      { trait_type: "Persona", value: personaId }
    ],
    properties: {
      files: [
        {
          uri: proofData.imageUrl || LOGO_IMAGE_PATH,
          type: fileExtensionFromUrl(proofData.imageUrl || LOGO_IMAGE_PATH)
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

const fileExtensionFromUrl = (url: string) => {
  const extension = url.split('.').pop()?.toLowerCase() || 'png';
  switch (extension) {
    case 'svg':
      return 'image/svg+xml';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/png';
  }
};

// Get explorer URL for NFT
export const getExplorerUrl = (mintAddress: string) => {
  return `https://explorer.solana.com/address/${mintAddress}?cluster=devnet`;
};