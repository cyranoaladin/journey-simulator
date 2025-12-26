# Diagrammes d'Architecture - Money Factory AI

Ce document contient les diagrammes Mermaid illustrant l'architecture du monorepo et les pipelines clés.

---

## Architecture Monorepo

```mermaid
graph TB
    subgraph "Front-end (journey-simulator/)"
        UI[React + Vite + TS]
        Router[React Router]
        Store[Zustand Stores]
        Wallet[Solana Wallet Adapter]
        UI --> Router
        UI --> Store
        UI --> Wallet
    end

    subgraph "Back-end Orchestration (mf-back/)"
        Express[Express Server]
        Mongo[(MongoDB)]
        Agents[23 Agents Zyno]
        RAG[RAG Engine]
        LLM[LLM Provider]
        Express --> Mongo
        Express --> Agents
        Express --> RAG
        Express --> LLM
    end

    subgraph "Services Web3 (web/)"
        Next[Next.js API]
        Prisma[(PostgreSQL)]
        Redis[(Redis)]
        BullMQ[BullMQ Queue]
        Worker[Mint Worker]
        UMI[UMI/Metaplex]
        Next --> Prisma
        Next --> Redis
        Next --> BullMQ
        BullMQ --> Worker
        Worker --> UMI
        Worker --> Prisma
    end

    subgraph "Blockchain"
        Solana[Solana Devnet/Testnet]
        UMI --> Solana
        Wallet --> Solana
    end

    UI -->|HTTP REST| Express
    UI -->|SIWS Auth| Next
    UI -->|Mint Requests| Next
    Express -->|Journey State| Mongo
    Next -->|Mint Jobs| BullMQ
    Next -->|SIWS Challenges| Redis

    style UI fill:#9945FF,color:#fff
    style Express fill:#14F195,color:#000
    style Next fill:#00E5FF,color:#000
    style Solana fill:#9945FF,color:#fff
```

---

## Pipeline de Minting Asynchrone

```mermaid
sequenceDiagram
    participant UI as journey-simulator
    participant API as web/api/mint
    participant Queue as BullMQ Queue
    participant Worker as Mint Worker
    participant UMI as UMI/Metaplex
    participant Solana as Solana Devnet
    participant DB as PostgreSQL

    UI->>API: POST /api/mint/simulate
    API-->>UI: { ok, sim: { estFee, riskScore } }

    UI->>API: POST /api/mint/execute
    Note over API: Validation (KILL_SWITCH, payload)
    API->>DB: Create MintJob
    API->>Queue: Add job to 'minting' queue
    API-->>UI: { ok: true, jobId, status: 'queued' }

    Queue->>Worker: Process job
    Note over Worker: executeReward(spec, sim)
    Worker->>UMI: createAndMint()
    UMI->>Solana: Send transaction
    Solana-->>UMI: Transaction signature
    UMI-->>Worker: { txSig, mintAddress }
    Worker->>DB: Update MintLog (SUCCESS)
    Worker-->>Queue: Job completed

    UI->>API: GET /api/mint/status?jobId=...
    API->>DB: Query MintJob status
    API-->>UI: { status: 'completed', txSig, mintAddress }
```

---

## Workflow Auth SIWS (Sign-In With Solana)

```mermaid
sequenceDiagram
    participant Wallet as Solana Wallet
    participant UI as journey-simulator
    participant API as web/api/auth/siws
    participant Redis as Redis Store
    participant DB as PostgreSQL

    UI->>API: POST /api/auth/siws/challenge
    Note over API: Generate nonce, message
    API->>Redis: Store challenge (siws:${id}, TTL)
    API-->>UI: { challengeId, message, nonce }

    UI->>Wallet: Request signature (message)
    Wallet->>Wallet: Sign with Ed25519
    Wallet-->>UI: signature

    UI->>API: POST /api/auth/siws/verify
    Note over API: { address, signature, challengeId }
    API->>Redis: Get challenge (siws:${id})
    Redis-->>API: Challenge data
    API->>API: Verify Ed25519 signature
    API->>Redis: Mark challenge as used
    API->>DB: Create/Update user session
    API-->>UI: { ok: true, token, issuedAt }

    Note over UI: Store token, redirect to /journeys
```

