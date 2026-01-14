<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# 🎨 Diagrammes UI/UX - Money Factory AI

*Collection complète de diagrammes pour spécialistes UI/UX*
*Comprendre le projet, la logique métier, les workflows et la structure*

---

## 📋 Table des Matières

1. [Vue d'Ensemble du Projet](#vue-densemble-du-projet)
2. [Workflows de Navigation](#workflows-de-navigation)
3. [Logique Métier - Personas & Phases](#logique-métier---personas--phases)
4. [Logique Métier - Missions & Évaluations](#logique-métier---missions--évaluations)
5. [Structure des Composants UI](#structure-des-composants-ui)
6. [Flux de Données Utilisateur](#flux-de-données-utilisateur)
7. [États de l'Interface](#états-de-linterface)
8. [Interactions Utilisateur](#interactions-utilisateur)
9. [Système de Récompenses](#système-de-récompenses)
10. [Architecture UI - Trinity Layout](#architecture-ui---trinity-layout)

---

## 1. Vue d'Ensemble du Projet

### 1.1 Architecture Complète

```mermaid
graph TB
    subgraph "User Journey"
        U[👤 User]
        U -->|1. Onboarding| L[Landing Page]
        L -->|2. Auth| AUTH{Login/Register<br/>or Demo?}
        AUTH -->|Real| LOGIN[Login/Register]
        AUTH -->|Demo| DEMO[Demo Mode<br/>No Wallet Required]
        LOGIN -->|3. Select| PERSONA[Persona Selection<br/>6 Personas Available]
        DEMO --> PERSONA
        PERSONA -->|4. Start| JOURNEY[Journey Workspace<br/>Trinity Layout]
    end

    subgraph "Journey Execution"
        JOURNEY -->|5. Execute| PHASES[6 Phases<br/>Learn → Build → Prove → Activate → Scale → Launch]
        PHASES -->|6. Complete| MISSIONS[Missions<br/>Quizzes, Submissions, Evaluations]
        MISSIONS -->|7. Evaluate| SCORE{Score ≥ 8.0?}
        SCORE -->|Yes| NFT[NFT Eligible<br/>Mint Proof-of-Skill™]
        SCORE -->|No| FEEDBACK[Feedback + Resubmit]
        FEEDBACK --> MISSIONS
        NFT -->|8. Complete| COMPLETE[Journey Completed<br/>Certificate + Rewards]
    end

    subgraph "Backend Services"
        JOURNEY -->|API Calls| API[mf-back API<br/>Express + MongoDB]
        API -->|Orchestrates| ZYNO[Zyno Orchestrator<br/>23 AI Agents]
        ZYNO -->|Queries| OPENAI[OpenAI GPT-4o]
        ZYNO -->|Returns| BLOCKS[UI Blocks<br/>15 Types Dynamic]
        BLOCKS -->|Renders| JOURNEY
    end

    subgraph "Web3 Features"
        NFT -->|Minting| WEB[Web Portal<br/>Next.js]
        WEB -->|Transactions| SOLANA[Solana Blockchain]
        U -->|Wallet| WALLET[Phantom/Solflare<br/>Wallet Connection]
        WALLET -->|Signs| SOLANA
    end

    style U fill:#e1f5ff
    style JOURNEY fill:#9945ff,color:#fff
    style ZYNO fill:#14f195,color:#000
    style NFT fill:#ffd512,color:#000
    style COMPLETE fill:#14f195,color:#000
```

### 1.2 Monorepo Structure

```mermaid
graph LR
    subgraph "journey-simulator<br/>Frontend React"
        JS1[React 19 + Vite]
        JS2[TypeScript 5.3]
        JS3[Zustand Store]
        JS4[UI Components]
        JS5[UI Blocks Renderer]
    end

    subgraph "mf-back<br/>Backend API"
        MB1[Express 4.21]
        MB2[MongoDB + Mongoose]
        MB3[Zyno Orchestrator]
        MB4[23 AI Agents]
        MB5[OpenAI Integration]
    end

    subgraph "web<br/>Web Portal"
        WP1[Next.js 14.2]
        WP2[Prisma + PostgreSQL]
        WP3[NFT Minting]
        WP4[Solana Integration]
        WP5[Redis + BullMQ]
    end

    JS1 -->|POST /orchestration/vslice| MB1
    JS3 -->|State Management| JS4
    JS4 -->|Renders| JS5
    MB3 -->|Routes| MB4
    MB4 -->|Queries| MB5
    WP3 -->|Mints| WP4

    style JS1 fill:#9945ff,color:#fff
    style MB1 fill:#14f195,color:#000
    style WP1 fill:#06b6d4,color:#fff
```

---

## 2. Workflows de Navigation

### 2.1 Navigation Principale - Sitemap

```mermaid
flowchart TD
    ROOT[/] --> HOME[Home Page<br/>Landing]
    HOME -->|Get Started| LOGIN[Login Page]
    HOME -->|Try Demo| DEMO[Demo Mode]

    LOGIN -->|Success| DASHBOARD[Dashboard]
    LOGIN -->|Register| REGISTER[Register Page]
    REGISTER --> DASHBOARD

    DEMO --> JOURNEYS_DEMO[/journeys/demo]
    DASHBOARD --> JOURNEYS[/journeys]

    JOURNEYS -->|No Persona Selected| PERSONAS[Personas Page<br/>6 Cards Grid]
    JOURNEYS -->|Persona Selected| WORKSPACE[Journey Workspace<br/>Trinity Layout]

    WORKSPACE -->|Complete All Phases| COMPLETED[Journey Completed Page]

    DASHBOARD --> PLAYGROUND[/playground]
    DASHBOARD --> RESOURCES[/resources]
    DASHBOARD --> SUPPORT[/support]
    DASHBOARD --> ZYNO_PAGE[/zyno]
    DASHBOARD --> GUIDE[/guide]
    DASHBOARD --> DAO[/dao]

    style HOME fill:#e1f5ff
    style WORKSPACE fill:#9945ff,color:#fff
    style COMPLETED fill:#14f195,color:#000
    style PERSONAS fill:#06b6d4,color:#fff
```

### 2.2 Workflow d'Onboarding Complet

```mermaid
flowchart TD
    START([User Arrives]) --> LANDING[Landing Page<br/>Hero Section]
    LANDING -->|Get Started| CHOICE{Choose Path}

    CHOICE -->|Login| LOGIN[Login Page]
    CHOICE -->|Register| REGISTER[Register Page]
    CHOICE -->|Try Demo| DEMO[Demo Mode<br/>Token: demo-token]

    LOGIN -->|Email/Password| AUTH[Authenticate]
    REGISTER -->|Create Account| AUTH
    AUTH -->|Success| TUTORIAL{Show Tutorial?}

    DEMO -->|Skip Tutorial| PERSONAS
    TUTORIAL -->|Yes| TUT[Onboarding Tutorial<br/>6 Steps]
    TUTORIAL -->|No| PERSONAS
    TUT --> PERSONAS[Personas Page<br/>Select Journey]

    PERSONAS -->|Click Card| SELECT[Persona Selected<br/>Store Updated]
    SELECT --> WORKSPACE[Journey Workspace<br/>Phase 1 Loaded]

    WORKSPACE -->|First Time| INTRO[Phase Introduction<br/>UI Blocks Displayed]
    INTRO --> START_JOURNEY([Journey Begins])

    style START fill:#e1f5ff
    style WORKSPACE fill:#9945ff,color:#fff
    style START_JOURNEY fill:#14f195,color:#000
    style DEMO fill:#ffd512,color:#000
```

### 2.3 Navigation dans Journey Workspace

```mermaid
flowchart TD
    WS[Journey Workspace] --> HEADER[Header<br/>Sticky Top]
    WS --> LEFT[Navigator Panel<br/>Left Side]
    WS --> CENTER[The Stage<br/>Center]
    WS --> RIGHT[Zyno Pulse<br/>Right Side]

    HEADER --> BACK[Back Button<br/>→ Journeys Page]
    HEADER --> TITLE[Persona Title + Badge]
    HEADER --> CONTROLS[Controls<br/>Panels Toggle, Wallet, Focus]

    LEFT --> PROGRESS[Progress Bar<br/>Global Progress]
    LEFT --> TIMELINE[Timeline<br/>6 Phases]
    TIMELINE -->|Click Phase| PHASE_CHANGE[Change Phase<br/>Load New UI Blocks]

    CENTER --> PHASE_HEADER[Phase Header<br/>Title + Description]
    CENTER --> UI_BLOCKS[UI Blocks Renderer<br/>15 Types Dynamic]
    CENTER --> ARTIFACTS[Artifacts Panel<br/>Generated Files]

    RIGHT --> ACTIONS[Next Actions Panel<br/>AEPO Suggestions]
    RIGHT --> LOGS[Agent Logs<br/>Real-time Updates]

    PHASE_CHANGE --> CENTER
    ACTIONS -->|Click Action| UI_BLOCKS
    UI_BLOCKS -->|User Input| LOGS

    CONTROLS -->|Toggle Left| LEFT
    CONTROLS -->|Toggle Right| RIGHT
    CONTROLS -->|Focus Mode| FOCUS[Full Screen<br/>Hide Panels]

    style WS fill:#9945ff,color:#fff
    style CENTER fill:#06b6d4,color:#fff
    style RIGHT fill:#14f195,color:#000
    style TIMELINE fill:#ffd512,color:#000
```

---

## 3. Logique Métier - Personas & Phases

### 3.1 Les 6 Personas

```mermaid
graph TB
    subgraph "Persona Selection"
        P1[Cognitive Activation Hub<br/>🧠<br/>Sky → Cyan Gradient<br/>Target: Web3 Newcomers]
        P2[Capital Foundry<br/>💰<br/>Emerald → Teal Gradient<br/>Target: DeFi Builders]
        P3[System Architect<br/>🧩<br/>Purple → Indigo Gradient<br/>Target: Infra Engineers]
        P4[Experience Studio<br/>🎨<br/>Rose → Fuchsia Gradient<br/>Target: Product/UX Designers]
        P5[Impact Engine<br/>🌱<br/>Amber → Lime Gradient<br/>Target: DAO Operators]
        P6[Resilience Master<br/>🛡️<br/>Slate → Cyan Gradient<br/>Target: Security/Audit]
    end

    P1 --> JOURNEY[6 Phases Journey]
    P2 --> JOURNEY
    P3 --> JOURNEY
    P4 --> JOURNEY
    P5 --> JOURNEY
    P6 --> JOURNEY

    style P1 fill:#06b6d4,color:#fff
    style P2 fill:#14f195,color:#000
    style P3 fill:#9945ff,color:#fff
    style P4 fill:#f472b6,color:#fff
    style P5 fill:#fbbf24,color:#000
    style P6 fill:#64748b,color:#fff
    style JOURNEY fill:#9945ff,color:#fff
```

### 3.2 Structure des Phases

```mermaid
flowchart TD
    START([Journey Starts]) --> P1[Phase 1: Learn<br/>Foundation & Orientation<br/>Duration: 1 week<br/>XP: 60-80<br/>NFT: Web3 Orientation]

    P1 -->|Complete All Missions| UNLOCK1[Unlock Phase 2]
    UNLOCK1 --> P2[Phase 2: Build<br/>Practical Skills<br/>Duration: 10 days<br/>XP: 80-100<br/>NFT: Solana Fluency]

    P2 -->|Complete All Missions| UNLOCK2[Unlock Phase 3]
    UNLOCK2 --> P3[Phase 3: Prove<br/>Validation & Testing<br/>Duration: 2 weeks<br/>XP: 100-120<br/>NFT: Tokenomics Architect]

    P3 -->|Complete All Missions| UNLOCK3[Unlock Phase 4]
    UNLOCK3 --> P4[Phase 4: Activate<br/>Deployment & Launch<br/>Duration: 1 week<br/>XP: 120-150<br/>NFT: Sovereign Identity]

    P4 -->|Complete All Missions| UNLOCK4[Unlock Phase 5]
    UNLOCK4 --> P5[Phase 5: Scale<br/>Growth & Expansion<br/>Duration: 2 weeks<br/>XP: 150-180<br/>NFT: Activation Badge]

    P5 -->|Complete All Missions| UNLOCK5[Unlock Phase 6]
    UNLOCK5 --> P6[Phase 6: Launch<br/>Collaterize Simulation<br/>Duration: 1 week<br/>XP: 200<br/>NFT: Launch Badge]

    P6 -->|All Phases Complete| COMPLETE[Journey Completed<br/>Certificate + Final NFT]

    P1 -.->|Can Return| P1
    P2 -.->|Can Return| P2
    P3 -.->|Can Return| P3
    P4 -.->|Can Return| P4
    P5 -.->|Can Return| P5

    style START fill:#e1f5ff
    style COMPLETE fill:#14f195,color:#000
    style P1 fill:#06b6d4,color:#fff
    style P6 fill:#ffd512,color:#000
```

### 3.3 Progression et Verrouillage

```mermaid
stateDiagram-v2
    [*] --> Available: Persona Selected
    Available --> Current: User Starts Phase
    Current --> InProgress: Missions Started
    InProgress --> Completed: All Missions Done<br/>Score ≥ 8.0
    Completed --> Available: Next Phase Unlocked
    Available --> Locked: Previous Phase<br/>Not Completed
    Locked --> Available: Prerequisites Met

    note right of Available
        Phase visible
        Can be selected
        Gradient visible
    end note

    note right of Current
        Active phase
        Cyan border
        Pulse animation
        UI Blocks displayed
    end note

    note right of Completed
        Check icon
        Green border
        Can return anytime
        NFT eligible
    end note

    note right of Locked
        Opacity 0.5
        Disabled
        Lock icon
        Tooltip: Complete previous phase
    end note
```

---

## 4. Logique Métier - Missions & Évaluations

### 4.1 Cycle de Mission Complet

```mermaid
flowchart TD
    START([Phase Loaded]) --> BLOCKS[UI Blocks Displayed<br/>Text, Resources, Mission]

    BLOCKS --> MISSION[Mission Block<br/>Title, Description, Input Type]
    MISSION --> INPUT[User Input<br/>Textarea/File/Code/Link]

    INPUT --> VALIDATE{Validation<br/>Local}
    VALIDATE -->|Invalid| ERROR[Show Error<br/>Inline Message]
    ERROR --> INPUT
    VALIDATE -->|Valid| SUBMIT[Submit Button<br/>Click]

    SUBMIT --> LOADING[Loading State<br/>Zyno is thinking...<br/>Spinner]
    LOADING --> API[API Call<br/>POST /orchestration/vslice]

    API --> PROCESS[Zyno Processes<br/>Agent Routes Request]
    PROCESS --> LLM[OpenAI GPT-4o<br/>Evaluates Submission]
    LLM --> EVAL[Evaluation Generated<br/>Multi-axis Scoring]

    EVAL --> RESPONSE[Response Received<br/>Evaluation Block]
    RESPONSE --> SCORE{Global Score<br/>0-10}

    SCORE -->|≥ 8.0| SUCCESS[Success State<br/>Green, Confetti<br/>NFT Eligible]
    SCORE -->|6.0-7.9| GOOD[Good State<br/>Yellow<br/>Can Improve]
    SCORE -->|< 6.0| NEEDS_WORK[Needs Work<br/>Red<br/>Resubmit Recommended]

    SUCCESS --> XP[XP Added<br/>userProgress.totalXP += xpReward]
    SUCCESS --> NFT_CHECK{NFT Eligible?}
    NFT_CHECK -->|Yes| CERT_MODAL[CertificationModal<br/>Opens Automatically]
    NFT_CHECK -->|No| NEXT[Next Mission]

    GOOD --> FEEDBACK[Show Feedback<br/>Detailed Comments]
    FEEDBACK --> RESUBMIT{Resubmit?}
    RESUBMIT -->|Yes| INPUT
    RESUBMIT -->|No| NEXT

    NEEDS_WORK --> FEEDBACK2[Show Feedback<br/>Detailed Comments]
    FEEDBACK2 --> RESUBMIT2{Resubmit?}
    RESUBMIT2 -->|Yes| INPUT
    RESUBMIT2 -->|No| NEXT

    CERT_MODAL --> MINT{User Mints NFT?}
    MINT -->|Yes| MINT_FLOW[NFT Minting Flow]
    MINT -->|No| NEXT
    MINT_FLOW --> NEXT

    NEXT --> CHECK{All Missions<br/>Complete?}
    CHECK -->|No| BLOCKS
    CHECK -->|Yes| PHASE_COMPLETE[Phase Complete<br/>Unlock Next Phase]

    style SUCCESS fill:#14f195,color:#000
    style GOOD fill:#ffd512,color:#000
    style NEEDS_WORK fill:#ff4f4f,color:#fff
    style CERT_MODAL fill:#9945ff,color:#fff
```

### 4.2 Système d'Évaluation Multi-Axes

```mermaid
graph TB
    SUBMISSION[User Submission] --> EVAL[Evaluation Agent]
    EVAL --> ANALYZE[Analyze Content<br/>Multi-Axis]

    ANALYZE --> AXIS1[Accuracy Axis<br/>0-10 Score]
    ANALYZE --> AXIS2[Creativity Axis<br/>0-10 Score]
    ANALYZE --> AXIS3[Technical Depth<br/>0-10 Score]
    ANALYZE --> AXIS4[Relevance Axis<br/>0-10 Score]
    ANALYZE --> AXIS5[Completeness<br/>0-10 Score]

    AXIS1 --> CALC[Calculate Global Score<br/>Weighted Average]
    AXIS2 --> CALC
    AXIS3 --> CALC
    AXIS4 --> CALC
    AXIS5 --> CALC

    CALC --> GLOBAL[Global Score<br/>0-10]
    GLOBAL --> THRESHOLD{Score ≥ 8.0?}

    THRESHOLD -->|Yes| ELIGIBLE[NFT Eligible<br/>Proof-of-Skill™]
    THRESHOLD -->|No| NOT_ELIGIBLE[Not Eligible<br/>Feedback Provided]

    ELIGIBLE --> REWARD[XP Reward<br/>Score * 10]
    ELIGIBLE --> MFAI[$MFAI Tokens<br/>Score * 1]
    ELIGIBLE --> NFT_BADGE[NFT Badge<br/>Phase-specific]

    NOT_ELIGIBLE --> FEEDBACK[Detailed Feedback<br/>Per Axis Comments]
    FEEDBACK --> RESUBMIT[Resubmit Option]

    style ELIGIBLE fill:#14f195,color:#000
    style NOT_ELIGIBLE fill:#ffd512,color:#000
    style GLOBAL fill:#9945ff,color:#fff
```

### 4.3 Types de Missions

```mermaid
graph TD
    MISSION[Mission Block] --> TYPE{Mission Type}

    TYPE -->|Text| TEXT[Text Submission<br/>Textarea Input<br/>Min Length Validation]
    TYPE -->|Markdown| MARKDOWN[Markdown Document<br/>File Upload<br/>.md Format]
    TYPE -->|Code| CODE[Code Snippet<br/>Syntax Highlighting<br/>Language Selection]
    TYPE -->|Link| LINK[External Link<br/>URL Validation<br/>Preview if Available]
    TYPE -->|Choice| CHOICE[Multiple Choice<br/>Radio Buttons<br/>Single Selection]

    TEXT --> SUBMIT[Submit]
    MARKDOWN --> SUBMIT
    CODE --> SUBMIT
    LINK --> SUBMIT
    CHOICE --> SUBMIT

    SUBMIT --> EVAL[Evaluation Process]

    style MISSION fill:#9945ff,color:#fff
    style EVAL fill:#14f195,color:#000
```

---

## 5. Structure des Composants UI

### 5.1 Hiérarchie Complète des Composants

```mermaid
graph TB
    APP[App.tsx<br/>Root Component] --> ROUTER[React Router<br/>Routes Configuration]

    ROUTER --> HOME[HomePage]
    ROUTER --> LOGIN_PAGE[LoginPage]
    ROUTER --> REGISTER_PAGE[RegisterPage]
    ROUTER --> JOURNEY_PAGE[Journey Page<br/>Main Container]

    JOURNEY_PAGE --> JOURNEYS_PAGE[JourneysPage<br/>Persona Selection]
    JOURNEY_PAGE --> JOURNEY_WORKSPACE[JourneyWorkspace<br/>1277 lines<br/>Main Component]

    JOURNEYS_PAGE --> JOURNEY_CARD[JourneyCard<br/>x6 Cards<br/>One per Persona]

    JOURNEY_WORKSPACE --> HEADER_COMP[Header<br/>Sticky Top]
    JOURNEY_WORKSPACE --> NAVIGATOR[Navigator Panel<br/>Left]
    JOURNEY_WORKSPACE --> STAGE[The Stage<br/>Center]
    JOURNEY_WORKSPACE --> PULSE[Zyno Pulse<br/>Right]

    NAVIGATOR --> PROGRESS_BAR[JourneyProgressBar<br/>Horizontal Progress]
    NAVIGATOR --> TIMELINE_COMP[JourneyTimeline<br/>Vertical Timeline]

    STAGE --> PHASE_SECTION[PhaseSection<br/>Phase Header]
    STAGE --> UI_BLOCKS_RENDERER[UIBlocksRenderer<br/>1146 lines<br/>15 Block Types]
    STAGE --> ARTIFACTS_PANEL[ArtifactsPanel<br/>Generated Files]

    UI_BLOCKS_RENDERER --> TEXT_BLOCK[Text Block<br/>Markdown Renderer]
    UI_BLOCKS_RENDERER --> QUIZ_BLOCK[Quiz Block<br/>Q&A Component]
    UI_BLOCKS_RENDERER --> MISSION_BLOCK[Mission Block<br/>Submission Form]
    UI_BLOCKS_RENDERER --> EVAL_BLOCK[Evaluation Block<br/>Score Display]
    UI_BLOCKS_RENDERER --> RESOURCE_BLOCK[Resource Block<br/>Links List]
    UI_BLOCKS_RENDERER --> CHECKLIST_BLOCK[Checklist Block<br/>Tasks List]
    UI_BLOCKS_RENDERER --> OTHER_BLOCKS[... 9 More Block Types]

    PULSE --> ACTIONS_PANEL[JourneyNextActionsPanel<br/>AEPO Actions]
    PULSE --> SIGNAL_SIDEBAR[ZynoSignalSidebar<br/>Agent Logs]

    JOURNEY_WORKSPACE --> MODALS[Modals]
    MODALS --> CERT_MODAL[CertificationModal<br/>NFT Preview]
    MODALS --> MINT_MODAL[NFTMintingModal<br/>Minting Flow]
    MODALS --> STAKE_MODAL[StakingModal<br/>$MFAI Staking]
    MODALS --> DAO_MODAL[DAOVoteModal<br/>DAO Voting]
    MODALS --> ARTIFACT_MODAL[ArtifactModal<br/>File Preview]

    style JOURNEY_WORKSPACE fill:#9945ff,color:#fff
    style UI_BLOCKS_RENDERER fill:#06b6d4,color:#fff
    style MODALS fill:#ffd512,color:#000
```

### 5.2 UI Blocks - Types et Rendu

```mermaid
graph LR
    RESPONSE[JourneyStepResponse<br/>from API] --> BLOCKS[ui_blocks Array<br/>UIBlock[]]

    BLOCKS --> RENDERER[UIBlocksRenderer<br/>Switch Statement]

    RENDERER -->|text_block| TEXT[Text Component<br/>Markdown → HTML]
    RENDERER -->|quiz_block| QUIZ[Quiz Component<br/>Q&A with Validation]
    RENDERER -->|mission_block| MISSION[Mission Component<br/>Submission Form]
    RENDERER -->|evaluation_block| EVAL[Evaluation Component<br/>Multi-axis Score]
    RENDERER -->|resource_block| RESOURCE[Resource Component<br/>Links + Icons]
    RENDERER -->|checklist_block| CHECKLIST[Checklist Component<br/>Tasks with Checkboxes]
    RENDERER -->|document_block| DOCUMENT[Document Component<br/>Full Markdown Doc]
    RENDERER -->|action_suggestions_block| ACTIONS[Actions Component<br/>Clickable Suggestions]
    RENDERER -->|xp_block| XP[XP Component<br/>Progress Display]
    RENDERER -->|diagram_block| DIAGRAM[Diagram Component<br/>Mermaid Renderer]
    RENDERER -->|dao_dashboard_block| DAO[DAO Component<br/>Governance Dashboard]
    RENDERER -->|project_selection_block| PROJECT[Project Component<br/>Selection Interface]
    RENDERER -->|narrative_choice_block| NARRATIVE[Narrative Component<br/>Story Choices]
    RENDERER -->|indicator_block| INDICATOR[Indicator Component<br/>Gauges/Charts]
    RENDERER -->|interactive_template_block| TEMPLATE[Template Component<br/>Forms/One-pagers]

    TEXT --> DISPLAY[Displayed in<br/>The Stage]
    QUIZ --> DISPLAY
    MISSION --> DISPLAY
    EVAL --> DISPLAY
    RESOURCE --> DISPLAY
    CHECKLIST --> DISPLAY
    DOCUMENT --> DISPLAY
    ACTIONS --> DISPLAY
    XP --> DISPLAY
    DIAGRAM --> DISPLAY
    DAO --> DISPLAY
    PROJECT --> DISPLAY
    NARRATIVE --> DISPLAY
    INDICATOR --> DISPLAY
    TEMPLATE --> DISPLAY

    style RENDERER fill:#9945ff,color:#fff
    style DISPLAY fill:#06b6d4,color:#fff
```

---

## 6. Flux de Données Utilisateur

### 6.1 State Management Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Component
    participant S as Zustand Store
    participant API as mf-back API
    participant LS as localStorage

    Note over U,LS: Initial Load
    U->>C: Opens Journey Workspace
    C->>S: useJourneyStore(selector)
    S->>LS: Load persisted state
    LS-->>S: Initial state
    S-->>C: State value
    C-->>U: Render UI

    Note over U,LS: User Action
    U->>C: Clicks Submit Mission
    C->>S: runInteractiveStep({phaseId, trackId, userInput})
    S->>S: setIsStepLoading(true)
    S->>API: POST /orchestration/vslice
    API-->>S: JourneyStepResponse
    S->>S: Update lastStep
    S->>S: Update userProgress
    S->>LS: Persist state
    S->>S: setIsStepLoading(false)
    S-->>C: New state
    C->>C: Re-render with new UI Blocks
    C-->>U: Updated Interface
```

### 6.2 Data Flow - Complete Journey

```mermaid
flowchart TD
    USER[User Actions] --> COMPONENT[React Component]
    COMPONENT --> STORE[Zustand Store<br/>journeyStore.ts]

    STORE -->|Read| STATE[State<br/>selectedPersona<br/>currentPhase<br/>userProgress<br/>lastStep]
    STORE -->|Write| ACTIONS[Actions<br/>runInteractiveStep<br/>completePhase<br/>updateProgress]

    ACTIONS --> API[API Server<br/>mf-back]
    API --> ZYNO[Zyno Orchestrator]
    ZYNO --> AGENTS[AI Agents]
    AGENTS --> OPENAI[OpenAI GPT-4o]
    OPENAI --> AGENTS
    AGENTS --> ZYNO
    ZYNO --> RESPONSE[JourneyStepResponse<br/>ui_blocks[]]
    RESPONSE --> API
    API --> ACTIONS

    ACTIONS --> UPDATE[Update State]
    UPDATE --> STATE
    STATE --> PERSIST[Persist to<br/>localStorage]
    STATE --> RENDER[Re-render<br/>Components]
    RENDER --> USER

    style STORE fill:#9945ff,color:#fff
    style ZYNO fill:#14f195,color:#000
    style STATE fill:#06b6d4,color:#fff
```

---

## 7. États de l'Interface

### 7.1 États des Composants Principaux

```mermaid
stateDiagram-v2
    [*] --> Loading: Component Mounts
    Loading --> Empty: No Data
    Loading --> Loaded: Data Received
    Loading --> Error: API Error

    Empty --> Loaded: Data Fetched
    Loaded --> Updating: User Action
    Updating --> Loaded: Update Complete
    Updating --> Error: Update Failed

    Error --> Retry: User Clicks Retry
    Retry --> Loading: API Call

    Loaded --> Submitting: User Submits
    Submitting --> Success: Submission Success
    Submitting --> Error: Submission Failed
    Success --> Loaded: Continue

    note right of Loading
        Skeleton Loaders
        Spinner Animation
        "Zyno is thinking..."
    end note

    note right of Empty
        Empty State UI
        "No artifacts yet"
        Call to Action
    end note

    note right of Loaded
        UI Blocks Rendered
        Interactive Elements
        Ready for Input
    end note

    note right of Error
        Toast Error
        Retry Button
        Error Message
    end note
```

### 7.2 États de Phase

```mermaid
stateDiagram-v2
    [*] --> Locked: Phase Not Started
    Locked --> Available: Prerequisites Met
    Available --> Current: User Selects Phase
    Current --> InProgress: Missions Started
    InProgress --> Evaluating: Submission Sent
    Evaluating --> Completed: Score ≥ 8.0
    Evaluating --> InProgress: Score < 8.0<br/>Resubmit
    Completed --> Available: Can Return Anytime

    note right of Locked
        Opacity: 0.5
        Disabled
        Lock Icon
        Tooltip: Complete previous phase
    end note

    note right of Available
        Full Opacity
        Clickable
        Gradient Visible
        Can Navigate To
    end note

    note right of Current
        Cyan Border
        Glow Effect
        Pulse Animation
        Active Indicator
    end note

    note right of Completed
        Green Border
        Check Icon
        NFT Eligible
        Can Revisit
    end note
```

---

## 8. Interactions Utilisateur

### 8.1 Interactions dans Journey Workspace

```mermaid
flowchart TD
    USER[User in Workspace] --> INTERACT{Interaction Type}

    INTERACT -->|Click Phase| PHASE_CLICK[Click Phase in Timeline]
    PHASE_CLICK --> CHECK{Phase<br/>Unlocked?}
    CHECK -->|Yes| LOAD[Load Phase<br/>runInteractiveStep]
    CHECK -->|No| TOAST[Toast: Complete previous phase]

    INTERACT -->|Submit Mission| MISSION_SUBMIT[Fill Input + Submit]
    MISSION_SUBMIT --> VALIDATE[Validate Input]
    VALIDATE -->|Valid| API_CALL[API Call]
    VALIDATE -->|Invalid| ERROR[Show Error]
    API_CALL --> LOADING[Loading State]
    LOADING --> RESPONSE[Response]
    RESPONSE --> RENDER[Render UI Blocks]

    INTERACT -->|Click Action| ACTION_CLICK[Click Suggested Action]
    ACTION_CLICK --> TRIGGER[Trigger Action<br/>Navigate/Submit]

    INTERACT -->|Toggle Panel| PANEL_TOGGLE[Toggle Left/Right Panel]
    PANEL_TOGGLE --> UPDATE[Update State<br/>leftPanelOpen/rightPanelOpen]
    UPDATE --> RE_RENDER[Re-render Layout]

    INTERACT -->|Focus Mode| FOCUS_TOGGLE[Toggle Focus Mode]
    FOCUS_TOGGLE --> HIDE[Hide Panels<br/>Full Screen Center]

    INTERACT -->|View Artifact| ARTIFACT_CLICK[Click Artifact Card]
    ARTIFACT_CLICK --> MODAL[Open ArtifactModal<br/>Preview File]

    INTERACT -->|Mint NFT| NFT_CLICK[Click Mint Button]
    NFT_CLICK --> WALLET_CHECK{Wallet<br/>Connected?}
    WALLET_CHECK -->|No| WALLET_MODAL[Wallet Connection Modal]
    WALLET_CHECK -->|Yes| MINT_MODAL[NFTMintingModal]
    WALLET_MODAL -->|Connect| MINT_MODAL
    MINT_MODAL --> SIGN[Sign Transaction]
    SIGN --> MINT[Process Minting]

    style API_CALL fill:#9945ff,color:#fff
    style MINT fill:#14f195,color:#000
    style ERROR fill:#ff4f4f,color:#fff
```

### 8.2 Interactions avec UI Blocks

```mermaid
graph TD
    BLOCK[UI Block Displayed] --> TYPE{Block Type}

    TYPE -->|Text Block| TEXT[Read Only<br/>Markdown Content]
    TYPE -->|Quiz Block| QUIZ[Select Answer<br/>Radio Buttons<br/>Submit → Feedback]
    TYPE -->|Mission Block| MISSION[Fill Input<br/>Textarea/File/Code<br/>Submit → Evaluation]
    TYPE -->|Evaluation Block| EVAL[Read Only<br/>Score Display<br/>Feedback Comments]
    TYPE -->|Resource Block| RESOURCE[Click Link<br/>Open External<br/>or Modal]
    TYPE -->|Checklist Block| CHECKLIST[Toggle Checkboxes<br/>Auto-save State]
    TYPE -->|Action Suggestions| ACTIONS[Click Action<br/>Trigger Navigation<br/>or Submission]

    QUIZ --> SUBMIT_QUIZ[Submit Quiz]
    SUBMIT_QUIZ --> VALIDATE_QUIZ[Validate Answers]
    VALIDATE_QUIZ --> FEEDBACK_QUIZ[Show Feedback<br/>Correct/Incorrect]

    MISSION --> FILL[Fill Input]
    FILL --> SUBMIT_MISSION[Submit Mission]
    SUBMIT_MISSION --> LOADING_MISSION[Loading...]
    LOADING_MISSION --> EVAL_BLOCK[Evaluation Block<br/>Appears]

    RESOURCE --> CLICK_RESOURCE[Click Resource]
    CLICK_RESOURCE --> EXTERNAL{External<br/>Link?}
    EXTERNAL -->|Yes| OPEN[Open in New Tab]
    EXTERNAL -->|No| MODAL_RESOURCE[Open in Modal]

    ACTIONS --> CLICK_ACTION[Click Action]
    CLICK_ACTION --> NAVIGATE[Navigate to Phase<br/>or Trigger Action]

    style MISSION fill:#9945ff,color:#fff
    style EVAL_BLOCK fill:#14f195,color:#000
    style LOADING_MISSION fill:#ffd512,color:#000
```

---

## 9. Système de Récompenses

### 9.1 XP et Tokens Flow

```mermaid
flowchart TD
    MISSION[Mission Completed] --> SCORE{Global Score<br/>0-10}

    SCORE --> CALC_XP[Calculate XP<br/>Score * 10]
    CALC_XP --> ADD_XP[Add to totalXP<br/>userProgress.totalXP += xp]

    SCORE --> CALC_MFAI[Calculate $MFAI<br/>Score * 1]
    CALC_MFAI --> ADD_MFAI[Add to mfaiTokens<br/>userProgress.mfaiTokens += mfai]

    SCORE --> CHECK_NFT{Score ≥ 8.0?}
    CHECK_NFT -->|Yes| NFT_ELIGIBLE[NFT Eligible<br/>Proof-of-Skill™]
    CHECK_NFT -->|No| NO_NFT[No NFT<br/>Continue Journey]

    NFT_ELIGIBLE --> CERT_MODAL[CertificationModal<br/>Auto-opens]
    CERT_MODAL --> USER_CHOICE{User Mints?}
    USER_CHOICE -->|Yes| MINT_FLOW[Minting Flow]
    USER_CHOICE -->|No| CONTINUE[Continue Journey]

    MINT_FLOW --> WALLET[Wallet Connection]
    WALLET --> SIGN[Sign Transaction]
    SIGN --> MINT[NFT Minted]
    MINT --> ADD_NFT[Add to userProgress.nfts<br/>Store mintAddress]
    ADD_NFT --> UPDATE[Update UI<br/>Show NFT in Collection]

    ADD_XP --> CHECK_LEVEL{Level Up?}
    CHECK_LEVEL -->|Yes| LEVEL_UP[Level Up Animation<br/>Confetti]
    CHECK_LEVEL -->|No| DISPLAY[Display XP Gain<br/>Toast Notification]

    style NFT_ELIGIBLE fill:#14f195,color:#000
    style MINT fill:#9945ff,color:#fff
    style LEVEL_UP fill:#ffd512,color:#000
```

### 9.2 NFT Minting Flow Détaillé

```mermaid
sequenceDiagram
    participant U as User
    participant JS as Journey Simulator
    participant MODAL as CertificationModal
    participant MINT_MODAL as NFTMintingModal
    participant W as Wallet
    participant WEB as Web Portal
    participant S as Solana
    participant DB as Database

    U->>JS: Completes Mission<br/>Score ≥ 8.0
    JS->>MODAL: Auto-open CertificationModal
    MODAL->>U: Display NFT Preview<br/>Name, Image, Metadata
    U->>MODAL: Click "Mint NFT"
    MODAL->>MINT_MODAL: Open NFTMintingModal

    MINT_MODAL->>MINT_MODAL: Check Wallet Connection
    alt Wallet Not Connected
        MINT_MODAL->>W: Request Connection
        W->>U: Approve Connection
        W->>MINT_MODAL: Wallet Address
    end

    MINT_MODAL->>U: Display Preview<br/>NFT Metadata
    U->>MINT_MODAL: Confirm Mint
    MINT_MODAL->>WEB: Prepare NFT Transaction
    WEB->>WEB: Generate NFT Metadata
    WEB->>S: Create Transaction
    S->>W: Request Signature
    W->>U: Approve Transaction
    U->>W: Sign
    W->>S: Signed Transaction
    S->>S: Process Minting
    S->>WEB: Transaction Signature
    WEB->>DB: Store NFT Record
    DB->>WEB: Confirmed
    WEB->>MINT_MODAL: Success Response
    MINT_MODAL->>JS: Update userProgress.nfts
    JS->>U: Display Success<br/>Confetti + Explorer Link
```

---

## 10. Architecture UI - Trinity Layout

### 10.1 Layout Structure Détaillée

```mermaid
graph TB
    subgraph "JourneyWorkspace - Trinity Layout"
        subgraph "Header - Sticky z-50<br/>h-16, bg-[#0A0A1F]/95"
            H_LEFT[Back Button<br/>→ Journeys Page]
            H_CENTER[Persona Title<br/>+ Badge<br/>Gradient Persona]
            H_RIGHT[Controls<br/>Panels Toggle<br/>Wallet Status<br/>Focus Mode]
        end

        subgraph "Navigator - Left Panel<br/>w-64 or w-80<br/>Collapsible"
            N_PROGRESS[JourneyProgressBar<br/>Horizontal Bar<br/>6 Phases with Icons]
            N_TIMELINE[JourneyTimeline<br/>Vertical Timeline<br/>Clickable Phases<br/>States: Completed/Current/Locked]
        end

        subgraph "The Stage - Center<br/>max-w-[1200px]<br/>Main Content Area"
            S_HEADER[PhaseSection<br/>Phase Title<br/>Description<br/>Mission Overview]
            S_BLOCKS[UIBlocksRenderer<br/>Dynamic UI Blocks<br/>15 Types Supported<br/>Scrollable]
            S_ARTIFACTS[ArtifactsPanel<br/>Generated Artifacts<br/>Neural Overlay<br/>Preview Modal]
        end

        subgraph "Zyno Pulse - Right Panel<br/>w-80 or w-96<br/>Sticky lg:top-24<br/>Collapsible"
            Z_ACTIONS[JourneyNextActionsPanel<br/>AEPO Actions<br/>Clickable Suggestions<br/>Recent Agent Runs]
            Z_LOGS[ZynoSignalSidebar<br/>Agent Activity Logs<br/>Real-time Updates<br/>Scrollable]
        end
    end

    H_LEFT -->|Navigate| N_TIMELINE
    H_CENTER -->|Display| S_HEADER
    H_RIGHT -->|Toggle| N_PROGRESS
    H_RIGHT -->|Toggle| Z_ACTIONS
    H_RIGHT -->|Focus| FOCUS[Focus Mode<br/>Hide Panels<br/>Full Screen Center]

    N_TIMELINE -->|Phase Click| PHASE_CHANGE[Change Phase<br/>setCurrentPhase<br/>runInteractiveStep]
    PHASE_CHANGE --> S_BLOCKS

    S_BLOCKS -->|User Input| USER_ACTION[User Action<br/>Submit/Click]
    USER_ACTION --> API_CALL[API Call<br/>POST /orchestration/vslice]
    API_CALL --> Z_LOGS

    Z_ACTIONS -->|Action Click| TRIGGER[Trigger Action<br/>Navigate/Submit]
    TRIGGER --> S_BLOCKS

    S_ARTIFACTS -->|Artifact Click| ARTIFACT_MODAL[ArtifactModal<br/>Preview File<br/>Download/Share]

    style S_BLOCKS fill:#9945ff,color:#fff
    style Z_LOGS fill:#06b6d4,color:#fff
    style N_TIMELINE fill:#14f195,color:#000
    style H_CENTER fill:#ffd512,color:#000
```

### 10.2 Responsive Breakpoints

```mermaid
graph TB
    LAYOUT[Trinity Layout] --> DESKTOP{Screen Size}

    DESKTOP -->|≥ 1024px<br/>Desktop| DESKTOP_LAYOUT[Full Layout<br/>3 Panels Visible<br/>Navigator: w-64<br/>Stage: flexible<br/>Pulse: w-80]

    DESKTOP -->|768px - 1023px<br/>Tablet| TABLET_LAYOUT[Adapted Layout<br/>Navigator: Drawer<br/>Stage: Full Width<br/>Pulse: Bottom or Drawer]

    DESKTOP -->|< 768px<br/>Mobile| MOBILE_LAYOUT[Stacked Layout<br/>Navigator: Drawer<br/>Stage: Full Width<br/>Pulse: Drawer<br/>Panels Collapsible]

    DESKTOP_LAYOUT --> DESKTOP_FEATURES[All Features<br/>Sticky Panels<br/>Full Navigation<br/>Real-time Logs]

    TABLET_LAYOUT --> TABLET_FEATURES[Adapted Features<br/>Collapsible Panels<br/>Touch Gestures<br/>Optimized Spacing]

    MOBILE_LAYOUT --> MOBILE_FEATURES[Mobile Optimized<br/>Drawer Navigation<br/>Touch-friendly<br/>Reduced Padding]

    style DESKTOP_LAYOUT fill:#9945ff,color:#fff
    style TABLET_LAYOUT fill:#06b6d4,color:#fff
    style MOBILE_LAYOUT fill:#14f195,color:#000
```

---

## 📝 Notes pour le Spécialiste UI/UX

### Points Clés à Retenir

1. **Trinity Layout** : Architecture principale avec 3 zones (Navigator, Stage, Pulse)
2. **UI Blocks Dynamiques** : 15 types de blocks générés par l'IA
3. **State Management** : Zustand store centralisé avec persistence localStorage
4. **Workflow** : Onboarding → Persona Selection → 6 Phases → Completion
5. **Récompenses** : XP, $MFAI tokens, NFTs (Proof-of-Skill™)
6. **Évaluations** : Multi-axis scoring (0-10), NFT si score ≥ 8.0
7. **Responsive** : 3 breakpoints (Desktop, Tablet, Mobile)
8. **Web3** : Intégration Solana pour wallet et minting NFT

### Priorités de Refonte

1. **JourneyWorkspace** (Complexité 28) : Extraire en sous-composants
2. **UIBlocksRenderer** (Complexité 27) : Simplifier renderBasicMarkdown
3. **Accessibilité** : Remplacer `role="button"` par `<button>`
4. **Mobile** : Améliorer l'expérience tactile

---

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

---

**Dernière mise à jour** : Décembre 2025
