import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { personas } from '../data/personas';
import { getPersonaProofData, getProofType } from '../data/proofsData';
import { Persona, TestnetFeatures, UserProgress } from '../types/journey';
import { api, API_BASE_URL } from '../utils/api';
import { mintProofOfSkill } from '../utils/blockchain';
import { normalizeCompletedPhases } from '../utils/progress';
import { logger } from '../utils/logger';
import { tokenStore } from '../utils/tokenStore';

import type { JourneyStepResponse, Mode, Tone } from '../types/uiBlocks';


export type CollaterizeSimulation = {
  accepted: boolean;
  eligibilityScore: number;
  tier: 'CORE' | 'EXPERIMENTAL' | 'REJECTED';
  targetRaiseUSD: number;
  softCapUSD: number;
  hardCapUSD: number;
  liquidityUSD: number;
  initialPriceUSD: number;
  notes: string[];
  simulatedLaunchUrl: string;
};

interface JourneyState {
  selectedPersona: Persona | null;
  currentPhase: number;
  userProgress: UserProgress;
  testnetFeatures: TestnetFeatures;
  isModalOpen: boolean;
  modalContent: any;
  apiJourneyId: string | null;
  lastStep: JourneyStepResponse | null;
  uiMode: Mode;
  uiTone: Tone;
  isStepLoading: boolean;
  setIsStepLoading: (loading: boolean) => void;
  setSelectedPersona: (persona: Persona | null) => void;
  setCurrentPhase: (phase: number) => void;
  setUiMode: (mode: Mode) => void;
  setUiTone: (tone: Tone) => void;
  ensureApiJourneyId: () => string;
  runInteractiveStep: (args: { phaseId: string; trackId: string; userInput?: string; }) => Promise<JourneyStepResponse>;
  runInteractiveStepDebug: (args: { phaseId: string; trackId: string; userInput?: string; }) => Promise<JourneyStepResponse>;
  updateProgress: (xp: number, nfts?: string[], mfai?: number) => Promise<void>;
  openModal: (content: any) => void;
  closeModal: () => void;
  completePhase: (phaseIndex: number, options?: {
    score?: number;
    nftAddress?: string;
    phaseNumber?: number;
    xpReward?: number;
    mfaiReward?: number;
    nftReward?: string;
  }) => Promise<void>;
  updateStaking: (amount: number) => void;
  updateVotingPower: (newPower: number) => void;
  updateWalletConnection: (connected: boolean, address?: string) => void;
  claimTestnetAirdrop: () => void;
  mintNFT: (nftName: string, wallet: any, options?: {
    personaId?: string;
    phaseId?: string;
    phaseNumber?: number;
    xpEarned?: number;
    imageUrl?: string;
    proofType?: string;
  }) => Promise<{ mintAddress: string; signature: string; }>;
  shareJourney: (platform: string) => void;
  resetProgress: () => Promise<void>;
  downloadNFT: (nftName: string) => Promise<boolean>;
  viewNFTOnExplorer: (tokenId: string) => string;
  completeMission: () => void;
  loadUserProgress: () => Promise<void>;
  setUserProgress: (progress: UserProgress) => void;
  setDemoMode: (enabled: boolean) => void;
  setCollaterizeSimulation: (sim: CollaterizeSimulation | undefined) => void;
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
};

const initialTestnetFeatures: TestnetFeatures = {
  walletAirdrop: true,
  nftMinting: true,
  stakingSimulation: true,
  daoVoting: true,
  socialSharing: true,
};

type DemoPersonaSnapshot = {
  xp: number;
  tokens: number;
  completedPhases: number[];
  nfts: string[];
};

type DemoDatabase = {
  version: number;
  personas: Record<string, DemoPersonaSnapshot>;
};

const DEMO_DB_KEY = 'demo_mock_db';
const DEMO_DB_VERSION = 2;
const DEMO_ACTIVE_PERSONA_KEY = 'demo_active_persona';

const createEmptyDemoPersona = (): DemoPersonaSnapshot => ({
  xp: 0,
  tokens: 0,
  completedPhases: [],
  nfts: [],
});

