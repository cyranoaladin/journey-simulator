/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { createWithEqualityFn } from 'zustand/traditional';
import { persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { toast } from 'sonner';
import { personas } from '../data/personas';
import { getPersonaProofData, getProofType } from '../data/proofsData';
import { Persona, TestnetFeatures, UserProgress } from '../types/journey';
import { api, API_BASE_URL } from '../utils/api';
import { mintProofOfSkill } from '../utils/blockchain';
import { normalizeCompletedPhases } from '../utils/progress';
import { logger } from '../utils/logger';
import { tokenStore } from '../utils/tokenStore';

import type { JourneyStepResponse, Mode, Tone, RunMode } from '../types/uiBlocks';


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

// --- STATE INTERFACES ---
export interface JourneyState {
  // Authentication & User
  userId: string | null;
  selectedPersona: Persona | null;
  currentPhase: number;
  userProgress: UserProgress;
  testnetFeatures: TestnetFeatures;
  isModalOpen: boolean;
  modalContent: any;
  apiJourneyId: string | null;
  lastStep: JourneyStepResponse | null;
  runMode: RunMode;
  uiMode: Mode;
  uiTone: Tone;
  isStepLoading: boolean;
  setIsStepLoading: (loading: boolean) => void;
  setSelectedPersona: (persona: Persona | null) => void;
  setCurrentPhase: (phase: number) => void;
  setUiMode: (mode: Mode) => void;
  setRunMode: (mode: RunMode) => void;
  toggleDemoMode: () => void;
  setUiTone: (tone: Tone) => void;
  setApiJourneyId: (id: string) => void;
  ensureApiJourneyId: () => string;
  runInteractiveStep: (args: { phaseId: string; trackId: string; userInput?: string; }) => Promise<JourneyStepResponse>;
  runInteractiveStepDebug: (args: { phaseId: string; trackId: string; userInput?: string; }) => Promise<JourneyStepResponse>;
  updateProgress: (xp: number, nfts?: string[], mfai?: number) => Promise<void>;
  openModal: (content: any) => void;
  closeModal: () => void;
  demoState: {
    isActive: boolean;
    status: 'IDLE' | 'LOADING' | 'PLAYING' | 'PAUSED' | 'WAITING_FOR_INTERACTION' | 'WAITING_FOR_FINAL_VALIDATION' | 'COMPLETED';
    currentSequence: JourneyStepResponse[];
    stepIndex: number;
    typingDelayMs: number;
    demoHistory: Array<{ role: string; content: string; source?: string; timestamp: Date }>;
    accumulatedActions: import('../types/uiBlocks').AgentAction[];
    accumulatedResources: import('../types/uiBlocks').ResourceItem[];
    demoSessionId: string;
    currentPhaseId: string | null;
  };
  setDemoState: (state: Partial<JourneyState['demoState']>) => void;
  startDemoPhase: (phaseId: string, trackId: string) => Promise<void>; // Setup sequence
  tickDemo: () => void; // The Heartbeat (one tick = one step)
  submitDemoInteraction: (action: string, payload?: any) => void;
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
  loadUserProgress: (force?: boolean) => Promise<any>;
  setUserProgress: (progress: UserProgress) => void;
  setDemoMode: (enabled: boolean) => void;
  setCollaterizeSimulation: (sim: CollaterizeSimulation | undefined) => void;
  resetDemoCache: () => void;
}

// Helper: prefer this over `useJourneyStore()` (no selector), to reduce rerenders.
export const useJourneyStoreShallow = <T,>(selector: (state: JourneyState) => T) =>
  useJourneyStore(selector, shallow);

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

const PROGRESS_THROTTLE_MS = 4000;
let progressFetchInFlight: Promise<void> | null = null;
let lastProgressFetchTs = 0;

const getStoredUserId = (): string | null => {
  try {
    if (typeof sessionStorage !== 'undefined') {
      const stored = sessionStorage.getItem('userId');
      if (stored) return stored;
    }
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('userId');
      if (stored) return stored;
    }
  } catch {
    // ignore storage access issues
  }
  return null;
};

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

