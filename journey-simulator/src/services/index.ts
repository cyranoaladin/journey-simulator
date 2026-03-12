/**
 * @file services/index.ts
 * @description Export centralisé des services MFAI
 */

// cNFT Service - Gestion des NFTs Proof-of-Skill
export {
  cnftService,
  getProofOfSkillNFTs,
  getProofOfSkillBlinkUrl,
  getExplorerUrl,
  mintProofOfSkillCNFT,
} from './cnftService';
export type { ProofOfSkillNFT } from './cnftService';

// Solana Agent Service - Interactions wallet et blockchain
export {
  solanaAgentService,
  getWalletBalanceSOL,
  getWalletStats,
  getAEPOHistory,
  checkNetworkHealth,
} from './solanaAgentService';
export type { WalletStats, AEPOHistoryPoint } from './solanaAgentService';