const readDemoDatabase = (): DemoDatabase => {
  if (typeof window === 'undefined') {
    return { version: DEMO_DB_VERSION, personas: {} };
  }

  try {
    const raw = window.localStorage.getItem(DEMO_DB_KEY);
    if (!raw) {
      return { version: DEMO_DB_VERSION, personas: {} };
    }

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.version === DEMO_DB_VERSION && parsed.personas) {
      return parsed as DemoDatabase;
    }
  } catch (error) {
    console.warn('[Demo Mode] Failed to read demo datastore:', error);
  }

  return { version: DEMO_DB_VERSION, personas: {} };
};

const writeDemoDatabase = (db: DemoDatabase) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(DEMO_DB_KEY, JSON.stringify(db));
  } catch (error) {
    console.warn('[Demo Mode] Failed to persist demo datastore:', error);
  }
};

const isDemoSession = (): boolean => {
  return tokenStore.getAccessToken() === 'demo-token';
};

const resetDemoPersonaProgress = (personaId: string | undefined | null) => {
  if (!personaId || typeof window === 'undefined') {
    return;
  }

  const datastore = readDemoDatabase();
  datastore.personas[personaId] = createEmptyDemoPersona();
  writeDemoDatabase(datastore);
};

const resetEntireDemoDatabase = () => {
  if (typeof window === 'undefined') {
    return;
  }

  writeDemoDatabase({ version: DEMO_DB_VERSION, personas: {} });
};

const setActiveDemoPersona = (personaId: string | undefined | null) => {
  if (!personaId || typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(DEMO_ACTIVE_PERSONA_KEY, personaId);
  } catch (error) {
    console.warn('[Demo Mode] Failed to set active persona:', error);
  }
};

const derivePassLevel = (
  subscription: string | undefined,
  totalXP: number,
  totalNFTs: number
): UserProgress['passLevel'] => {
  switch (subscription) {
    case 'diamond':
      return 'Diamond';
    case 'platinum':
      return 'Platinum';
    case 'gold':
      return 'Gold';
    default:
      break;
  }

  if (totalXP >= 2000 && totalNFTs >= 10) {
    return 'Diamond';
  }

  if (totalXP >= 1000 && totalNFTs >= 5) {
    return 'Platinum';
  }

  if (totalXP >= 500 && totalNFTs >= 2) {
    return 'Gold';
  }

  return 'Free';
};

