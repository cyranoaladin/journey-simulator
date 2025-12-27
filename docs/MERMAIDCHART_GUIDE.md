# 📊 Guide MermaidChart - Documentation du Projet

*Guide complet pour créer des diagrammes et graphiques avec MermaidChart dans Cursor*

---

## 🎯 Vue d'Ensemble

MermaidChart permet de créer des diagrammes Mermaid directement dans Cursor et de les visualiser/éditer de manière interactive. Ce guide vous montre comment documenter le projet Money Factory AI avec des diagrammes détaillés.

---

## 🚀 Utilisation de Base

### 1. Créer un Diagramme Mermaid

Dans n'importe quel fichier `.md`, créez un bloc de code avec la syntaxe Mermaid :

````markdown
```mermaid
graph TD
    A[Start] --> B[Process]
    B --> C[End]
```
````

### 2. Visualiser dans Cursor

1. **Ouvrir** le fichier `.md` dans Cursor
2. **Placer le curseur** sur le bloc Mermaid
3. **Cliquer** sur l'icône de prévisualisation (si disponible)
4. **Ou** utiliser la commande : `Ctrl+Shift+P` → "Mermaid: Preview"

### 3. Éditer Visuellement (si supporté)

1. **Ouvrir** la palette de commandes : `Ctrl+Shift+P`
2. **Rechercher** "Mermaid: Edit Diagram"
3. **Éditer** le diagramme dans l'éditeur visuel
4. **Sauvegarder** pour mettre à jour le code Mermaid

---

## 📐 Types de Diagrammes pour le Projet

### 1. Architecture Système

**Fichier** : `docs/ARCHITECTURE_DIAGRAMS.md`

#### Architecture Monorepo

````markdown
```mermaid
graph TB
    subgraph "Monorepo Structure"
        A[journey-simulator<br/>React 19 + Vite]
        B[mf-back<br/>Express + MongoDB]
        C[web<br/>Next.js + Prisma]
    end

    A -->|API Calls| B
    C -->|API Calls| B
    C -->|Transactions| D[Solana Blockchain]
    E[User Wallet] -->|Sign| D

    B -->|Stores Progress| F[MongoDB]
    C -->|Stores Users| G[PostgreSQL]
    C -->|Queue Jobs| H[Redis + BullMQ]

    B -->|Orchestrates| I[Zyno Agents<br/>23 Specialized Agents]
    I -->|Queries| J[OpenAI GPT-4o]
    I -->|Retrieves Context| K[RAG System]
```
````

#### Flux de Données Principal

````markdown
```mermaid
sequenceDiagram
    participant U as User
    participant JS as Journey Simulator
    participant API as mf-back API
    participant Z as Zyno Orchestrator
    participant A as Agents
    participant LLM as OpenAI

    U->>JS: Select Persona
    JS->>API: POST /orchestration/vslice
    API->>Z: Analyze Context
    Z->>A: Route to Agent
    A->>LLM: Query GPT-4o
    LLM-->>A: Response
    A-->>Z: Agent Output
    Z-->>API: UI Blocks + Actions
    API-->>JS: JourneyStepResponse
    JS-->>U: Render UI Blocks
```
````

---

### 2. Flux Utilisateur

**Fichier** : `docs/UI_UX_USER_FLOWS.md` (déjà présent, à enrichir)

#### Flux d'Onboarding Complet

````markdown
```mermaid
flowchart TD
    Start([User Arrives]) --> Landing{Landing Page}
    Landing -->|Get Started| Login{Login/Register}
    Login -->|Email/Password| Auth[Authenticate]
    Login -->|Try Demo| Demo[Demo Mode<br/>Token: demo-token]
    Auth -->|Success| PersonaSelect[Select Persona]
    Demo --> PersonaSelect
    PersonaSelect -->|Click Card| JourneyWS[JourneyWorkspace]
    JourneyWS --> Phase1[Phase 1: Learn]
    Phase1 --> Mission[Complete Missions]
    Mission -->|All Done| Phase2[Phase 2: Build]
    Phase2 --> Phase3[Phase 3: Prove]
    Phase3 --> Phase4[Phase 4: Activate]
    Phase4 --> Phase5[Phase 5: Scale]
    Phase5 --> Phase6[Phase 6: Launch]
    Phase6 -->|All Phases| Complete[Journey Completed]

    style Start fill:#e1f5ff
    style Complete fill:#14f195
    style Demo fill:#ffd512
```
````