---

## Orchestration Agentique (R2.x)

```mermaid
graph LR
    Input[User Input] --> Intent[Intent Router]
    Intent --> Select[Agent Selection]
    Select -->|Scoring| Agents[23 Agents Zyno]

    Agents -->|Parallel| Exec[Agent Execution]
    Exec --> RAG[RAG Query]
    Exec --> LLM[LLM Call]

    RAG --> Arbitrage[Arbitrage Zyno]
    LLM --> Arbitrage

    Arbitrage -->|Detect| Contradictions[Contradictions?]
    Contradictions -->|Yes| Resolve[Resolve Conflicts]
    Contradictions -->|No| Decision[Decision Structurée]
    Resolve --> Decision

    Decision --> Plan[Execution Plan]
    Plan --> Gate{Execution Gate}

    Gate -->|PENDING| HITL[Human-in-the-Loop]
    Gate -->|APPROVED| Real[REAL Execution]
    Gate -->|REJECTED| DryRun[DRY_RUN Fallback]
    Gate -->|EXPIRED| DryRun

    HITL -->|APPROVED| Real
    HITL -->|REJECTED| DryRun

    Real --> Tools[Tools Registry]
    DryRun --> Simulate[Simulate Tools]

    Tools --> Response[Structured Response]
    Simulate --> Response

    Response --> UI[UI Blocks Renderer]

    style Input fill:#9945FF,color:#fff
    style Agents fill:#14F195,color:#000
    style Gate fill:#FFD512,color:#000
    style Real fill:#FF4F4F,color:#fff
    style DryRun fill:#00E5FF,color:#000
```

---

## SkillChain Mining Flow

```mermaid
graph TD
    Start[User Completes Phase] --> XP[XP Awarded]
    XP --> Convert{Convert XP → $MFAI}
    Convert -->|Rate| MFAI[$MFAI Tokens]
    MFAI --> Check{Threshold Reached?}

    Check -->|No| Display[Display Progress]
    Check -->|Yes| Trigger[Mint Triggered]

    Trigger --> Simulate[POST /api/mint/simulate]
    Simulate --> Execute[POST /api/mint/execute]
    Execute --> Queue[BullMQ Queue]
    Queue --> Worker[Mint Worker]
    Worker --> Mint[UMI/Metaplex Mint]
    Mint --> NFT[Proof-of-Skill NFT]
    NFT --> Update[Update userProgress.nfts]
    Update --> Display

    style Start fill:#9945FF,color:#fff
    style XP fill:#14F195,color:#000
    style MFAI fill:#00E5FF,color:#000
    style NFT fill:#FFD512,color:#000
```

---

## Trinity Layout Structure

```mermaid
graph TB
    Layout[Layout Component] --> Header[Header]
    Layout --> Container[Main Container]
    Layout --> Footer[Footer]

    Container --> Navigator[Navigator - Left]
    Container --> Stage[The Stage - Center]
    Container --> Pulse[Zyno Pulse - Right]

    Navigator --> Timeline[Journey Timeline]
    Navigator --> Progress[Progress Indicators]
    Navigator --> QuickAccess[Quick Access Journeys]

    Stage --> Workspace[JourneyWorkspace]
    Workspace --> Blocks[UIBlocksRenderer]
    Blocks --> Text[text_block]
    Blocks --> Checklist[checklist_block]
    Blocks --> Quiz[quiz_block]
    Blocks --> Mission[mission_block]
    Blocks --> Resource[resource_block]
    Blocks --> Document[document_block]
    Blocks --> Evaluation[evaluation_block]
    Blocks --> Diagram[diagram_block]

    Pulse --> AgentLogs[Agent Activity Logs]
    Pulse --> Suggestions[Action Suggestions]
    Pulse --> AEPO[AEPO/AECO Status]

    style Layout fill:#050510,color:#fff
    style Navigator fill:#120E24,color:#fff
    style Stage fill:#1A1630,color:#fff
    style Pulse fill:#231F3D,color:#fff
```

---

**Note** : Ces diagrammes sont générés avec Mermaid et peuvent être rendus dans tout viewer Markdown compatible (GitHub, GitLab, VS Code avec extension Mermaid, etc.).