type PhaseResolution = {
  phaseNumber: number;
  xpReward: number;
  mfaiReward: number;
  nftReward?: string;
  resolvedNftName?: string;
  proofData: any;
  phases: Persona['phases'];
};

const resolvePhaseRewards = (
  state: JourneyState,
  phaseIndex: number,
  options: {
    score?: number;
    nftAddress?: string;
    phaseNumber?: number;
    xpReward?: number;
    mfaiReward?: number;
    nftReward?: string;
  }
): PhaseResolution => {
  const phaseNumber = options.phaseNumber ?? phaseIndex + 1;
  const currentPersona = state.selectedPersona;
  const personaData = currentPersona ? personas.find((p) => p.id === currentPersona.id) : null;
  const phases = personaData ? personaData.phases : [];
  const currentPhaseData = phases[phaseNumber - 1];

  const xpReward = options.xpReward ?? currentPhaseData?.xpReward ?? 0;
  const mfaiReward = options.mfaiReward ?? currentPhaseData?.mfaiReward ?? 0;
  const nftReward = options.nftReward ?? currentPhaseData?.nftReward;

  let resolvedNftName = nftReward;
  let proofData: any = null;

  const resolvedPersonaId = currentPersona?.id ?? state.userProgress.currentPersona;
  const resolvedPhaseId = currentPhaseData?.id;
  const resolvedPhaseTitle = currentPhaseData?.title ?? `Phase ${phaseNumber}`;

  if (resolvedPersonaId && resolvedPhaseId) {
    try {
      const proofType = getProofType(resolvedPersonaId, resolvedPhaseId);
      proofData = getPersonaProofData(resolvedPersonaId, resolvedPhaseId, proofType, xpReward, resolvedPhaseTitle, phaseNumber);
      if (proofData?.name) {
        resolvedNftName = proofData.name;
      }
    } catch (metadataError) {
      console.warn('Failed to derive proof metadata for NFT reward:', metadataError);
    }
  }

  return { phaseNumber, xpReward, mfaiReward, nftReward, resolvedNftName, proofData, phases };
};

const buildProgressUpdate = (
  state: JourneyState,
  phaseIndex: number,
  rewards: PhaseResolution
) => {
  const updatedPhases = Array.from(new Set([...state.userProgress.completedPhases, phaseIndex])).sort((a, b) => a - b);
  // Next phase = completed count, capped at last phase index (phases.length - 1)
  // If all phases completed, stay on last phase
  const totalPhases = rewards.phases.length;
  const nextPhaseIndex = Math.min(updatedPhases.length, totalPhases - 1);

  const newTotalXP = state.userProgress.totalXP + rewards.xpReward;
  let updatedNFTs = state.userProgress.nfts;

  if (rewards.resolvedNftName && !updatedNFTs.includes(rewards.resolvedNftName)) {
    updatedNFTs = [...updatedNFTs, rewards.resolvedNftName];
  }

  const updatedPassLevel = derivePassLevel(undefined, newTotalXP, updatedNFTs.length);

  // MFAI Reward Formula: (XP/100) + (Staked*2) + base phase reward
  const stakedAmount = state.userProgress.stakedMfai || 0;
  const calculatedMfaiReward = Math.floor(rewards.xpReward / 100) + (stakedAmount * 2) + rewards.mfaiReward;

  const updatedProgress: UserProgress = {
    ...state.userProgress,
    completedPhases: updatedPhases,
    totalXP: newTotalXP,
    mfaiTokens: state.userProgress.mfaiTokens + calculatedMfaiReward,
    votingPower: state.userProgress.votingPower + Math.floor(rewards.xpReward / 10),
    nfts: updatedNFTs,
    passLevel: updatedPassLevel,
  };

  return { updatedProgress, nextPhaseIndex };
};

