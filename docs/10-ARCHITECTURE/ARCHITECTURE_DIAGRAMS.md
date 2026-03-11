<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# 🏗️ Diagrammes d'Architecture - Money Factory AI

*Collection complète de diagrammes Mermaid pour documenter l'architecture du projet*

---

## 📋 Table des Matières

1. [Architecture Monorepo](#architecture-monorepo)
2. [Flux de Données Principal](#flux-de-données-principal)
3. [Architecture Zyno Orchestrator](#architecture-zyno-orchestrator)
4. [Architecture UI - Trinity Layout](#architecture-ui---trinity-layout)
5. [State Management](#state-management)
6. [Flux API](#flux-api)
7. [Schéma de Base de Données](#schéma-de-base-de-données)
8. [Personas & Phases](#personas--phases)

---

## 1. Architecture Monorepo

### Vue d'Ensemble

```mermaid
graph TB
    subgraph "Monorepo Structure"
        A[journey-simulator<br/>React 19 + Vite + TypeScript]
        B[mf-back<br/>Express + PostgreSQL + LocalAI]
        C[web<br/>Next.js + Prisma + PostgreSQL]
    end

    subgraph "External Services"
        D[Solana Blockchain<br/>Devnet/Mainnet]
        E[OpenAI API<br/>GPT-4o]
        F[PostgreSQL<br/>Local or Docker]
        G[PostgreSQL<br/>Production DB]
        H[Redis<br/>Queue + Cache]
    end

    A -->|API Calls<br/>POST /orchestration/vslice| B
    C -->|API Calls| B
    C -->|Transactions<br/>NFT Minting| D
    E[User Wallet] -->|Sign Transactions| D

    B -->|Stores Progress| F
    C -->|Stores Users| G
    C -->|Queue Jobs| H

    B -->|Orchestrates| I[Zyno Orchestrator<br/>37 Specialized Agents]
    I -->|Queries| E
    I -->|Retrieves Context| J[RAG System]

    style A fill:#9945ff,color:#fff
    style B fill:#14f195,color:#000
    style C fill:#06b6d4,color:#fff
    style I fill:#ffd512,color:#000
```

---

## 2. Flux de Données Principal

### Sequence Diagram - Journey Execution

```mermaid
sequenceDiagram
    participant U as User
    participant JS as Journey Simulator<br/>React App
    participant Store as Zustand Store
    participant API as mf-back API<br/>Express
    participant Z as Zyno Orchestrator
    participant A as Specialized Agent
    participant LLM as OpenAI GPT-4o
    participant DB as PostgreSQL

    U->>JS: Select Persona
    JS->>Store: setSelectedPersona()
    Store->>Store: Update State

    U->>JS: Submit Mission Input
    JS->>Store: runInteractiveStep()
    Store->>API: POST /orchestration/vslice<br/>{phaseId, trackId, userInput}

    API->>Z: Analyze Context
    Z->>Z: Intent Router
    Z->>A: Route to Agent<br/>(e.g., BuilderAgent)
    A->>LLM: Query GPT-4o<br/>with Context
    LLM-->>A: AI Response
    A->>A: Process Response
    A-->>Z: Agent Output<br/>(UI Blocks, Actions)
    Z->>Z: Build Response
    Z-->>API: JourneyStepResponse<br/>{ui_blocks, agent_actions}
    API->>DB: Save Progress
    DB-->>API: Confirmed
    API-->>Store: Response
    Store->>Store: Update lastStep
    Store-->>JS: New State
    JS->>JS: Render UI Blocks<br/>via UIBlocksRenderer
    JS-->>U: Updated Interface
```

---

## 3. Architecture Zyno Orchestrator

### Vue Détaillée

```mermaid
graph TB
    subgraph "Zyno Orchestrator R2.x"
        Z[Zyno Core<br/>Main Orchestrator]

        subgraph "Intent Router"
            IR[Analyze User Input]
            IR --> AEPO[AEPO Signal<br/>Agent Execution]
            IR --> AECO[AECO Signal<br/>Agent Evaluation]
        end

        subgraph "Agent Factory"
            AF[AgentFactory<br/>getAgentForContext]
            AF --> Coach[CoachAgent]
            AF --> Builder[BuilderAgent]
            AF --> Tokenomics[TokenomicsAgent]
            AF --> Governance[GovernanceAgent]
            AF --> Security[SecurityAgent]
            AF --> ...[... 18 more agents]
        end

        subgraph "Execution Gate"
            EG[HITL<br/>Human in the Loop]
            EG --> DRY[DRY_RUN Mode<br/>Simulation]
            EG --> REAL[Real Mode<br/>Production]
        end

        subgraph "Caching Layer"
            Cache[TTL Cache<br/>In-Memory]
            Cache --> FIFO[FIFO Queue]
        end
    end

    User[User Input] --> Z
    Z --> IR
    IR --> AF
    AF --> Selected[Selected Agent]
    Selected --> LLM[OpenAI GPT-4o<br/>6.9.1]
    LLM --> Selected
    Selected --> EG
    EG --> Cache
    Cache --> Response[UI Blocks Response]

    style Z fill:#9945ff,color:#fff
    style EG fill:#ffd512,color:#000
    style LLM fill:#14f195,color:#000
```

### Agent Routing Logic

```mermaid
flowchart TD
    Start([User Input Received]) --> Analyze[Analyze Context<br/>phaseId, trackId, userInput]
    Analyze --> Intent{Intent Type?}

    Intent -->|Learning| Coach[CoachAgent]
    Intent -->|Building| Builder[BuilderAgent]
    Intent -->|Tokenomics| Tokenomics[TokenomicsAgent]
    Intent -->|Governance| Governance[GovernanceAgent]
    Intent -->|Security| Security[SecurityAgent]
    Intent -->|Evaluation| Eval[EvaluationAgent]
    Intent -->|Default| Default[DefaultAgent]

    Coach --> Process[Process Request]
    Builder --> Process
    Tokenomics --> Process
    Governance --> Process
    Security --> Process
    Eval --> Process
    Default --> Process

    Process --> LLM[Query OpenAI]
    LLM --> Format[Format Response]
    Format --> Blocks[Generate UI Blocks]
    Blocks --> Return[Return JourneyStepResponse]

    style Intent fill:#ffd512,color:#000
    style Process fill:#9945ff,color:#fff
```

---

## 4. Architecture UI - Trinity Layout

### Layout Structure

```mermaid
graph TB
    subgraph "JourneyWorkspace - Trinity Layout"
        subgraph "Header - Sticky z-50"
            H1[Back Button]
            H2[Persona Title + Badge<br/>Gradient Persona]
            H3[Controls<br/>Panels Toggle, Wallet, Focus]
        end

        subgraph "Navigator - Left Panel<br/>w-64 or w-80"
            N1[JourneyProgressBar<br/>Global Progress]
            N2[JourneyTimeline<br/>Phases Navigation<br/>Vertical Timeline]
        end

        subgraph "The Stage - Center<br/>max-w-[1200px]"
            S1[PhaseSection<br/>Phase Header + Description]
            S2[UIBlocksRenderer<br/>Dynamic UI Blocks<br/>15 Types Supported]
            S3[ArtifactsPanel<br/>Generated Artifacts<br/>Neural Overlay]
        end

        subgraph "Zyno Pulse - Right Panel<br/>w-80 or w-96, Sticky"
            Z1[JourneyNextActionsPanel<br/>AEPO Actions]
            Z2[ZynoSignalSidebar<br/>Agent Logs<br/>Real-time Updates]
        end
    end

    H1 -->|Navigate| N1
    H2 -->|Display| S1
    H3 -->|Toggle| Z1
    N2 -->|Phase Change| S2
    S2 -->|User Input| Z2
    Z1 -->|Action Click| S2
    S2 -->|Generate| S3

    style S2 fill:#9945ff,color:#fff
    style Z2 fill:#06b6d4,color:#fff
    style N2 fill:#14f195,color:#000
```

### Component Hierarchy

```mermaid
graph TD
    App[App.tsx<br/>React Router] --> Layout[Layout<br/>Header + Footer]
    Layout --> JourneyPage[Journey Page]

    JourneyPage --> JourneysPage[JourneysPage<br/>Persona Selection<br/>Grid of 6 Cards]
    JourneyPage --> JourneyWorkspace[JourneyWorkspace<br/>Main Component<br/>1277 lines]

    JourneyWorkspace --> ProgressBar[JourneyProgressBar<br/>Horizontal Progress]
    JourneyWorkspace --> Timeline[JourneyTimeline<br/>Vertical Timeline]
    JourneyWorkspace --> UIBlocks[UIBlocksRenderer<br/>1146 lines<br/>15 Block Types]
    JourneyWorkspace --> Sidebar[ZynoSignalSidebar<br/>Agent Console]

    UIBlocks --> TextBlock[Text Block<br/>Markdown]
    UIBlocks --> QuizBlock[Quiz Block<br/>Q&A]
    UIBlocks --> MissionBlock[Mission Block<br/>Submission]
    UIBlocks --> EvalBlock[Evaluation Block<br/>Multi-axis Score]
    UIBlocks --> ResourceBlock[Resource Block<br/>Links + Docs]

    JourneyWorkspace --> Modals[Modals]
    Modals --> CertModal[CertificationModal<br/>NFT Preview]
    Modals --> MintModal[NFTMintingModal<br/>Minting Flow]
    Modals --> StakeModal[StakingModal<br/>$MFAI Staking]
    Modals --> DAOModal[DAOVoteModal<br/>DAO Voting]

    style JourneyWorkspace fill:#9945ff,color:#fff
    style UIBlocks fill:#06b6d4,color:#fff
    style Modals fill:#ffd512,color:#000
```

---

## 5. State Management

### Zustand Store Structure

```mermaid
graph LR
    subgraph "JourneyStore (Zustand)"
        State[State<br/>Immutable]
        Actions[Actions<br/>Methods]

        State --> SP[selectedPersona<br/>Persona | null]
        State --> CP[currentPhase<br/>number]
        State --> UP[userProgress<br/>UserProgress]
        State --> LS[lastStep<br/>JourneyStepResponse]
        State --> ISL[isStepLoading<br/>boolean]
        State --> APIJ[apiJourneyId<br/>string]

        Actions --> RIS[runInteractiveStep<br/>async function]
        Actions --> CPH[completePhase<br/>async function]
        Actions --> SPP[setSelectedPersona<br/>function]
        Actions --> UP2[updateProgress<br/>async function]
        Actions --> MINT[mintNFT<br/>async function]
    end

    Components[React Components] -->|useJourneyStore<br/>with shallow| State
    Components -->|Call| Actions
    Actions -->|Update| State
    State -->|Re-render| Components

    API[API Server] -->|Response| Actions
    Actions -->|Request| API

    LocalStorage[(localStorage)] -->|Persist| State
    State -->|Load| LocalStorage

    style State fill:#9945ff,color:#fff
    style Actions fill:#14f195,color:#000
    style LocalStorage fill:#ffd512,color:#000
```

### State Flow

```mermaid
sequenceDiagram
    participant C as Component
    participant S as Zustand Store
    participant API as API Server
    participant LS as localStorage

    C->>S: useJourneyStore(selector)
    S->>LS: Load persisted state
    LS-->>S: Initial state
    S-->>C: State value

    C->>S: runInteractiveStep()
    S->>S: setIsStepLoading(true)
    S->>API: POST /orchestration/vslice
    API-->>S: JourneyStepResponse
    S->>S: Update lastStep
    S->>LS: Persist state
    S->>S: setIsStepLoading(false)
    S-->>C: New state (re-render)
```

---

## 6. Flux API

### API Endpoints Flow

```mermaid
graph TB
    subgraph "Frontend - journey-simulator"
        JS[Journey Simulator<br/>React App]
    end

    subgraph "Backend - mf-back"
        API[Express API Server<br/>Port 3002]

        subgraph "Routes"
            R1[POST /orchestration/vslice<br/>Main Endpoint]
            R2[GET /journey/user-progress]
            R3[GET /agents/logs]
            R4[GET /journey/artifacts]
        end

        subgraph "Controllers"
            C1[OrchestrationController]
            C2[JourneyController]
            C3[UserController]
        end

        subgraph "Services"
            S1[ZynoService]
            S2[ProgressService]
            S3[ArtifactService]
        end
    end

    subgraph "External"
        OAI[OpenAI API]
        DB[PostgreSQL]
    end

    JS -->|POST| R1
    R1 --> C1
    C1 --> S1
    S1 --> OAI
    OAI --> S1
    S1 --> C1
    C1 --> S2
    S2 --> MONGO
    MONGO --> S2
    S2 --> C1
    C1 -->|Response| JS

    style R1 fill:#9945ff,color:#fff
    style S1 fill:#14f195,color:#000
```

---

## 7. Schéma de Base de Données

### PostgreSQL Schema (mf-back)

```mermaid
erDiagram
    USER ||--o{ JOURNEY : has
    USER ||--o{ PROGRESS : tracks
    JOURNEY ||--o{ PHASE : contains
    PHASE ||--o{ STEP : has
    STEP ||--o{ UI_BLOCK : contains

    USER {
        string _id PK
        string email
        string walletAddress
        string personaId
        int totalXP
        int mfaiTokens
        array completedPhases
        datetime createdAt
    }

    JOURNEY {
        string _id PK
        string userId FK
        string personaId
        int currentPhase
        object lastStep
        datetime createdAt
        datetime updatedAt
    }

    PROGRESS {
        string _id PK
        string userId FK
        string journeyId FK
        int totalXP
        array nfts
        int mfaiTokens
        int stakedMfai
        int votingPower
    }
```

### PostgreSQL Schema (web)

```mermaid
erDiagram
    USER ||--o{ NFT : owns
    USER ||--o{ TRANSACTION : has
    USER ||--o{ STAKING : has
    USER ||--o{ VOTE : casts

    USER {
        string id PK
        string email
        string walletAddress
        string personaId
        datetime createdAt
    }

    NFT {
        string id PK
        string userId FK
        string name
        string mintAddress
        string signature
        string imageUrl
        datetime mintedAt
    }

    TRANSACTION {
        string id PK
        string userId FK
        string type
        float amount
        string signature
        datetime createdAt
    }

    STAKING {
        string id PK
        string userId FK
        float amount
        int votingPower
        datetime stakedAt
    }

    VOTE {
        string id PK
        string userId FK
        string proposalId
        string choice
        string comment
        datetime votedAt
    }
```

---

## 8. Personas & Phases

### Structure Complète

```mermaid
graph TB
    subgraph "6 Personas"
        P1[Cognitive Activation Hub<br/>🧠<br/>Sky → Cyan]
        P2[Capital Foundry<br/>💰<br/>Emerald → Teal]
        P3[System Architect<br/>🧩<br/>Purple → Indigo]
        P4[Experience Studio<br/>🎨<br/>Rose → Fuchsia]
        P5[Impact Engine<br/>🌱<br/>Amber → Lime]
        P6[Resilience Master<br/>🛡️<br/>Slate → Cyan]
    end

    subgraph "6 Phases per Persona"
        PH1[Phase 1: Learn<br/>Foundation & Orientation<br/>60-80 XP]
        PH2[Phase 2: Build<br/>Practical Skills<br/>80-100 XP]
        PH3[Phase 3: Prove<br/>Validation & Testing<br/>100-120 XP]
        PH4[Phase 4: Activate<br/>Deployment & Launch<br/>120-150 XP]
        PH5[Phase 5: Scale<br/>Growth & Expansion<br/>150-180 XP]
        PH6[Phase 6: Launch<br/>Collaterize Simulation<br/>200 XP]
    end

    P1 --> PH1
    P2 --> PH1
    P3 --> PH1
    P4 --> PH1
    P5 --> PH1
    P6 --> PH1

    PH1 --> PH2
    PH2 --> PH3
    PH3 --> PH4
    PH4 --> PH5
    PH5 --> PH6

    PH6 --> Complete[All Phases Complete<br/>Journey Completed<br/>Certificate + NFT]

    style P1 fill:#06b6d4,color:#fff
    style P2 fill:#14f195,color:#000
    style P3 fill:#9945ff,color:#fff
    style P4 fill:#f472b6,color:#fff
    style P5 fill:#fbbf24,color:#000
    style P6 fill:#64748b,color:#fff
    style Complete fill:#14f195,color:#000
```

---

## 9. NFT Minting Flow

### Processus Complet

```mermaid
flowchart TD
    Start([Mission Completed<br/>Score ≥ 8.0/10]) --> CertModal[CertificationModal Opens<br/>NFT Preview]
    CertModal --> UserClick[User Clicks<br/>Mint NFT]
    UserClick --> MintModal[NFTMintingModal Opens]
    MintModal --> CheckWallet{Wallet<br/>Connected?}
    CheckWallet -->|No| WalletModal[Wallet Connection Modal<br/>Phantom/Solflare/Torus]
    WalletModal -->|User Connects| CheckWallet
    CheckWallet -->|Yes| Preview[Preview NFT Metadata<br/>Name, Image, Attributes]
    Preview --> Confirm{User<br/>Confirms?}
    Confirm -->|No| MintModal
    Confirm -->|Yes| Sign[Transaction Signing<br/>User Signs in Wallet]
    Sign --> Processing[Minting in Progress<br/>Polling Status]
    Processing --> Result{Transaction<br/>Success?}
    Result -->|Yes| Success[Confetti Animation<br/>Success Toast<br/>Explorer Link]
    Result -->|No| Error[Error Toast<br/>Retry Button]
    Error --> Sign
    Success --> Update[Update userProgress.nfts<br/>Add NFT to Collection]
    Update --> Complete([NFT Minted Successfully])

    style Start fill:#e1f5ff
    style Success fill:#14f195,color:#000
    style Error fill:#ff4f4f,color:#fff
    style Complete fill:#9945ff,color:#fff
```

---

## 10. Web3 Integration Flow

### Solana Integration

```mermaid
sequenceDiagram
    participant U as User
    participant JS as Journey Simulator
    participant W as Wallet<br/>Phantom/Solflare
    participant S as Solana Blockchain<br/>Devnet
    participant API as Web Portal API<br/>Next.js
    participant M as Metaplex<br/>NFT SDK

    U->>JS: Click Mint NFT
    JS->>W: Request Connection
    W-->>JS: Wallet Address
    JS->>API: Prepare NFT Metadata
    API->>M: Create NFT Instruction
    M-->>API: Transaction Instruction
    API-->>JS: Transaction to Sign
    JS->>W: Request Signature
    W->>U: Approve Transaction
    U->>W: Sign
    W-->>JS: Signed Transaction
    JS->>S: Submit Transaction
    S-->>JS: Transaction Signature
    JS->>API: Store NFT Record
    API-->>JS: NFT Saved
    JS-->>U: Success + Explorer Link
```

---

## 📝 Notes

- Tous les diagrammes utilisent la syntaxe Mermaid standard
- Les couleurs correspondent au design system du projet
- Les diagrammes peuvent être édités visuellement avec MermaidChart
- Exporter en PNG/SVG pour la documentation statique si nécessaire

---

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

---

**Dernière mise à jour** : Décembre 2025
