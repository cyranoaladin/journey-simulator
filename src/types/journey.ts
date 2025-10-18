export interface Persona {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  targetProfile: string;
  motivation: string;
  passType: string;
  phases: JourneyPhase[];
}

export interface JourneyPhase {
  id: string;
  title: string;
  description: string;
  mission: string;
  duration: string;
  xpReward: number;
  mfaiReward?: number;
  nftReward?: string;
  nftDesign?: string; // Path to persona-specific NFT design
  tools: string[];
  outcomes: string[];
  zynoTip: string;
  zynoTips?: string[];
  modules?: PhaseModule[];
  isLocked?: boolean;
  requirements?: string[];
  stakingRequired?: number;
  daoVoteRequired?: boolean;
  isIncubation?: boolean;
  isLaunchpad?: boolean;
}

export interface PhaseModule {
  title: string;
  description: string;
  deliverable: string;
  reward: string;
}

export interface UserProgress {
  totalXP: number;
  nfts: string[];
  nftMints?: { name: string; address: string; signature: string }[];
  passLevel: 'Free' | 'Gold' | 'Platinum' | 'Diamond';
  mfaiTokens: number;
  stakedMfai: number;
  walletConnected: boolean;
  walletAddress?: string;
  completedPhases: number[];
  currentPersona?: string;
  votingPower: number;
  daoProposals: number;
  incubationStatus?: 'pending' | 'approved' | 'rejected';
  launchpadStatus?: 'pending' | 'approved' | 'rejected';
  testnetAirdropClaimed?: boolean;
  socialShareCount?: number;
  lastSharedPlatform?: string;
  shareHistory?: { platform: string; timestamp: string }[];
}

export interface AccessPassHolder {
  id: string;
  name: string;
  title: string;
  passLevel: 'Gold' | 'Platinum' | 'Diamond';
  avatar: string;
  duration: string;
  certifications: number;
  roi: string;
  projects: string;
  testimonial: string;
  metrics: {
    label: string;
    value: string;
  }[];
}

export interface Certification {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
  earnedAt?: Date;
  mintAddress?: string;
}

export interface TestnetFeatures {
  walletAirdrop: boolean;
  nftMinting: boolean;
  stakingSimulation: boolean;
  daoVoting: boolean;
  socialSharing: boolean;
}