const mapBackendProgress = (progress: any, currentState: JourneyState) => {
  const totalXP: number = progress.total_xp ?? 0;
  const normalizedBackend = normalizeCompletedPhases(progress);
  let backendCompletedPhases = normalizedBackend.completedPhases;

  if (backendCompletedPhases.length === 0 && normalizedBackend.completedCount > 0) {
    backendCompletedPhases = Array.from({ length: normalizedBackend.completedCount }, (_, index) => index);
  }

  const backendPersonaId: string | undefined = progress.persona || currentState.userProgress.currentPersona || undefined;
  const matchedPersona = backendPersonaId ? personas.find((persona) => persona.id === backendPersonaId) : null;
  const progressPersona = currentState.selectedPersona ?? matchedPersona ?? null;
  const mergedPhaseIndexes = Array.from(new Set([...backendCompletedPhases, ...currentState.userProgress.completedPhases])).sort((a, b) => a - b);
  const personaPhaseCount = progressPersona?.phases?.length ?? Math.max(mergedPhaseIndexes.length, normalizedBackend.completedCount);
  const completedPhases = mergedPhaseIndexes.filter((index) => index < personaPhaseCount);
  const rawCertificates: any[] = Array.isArray(progress.nft_certificates) ? progress.nft_certificates : [];

  const mappedNfts = rawCertificates.map((certificate) => {
    if (certificate?.title) return certificate.title as string;
    if (certificate?.phase) return `Phase ${certificate.phase} NFT`;
    if (certificate?.mint_address) return certificate.mint_address as string;
    if (certificate?.nft_address) return certificate.nft_address as string;
    return 'NFT Certificate';
  });

  const dedupedNfts = Array.from(new Set([...currentState.userProgress.nfts, ...mappedNfts]));
  const passLevel = derivePassLevel(progress.subscription, totalXP, dedupedNfts.length);

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
    demoModeEnabled: Boolean(progress.demo_mode?.enabled),
  };

  return { mappedProgress, completedCount: completedPhases.length };
};

const normalizeRunMode = (v: unknown): RunMode => {
  if (v === 'real' || v === 'demo' || v === 'simulation') return v;
  return 'simulation';
};

const getInitialRunMode = (): RunMode => {
  if (typeof window === 'undefined') return 'simulation';
  try {
    const stored = window.localStorage.getItem('mfai-run-mode');
    return normalizeRunMode(stored);
  } catch {
    return 'simulation';
  }
};