#### Flux de Mission

````markdown
```mermaid
flowchart TD
    A[Mission Block Displayed] --> B[User Fills Input]
    B --> C[Click Submit]
    C --> D{Validation}
    D -->|Invalid| E[Show Error]
    E --> B
    D -->|Valid| F[API Call<br/>runInteractiveStep]
    F --> G[Loading State<br/>Zyno is thinking...]
    G --> H{Response}
    H -->|Error| I[Toast Error + Retry]
    I --> C
    H -->|Success| J[Evaluation Block]
    J --> K{Score ≥ 8.0?}
    K -->|Yes| L[NFT Eligible]
    K -->|No| M[Show Feedback]
    L --> N[CertificationModal]
    N --> O[Mint NFT Flow]
    M --> P[Action Suggestions]

    style L fill:#14f195
    style M fill:#ffd512
    style I fill:#ff4f4f
```
````

---

### 3. Architecture UI - Trinity Layout

**Fichier** : `docs/UI_UX_DESIGN_GUIDE.md` (à enrichir)

````markdown
```mermaid
graph TB
    subgraph "JourneyWorkspace - Trinity Layout"
        subgraph "Header - Sticky"
            H1[Back Button]
            H2[Persona Title + Badge]
            H3[Controls: Panels, Wallet, Focus]
        end

        subgraph "Navigator - Left Panel"
            N1[JourneyProgressBar]
            N2[JourneyTimeline<br/>Phases Navigation]
        end

        subgraph "The Stage - Center"
            S1[PhaseSection<br/>Phase Header]
            S2[UIBlocksRenderer<br/>Dynamic UI Blocks]
            S3[ArtifactsPanel<br/>Generated Artifacts]
        end

        subgraph "Zyno Pulse - Right Panel"
            Z1[JourneyNextActionsPanel<br/>AEPO Actions]
            Z2[ZynoSignalSidebar<br/>Agent Logs]
        end
    end

    H1 --> N1
    H2 --> S1
    H3 --> Z1
    N2 -->|Phase Change| S2
    S2 -->|User Input| Z2
    Z1 -->|Action Click| S2

    style S2 fill:#9945ff,color:#fff
    style Z2 fill:#06b6d4,color:#fff
```
````

---

### 4. Composants UI - Hiérarchie

**Fichier** : `docs/UI_UX_COMPONENT_LIBRARY.md` (à enrichir)

````markdown
```mermaid
graph TD
    App[App.tsx] --> Layout[Layout]
    Layout --> Header[Header]
    Layout --> Main[Main]
    Layout --> Footer[Footer]

    Main --> JourneyPage[Journey Page]
    JourneyPage --> JourneysPage[JourneysPage<br/>Persona Selection]
    JourneyPage --> JourneyWorkspace[JourneyWorkspace<br/>Main Component]

    JourneyWorkspace --> ProgressBar[JourneyProgressBar]
    JourneyWorkspace --> Timeline[JourneyTimeline]
    JourneyWorkspace --> UIBlocks[UIBlocksRenderer]
    JourneyWorkspace --> Sidebar[ZynoSignalSidebar]

    UIBlocks --> TextBlock[Text Block]
    UIBlocks --> QuizBlock[Quiz Block]
    UIBlocks --> MissionBlock[Mission Block]
    UIBlocks --> EvalBlock[Evaluation Block]
    UIBlocks --> ResourceBlock[Resource Block]

    JourneyWorkspace --> Modals[Modals]
    Modals --> CertModal[CertificationModal]
    Modals --> MintModal[NFTMintingModal]
    Modals --> StakeModal[StakingModal]
    Modals --> DAOModal[DAOVoteModal]

    style JourneyWorkspace fill:#9945ff,color:#fff
    style UIBlocks fill:#06b6d4,color:#fff
```
````

