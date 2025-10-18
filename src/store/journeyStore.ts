import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Persona, UserProgress, TestnetFeatures } from '../types/journey'
import { mintProofOfSkill } from '../utils/blockchain'

interface JourneyState {
  selectedPersona: Persona | null
  currentPhase: number
  userProgress: UserProgress
  testnetFeatures: TestnetFeatures
  isModalOpen: boolean
  modalContent: any
  setSelectedPersona: (persona: Persona | null) => void
  setCurrentPhase: (phase: number) => void
  updateProgress: (xp: number, nfts?: string[], mfai?: number) => void
  openModal: (content: any) => void
  closeModal: () => void
  completePhase: (phaseIndex: number) => void
  updateStaking: (amount: number) => void
  updateVotingPower: (newPower: number) => void
  updateWalletConnection: (connected: boolean, address?: string) => void
  claimTestnetAirdrop: () => void
  mintNFT: (nftName: string, wallet: any) => Promise<{ mintAddress: string; signature: string }>
  shareJourney: (platform: string) => void
  resetProgress: () => void
  downloadNFT: (nftName: string) => Promise<boolean>
  viewNFTOnExplorer: (tokenId: string) => string
  completeMission: () => void
}

const initialUserProgress: UserProgress = {
  totalXP: 0,
  nfts: [],
  nftMints: [],
  passLevel: 'Free',
  mfaiTokens: 0,
  stakedMfai: 0,
  walletConnected: false,
  walletAddress: undefined,
  completedPhases: [],
  currentPersona: undefined,
  votingPower: 0,
  daoProposals: 0,
  testnetAirdropClaimed: false,
  socialShareCount: 0,
  lastSharedPlatform: undefined,
  shareHistory: [],
}

const initialTestnetFeatures: TestnetFeatures = {
  walletAirdrop: true,
  nftMinting: true,
  stakingSimulation: true,
  daoVoting: true,
  socialSharing: true,
}

