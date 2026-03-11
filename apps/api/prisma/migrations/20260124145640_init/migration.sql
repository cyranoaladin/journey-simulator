-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('FOUNDER', 'INVESTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'AUDIT', 'APPROVED', 'LAUNCHED', 'FAILED');

-- CreateEnum
CREATE TYPE "JourneyPhase" AS ENUM ('LEARN', 'BUILD', 'GOVERN', 'LAUNCH', 'GROWTH');

-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('ZYNO_ORCHESTRATOR', 'ARCHITECT_AGENT', 'ENGINEER_AGENT', 'CFO_AGENT', 'LEGAL_AGENT', 'MARKETING_AGENT', 'AUDITOR_AGENT', 'TOKENOMICS_AGENT', 'GROWTH_AGENT', 'GOVERNANCE_AGENT', 'SECURITY_AGENT', 'RESEARCH_AGENT', 'UX_AGENT', 'PRODUCT_AGENT', 'COMMUNITY_AGENT', 'MINTING_AGENT', 'RAG_OPS_AGENT');

-- CreateEnum
CREATE TYPE "ArtifactType" AS ENUM ('WHITEPAPER_MD', 'RUST_CONTRACT', 'TOKENOMICS_CSV', 'PITCH_DECK_JSON', 'IMAGE_ASSET', 'CHECKLIST', 'TEMPLATE', 'REPORT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'FOUNDER',
    "reputationScore" INTEGER NOT NULL DEFAULT 0,
    "totalXP" INTEGER NOT NULL DEFAULT 0,
    "mfaiTokens" INTEGER NOT NULL DEFAULT 0,
    "votingPower" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "chain" TEXT NOT NULL DEFAULT 'solana',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hasActivePass" BOOLEAN NOT NULL DEFAULT false,
    "lastPassCheck" TIMESTAMP(3),

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NftPass" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "mintAddress" TEXT NOT NULL,
    "collectionMint" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NftPass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "phase" "JourneyPhase" NOT NULL DEFAULT 'LEARN',
    "metadata" JSONB,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyProgress" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "currentPhase" INTEGER NOT NULL DEFAULT 0,
    "completedPhases" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "totalXP" INTEGER NOT NULL DEFAULT 0,
    "mfaiTokens" INTEGER NOT NULL DEFAULT 0,
    "stakedMfai" INTEGER NOT NULL DEFAULT 0,
    "votingPower" INTEGER NOT NULL DEFAULT 0,
    "nfts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "passLevel" TEXT NOT NULL DEFAULT 'STARTER',
    "progressData" JSONB,

    CONSTRAINT "JourneyProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "agentType" "AgentType" NOT NULL,
    "contextSummary" TEXT,
    "agentState" JSONB,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "AgentSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "toolCalls" JSONB,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentLog" (
    "id" TEXT NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "journeyId" TEXT,
    "userId" TEXT,
    "agent" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "latencyMs" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ok',

    CONSTRAINT "AgentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "status" TEXT NOT NULL DEFAULT 'ok',
    "latencyMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artifact" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "ArtifactType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "url" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isFinal" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Artifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tokenomics" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tokenName" TEXT NOT NULL,
    "tokenSymbol" TEXT NOT NULL,
    "totalSupply" BIGINT NOT NULL,
    "initialPrice" DECIMAL(18,8) NOT NULL,
    "targetLiquidity" DECIMAL(18,8) NOT NULL,
    "curveType" TEXT NOT NULL DEFAULT 'SIGMOID',
    "allocations" JSONB NOT NULL,
    "mintAddress" TEXT,
    "poolAddress" TEXT,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Tokenomics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollaterizeSimulationLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userWallet" TEXT NOT NULL,
    "journeyId" TEXT,
    "tier" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL,
    "eligibilityScore" INTEGER NOT NULL,
    "fundraisingGoalUSD" DOUBLE PRECISION NOT NULL,
    "softCapUSD" DOUBLE PRECISION NOT NULL,
    "hardCapUSD" DOUBLE PRECISION NOT NULL,
    "liquidityUSD" DOUBLE PRECISION NOT NULL,
    "initialPriceUSD" DOUBLE PRECISION NOT NULL,
    "rawInput" JSONB NOT NULL,
    "rawOutput" JSONB NOT NULL,

    CONSTRAINT "CollaterizeSimulationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetProjectId" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weight" INTEGER NOT NULL,
    "choice" BOOLEAN NOT NULL,
    "userId" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoulboundCredential" (
    "id" TEXT NOT NULL,
    "mintedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "mintAddress" TEXT NOT NULL,
    "metadataUrl" TEXT NOT NULL,
    "phaseId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SoulboundCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amountSol" DECIMAL(18,9) NOT NULL,
    "tokensRecv" DECIMAL(18,9) NOT NULL,
    "projectId" TEXT,
    "txSignature" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NftMint" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "mintAddress" TEXT NOT NULL,
    "txId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "journeyId" TEXT,
    "phaseId" TEXT,
    "metadata" JSONB,

    CONSTRAINT "NftMint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MintLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "spec" JSONB NOT NULL,
    "signature" TEXT,
    "mintAddress" TEXT,
    "network" TEXT NOT NULL DEFAULT 'devnet',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "error" TEXT,

    CONSTRAINT "MintLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doc" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "category" TEXT,
    "embedding" DOUBLE PRECISION[] DEFAULT ARRAY[]::DOUBLE PRECISION[],

    CONSTRAINT "Doc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyState" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "last_state" JSONB NOT NULL,
    "last_metadata" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JourneyState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_walletAddress_idx" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_address_key" ON "Wallet"("address");

-- CreateIndex
CREATE INDEX "Wallet_address_idx" ON "Wallet"("address");

-- CreateIndex
CREATE UNIQUE INDEX "NftPass_mintAddress_key" ON "NftPass"("mintAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_ownerId_idx" ON "Project"("ownerId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "JourneyProgress_userId_idx" ON "JourneyProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyProgress_userId_personaId_key" ON "JourneyProgress"("userId", "personaId");

-- CreateIndex
CREATE INDEX "AgentSession_projectId_idx" ON "AgentSession"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentSession_projectId_agentType_key" ON "AgentSession"("projectId", "agentType");

-- CreateIndex
CREATE INDEX "ChatMessage_sessionId_idx" ON "ChatMessage"("sessionId");

-- CreateIndex
CREATE INDEX "AgentLog_journeyId_ts_idx" ON "AgentLog"("journeyId", "ts");

-- CreateIndex
CREATE INDEX "AgentLog_userId_ts_idx" ON "AgentLog"("userId", "ts");

-- CreateIndex
CREATE INDEX "AgentLog_agent_ts_idx" ON "AgentLog"("agent", "ts");

-- CreateIndex
CREATE INDEX "AgentRun_kind_createdAt_idx" ON "AgentRun"("kind", "createdAt");

-- CreateIndex
CREATE INDEX "Artifact_projectId_idx" ON "Artifact"("projectId");

-- CreateIndex
CREATE INDEX "Artifact_type_idx" ON "Artifact"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Tokenomics_projectId_key" ON "Tokenomics"("projectId");

-- CreateIndex
CREATE INDEX "CollaterizeSimulationLog_userWallet_idx" ON "CollaterizeSimulationLog"("userWallet");

-- CreateIndex
CREATE INDEX "Proposal_targetProjectId_idx" ON "Proposal"("targetProjectId");

-- CreateIndex
CREATE INDEX "Vote_proposalId_idx" ON "Vote"("proposalId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_userId_proposalId_key" ON "Vote"("userId", "proposalId");

-- CreateIndex
CREATE UNIQUE INDEX "SoulboundCredential_mintAddress_key" ON "SoulboundCredential"("mintAddress");

-- CreateIndex
CREATE INDEX "SoulboundCredential_userId_idx" ON "SoulboundCredential"("userId");

-- CreateIndex
CREATE INDEX "Achievement_userId_idx" ON "Achievement"("userId");

-- CreateIndex
CREATE INDEX "Investment_userId_idx" ON "Investment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NftMint_mintAddress_key" ON "NftMint"("mintAddress");

-- CreateIndex
CREATE UNIQUE INDEX "NftMint_txId_key" ON "NftMint"("txId");

-- CreateIndex
CREATE INDEX "NftMint_userId_idx" ON "NftMint"("userId");

-- CreateIndex
CREATE INDEX "NftMint_wallet_idx" ON "NftMint"("wallet");

-- CreateIndex
CREATE INDEX "NftMint_type_idx" ON "NftMint"("type");

-- CreateIndex
CREATE INDEX "MintLog_userId_idx" ON "MintLog"("userId");

-- CreateIndex
CREATE INDEX "MintLog_status_idx" ON "MintLog"("status");

-- CreateIndex
CREATE INDEX "Doc_category_idx" ON "Doc"("category");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyState_journeyId_key" ON "JourneyState"("journeyId");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NftPass" ADD CONSTRAINT "NftPass_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyProgress" ADD CONSTRAINT "JourneyProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentSession" ADD CONSTRAINT "AgentSession_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AgentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artifact" ADD CONSTRAINT "Artifact_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tokenomics" ADD CONSTRAINT "Tokenomics_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_targetProjectId_fkey" FOREIGN KEY ("targetProjectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoulboundCredential" ADD CONSTRAINT "SoulboundCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NftMint" ADD CONSTRAINT "NftMint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