---

### 5. State Management - Zustand Store

**Fichier** : `docs/UI_UX_TECHNICAL_REFERENCE.md` (à enrichir)

````markdown
```mermaid
graph LR
    subgraph "JourneyStore (Zustand)"
        State[State]
        Actions[Actions]

        State --> SP[selectedPersona]
        State --> CP[currentPhase]
        State --> UP[userProgress]
        State --> LS[lastStep]
        State --> ISL[isStepLoading]

        Actions --> RIS[runInteractiveStep]
        Actions --> CPH[completePhase]
        Actions --> SPP[setSelectedPersona]
        Actions --> UP2[updateProgress]
    end

    Components[React Components] -->|useJourneyStore| State
    Components -->|Call| Actions
    Actions -->|Update| State
    State -->|Re-render| Components

    API[API Server] -->|Response| Actions
    Actions -->|Request| API

    style State fill:#9945ff,color:#fff
    style Actions fill:#14f195,color:#000
```
````

---

### 6. Zyno Orchestrator - Architecture Agents

**Fichier** : `docs/ARCHITECTURE.md` (à enrichir)

````markdown
```mermaid
graph TB
    subgraph "Zyno Orchestrator R2.x"
        Z[Zyno Core]

        subgraph "Intent Router"
            IR[Analyze User Input]
            IR --> AEPO[AEPO Signal]
            IR --> AECO[AECO Signal]
        end

        subgraph "Agent Factory"
            AF[AgentFactory]
            AF --> Coach[CoachAgent]
            AF --> Builder[BuilderAgent]
            AF --> Tokenomics[TokenomicsAgent]
            AF --> Governance[GovernanceAgent]
            AF --> ...[... 19 more agents]
        end

        subgraph "Execution Gate"
            EG[HITL - Human in the Loop]
            EG --> DRY[DRY_RUN Mode]
            EG --> REAL[Real Mode]
        end
    end

    User[User Input] --> Z
    Z --> IR
    IR --> AF
    AF --> Agents[Selected Agent]
    Agents --> LLM[OpenAI GPT-4o]
    LLM --> Agents
    Agents --> EG
    EG --> Response[UI Blocks Response]

    style Z fill:#9945ff,color:#fff
    style EG fill:#ffd512,color:#000
```
````

---

### 7. Flux de Données - API Integration

````markdown
```mermaid
sequenceDiagram
    participant U as User
    participant JS as Journey Simulator
    participant Store as Zustand Store
    participant API as mf-back API
    participant Z as Zyno
    participant DB as MongoDB

    U->>JS: Submit Mission
    JS->>Store: runInteractiveStep()
    Store->>API: POST /orchestration/vslice
    Note over API: Payload: phaseId, trackId, userInput
    API->>Z: Process Request
    Z->>Z: Analyze Context
    Z->>Z: Route to Agent
    Z->>Z: Generate UI Blocks
    Z-->>API: JourneyStepResponse
    API->>DB: Save Progress
    DB-->>API: Confirmed
    API-->>Store: Response
    Store->>Store: Update lastStep
    Store-->>JS: New State
    JS->>JS: Render UI Blocks
    JS-->>U: Updated Interface
```
````

---

### 8. Personas & Phases

