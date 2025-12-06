-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "wallet" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
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
CREATE TABLE "Journey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "requiredTier" TEXT,

    CONSTRAINT "Journey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyAccess" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "nftPassId" TEXT,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tierUsed" TEXT,

    CONSTRAINT "JourneyAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NftMint" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "mintAddress" TEXT NOT NULL,
    "txId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "journeyId" TEXT,
    "phaseId" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NftMint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MintLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "spec" JSONB NOT NULL,
    "signature" TEXT,
    "mintAddress" TEXT,
    "network" TEXT NOT NULL DEFAULT 'devnet',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MintLog_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Doc" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT,
    "embedding" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Doc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "status" TEXT NOT NULL DEFAULT 'ok',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "AgentLog" (
    "id" TEXT NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "journeyId" TEXT,
    "userId" TEXT,
    "agent" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,

    CONSTRAINT "AgentLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_wallet_key" ON "User"("wallet");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_address_key" ON "Wallet"("address");

-- CreateIndex
CREATE UNIQUE INDEX "NftPass_mintAddress_key" ON "NftPass"("mintAddress");

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
CREATE UNIQUE INDEX "JourneyState_journeyId_key" ON "JourneyState"("journeyId");

-- CreateIndex
CREATE INDEX "AgentLog_journeyId_ts_idx" ON "AgentLog"("journeyId", "ts");

-- CreateIndex
CREATE INDEX "AgentLog_userId_ts_idx" ON "AgentLog"("userId", "ts");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NftPass" ADD CONSTRAINT "NftPass_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Journey" ADD CONSTRAINT "Journey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyAccess" ADD CONSTRAINT "JourneyAccess_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyAccess" ADD CONSTRAINT "JourneyAccess_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyAccess" ADD CONSTRAINT "JourneyAccess_nftPassId_fkey" FOREIGN KEY ("nftPassId") REFERENCES "NftPass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NftMint" ADD CONSTRAINT "NftMint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