export const useJourneyStore = create<JourneyState>()(
  persist(
    (set, get) => ({
      selectedPersona: null,
      currentPhase: 0,
      userProgress: initialUserProgress,
      testnetFeatures: initialTestnetFeatures,
      isModalOpen: false,
      modalContent: null,
      apiJourneyId: null,
      lastStep: null,
      uiMode: 'discovery',
      uiTone: 'pedagogical',
      isStepLoading: false,

      setSelectedPersona: (persona) => {
        const state = get();
        const journeyId = state.apiJourneyId ?? state.ensureApiJourneyId();

        if (isDemoSession() && persona?.id) {
          setActiveDemoPersona(persona.id);
          resetDemoPersonaProgress(persona.id);
        }

        set({
          selectedPersona: persona,
          currentPhase: 0,
          apiJourneyId: journeyId,
          userProgress: {
            ...state.userProgress,
            currentPersona: persona?.id || undefined,
            completedPhases: [] // Reset completed phases when changing persona
          }
        });
      },

      setCurrentPhase: (phase) => set({ currentPhase: phase }),

      setUiMode: (mode) => set({ uiMode: mode }),
      setUiTone: (tone) => set({ uiTone: tone }),
      setIsStepLoading: (loading) => set({ isStepLoading: loading }),

      ensureApiJourneyId: () => {
        const state = get();
        if (state.apiJourneyId) return state.apiJourneyId;
        const id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2);
        set({ apiJourneyId: id });
        return id;
      },

      runInteractiveStep: async ({ phaseId, trackId, userInput }) => {
        const id = get().ensureApiJourneyId();
        const { uiTone } = get();
        const body = {
          phaseId,
          trackId,
          userInput,
          language: 'en' as const,
          mode: get().uiMode,
          tone: uiTone,
          journeyState: { xp: get().userProgress.totalXP, completed: get().userProgress.completedPhases }
        };
        try {
          set({ isStepLoading: true });
          const resp = await window.fetch(`${API_BASE_URL}/journey/${id}/step`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          if (!resp.ok) throw new Error(`step failed: ${resp.status}`);
          const json = await resp.json();
          set({ lastStep: json });
          return json;
        } finally {
          set({ isStepLoading: false });
        }
      },

      runInteractiveStepDebug: async ({ phaseId, trackId, userInput }) => {
        logger.debug('[Store] runInteractiveStepDebug START', { phaseId, trackId });
        try {
          const response = await get().runInteractiveStep({ phaseId, trackId, userInput });
          logger.debug('[Store] runInteractiveStepDebug COMPLETE');
          return response;
        } catch (error) {
          console.error('[Store] runInteractiveStepDebug FAILED', error);
          throw error;
        }
      },

      updateProgress: async (xp, nfts = [], mfai = 0) => {
        const state = get();
        const newTotalXP = state.userProgress.totalXP + xp;
        const newMfaiTokens = state.userProgress.mfaiTokens + mfai;

        // Determine new pass level based on XP and achievements
        const totalNFTs = state.userProgress.nfts.length + nfts.length;
        const newPassLevel = derivePassLevel(undefined, newTotalXP, totalNFTs);

        const updatedProgress = {
          ...state.userProgress,
          totalXP: newTotalXP,
          nfts: [...state.userProgress.nfts, ...nfts],
          mfaiTokens: newMfaiTokens,
          passLevel: newPassLevel,
          votingPower: state.userProgress.votingPower + Math.floor(xp / 10), // 1 voting power per 10 XP
        };

        // Update local state
        set({ userProgress: updatedProgress });

        // Sync with backend
        try {
          await api.updateProgress({
            total_xp: newTotalXP,
            current_level: Math.floor(newTotalXP / 200),
            completed_phases: updatedProgress.completedPhases.length,
          });

          await api.updateTokenBalance({ mfai_tokens: newMfaiTokens });
        } catch (error) {
          console.error('Failed to sync progress with backend:', error);
        }
      },

      openModal: (content) => set({ isModalOpen: true, modalContent: content }),

      closeModal: () => set({ isModalOpen: false, modalContent: null }),

      completePhase: async (phaseIndex, options = {}) => {
        const state = get();

        if (state.userProgress.completedPhases.includes(phaseIndex)) {
          return;
        }

        const phaseNumber = options.phaseNumber ?? phaseIndex + 1;
        const currentPersona = state.selectedPersona;
        const personaData = currentPersona ? personas.find(p => p.id === currentPersona.id) : null;
        const phases = personaData ? personaData.phases : [];

        if (phaseIndex >= phases.length) {
          return;
        }

        const currentPhaseData = phases[phaseNumber - 1];
        const xpReward = options.xpReward ?? currentPhaseData?.xpReward ?? 0;
        const mfaiReward = options.mfaiReward ?? currentPhaseData?.mfaiReward ?? 0;
        const nftReward = options.nftReward ?? currentPhaseData?.nftReward;

        const resolvedPersonaId = currentPersona?.id ?? state.userProgress.currentPersona;
        const resolvedPhaseId = currentPhaseData?.id;
        const resolvedPhaseTitle = currentPhaseData?.title ?? `Phase ${phaseNumber}`;
        let resolvedNftName = nftReward;

        let proofData: any = null;

        if (resolvedPersonaId && resolvedPhaseId) {
          try {
            const proofType = getProofType(resolvedPersonaId, resolvedPhaseId);
            proofData = getPersonaProofData(
              resolvedPersonaId,
              resolvedPhaseId,
              proofType,
              xpReward,
              resolvedPhaseTitle,
              phaseNumber
            );

            if (proofData?.name) {
              resolvedNftName = proofData.name;
            }
          } catch (metadataError) {
            console.warn('Failed to derive proof metadata for NFT reward:', metadataError);
          }
        }

        const updatedPhases = Array.from(
          new Set([...state.userProgress.completedPhases, phaseIndex])
        ).sort((a, b) => a - b);

        const nextPhaseIndex = Math.min(updatedPhases.length, Math.max(phases.length - 1, 0));

        const newTotalXP = state.userProgress.totalXP + xpReward;
        let updatedNFTs = state.userProgress.nfts;

        if (resolvedNftName && !updatedNFTs.includes(resolvedNftName)) {
          updatedNFTs = [...updatedNFTs, resolvedNftName];
        }

        const updatedPassLevel = derivePassLevel(undefined, newTotalXP, updatedNFTs.length);

        const updatedProgress: UserProgress = {
          ...state.userProgress,
          completedPhases: updatedPhases,
          totalXP: newTotalXP,
          mfaiTokens: state.userProgress.mfaiTokens + mfaiReward,
          votingPower: state.userProgress.votingPower + Math.floor(xpReward / 10),
          nfts: updatedNFTs,
          passLevel: updatedPassLevel,
        };

        set({
          userProgress: updatedProgress,
          currentPhase: nextPhaseIndex,
        });

        const accessToken = tokenStore.getAccessToken();
        if (!accessToken) {
          return;
        }

        try {
          const response = await api.completePhase({
            phase_number: phaseNumber,
            score: options.score ?? 100,
            nft_address: options.nftAddress || '0x' + Math.random().toString(16).substr(2, 40),
            xp_reward: xpReward,
            mfai_reward: mfaiReward,
            nft_reward: resolvedNftName,
            title: proofData?.name,
            description: proofData?.description,
            image_url: proofData?.imageUrl,
            rarity: proofData?.rarity,
          });

          if (response && response.ui_blocks) {
            set({ lastStep: response });
          } else {
            set({ lastStep: null });
          }

          await get().loadUserProgress();
        } catch (error) {
          console.error('Failed to sync phase completion with backend:', error);
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

      mintNFT: async (nftName: string, wallet: any, options = {}) => {
        const resolveImage = (): string => {
          if (options.imageUrl) {
            return options.imageUrl;
          }

          if (options.personaId && options.phaseId) {
            const proofType = getProofType(options.personaId, options.phaseId);
            const proof = getPersonaProofData(
              options.personaId,
              options.phaseId,
              proofType,
              options.xpEarned ?? 0,
              options.phaseId,
              options.phaseNumber ?? 1
            );
            return proof.imageUrl;
          }

          const normalizedName = nftName.toLowerCase();

          if (
            normalizedName.includes('proof-of-skill') ||
            normalizedName.includes('cognitive') ||
            normalizedName.includes('activation')
          ) {
            return '/images/nfts/cognitive-activation-hub/cognitive-orientation.png';
          }

          if (
            normalizedName.includes('proof-of-yield') ||
            normalizedName.includes('capital') ||
            normalizedName.includes('solana') ||
            normalizedName.includes('neuro-dividend')
          ) {
            return '/images/nfts/capital-foundry/capital-discovery.png';
          }

          if (
            normalizedName.includes('proof-of-build') ||
            normalizedName.includes('system') ||
            normalizedName.includes('tokenomics') ||
            normalizedName.includes('architect')
          ) {
            return '/images/nfts/system-architect/architecture-scan.png';
          }

          if (
            normalizedName.includes('proof-of-creation') ||
            normalizedName.includes('experience') ||
            normalizedName.includes('creator')
          ) {
            return '/images/nfts/experience-studio/experience-discovery.png';
          }

          if (
            normalizedName.includes('proof-of-orchestration') ||
            normalizedName.includes('impact') ||
            normalizedName.includes('governance')
          ) {
            return '/images/nfts/impact-engine/impact-charter.png';
          }

          if (
            normalizedName.includes('proof-of-security') ||
            normalizedName.includes('resilience') ||
            normalizedName.includes('guardian')
          ) {
            return '/images/nfts/resilience-master/security-baseline.png';
          }

          if (normalizedName.includes('proof-of-design')) {
            return '/images/nfts/experience-studio/experience-discovery.png';
          }

          if (normalizedName.includes('proof-of-invest')) {
            return '/images/nfts/capital-foundry/capital-discovery.png';
          }

          return '/images/logo_mfai.png';
        };

        const proofTypeTrait = options.proofType ? `Proof-of-${options.proofType}™` : 'Proof-of-Skill';

        const metadata = {
          name: nftName,
          description: `Proof NFT for ${nftName}`,
          image: resolveImage(),
          attributes: [
            { trait_type: 'App', value: 'Money Factory AI' },
            { trait_type: 'Type', value: proofTypeTrait },
            ...(options.xpEarned !== undefined ? [{ trait_type: 'XP Earned', value: options.xpEarned }] : []),
            ...(options.phaseNumber !== undefined ? [{ trait_type: 'Phase', value: options.phaseNumber }] : []),
          ],
        };

        const result = await mintProofOfSkill(wallet, metadata);

        if (!result.success || !result.mintAddress || !result.signature) {
          throw new Error(result.error || 'Mint failed');
        }

        set((state) => {
          const hasNFT = state.userProgress.nfts.includes(nftName);
          const updatedNFTs = hasNFT
            ? state.userProgress.nfts
            : [...state.userProgress.nfts, nftName];

          const updatedPassLevel = derivePassLevel(
            undefined,
            state.userProgress.totalXP,
            updatedNFTs.length
          );

          const existingMints = state.userProgress.nftMints || [];
          const filteredMints = existingMints.filter((mint) => mint.name !== nftName);

          return {
            userProgress: {
              ...state.userProgress,
              nfts: updatedNFTs,
              passLevel: updatedPassLevel,
              nftMints: [
                ...filteredMints,
                { name: nftName, address: result.mintAddress!, signature: result.signature!, imageUrl: metadata.image },
              ],
            },
          };
        });

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

      resetProgress: async () => {
        set({
          selectedPersona: null,
          currentPhase: 0,
          userProgress: { ...initialUserProgress },
          testnetFeatures: { ...initialTestnetFeatures },
          isModalOpen: false,
          modalContent: null,
        });

        if (typeof window !== 'undefined') {
          try {
            window.localStorage.removeItem('mfai-journey-storage');
          } catch (error) {
            console.error('Failed to clear persisted journey data:', error);
          }
        }

        const hasAccessToken = typeof window !== 'undefined'
          ? tokenStore.getAccessToken()
          : null;

        if (hasAccessToken) {
          try {
            await api.resetProgress();
          } catch (error) {
            console.error('Failed to reset progress on server:', error);
          }
        }
      },

      downloadNFT: async (nftName: string) => {
        // Simulate download process and log the requested NFT name for analytics
        await new Promise(resolve => setTimeout(resolve, 1000));
        logger.debug(`Simulated download for NFT: ${nftName}`);
        return true;
      },

      viewNFTOnExplorer: (tokenId: string) => {
        // Generate explorer URL
        const explorerUrl = `https://explorer.solana.com/address/${tokenId}?cluster=devnet`;
        return explorerUrl;
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
        const currentState = get();

        try {
          const response = await api.getUserProgress();

          if (!response?.success) {
            return;
          }

          const progress = response.progress || {};
          const totalXP: number = progress.total_xp ?? 0;
          const normalizedBackend = normalizeCompletedPhases(progress);
          let backendCompletedPhases = normalizedBackend.completedPhases;

          if (backendCompletedPhases.length === 0 && normalizedBackend.completedCount > 0) {
            backendCompletedPhases = Array.from({ length: normalizedBackend.completedCount }, (_, index) => index);
          }

          const backendPersonaId: string | undefined = progress.persona || currentState.userProgress.currentPersona || undefined;
          const matchedPersona = backendPersonaId
            ? personas.find((persona) => persona.id === backendPersonaId)
            : null;

          // Persona used to normalize phase counts/progress math.
          // We intentionally do NOT auto-select a persona here, otherwise the UI can
          // oscillate between /journeys list and an auto-selected workspace.
          const progressPersona = currentState.selectedPersona ?? matchedPersona ?? null;
          const mergedPhaseIndexes = Array.from(new Set([
            ...backendCompletedPhases,
            ...currentState.userProgress.completedPhases
          ])).sort((a, b) => a - b);

          const personaPhaseCount = progressPersona?.phases?.length
            ?? Math.max(mergedPhaseIndexes.length, normalizedBackend.completedCount);

          const completedPhases = mergedPhaseIndexes.filter((index) => index < personaPhaseCount);

          const safeCompletedCount = completedPhases.length;

          const rawCertificates: any[] = Array.isArray(progress.nft_certificates)
            ? progress.nft_certificates
            : [];

          const mappedNfts = rawCertificates.map((certificate) => {
            if (certificate?.title) {
              return certificate.title as string;
            }

            if (certificate?.phase) {
              return `Phase ${certificate.phase} NFT`;
            }

            if (certificate?.mint_address) {
              return certificate.mint_address as string;
            }

            if (certificate?.nft_address) {
              return certificate.nft_address as string;
            }

            return 'NFT Certificate';
          });

          const dedupedNfts = Array.from(new Set([
            ...currentState.userProgress.nfts,
            ...mappedNfts,
          ]));

          const passLevel = derivePassLevel(
            progress.subscription,
            totalXP,
            dedupedNfts.length
          );

          const mappedProgress: UserProgress = {
            ...initialUserProgress,
            ...currentState.userProgress,
            totalXP,
            nfts: dedupedNfts,
            passLevel,
            mfaiTokens: progress.token_transactions?.mfai_tokens ?? currentState.userProgress.mfaiTokens,
            stakedMfai: currentState.userProgress.stakedMfai,
            walletConnected: currentState.userProgress.walletConnected,
            walletAddress: currentState.userProgress.walletAddress,
            completedPhases,
            currentPersona: backendPersonaId ?? currentState.userProgress.currentPersona,
            votingPower: Math.floor(totalXP / 10),
            daoProposals: currentState.userProgress.daoProposals,
            testnetAirdropClaimed: currentState.userProgress.testnetAirdropClaimed,
            socialShareCount: currentState.userProgress.socialShareCount,
            nftMints: currentState.userProgress.nftMints,
            demoModeEnabled: Boolean(progress.demo_mode?.enabled)
          };

          set({
            // Keep current selection; do not auto-select from backend progress.
            selectedPersona: currentState.selectedPersona,
            currentPhase: safeCompletedCount,
            userProgress: mappedProgress,
          });
        } catch (error) {
          console.error('Failed to load user progress from backend:', error);
        }
      },

      setUserProgress: (progress) => set({ userProgress: progress }),

      setDemoMode: (enabled: boolean) => {
        if (enabled) {
          const demoPersona = personas[0]; // Cognitive Activation Hub
          const state = get();
          const journeyId = state.apiJourneyId ?? state.ensureApiJourneyId();

          resetEntireDemoDatabase();
          setActiveDemoPersona(demoPersona.id);
          resetDemoPersonaProgress(demoPersona.id);

          set({
            selectedPersona: demoPersona,
            currentPhase: 0, // Start at Phase 1
            apiJourneyId: journeyId,
            userProgress: {
              ...initialUserProgress,
              totalXP: 0,
              mfaiTokens: 0,
              completedPhases: [], // No phases completed
              currentPersona: demoPersona.id,
              nfts: [],
              passLevel: 'Free',
              votingPower: 0
            }
          });
        }
      },

      setCollaterizeSimulation: (sim) => set((state) => ({
        userProgress: {
          ...state.userProgress,
          collaterizeSimulation: sim
        }
      }))
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
);

// Expose store to window for non-production testing helpers
const shouldExposeStore =
  typeof window !== 'undefined' &&
  typeof import.meta !== 'undefined' &&
  typeof import.meta.env !== 'undefined' &&
  import.meta.env.MODE !== 'production';

if (shouldExposeStore) {
  (window as any).useJourneyStore = useJourneyStore;
}
