// =============================================================================
// Money Factory AI - Shared Types
// Central source of truth for all TypeScript types
// =============================================================================

// Re-export Prisma types for convenience
export type {
  User,
  Wallet,
  Project,
  JourneyProgress,
  AgentSession,
  ChatMessage,
  AgentType,
  UserRole,
  ProjectStatus,
  JourneyPhase,
  ArtifactType,
  PassLevel,
  NftMint,
  Proposal,
  Vote,
} from '@prisma/client';

// =============================================================================
// Core Domain Types
// =============================================================================

export interface UserProgress {
  totalXP: number;
  nfts: string[];
  nftMints?: Array<{
    name: string;
    address: string;
    signature: string;
    imageUrl?: string;
  }>;
  passLevel: PassLevel;
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
  shareHistory?: Array<{
    platform: string;
    timestamp: string;
    url?: string;
  }>;
}

export interface JourneyState {
  id: string;
  userId: string;
  personaId: string;
  currentPhase: number;
  completedPhases: number[];
  totalXP: number;
  mfaiTokens: number;
  stakedMfai: number;
  votingPower: number;
  nfts: string[];
  passLevel: PassLevel;
  progressData?: Record<string, unknown>;
}

// =============================================================================
// Agent Types
// =============================================================================

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  metadata?: Record<string, unknown>;
}

export interface AgentContext {
  sessionId: string;
  userId?: string;
  journey?: {
    journeyType: string;
    phaseId: string;
    phaseIndex?: number;
    phasesExecuted?: string[];
    artifacts?: unknown[];
  };
  projectSpecs?: Record<string, unknown>;
  budget?: {
    maxTokens: number;
    timeoutMs: number;
  };
}

export interface AgentFinding {
  id: string;
  status: 'ok' | 'warn' | 'error';
  priority: 'high' | 'medium' | 'low';
  description: string;
}

export interface AgentAction {
  id: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status?: 'pending' | 'in_progress' | 'completed';
}

export interface AgentResult {
  status: 'OK' | 'WARN' | 'FAIL' | 'TIMEOUT';
  summary: string;
  findings: AgentFinding[];
  actions: AgentAction[];
  confidence: number;
  assumptions: string[];
  limits?: string[];
  citations?: string[];
  metrics?: {
    latencyMs: number;
    tokensUsed?: number;
    model?: string;
  };
  traceId: string;
  details?: Record<string, unknown>;
}

export interface AgentRequest {
  traceId: string;
  input: string;
  context?: AgentContext;
  constraints?: {
    maxTokens?: number;
    timeoutMs?: number;
  };
}

// =============================================================================
// Web3 / Solana Types
// =============================================================================

export interface SolanaNetworkConfig {
  cluster: 'devnet' | 'testnet' | 'mainnet-beta';
  rpcUrl?: string;
  wsUrl?: string;
}

export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties?: {
    category?: string;
    creators?: Array<{
      address: string;
      share: number;
    }>;
  };
}

export interface ProofOfSkillNFT {
  skill: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  projectName?: string;
  recipient: string;
  metadata: NFTMetadata;
}

export interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: number;
  mintAddress?: string;
  tokenAccount?: string;
}

// =============================================================================
// API Types
// =============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    timestamp: string;
    requestId: string;
    latencyMs?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
  field?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// =============================================================================
// Evaluation Types (AEPO)
// =============================================================================

export interface RubricScores {
  completeness: number;
  relevance: number;
  clarity: number;
  specificity: number;
  innovation: number;
  total: number;
}

export interface AEPOEvaluation {
  score: number;
  decision: 'VALIDATED' | 'REJECTED';
  feedback: string;
  isDeterministic: boolean;
  rubric: RubricScores;
  metrics: {
    mode: 'llm' | 'fallback';
    latencyMs?: number;
    tokensUsed?: number;
    model?: string;
  };
  strengths: string[];
  improvements: string[];
}

export interface EvaluationRequest {
  userId: string;
  personaId: string;
  phaseId: string | number;
  userInput: string;
  journeyContext?: Record<string, unknown>;
}

// =============================================================================
// Blinks / Solana Actions Types
// =============================================================================

export interface BlinkMetadata {
  type: 'action';
  icon: string;
  title: string;
  description: string;
  label: string;
  disabled?: boolean;
  links?: {
    actions: Array<{
      label: string;
      href: string;
      parameters?: Array<{
        name: string;
        label: string;
        required?: boolean;
      }>;
    }>;
  };
}

export interface BlinkTransactionRequest {
  account: string;
  params?: Record<string, string>;
}

export interface BlinkTransactionResponse {
  type: 'transaction';
  transaction: string;
  message?: string;
}

// =============================================================================
// Utility Types
// =============================================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

export interface Identifiable {
  id: string;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