````markdown
```mermaid
graph LR
    subgraph "6 Personas"
        P1[Cognitive Activation Hub<br/>🧠]
        P2[Capital Foundry<br/>💰]
        P3[System Architect<br/>🧩]
        P4[Experience Studio<br/>🎨]
        P5[Impact Engine<br/>🌱]
        P6[Resilience Master<br/>🛡️]
    end

    subgraph "6 Phases per Persona"
        PH1[Phase 1: Learn]
        PH2[Phase 2: Build]
        PH3[Phase 3: Prove]
        PH4[Phase 4: Activate]
        PH5[Phase 5: Scale]
        PH6[Phase 6: Launch]
    end

    P1 --> PH1
    PH1 --> PH2
    PH2 --> PH3
    PH3 --> PH4
    PH4 --> PH5
    PH5 --> PH6

    style P1 fill:#06b6d4,color:#fff
    style P2 fill:#14f195,color:#000
    style P3 fill:#9945ff,color:#fff
    style P4 fill:#f472b6,color:#fff
    style P5 fill:#fbbf24,color:#000
    style P6 fill:#64748b,color:#fff
```
````

---

### 9. NFT Minting Flow

````markdown
```mermaid
flowchart TD
    Start([Mission Score ≥ 8.0]) --> CertModal[CertificationModal Opens]
    CertModal --> UserClick[User Clicks Mint NFT]
    UserClick --> MintModal[NFTMintingModal Opens]
    MintModal --> CheckWallet{Wallet Connected?}
    CheckWallet -->|No| WalletModal[Wallet Connection Modal]
    WalletModal -->|Connect| CheckWallet
    CheckWallet -->|Yes| Preview[Preview NFT Metadata]
    Preview --> Confirm{User Confirms?}
    Confirm -->|No| MintModal
    Confirm -->|Yes| Sign[Transaction Signing]
    Sign --> Processing[Minting in Progress]
    Processing --> Result{Success?}
    Result -->|Yes| Success[Confetti + Toast<br/>Explorer Link]
    Result -->|No| Error[Error Toast + Retry]
    Error --> Sign
    Success --> Complete([NFT Added to userProgress])

    style Success fill:#14f195,color:#000
    style Error fill:#ff4f4f,color:#fff
```
````

---

### 10. Database Schema

````markdown
```mermaid
erDiagram
    USER ||--o{ JOURNEY : has
    USER ||--o{ NFT : owns
    USER ||--o{ PROGRESS : tracks
    JOURNEY ||--o{ PHASE : contains
    PHASE ||--o{ MISSION : has
    MISSION ||--o{ SUBMISSION : receives
    SUBMISSION ||--|| EVALUATION : generates

    USER {
        string id PK
        string email
        string walletAddress
        string personaId
        int totalXP
        int mfaiTokens
    }

    JOURNEY {
        string id PK
        string userId FK
        string personaId
        int currentPhase
        datetime createdAt
    }

    PHASE {
        string id PK
        string journeyId FK
        string phaseId
        boolean completed
        int xpReward
    }

    MISSION {
        string id PK
        string phaseId FK
        string missionType
        string expectedInput
        int xpReward
    }

    SUBMISSION {
        string id PK
        string missionId FK
        string userId FK
        string content
        datetime submittedAt
    }

    EVALUATION {
        string id PK
        string submissionId FK
        float globalScore
        json axes
        string feedback
    }

    NFT {
        string id PK
        string userId FK
        string name
        string mintAddress
        string signature
        datetime mintedAt
    }
```
````

---

## 🎨 Templates Réutilisables

### Template : Flowchart Simple

````markdown
```mermaid
flowchart TD
    Start([Start]) --> Step1[Step 1]
    Step1 --> Step2[Step 2]
    Step2 --> Decision{Decision?}
    Decision -->|Yes| Step3[Step 3]
    Decision -->|No| Step4[Step 4]
    Step3 --> End([End])
    Step4 --> End

    style Start fill:#e1f5ff
    style End fill:#14f195
    style Decision fill:#ffd512
```
````

### Template : Sequence Diagram

````markdown
```mermaid
sequenceDiagram
    participant A as Component A
    participant B as Component B
    participant C as Component C

    A->>B: Request
    B->>C: Process
    C-->>B: Response
    B-->>A: Result
```
````

### Template : Architecture Graph

