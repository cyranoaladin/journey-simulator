import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Persona, JourneyPhase, UserProgress, TestnetFeatures } from '../types/journey'
import api from '../utils/api'

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
  mintNFT: (nftName: string) => Promise<string>
  shareJourney: (platform: string) => void
  resetProgress: () => void
  downloadNFT: (nftName: string) => Promise<boolean>
  viewNFTOnExplorer: (tokenId: string) => string
  completeMission: () => void
  loadUserProgress: () => Promise<void>
}

const initialUserProgress: UserProgress = {
  totalXP: 0,
  nfts: [],
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
      
      updateProgress: async (xp, nfts = [], mfai = 0) => {
        const state = get()
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
        
        const updatedProgress = {
          ...state.userProgress,
          totalXP: newTotalXP,
          nfts: [...state.userProgress.nfts, ...nfts],
          mfaiTokens: newMfaiTokens,
          passLevel: newPassLevel,
          votingPower: state.userProgress.votingPower + Math.floor(xp / 10), // 1 voting power per 10 XP
        }

        // Update local state
        set({ userProgress: updatedProgress })

        // Sync with backend
        try {
          await api.updateProgress({
            total_xp: newTotalXP,
            current_level: Math.floor(newTotalXP / 200), // Level based on XP
            completed_phases: updatedProgress.completedPhases.length
          })

          // Update token balance
          await api.updateTokenBalance({ mfai_tokens: newMfaiTokens })
        } catch (error) {
          console.error('Failed to sync progress with backend:', error)
        }
      },
      
      openModal: (content) => set({ isModalOpen: true, modalContent: content }),
      
      closeModal: () => set({ isModalOpen: false, modalContent: null }),
      
      completePhase: async (phaseIndex) => {
        const state = get()
        
        // Check if phase is already completed to avoid duplicates
        if (state.userProgress.completedPhases.includes(phaseIndex)) {
          return;
        }
        
        const updatedPhases = [...state.userProgress.completedPhases, phaseIndex]
        
        // Update local state
        set({
          userProgress: {
            ...state.userProgress,
            completedPhases: updatedPhases,
          }
        });

        // Sync with backend
        try {
          await api.completePhase({
            phase_number: phaseIndex + 1, // Backend expects 1-based indexing
            score: 100, // Default score for completion
            nft_address: '' // Will be filled when NFT is minted
          })
        } catch (error) {
          console.error('Failed to sync phase completion with backend:', error)
        }
      },
      
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

      updateWalletConnection: (connected, address) => set((state) => {
        console.log("Updating wallet connection:", connected, address);
        return {
          userProgress: {
            ...state.userProgress,
            walletConnected: connected,
            walletAddress: address,
            // If wallet is connected and user has no tokens, give them some initial tokens
            mfaiTokens: connected && state.userProgress.mfaiTokens === 0 ? 10 : state.userProgress.mfaiTokens,
          }
        };
      }),

      claimTestnetAirdrop: () => set((state) => ({
        userProgress: {
          ...state.userProgress,
          mfaiTokens: state.userProgress.mfaiTokens + 100, // Airdrop 100 testnet $MFAI
          testnetAirdropClaimed: true,
        }
      })),

      mintNFT: async (nftName: string) => {
        // Simulate NFT minting with delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Generate mock mint address
        const mintAddress = `${Math.random().toString(36).substr(2, 8)}${Math.random().toString(36).substr(2, 8)}`
        
        set((state) => ({
          userProgress: {
            ...state.userProgress,
            nfts: [...state.userProgress.nfts, nftName],
          }
        }))
        
        return mintAddress
      },

      shareJourney: (platform: string) => set((state) => ({
        userProgress: {
          ...state.userProgress,
          socialShareCount: (state.userProgress.socialShareCount || 0) + 1,
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
        // Simulate download process
        await new Promise(resolve => setTimeout(resolve, 1000))
        return true
      },
      
      viewNFTOnExplorer: (tokenId: string) => {
        // Generate explorer URL
        const explorerUrl = `https://explorer.solana.com/address/${tokenId}?cluster=testnet`
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
      }),

      loadUserProgress: async () => {
        try {
          const response = await api.getUserProgress();
          if (response.success) {
            const progress = response.progress;
            
            // Map backend progress to frontend format
            const mappedProgress: UserProgress = {
              totalXP: progress.total_xp || 0,
              nfts: progress.nft_certificates?.map((cert: any) => `Phase ${cert.phase} NFT`) || [],
              passLevel: progress.subscription === 'free plan' ? 'Free' : 
                        progress.subscription === 'gold' ? 'Gold' :
                        progress.subscription === 'platinum' ? 'Platinum' : 'Diamond',
              mfaiTokens: progress.token_transactions?.mfai_tokens || 0,
              stakedMfai: 0, // Not tracked in backend yet
              walletConnected: false, // Will be updated by wallet connection
              walletAddress: undefined,
              completedPhases: Array.from({ length: progress.completed_phases || 0 }, (_, i) => i),
              currentPersona: undefined,
              votingPower: Math.floor((progress.total_xp || 0) / 10),
              daoProposals: 0,
              testnetAirdropClaimed: false,
              socialShareCount: 0,
            };

            set({ userProgress: mappedProgress });
          }
        } catch (error) {
          console.error('Failed to load user progress from backend:', error);
        }
      }
    }),
    {
      name: 'mfai-journey-storage',
      partialize: (state) => ({
        userProgress: state.userProgress,
        selectedPersona: state.selectedPersona,
      }),
    }
  )
)