export const useJourneyStore = create<JourneyState>()(
  persist(
    (set, get) => ({
      selectedPersona: null,
      currentPhase: 0,
      userProgress: initialUserProgress,
      testnetFeatures: initialTestnetFeatures,
      isModalOpen: false,
      modalContent: null,

      setSelectedPersona: (persona) => set({ 
        selectedPersona: persona, 
        currentPhase: 0,
        userProgress: {
          ...get().userProgress,
          currentPersona: persona?.id || undefined,
          completedPhases: [] // Reset completed phases when changing persona
        }
      }),
      
      setCurrentPhase: (phase) => set({ currentPhase: phase }),
      
      updateProgress: (xp, nfts = [], mfai = 0) => set((state) => {
        const newTotalXP = state.userProgress.totalXP + xp
        const newMfaiTokens = state.userProgress.mfaiTokens + mfai
        
        // Determine new pass level based on XP and achievements
        let newPassLevel = state.userProgress.passLevel
        const totalNFTs = state.userProgress.nfts.length + nfts.length
        
        if (newTotalXP >= 2000 && totalNFTs >= 10) {
          newPassLevel = 'Diamond'
        } else if (newTotalXP >= 1000 && totalNFTs >= 5) {
          newPassLevel = 'Platinum'
        } else if (newTotalXP >= 500 && totalNFTs >= 2) {
          newPassLevel = 'Gold'
        }
        
        return {
          userProgress: {
            ...state.userProgress,
            totalXP: newTotalXP,
            nfts: [...state.userProgress.nfts, ...nfts],
            mfaiTokens: newMfaiTokens,
            passLevel: newPassLevel,
            votingPower: state.userProgress.votingPower + Math.floor(xp / 10), // 1 voting power per 10 XP
          }
        }
      }),
      
      openModal: (content) => set({ isModalOpen: true, modalContent: content }),
      
      closeModal: () => set({ isModalOpen: false, modalContent: null }),
      
      completePhase: (phaseIndex) => set((state) => {
        // Check if phase is already completed to avoid duplicates
        if (state.userProgress.completedPhases.includes(phaseIndex)) {
          return state;
        }
        
        return {
          userProgress: {
            ...state.userProgress,
            completedPhases: [...state.userProgress.completedPhases, phaseIndex],
          }
        };
      }),
      
      updateStaking: (amount) => set((state) => ({
        userProgress: {
          ...state.userProgress,
          mfaiTokens: Math.max(0, state.userProgress.mfaiTokens - amount),
          stakedMfai: state.userProgress.stakedMfai + amount,
          votingPower: state.userProgress.votingPower + Math.floor(amount * 2), // 2 voting power per staked MFAI
        }
      })),
      
      updateVotingPower: (newPower) => set((state) => ({
        userProgress: {
          ...state.userProgress,
          votingPower: newPower,
          daoProposals: state.userProgress.daoProposals + 1,
        }
      })),

      updateWalletConnection: (connected, address) => set((state) => ({
        userProgress: {
          ...state.userProgress,
          walletConnected: connected,
          walletAddress: connected ? address : undefined,
        }
      })),

      claimTestnetAirdrop: () => set((state) => ({
        userProgress: {
          ...state.userProgress,
          mfaiTokens: state.userProgress.mfaiTokens + 100, // Airdrop 100 testnet $MFAI
          testnetAirdropClaimed: true,
        }
      })),

      mintNFT: async (nftName: string, wallet: any) => {
        const metadata = {
          name: nftName,
          description: `Proof-of-Skill NFT for ${nftName}`,
          image: 'https://placehold.co/600x400.png',
          attributes: [
            { trait_type: 'App', value: 'Money Factory AI' },
            { trait_type: 'Type', value: 'Proof-of-Skill' },
          ],
        };

        const result = await mintProofOfSkill(wallet, metadata);

        if (!result.success || !result.mintAddress || !result.signature) {
          throw new Error(result.error || 'Mint failed');
        }

        set((state) => ({
          userProgress: {
            ...state.userProgress,
            nfts: [...state.userProgress.nfts, nftName],
            nftMints: [
              ...(state.userProgress.nftMints || []),
              { name: nftName, address: result.mintAddress!, signature: result.signature! },
            ],
          },
        }));

        return { mintAddress: result.mintAddress, signature: result.signature };
      },

      shareJourney: (platform: string) => set((state) => ({
        userProgress: {
          ...state.userProgress,
          socialShareCount: (state.userProgress.socialShareCount || 0) + 1,
          lastSharedPlatform: platform,
          shareHistory: [
            { platform, timestamp: new Date().toISOString() },
            ...(state.userProgress.shareHistory || []),
          ].slice(0, 10),
        }
      })),

      resetProgress: () => set({
        selectedPersona: null,
        currentPhase: 0,
        userProgress: {
          ...initialUserProgress,
          walletConnected: get().userProgress.walletConnected,
          walletAddress: get().userProgress.walletAddress,
        },
        isModalOpen: false,
        modalContent: null,
      }),
      
      downloadNFT: async (nftName: string) => {
        // Simulate download process and log the requested NFT name for analytics
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.info(`Simulated download for NFT: ${nftName}`)
        return true
      },
      
      viewNFTOnExplorer: (tokenId: string) => {
        // Generate explorer URL
        const explorerUrl = `https://explorer.solana.com/address/${tokenId}?cluster=devnet`
        return explorerUrl
      },
      
      completeMission: () => set((state) => {
        // Award XP, tokens, and potentially an NFT for completing a mission
        const xpReward = 50;
        const mfaiReward = 25;
        const nftReward = Math.random() > 0.5 ? ["Mission Completion NFT"] : [];
        
        return {
          userProgress: {
            ...state.userProgress,
            totalXP: state.userProgress.totalXP + xpReward,
            mfaiTokens: state.userProgress.mfaiTokens + mfaiReward,
            nfts: [...state.userProgress.nfts, ...nftReward],
            votingPower: state.userProgress.votingPower + Math.floor(xpReward / 10),
          }
        };
      })
    }),
    {
      name: 'mfai-journey-storage',
      partialize: (state) => ({
        userProgress: {
          ...state.userProgress,
          walletConnected: false,
          walletAddress: undefined,
        },
        selectedPersona: state.selectedPersona,
      }),
    }
  )
)