````markdown
```mermaid
graph TB
    subgraph "Layer 1"
        A1[Component 1]
        A2[Component 2]
    end

    subgraph "Layer 2"
        B1[Component 3]
        B2[Component 4]
    end

    A1 --> B1
    A2 --> B2

    style A1 fill:#9945ff,color:#fff
    style B1 fill:#06b6d4,color:#fff
```
````

---

## 📝 Intégration dans la Documentation

### 1. Créer un Fichier Dédié

Créer `docs/ARCHITECTURE_DIAGRAMS.md` pour centraliser tous les diagrammes d'architecture.

### 2. Ajouter aux Documents Existants

Ajouter des diagrammes Mermaid dans :

- `docs/ARCHITECTURE.md` : Diagrammes d'architecture système
- `docs/UI_UX_USER_FLOWS.md` : Flux utilisateur (déjà présent)
- `docs/UI_UX_DESIGN_GUIDE.md` : Architecture UI
- `docs/UI_UX_TECHNICAL_REFERENCE.md` : State management, API

### 3. Référencer dans l'Index

Mettre à jour `docs/UI_UX_INDEX.md` pour référencer les nouveaux diagrammes.

---

## 🛠️ Commandes Utiles MermaidChart

### Dans Cursor

1. **Prévisualiser** : `Ctrl+Shift+P` → "Mermaid: Preview"
2. **Éditer** : `Ctrl+Shift+P` → "Mermaid: Edit Diagram"
3. **Exporter PNG** : `Ctrl+Shift+P` → "Mermaid: Export PNG"
4. **Exporter SVG** : `Ctrl+Shift+P` → "Mermaid: Export SVG"

### Raccourcis Clavier

- **Toggle Preview** : `Alt+M` (peut varier selon configuration)
- **Export** : `Ctrl+Shift+E` (peut varier)

---

## 💡 Bonnes Pratiques

### 1. Nommage des Nœuds

✅ **Bon** :

```mermaid
graph TD
    User[User] --> Login[Login Page]
    Login --> Dashboard[Dashboard]
```

❌ **Éviter** :

```mermaid
graph TD
    A --> B
    B --> C
```

### 2. Couleurs Cohérentes

Utiliser les couleurs du design system :

- **Primary** : `#9945ff` (Solana Purple)
- **Success** : `#14f195` (Solana Green)
- **Warning** : `#ffd512` (Gold)
- **Danger** : `#ff4f4f` (Red)
- **Info** : `#06b6d4` (Cyan)

### 3. Groupement Logique

Utiliser `subgraph` pour regrouper les éléments liés :

```mermaid
graph TB
    subgraph "Frontend"
        A[React App]
        B[Components]
    end

    subgraph "Backend"
        C[API Server]
        D[Database]
    end
```

### 4. Légendes et Notes

Ajouter des notes pour clarifier :

```mermaid
sequenceDiagram
    A->>B: Request
    Note over A,B: This is an important step
    B-->>A: Response
```

---

## 🎯 Prochaines Étapes

### 1. Créer les Diagrammes Principaux

- [ ] Architecture monorepo complète
- [ ] Flux de données API détaillé
- [ ] Architecture Zyno avec tous les agents
- [ ] Schéma de base de données complet
- [ ] Flux utilisateur pour chaque persona

### 2. Intégrer dans la Documentation

- [ ] Ajouter aux fichiers existants
- [ ] Créer `docs/ARCHITECTURE_DIAGRAMS.md`
- [ ] Mettre à jour les index

### 3. Maintenir à Jour

- [ ] Mettre à jour les diagrammes lors des changements
- [ ] Versionner les diagrammes importants
- [ ] Documenter les changements majeurs

---

## 📚 Ressources

- **Documentation Mermaid** : <https://mermaid.js.org/>
- **Mermaid Live Editor** : <https://mermaid.live/>
- **MermaidChart Docs** : <https://www.mermaidchart.com/docs>
- **Syntaxe Mermaid** : <https://mermaid.js.org/syntax/>

---

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

---

**Dernière mise à jour** : Décembre 2025
