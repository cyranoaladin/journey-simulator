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
  updateProgress: (xp: number, nfts?: string[], mfai?: number) => Promise<void>
  openModal: (content: any) => void
  closeModal: () => void
  completePhase: (phaseIndex: number, options?: { score?: number; nftAddress?: string; phaseNumber?: number }) => Promise<void>
  updateStaking: (amount: number) => void
  updateVotingPower: (newPower: number) => void
  updateWalletConnection: (connected: boolean, address?: string) => void
  claimTestnetAirdrop: () => void
  mintNFT: (nftName: string, wallet: any) => Promise<{ mintAddress: string; signature: string }>
  shareJourney: (platform: string) => void
  resetProgress: () => Promise<void>
  downloadNFT: (nftName: string) => Promise<boolean>
  viewNFTOnExplorer: (tokenId: string) => string
  completeMission: () => void
  loadUserProgress: () => Promise<void>
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

const derivePassLevel = (
  subscription: string | undefined,
  totalXP: number,
  totalNFTs: number
): UserProgress['passLevel'] => {
  switch (subscription) {
    case 'diamond':
      return 'Diamond'
    case 'platinum':
      return 'Platinum'
    case 'gold':
      return 'Gold'
    default:
      break
  }

  if (totalXP >= 2000 && totalNFTs >= 10) {
    return 'Diamond'
  }

  if (totalXP >= 1000 && totalNFTs >= 5) {
    return 'Platinum'
  }

  if (totalXP >= 500 && totalNFTs >= 2) {
    return 'Gold'
  }

  return 'Free'
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
        const totalNFTs = state.userProgress.nfts.length + nfts.length
        const newPassLevel = derivePassLevel(undefined, newTotalXP, totalNFTs)
        
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
      
      completePhase: async (phaseIndex, options = {}) => {
        const state = get()

        if (state.userProgress.completedPhases.includes(phaseIndex)) {
          return
        }

        const phaseNumber = options.phaseNumber ?? phaseIndex + 1

        try {
          await api.completePhase({
            phase_number: phaseNumber,
            score: options.score ?? 0,
            ...(options.nftAddress ? { nft_address: options.nftAddress } : {})
          })

          const updatedPhases = Array.from(
            new Set([...state.userProgress.completedPhases, phaseIndex])
          ).sort((a, b) => a - b)

          set({
            userProgress: {
              ...state.userProgress,
              completedPhases: updatedPhases,
            }
          })
        } catch (error) {
          console.error('Failed to sync phase completion with backend:', error)
          throw error
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

      shareJourney: (_platform: string) => set((state) => ({
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

      resetProgress: async () => {
        set({
          selectedPersona: null,
          currentPhase: 0,
          userProgress: { ...initialUserProgress },
          testnetFeatures: { ...initialTestnetFeatures },
          isModalOpen: false,
          modalContent: null,
        })

        if (typeof window !== 'undefined') {
          try {
            window.localStorage.removeItem('mfai-journey-storage')
          } catch (error) {
            console.error('Failed to clear persisted journey data:', error)
          }
        }

        const hasAccessToken = typeof window !== 'undefined'
          ? window.localStorage.getItem('accessToken')
          : null

        if (hasAccessToken) {
          try {
            await api.resetProgress()
          } catch (error) {
            console.error('Failed to reset progress on server:', error)
          }
        }
      },
      
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
      }),

      loadUserProgress: async () => {
        const currentState = get()

        try {
          const response = await api.getUserProgress()

          if (!response?.success) {
            return
          }

          const progress = response.progress || {}
          const totalXP: number = progress.total_xp ?? 0
          const completedCount: number = typeof progress.completed_phases === 'number'
            ? progress.completed_phases
            : 0

          const completedPhases = Array.from({ length: completedCount }, (_, index) => index)

          const rawCertificates: any[] = Array.isArray(progress.nft_certificates)
            ? progress.nft_certificates
            : []

          const mappedNfts = rawCertificates.map((certificate) => {
            if (certificate?.title) {
              return certificate.title as string
            }

            if (certificate?.phase) {
              return `Phase ${certificate.phase} NFT`
            }

            if (certificate?.mint_address) {
              return certificate.mint_address as string
            }

            if (certificate?.nft_address) {
              return certificate.nft_address as string
            }

            return 'NFT Certificate'
          })

          const personaId: string | undefined = progress.persona || undefined
          const matchedPersona = personaId
            ? personas.find((persona) => persona.id === personaId)
            : null

          const passLevel = derivePassLevel(
            progress.subscription,
            totalXP,
            mappedNfts.length
          )

          const mappedProgress: UserProgress = {
            ...initialUserProgress,
            totalXP,
            nfts: mappedNfts,
            passLevel,
            mfaiTokens: progress.token_transactions?.mfai_tokens ?? 0,
            stakedMfai: currentState.userProgress.stakedMfai,
            walletConnected: currentState.userProgress.walletConnected,
            walletAddress: currentState.userProgress.walletAddress,
            completedPhases,
            currentPersona: personaId,
            votingPower: Math.floor(totalXP / 10),
            daoProposals: currentState.userProgress.daoProposals,
            testnetAirdropClaimed: currentState.userProgress.testnetAirdropClaimed,
            socialShareCount: currentState.userProgress.socialShareCount,
          }

          set({
            selectedPersona: matchedPersona ?? currentState.selectedPersona ?? null,
            currentPhase: completedPhases.length,
            userProgress: mappedProgress,
          })
        } catch (error) {
          console.error('Failed to load user progress from backend:', error)
        }
      }
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
