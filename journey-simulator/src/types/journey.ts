/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

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
  quizId?: string;
  resources?: string[] | GeneratedResource[];
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
  nftMints?: { name: string; address: string; signature: string; imageUrl?: string }[];
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
  collaterizeSimulation?: {
    accepted: boolean
    eligibilityScore: number
    tier: 'CORE' | 'EXPERIMENTAL' | 'REJECTED'
    targetRaiseUSD: number
    softCapUSD: number
    hardCapUSD: number
    liquidityUSD: number
    initialPriceUSD: number
    notes: string[]
    simulatedLaunchUrl: string
  };
  demoModeEnabled?: boolean;
}

export interface AccessPassHolder {
  id: string;
  name: string;
  title: string;
  passLevel: 'Gold' | 'Platinum' | 'Diamond';
  avatar: string;
  duration: string;
  certificates: number;
  roi: string;
  projects: string;
  testimonial: string;
  metrics: {
    label: string;
    value: string;
  }[];
  recommendedPersonaId?: string;
}

export interface Certificate {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
  phaseId?: string;
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

export type PhaseStatus = 'IDLE' | 'SUBMITTING' | 'AGENTS_ANALYZING' | 'FEEDBACK_AVAILABLE' | 'VALIDATED' | 'REJECTED' | 'REWARDS_CLAIMED';
export type MintStatus = 'idle' | 'initiating' | 'minting' | 'finalizing' | 'completed' | 'pending';

export type ActiveAgent = {
  id: string;
  name: string;
  role: string;
  status: 'waiting' | 'analyzing' | 'done';
  bio: string;
};

export type GeneratedResource =
  | { kind: 'cheatsheet'; title: string; url: string; description?: string }
  | { kind: 'code'; title: string; code: string; language: string }
  | { kind: 'link'; title: string; url: string; description?: string };

export type PhaseFeedback = {
  score: number;
  relevance: string;
  nextSteps: string[];
  verdict: 'pass' | 'fail';
  axes?: { label: string; value: number }[];
};