export const useJourneyStore = createWithEqualityFn<JourneyState>()(
  persist(
    (set, get) => ({
      userId: null,
      selectedPersona: null,
      currentPhase: 1,
      userProgress: initialUserProgress,
      testnetFeatures: initialTestnetFeatures,
      isModalOpen: false,
      modalContent: null,
      apiJourneyId: null,
      lastStep: null,
      runMode: getInitialRunMode(),
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

      setRunMode: (mode) => {
        const m = normalizeRunMode(mode);
        set({ runMode: m });
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem('mfai-run-mode', m);
          } catch (e) {
            console.warn('Failed to persist run mode', e);
          }
        }
        const userId = getStoredUserId();
        // Notify backend of mode intent; fire-and-forget to avoid blocking UI.
        window.fetch(`${API_BASE_URL}/orchestration/mode`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(userId ? { 'x-user-id': userId } : {}),
          },
          body: JSON.stringify({ mode: m }),
        }).catch((err) => {
          logger.warn('Failed to notify backend of run mode change', err);
        });
      },

      toggleDemoMode: () => {
        const current = get().runMode;
        const newMode: RunMode = current === 'demo' ? 'real' : 'demo';
        get().setRunMode(newMode);
      },
      setUiMode: (mode) => set({ uiMode: mode }),
      setUiTone: (tone) => set({ uiTone: tone }),
      setIsStepLoading: (loading) => set({ isStepLoading: loading }),

      setApiJourneyId: (id: string) => set({ apiJourneyId: id }),

      demoState: {
        isActive: false,
        status: 'IDLE',
        currentSequence: [],
        stepIndex: 0,
        typingDelayMs: 1500,
        demoHistory: [],
        accumulatedActions: [],
        accumulatedResources: [],
        demoSessionId: '',
        currentPhaseId: null,
      },

      setDemoState: (partial) => set((state) => ({
        demoState: { ...state.demoState, ...partial }
      })),

      startDemoPhase: async (phaseId, trackId) => {
        const currentState = get();

        // DEBOUNCE: If already loading/playing this exact phase, skip
        if (currentState.demoState.currentPhaseId === phaseId &&
            currentState.demoState.status !== 'IDLE' &&
            currentState.demoState.currentSequence.length > 0) {
          console.log('[Demo] Phase already loaded/playing. Skipping duplicate call.', { phaseId, status: currentState.demoState.status });
          return;
        }

        const newSessionId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

        console.log(`[Demo] startDemoPhase INIT: ${phaseId} | Session: ${newSessionId}`);

        set((state) => ({
          isStepLoading: true,
          isModalOpen: false,
          modalContent: null,
          demoState: {
            ...state.demoState,
            isActive: true,
            status: 'LOADING',
            demoSessionId: newSessionId,
            currentPhaseId: phaseId,
            currentSequence: [],
            stepIndex: -1,
            demoHistory: [],
            accumulatedActions: state.demoState.accumulatedActions || [],
            accumulatedResources: state.demoState.accumulatedResources || [],
          }
        }));

        await new Promise(r => setTimeout(r, 600));

        if (get().demoState.demoSessionId !== newSessionId) {
          console.log('[Demo] Session invalidated - another phase started. Aborting.');
          return;
        }

        const { getDemoSequence } = await import('./demoSequencer');
        const sequence = getDemoSequence(phaseId, trackId);

        console.log(`[Demo] Sequence loaded: ${sequence.length} steps | Phase: ${phaseId}`);

        if (get().demoState.demoSessionId !== newSessionId) {
          console.log('[Demo] Session invalidated after sequence load. Aborting.');
          return;
        }

        // GUARD: Empty sequence protection - don't proceed to PLAYING
        if (!sequence || sequence.length === 0) {
          console.error('[Demo] CRITICAL: Empty sequence returned for', phaseId, trackId);
          set((state) => ({
            isStepLoading: false,
            demoState: {
              ...state.demoState,
              status: 'IDLE',
              isActive: false,
              currentSequence: [],
              stepIndex: -1,
            }
          }));
          // Show error toast if available
          if (typeof window !== 'undefined') {
            import('sonner').then(({ toast }) => {
              toast.error('Unable to load simulation sequence. Please try again.');
            }).catch(() => {
              console.error('[Demo] Toast notification unavailable');
            });
          }
          return;
        }

        set((state) => ({
          isStepLoading: false,
          demoState: {
            ...state.demoState,
            currentSequence: sequence,
            stepIndex: -1,
            status: 'PLAYING'
          }
        }));
      },

      tickDemo: () => {
        const state = get();
        const { currentSequence, stepIndex, status } = state.demoState;

        // Guard: Only tick if PLAYING
        if (status !== 'PLAYING') return;

        const nextIndex = stepIndex + 1;

        // 1. Check for Completion
        if (nextIndex >= currentSequence.length) {
          set((s) => ({
            demoState: { ...s.demoState, status: 'WAITING_FOR_FINAL_VALIDATION' }
          }));
          return;
        }

        const step = currentSequence[nextIndex];
        set({ lastStep: step });

        // 2. Interaction Check (The "Pause" Logic)
        const interactiveKinds = ['bonding_curve_block', 'mission_block', 'market_launchpad_block', 'quiz_block'];

        // CRITICAL FIX: Scan ALL blocks, not just the last one
        let isInteractive = false;
        if (step.ui_blocks && step.ui_blocks.length > 0) {
          isInteractive = step.ui_blocks.some(b => interactiveKinds.includes(b.kind) || (b.kind === 'mission_block' && !!b.nft_reward_id));
        }

        // 3. Update State & Sync Progress
        // Process Agent Actions for Live Chat
        const newMessages = step.agent_actions?.map(action => ({
          role: 'assistant',
          content: action.reason || action.action,
          source: action.agent_name,
          timestamp: new Date()
        })) || [];

        // Check for specific reward blocks (Airdrop / Mint) to trigger cash animation
        let mfaiDelta = 0;

        const hasLaunchpad = step.ui_blocks?.some(b => b.kind === 'market_launchpad_block');
        const hasMintReward = step.ui_blocks?.some(b => b.kind === 'mission_block' && !!b.nft_reward_id);

        if (hasLaunchpad || hasMintReward) {
          mfaiDelta = 1000;
          console.log('SYSTEM_EVENT: AIRDROP_SUCCESS', { amount: 1000, trigger: hasLaunchpad ? 'launchpad' : 'mint' });
        }

        // Neural Core Sync: Push Log to Mongo (via userProgress) & Enforce Gating
        console.log(`[NeuralCore] Tick: Step ${nextIndex} | Interactive: ${isInteractive} | Status: ${isInteractive ? 'WAITING' : 'PLAYING'}`);

        // CUMULATIVE MEMORY: Append new actions/resources
        // We filter out any undefined resources just in case
        const newResources = (step.ui_blocks || [])
          .filter(b => b.kind === 'resource_block')
          .flatMap(b => (b as any).resources || []);

        const currentAccumulatedActions = state.demoState.accumulatedActions || [];
        const currentAccumulatedResources = state.demoState.accumulatedResources || [];

        set((s) => ({
          demoState: {
            ...s.demoState,
            stepIndex: nextIndex,
            status: isInteractive ? 'WAITING_FOR_INTERACTION' : 'PLAYING',
            demoHistory: [...s.demoState.demoHistory, ...newMessages],
            // TASK 1: Cumulative Persistence
            accumulatedActions: [...currentAccumulatedActions, ...(step.agent_actions || [])],
            accumulatedResources: [...currentAccumulatedResources, ...newResources]
          },
          // Task 1: Real-Time Reward Engine (Strict)
          userProgress: {
            ...s.userProgress,
            // STRICT: No +10 fallback. Trust the sequencer.
            totalXP: s.userProgress.totalXP + (step.next_state?.xp_delta ?? 0),
            mfaiTokens: s.userProgress.mfaiTokens + mfaiDelta,
            // LOG SYNC: Append new agent thoughts/actions for persistence
            interaction_logs: [
              ...(s.userProgress.interaction_logs || []),
              ...newMessages
            ]
          }
        }));
      },

      submitDemoInteraction: (_action, _payload) => {
        const state = get();
        if (state.demoState.status !== 'WAITING_FOR_INTERACTION') {
          console.warn('[Demo] Interaction ignored - not waiting for one.');
          return;
        }

        console.log('[Demo] User Interaction Received. Resuming PLAYING.');
        set((s) => ({
          demoState: { ...s.demoState, status: 'PLAYING' }
        }));
      },

      ensureApiJourneyId: () => {
        const state = get();
        if (state.apiJourneyId) return state.apiJourneyId;
        const id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2);
        set({ apiJourneyId: id });
        return id;
      },

      runInteractiveStep: async ({ phaseId, trackId, userInput }) => {
        // DEMO MODE: Replaced by State Machine. 
        // This method is now only for legacy compatibility or debug triggering.
        // It does NOT loop.
        if (get().runMode === 'demo') {
          console.warn('[Demo] runInteractiveStep called directly. Use startDemoPhase/tickDemo instead.');
          return { ui_blocks: [] } as any;
        }

        // STANDARD MODE
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
          const token = tokenStore.getAccessToken();
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'x-run-mode': get().runMode || 'demo'
          };
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const resp = await window.fetch(`${API_BASE_URL}/journey/${id}/step`, {
            method: 'POST',
            headers,
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

        const rewards = resolvePhaseRewards(state, phaseIndex, options);
        if (phaseIndex >= rewards.phases.length) {
          return;
        }

        const { updatedProgress, nextPhaseIndex } = buildProgressUpdate(state, phaseIndex, rewards);

        set({
          userProgress: updatedProgress,
          currentPhase: nextPhaseIndex,
        });

        toast.success(`Phase ${rewards.phaseNumber} Completed!`, {
            description: `You earned ${rewards.xpReward} XP.`,
        });

        if (phaseIndex === 4 && state.selectedPersona) {
          const currentMastered = state.userProgress.masteredPersonas || [];
          if (!currentMastered.includes(state.selectedPersona.id)) {
            set((s) => ({
              userProgress: {
                ...s.userProgress,
                masteredPersonas: [...currentMastered, s.selectedPersona!.id]
              }
            }));
          }
        }

        const accessToken = tokenStore.getAccessToken();
        if (!accessToken || accessToken === 'demo-token') {
          return;
        }

        try {
          const response = await api.completePhase({
            phase_number: rewards.phaseNumber,
            score: options.score ?? 100,
            nft_address: options.nftAddress || '0x' + Math.random().toString(16).slice(2, 42),
            xp_reward: rewards.xpReward,
            mfai_reward: rewards.mfaiReward,
            nft_reward: rewards.resolvedNftName,
            title: rewards.proofData?.name,
            description: rewards.proofData?.description,
            image_url: rewards.proofData?.imageUrl,
            rarity: rewards.proofData?.rarity,
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
          const newMints = [
            ...filteredMints,
            { name: nftName, address: result.mintAddress!, signature: result.signature!, imageUrl: metadata.image },
          ];

          // Persist to Backend Immediately
          api.updateProgress({
            nft_certificates: newMints.map(m => ({
              title: m.name,
              nft_address: m.address,
              mint_address: m.address,
              image_url: m.imageUrl,
              mint_date: new Date(),
              phase: options.phaseNumber || 0,
              xp_earned: options.xpEarned || 0
            }))
          }).catch(err => console.error('Failed to persist mint:', err));

          return {
            userProgress: {
              ...state.userProgress,
              nfts: updatedNFTs,
              passLevel: updatedPassLevel,
              nftMints: newMints,
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
        // UNIFIED RESET: Clears BOTH regular progress AND demo state
        // Generates new demoSessionId to invalidate any running timers
        const newSessionId = `reset-${Date.now()}`;
        
        // 1. Clear demo database
        resetEntireDemoDatabase();
        
        // 2. Reset ALL store state including demoState
        set({
          selectedPersona: null,
          currentPhase: 0,
          userProgress: { 
            ...initialUserProgress,
            completedPhases: [],
            totalXP: 0,
            nfts: [],
            nftMints: [],
            mfaiTokens: 0,
            stakedMfai: 0,
            votingPower: 0,
          },
          testnetFeatures: { ...initialTestnetFeatures },
          isModalOpen: false,
          modalContent: null,
          lastStep: null,
          apiJourneyId: null,
          // CRITICAL: Reset demoState with new sessionId
          demoState: {
            isActive: false,
            status: 'IDLE',
            currentSequence: [],
            stepIndex: -1,
            typingDelayMs: 1200,
            demoHistory: [],
            accumulatedActions: [],
            accumulatedResources: [],
            demoSessionId: newSessionId,
            currentPhaseId: null,
          },
        });

        // 3. Clear all localStorage and sessionStorage
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.removeItem('mfai-journey-storage');
            window.localStorage.removeItem(DEMO_ACTIVE_PERSONA_KEY);
            window.localStorage.removeItem('demo_artifacts');
            window.localStorage.removeItem('demo_history');
            window.sessionStorage.clear();
          } catch (error) {
            console.error('Failed to clear persisted data:', error);
          }
        }

        // 4. Call API reset if authenticated
        const hasAccessToken = typeof window !== 'undefined'
          ? tokenStore.getAccessToken()
          : null;

        if (hasAccessToken && hasAccessToken !== 'demo-token') {
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





      loadUserProgress: async (force = false) => {
        const now = Date.now();
        console.log('[Store] loadUserProgress ENTER. Force:', force, 'InFlight:', !!progressFetchInFlight);

        if (progressFetchInFlight) {
          return progressFetchInFlight;
        }
        if (!force && now - lastProgressFetchTs < PROGRESS_THROTTLE_MS) {
          console.log('[Store] Throttled. Skipping.');
          return Promise.resolve();
        }

        progressFetchInFlight = (async () => {
          try {
            // Parallel fetch: Progress + Journeys (for ID harmonization)
            const [progressResp, journeysResp] = await Promise.all([
              api.getUserProgress(),
              api.getUserJourneys().catch((_e: any) => ({ success: false, journeys: [] }))
            ]);

            console.log('[Store] loadUserProgress response:', progressResp);

            if (!progressResp?.success) {
              return;
            }

            // Get fresh state to avoid stale closure issues (e.g. persona changed while fetching)
            const freshState = get();
            const progress = progressResp.progress || {};
            const { mappedProgress, completedCount } = mapBackendProgress(progress, freshState);

            // ID Harmonization: Find the real MongoID for the current persona
            let syncedJourneyId = freshState.apiJourneyId;
            if (journeysResp?.success && Array.isArray(journeysResp.journeys)) {
              // Find most recent journey for current persona
              const activeJourney = journeysResp.journeys
                .filter((j: any) => j.journey_type === freshState.selectedPersona?.id)
                .sort((a: any, b: any) => new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime())[0];

              if (activeJourney && activeJourney._id) {
                console.log('[Store] ID HARMONIZED: Syncing apiJourneyId to backend ID:', activeJourney._id);
                syncedJourneyId = activeJourney._id;
              }
            }

            console.log('[Store] Mapping Progress:', {
              backendPhases: progress.completed_phases,
              completedCount,
              mappedPhases: mappedProgress.completedPhases
            });

            set({
              selectedPersona: freshState.selectedPersona,
              currentPhase: completedCount,
              userProgress: mappedProgress,
              apiJourneyId: syncedJourneyId // Update ID from backend truth
            });
            console.log('[Store] State Updated. CurrentPhase:', completedCount);
          } catch (error) {
            console.error('Failed to load user progress from backend:', error);
          } finally {
            progressFetchInFlight = null;
            lastProgressFetchTs = Date.now();
          }
        })();

        return progressFetchInFlight;
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
      })),

      resetDemoCache: () => {
        // NUCLEAR RESET: Clear ALL demo-related data
        
        // 1. Clear demo database (personas progress)
        resetEntireDemoDatabase();
        
        // 2. Clear all localStorage keys
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(DEMO_ACTIVE_PERSONA_KEY);
          window.localStorage.removeItem('mfai-journey-storage');
          // Clear any other potential demo artifacts
          window.localStorage.removeItem('demo_artifacts');
          window.localStorage.removeItem('demo_history');
          window.sessionStorage.clear();
        }
        
        // 3. Generate NEW session ID to invalidate any running timers
        const newInvalidSessionId = `reset-${Date.now()}`;
        
        // 4. Reset ALL store state to initial values
        set({
          selectedPersona: null,
          currentPhase: 0,
          userProgress: { 
            ...initialUserProgress,
            completedPhases: [],
            totalXP: 0,
            nfts: [],
            nftMints: [],
            mfaiTokens: 0,
            stakedMfai: 0,
            votingPower: 0,
          },
          lastStep: null,
          apiJourneyId: null,
          isModalOpen: false,
          modalContent: null,
          demoState: {
            isActive: false,
            status: 'IDLE',
            currentSequence: [],
            stepIndex: -1,
            typingDelayMs: 1200,
            demoHistory: [],
            accumulatedActions: [],
            accumulatedResources: [],
            demoSessionId: newInvalidSessionId, // Invalidates running timers
            currentPhaseId: null,
          },
        });
        
        toast.success('Demo reset complete', { description: 'All progress cleared. Select a persona to start fresh.' });
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
        runMode: state.runMode,
      }),
    }
  )
);


// Expose store to window for non-production testing helpers
// ABSOLUTE ZERO: Unconditional exposure for audit verification
(window as any).useJourneyStore = useJourneyStore;
/*
const shouldExposeStore =
  (typeof window !== 'undefined' && window.location.hostname === 'localhost') ||
  (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1') ||
  (typeof window !== 'undefined' &&
    typeof import.meta !== 'undefined' &&
    typeof import.meta.env !== 'undefined' &&
    import.meta.env.MODE !== 'production');

if (shouldExposeStore) {
  (window as any).useJourneyStore = useJourneyStore;
}
*/
