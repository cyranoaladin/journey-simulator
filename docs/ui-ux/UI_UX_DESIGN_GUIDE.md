# 🎨 Guide UI/UX Complet - Money Factory AI Journey Simulator

*Documentation exhaustive pour spécialistes UI/UX*
*Version*: 1.0
*Dernière mise à jour*: Décembre 2025

---

## 📋 Table des Matières

1. [Vue d'ensemble du Projet](#vue-densemble-du-projet)
2. [Design System](#design-system)
3. [Architecture UI - Trinity Layout](#architecture-ui---trinity-layout)
4. [Composants UI Principaux](#composants-ui-principaux)
5. [UI Blocks Dynamiques](#ui-blocks-dynamiques)
6. [Flux Utilisateur Complets](#flux-utilisateur-complets)
7. [Personas & Parcours Visuels](#personas--parcours-visuels)
8. [États de l'Interface](#états-de-linterface)
9. [Animations & Transitions](#animations--transitions)
10. [Accessibilité](#accessibilité)
11. [Responsive Design](#responsive-design)
12. [Intégrations Web3](#intégrations-web3)
13. [Patterns d'Interaction](#patterns-dinteraction)
14. [Structure des Fichiers](#structure-des-fichiers)
15. [Recommandations pour la Refonte](#recommandations-pour-la-refonte)

---

## 1. Vue d'ensemble du Projet

### 1.1 Contexte Produit

Money Factory AI est une plateforme Web3 d'apprentissage gamifié qui combine :

- **IA Multi-Agents** : Orchestration Zyno avec 23 agents spécialisés
- **Blockchain** : Intégration Solana pour authentification et minting NFT
- **Parcours Personnalisés** : 6 personas avec 6 phases chacune (Learn → Build → Prove → Activate → Scale → Launch)

### 1.2 Stack Technique Frontend

- **Framework** : React 19.0.0 avec TypeScript 5.3.3
- **Build Tool** : Vite 4.5.14
- **Styling** : Tailwind CSS 3.3.5 (configuration custom)
- **State Management** : Zustand 4.4.1
- **Routing** : React Router 7.6.3
- **Animations** : Framer Motion 12.23.0
- **Icons** : Lucide React 0.556.0
- **Notifications** : Sonner 2.0.7 (toasts)
- **Wallet** : @solana/wallet-adapter (Phantom, Solflare, Torus)

### 1.3 Objectifs UX

- **Immersion** : Expérience immersive type "game-like" avec progression visible
- **Clarté** : Interface claire malgré la complexité du système multi-agents
- **Feedback** : Feedback immédiat et visuel pour toutes les actions
- **Accessibilité** : Conforme WCAG 2.1 AA minimum
- **Performance** : Temps de chargement < 2s, animations fluides 60fps

---

## 2. Design System

### 2.1 Palette de Couleurs

#### Couleurs Principales

```css
/* Deep Space (Background principal) */
--color-background: #050510;        /* Fond principal */
--color-surface: #0A0A1F;           /* Surfaces (cards, panels) */
--color-surface-alt: #0F172A;      /* Surfaces alternatives */
--color-surface-muted: #1E293B;    /* Surfaces atténuées */

/* Solana Brand Colors */
--color-solana-purple: #9945FF;    /* Primary accent */
--color-solana-green: #14F195;      /* Success, actions positives */
--color-electric-cyan: #00E5FF;     /* Accent cyan (accent-cyan) */

/* Accent Colors */
--color-accent-cyan: #06B6D4;      /* Cyan accent (utilisé pour highlights) */
--color-accent-gold: #FFD512;      /* Gold (warnings, achievements) */
--color-accent-purple: #9945FF;    /* Purple (primary actions) */

/* Semantic Colors */
--color-success: #14F195;           /* Solana Green */
--color-warning: #FFD512;           /* Gold/Yellow */
--color-danger: #FF4F4F;            /* Red (errors) */
--color-info: #00C2FF;              /* Info blue */

/* Text Colors */
--color-text: #F9FAFB;              /* Text principal (white) */
--color-text-muted: rgba(255, 255, 255, 0.6);  /* Text secondaire */
--color-text-disabled: rgba(255, 255, 255, 0.3); /* Text désactivé */
```

#### Gradients Persona-Specific

Chaque persona a son propre gradient pour l'identification visuelle :

| Persona | Gradient | Code Tailwind |
|---------|----------|---------------|
| Cognitive Activation Hub | Sky → Cyan | `from-sky-500 to-cyan-400` |
| Capital Foundry | Emerald → Teal | `from-emerald-500 to-teal-500` |
| System Architect | Purple → Indigo | `from-purple-500 to-indigo-500` |
| Experience Studio | Rose → Fuchsia | `from-rose-500 to-fuchsia-500` |
| Impact Engine | Amber → Lime | `from-amber-500 to-lime-500` |
| Resilience Master | Slate → Cyan | `from-slate-500 to-cyan-600` |

**Fichier de référence** : `journey-simulator/src/utils/personaStyles.ts`

### 2.2 Typographie

#### Fonts

```css
/* Display (Titres) */
font-family: 'Space Grotesk', sans-serif;
/* Utilisé pour : h1, h2, titres de sections, badges */

/* Body (Corps de texte) */
font-family: 'Inter', sans-serif;
/* Utilisé pour : paragraphes, labels, descriptions */
```

#### Hiérarchie Typographique

| Élément | Font | Size | Weight | Line Height | Usage |
|---------|------|------|--------|-------------|-------|
| H1 (Hero) | Space Grotesk | 4xl (2.25rem) | Bold (700) | 1.2 | Titres principaux |
| H2 (Section) | Space Grotesk | 2xl (1.5rem) | Bold (700) | 1.3 | Sections |
| H3 (Subsection) | Space Grotesk | xl (1.25rem) | Semibold (600) | 1.4 | Sous-sections |
| Body Large | Inter | base (1rem) | Regular (400) | 1.6 | Paragraphes importants |
| Body | Inter | sm (0.875rem) | Regular (400) | 1.5 | Texte standard |
| Small | Inter | xs (0.75rem) | Regular (400) | 1.4 | Labels, métadonnées |
| Tiny | Inter | [10px] | Medium (500) | 1.3 | Badges, tags |

#### Classes Tailwind Typography

```tsx
// Titres
className="text-4xl font-space font-bold"        // H1 Hero
className="text-2xl font-space font-bold"        // H2 Section
className="text-xl font-space font-semibold"     // H3 Subsection

// Corps
className="text-base font-sans"                  // Body large
className="text-sm font-sans"                     // Body standard
className="text-xs font-sans"                     // Small
className="text-[10px] font-sans font-medium"    // Tiny

// Couleurs texte
className="text-white"                            // Texte principal
className="text-white/60"                         // Texte secondaire (60% opacity)
className="text-white/40"                         // Texte désactivé (40% opacity)
className="text-accent-cyan"                      // Accent cyan
className="text-accent-purple"                    // Accent purple
```

### 2.3 Espacements (Spacing)

Système basé sur des multiples de 4px :

| Token | Value | Usage |
|-------|-------|-------|
| xs | 0.25rem (4px) | Espacements très serrés |
| sm | 0.5rem (8px) | Espacements serrés |
| base | 1rem (16px) | Espacements standard |
| md | 1.5rem (24px) | Espacements moyens |
| lg | 2rem (32px) | Espacements larges |
| xl | 3rem (48px) | Espacements très larges |
| 2xl | 4rem (64px) | Sections |

**Exemples** :

```tsx
className="p-4"        // padding: 1rem (16px)
className="gap-6"      // gap: 1.5rem (24px)
className="space-y-4"  // margin-top entre enfants: 1rem
className="mb-8"       // margin-bottom: 2rem (32px)
```

### 2.4 Bordures & Rayons

```css
/* Border Radius */
border-radius: 0.5rem;    /* rounded-lg */
border-radius: 0.75rem;   /* rounded-xl */
border-radius: 1rem;      /* rounded-2xl */
border-radius: 1.5rem;    /* rounded-3xl */
border-radius: 9999px;    /* rounded-full (pills, badges) */

/* Borders */
border: 1px solid rgba(255, 255, 255, 0.1);     /* border-white/10 */
border: 1px solid rgba(255, 255, 255, 0.2);     /* border-white/20 */
border: 1px solid rgba(6, 182, 212, 0.5);       /* border-accent-cyan/50 */
```

### 2.5 Ombres & Effets

#### Box Shadows

```css
/* Glow Effects */
box-shadow: 0 0 25px rgba(165, 99, 245, 0.25);           /* shadow-glow */
box-shadow: 0 0 30px rgba(34, 211, 238, 0.6);          /* Cyan glow (actif) */
box-shadow: 0 0 24px rgba(34, 211, 238, 0.12);          /* Cyan glow (hover) */
box-shadow: inset 0 0 20px rgba(165, 99, 245, 0.15);    /* inner-glow */

/* Glass Morphism */
box-shadow: 0 8px 32px rgba(13, 11, 31, 0.35);          /* shadow-glass */
backdrop-filter: blur(24px);                             /* Glass effect */

/* Neon Ring */
box-shadow: 0 0 40px rgba(165, 99, 245, 0.35);          /* neon-ring */

/* Halo Soft */
box-shadow: 0 18px 48px rgba(12, 17, 39, 0.55);         /* halo-soft */
```

#### Classes Utilitaires

```tsx
// Glass morphism
className="backdrop-blur supports-[backdrop-filter]:bg-[#0A0A1F]/80"

// Neon border effect
className="border border-accent-cyan/50 shadow-[0_0_30px_rgba(34,211,238,0.6)]"

// Glow on hover
className="hover:shadow-[0_0_24px_rgba(34,211,238,0.12)]"
```

### 2.6 Composants de Design System

#### Card Surface

```tsx
// Classe utilitaire : .card-surface
className="card-surface"
// Équivalent à :
// backgroundColor: var(--color-card)
// borderRadius: 2rem
// border: 1px solid var(--color-border)
// boxShadow: shadow-glass
// backdropFilter: blur(24px)
```

#### Neon Border

```tsx
// Classe utilitaire : .neon-border
className="neon-border"
// Ajoute un effet de bordure néon animée au hover
```

#### Inset Panel

```tsx
// Classe utilitaire : .inset-panel
className="inset-panel"
// Panel avec gradient et ombre halo-soft
```

---

## 3. Architecture UI - Trinity Layout

### 3.1 Concept

Le **Trinity Layout** est l'architecture principale de l'interface, divisée en trois zones distinctes :

```
┌─────────────────────────────────────────────────────────┐
│                    HEADER (Sticky)                      │
├──────────┬──────────────────────────────┬───────────────┤
│          │                              │               │
│ NAVIGATOR│      THE STAGE (Center)     │  ZYNO PULSE   │
│  (Left)  │                              │   (Right)     │
│          │  - UI Blocks                 │  - Agent Logs │
│  - Phase │  - Artifacts                │  - Actions    │
│  Progress│  - Missions                  │  - Metrics    │
│  - Map   │  - Quizzes                   │               │
│          │  - Resources                 │               │
│          │                              │               │
└──────────┴──────────────────────────────┴───────────────┘
```

### 3.2 Navigator (Left Panel)

**Fichier** : `journey-simulator/src/components/Journey/JourneyWorkspace.tsx` (lignes ~1168-1185)

**Composants** :

- `JourneyProgressBar` : Barre de progression globale
- `JourneyTimeline` : Timeline des phases avec états (completed/current/locked)

**Largeur** :

- Desktop : `w-64` (256px) ou `w-80` (320px)
- Mobile : Collapsible en drawer

**États** :

- **Collapsed** : Icône uniquement, largeur minimale
- **Expanded** : Panneau complet avec progression

**Fonctionnalités** :

- Navigation entre phases
- Indication visuelle de la phase actuelle
- Verrouillage/déverrouillage des phases
- Progression XP visible

### 3.3 The Stage (Center)

**Fichier** : `journey-simulator/src/components/Journey/JourneyWorkspace.tsx` (lignes ~810-1165)

**Composants Principaux** :

- `UIBlocksRenderer` : Rendu dynamique des UI Blocks
- `ArtifactModal` : Modal pour visualiser les artefacts
- `NeuralOverlay` : Overlay pour la génération d'artefacts
- Zone de preview des artefacts (iframe)

**Structure** :

```tsx
<div className="mx-auto w-full max-w-[1200px]">
  {/* Phase Header */}
  <PhaseSection />

  {/* UI Blocks (dynamiques) */}
  <UIBlocksRenderer response={lastStep} />

  {/* Artifacts Panel */}
  <ArtifactsPanel />
</div>
```

**Largeur** : `max-w-[1200px]` (centré)

**Responsive** :

- Desktop : Largeur fixe centrée
- Tablet : Padding réduit
- Mobile : Full width avec padding

### 3.4 Zyno Pulse (Right Panel)

**Fichier** : `journey-simulator/src/components/Journey/ZynoSignalSidebar.tsx`

**Composants** :

- `JourneyNextActionsPanel` : Actions suggérées
- `ZynoSignalSidebar` : Console agentique avec logs

**Largeur** :

- Desktop : `w-80` (320px) ou `w-96` (384px)
- Mobile : Collapsible en drawer

**Contenu** :

- Logs des agents en temps réel
- Actions suggérées (AEPO/AECO)
- Métriques de progression
- Feedback des agents

**Sticky** : `lg:sticky lg:top-24` (reste visible au scroll)

### 3.5 Header (Sticky)

**Fichier** : `journey-simulator/src/components/Journey/JourneyWorkspace.tsx` (lignes ~737-805)

**Structure** :

```tsx
<header className="sticky top-0 z-50 h-16 border-b border-white/10 bg-[#0A0A1F]/95 backdrop-blur">
  {/* Left: Back button */}
  <BackButton />

  {/* Center: Persona title + badge */}
  <PersonaTitle />

  {/* Right: Controls (panels toggle, wallet, etc.) */}
  <HeaderControls />
</header>
```

**Fonctionnalités** :

- Toggle left/right panels
- Focus mode (masque les panels)
- Wallet connection status
- Navigation back

**Z-index** : `z-50` (toujours au-dessus)

---

## 4. Composants UI Principaux

### 4.1 JourneyWorkspace

**Fichier** : `journey-simulator/src/components/Journey/JourneyWorkspace.tsx`
**Lignes** : 1-1277
**Complexité Cognitive** : 28 (à réduire à < 15)

**Responsabilités** :

- Orchestration du layout Trinity
- Gestion de l'état local (artefacts, panels, etc.)
- Intégration avec le store Zustand
- Gestion des interactions utilisateur

**Props** :

```typescript
interface JourneyWorkspaceProps {
  onBack?: () => void;
}
```

**État Local** :

```typescript
const [isThinking, setIsThinking] = useState(false);
const [currentTask, setCurrentTask] = useState({ agent: '', task: '' });
const [viewingArtifact, setViewingArtifact] = useState<any>(null);
const [selectedArtifactKey, setSelectedArtifactKey] = useState<string | null>(null);
const [unlockedArtifacts, setUnlockedArtifacts] = useState<string[]>([]);
const [isAutoSimulating, setIsAutoSimulating] = useState(false);
const [leftPanelOpen, setLeftPanelOpen] = useState(true);
const [rightPanelOpen, setRightPanelOpen] = useState(true);
const [focusMode, setFocusMode] = useState(false);
```

**Points d'Attention pour Refonte** :

- Complexité cognitive élevée (28) → Extraire des sous-composants
- Logique métier mélangée avec UI → Séparer en hooks custom
- Gestion d'état complexe → Simplifier avec useReducer si nécessaire

### 4.2 UIBlocksRenderer

**Fichier** : `journey-simulator/src/components/UIBlocks/UIBlocksRenderer.tsx`
**Lignes** : 1-1146

**Responsabilités** :

- Rendu dynamique de tous les types de UI Blocks
- Gestion des interactions spécifiques à chaque block
- Conversion markdown → HTML pour les text blocks

**Types de Blocks Supportés** :

| Type | Composant | Description |
|------|-----------|-------------|
| `text_block` | `<Text />` | Contenu markdown formaté |
| `checklist_block` | `<Checklist />` | Liste de tâches avec checkboxes |
| `quiz_block` | `<Quiz />` | Questions à choix multiples |
| `mission_block` | `<Mission />` | Mission avec soumission de livrable |
| `resource_block` | `<Resources />` | Liste de ressources (articles, vidéos, etc.) |
| `document_block` | `<Document />` | Document markdown complet |
| `evaluation_block` | `<Evaluation />` | Évaluation multi-axes avec scores |
| `action_suggestions_block` | `<ActionSuggestions />` | Suggestions d'actions suivantes |
| `xp_block` | `<Xp />` | Affichage de progression XP |
| `diagram_block` | `<Diagram />` | Diagrammes Mermaid |
| `dao_dashboard_block` | `<DAODashboard />` | Dashboard de gouvernance |
| `project_selection_block` | `<ProjectSelection />` | Sélection de projet |
| `narrative_choice_block` | `<NarrativeChoice />` | Choix narratifs |
| `indicator_block` | `<IndicatorBlock />` | Indicateurs visuels |
| `interactive_template_block` | `<InteractiveTemplate />` | Templates interactifs (one-pager, pitch-deck, etc.) |

**Exemple d'Usage** :

```tsx
<UIBlocksRenderer response={lastStep} />
// lastStep.ui_blocks est un tableau de UIBlock[]
```

**Points d'Attention pour Refonte** :

- `renderBasicMarkdown` a une complexité de 27 → Extraire en fonctions plus petites
- Gestion des états de chaque block → Centraliser dans un contexte si nécessaire
- Accessibilité des formulaires → Vérifier labels, ARIA, keyboard navigation

### 4.3 JourneyCard

**Fichier** : `journey-simulator/src/components/Journey/JourneyCard.tsx`

**Usage** : Affichage d'une carte persona dans la liste des journeys

**Props** :

```typescript
interface JourneyCardProps {
  persona: Persona;
  progress: number; // 0-100
  onSelect: () => void;
}
```

**Design** :

- Gradient persona-specific en background
- Icône persona en haut
- Titre et description
- Barre de progression
- Badge de statut (locked/completed/available)

**États Visuels** :

- **Available** : Carte cliquable, gradient visible
- **Locked** : Opacité réduite, overlay "locked"
- **Completed** : Badge "Completed", confetti possible
- **Current** : Border accent-cyan, glow effect

### 4.4 JourneyProgressBar

**Fichier** : `journey-simulator/src/components/Journey/JourneyProgressBar.tsx`

**Usage** : Barre de progression horizontale avec phases

**Design** :

- Barre continue avec segments pour chaque phase
- Icônes pour chaque phase (Check/Zap/Number)
- Tooltips au hover
- Animation de progression

**États des Phases** :

- **Completed** : Check icon, couleur success
- **Current** : Zap icon, glow cyan, pulse animation
- **Locked** : Number, couleur muted

### 4.5 JourneyTimeline

**Fichier** : `journey-simulator/src/components/Journey/JourneyTimeline.tsx`

**Usage** : Timeline verticale des phases

**Design** :

- Timeline verticale avec connecteurs
- Carte pour chaque phase
- Indicateurs visuels (completed/current/locked)
- Cliquable pour navigation

### 4.6 Modals

#### CertificationModal

**Fichier** : `journey-simulator/src/components/CertificationModal.tsx`

**Usage** : Affichage des détails de certification NFT

**Contenu** :

- Image NFT
- Titre et description
- Métadonnées (phase, persona, date)
- Actions : Mint, Share, Close

#### NFTMintingModal

**Fichier** : `journey-simulator/src/components/NFTMintingModal.tsx`

**Usage** : Processus de minting NFT

**Étapes** :

1. Confirmation (preview NFT)
2. Wallet connection (si nécessaire)
3. Transaction signing
4. Confirmation (success/error)

#### StakingModal

**Fichier** : `journey-simulator/src/components/StakingModal.tsx`

**Usage** : Interface de staking $MFAI

**Champs** :

- Amount input
- Voting power preview
- Confirm button

#### DAOVoteModal

**Fichier** : `journey-simulator/src/components/DAOVoteModal.tsx`

**Usage** : Vote sur une proposition DAO

**Options** :

- For / Against / Abstain
- Commentaire optionnel
- Confirmation

---

## 5. UI Blocks Dynamiques

### 5.1 Architecture

Les UI Blocks sont générés dynamiquement par l'orchestrateur Zyno et rendus par `UIBlocksRenderer`. Chaque block a un `id` unique et un `kind` qui détermine le composant à utiliser.

### 5.2 Text Block

**Type** : `TextBlock`

**Structure** :

```typescript
{
  kind: 'text_block';
  id: string;
  title: string;
  body_markdown: string; // Markdown formaté
}
```

**Rendu** :

- Conversion markdown → HTML via `renderBasicMarkdown`
- Support : headers (h1-h3), lists, paragraphs, emphasis
- Styling : Typography plugin Tailwind

### 5.3 Quiz Block

**Type** : `QuizBlock`

**Structure** :

```typescript
{
  kind: 'quiz_block';
  id: string;
  title: string;
  questions: QuizQuestion[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
}
```

**Interactions** :

- Sélection d'option (radio buttons)
- Validation au submit
- Feedback immédiat (correct/incorrect)
- Affichage de l'explication

**Design** :

- Options avec hover effect
- Correct : border green, check icon
- Incorrect : border red, X icon
- Explanation en dessous

### 5.4 Mission Block

**Type** : `MissionBlock`

**Structure** :

```typescript
{
  kind: 'mission_block';
  id: string;
  title: string;
  description: string;
  mission_type: string;
  expected_input_type: 'text' | 'markdown_document' | 'code_snippet' | 'link' | 'choice';
  xp_reward: number;
  nft_reward_id?: string;
  is_mandatory?: boolean;
}
```

**Interactions** :

- Textarea pour soumission
- Upload de fichier (si markdown_document)
- Submit button
- Loading state pendant évaluation
- Résultat avec score et feedback

**Design** :

- Card avec border accent
- XP reward visible
- NFT reward preview si éligible
- Progress indicator pendant traitement

### 5.5 Resource Block

**Type** : `ResourceBlock`

**Structure** :

```typescript
{
  kind: 'resource_block';
  id: string;
  title: string;
  resources: ResourceItem[];
}

interface ResourceItem {
  id: string;
  label: string;
  description?: string;
  url?: string;
  resource_type: 'article' | 'video' | 'template' | 'code_snippet' | 'checklist' | 'tool_link' | 'flashcard';
  agent_owner: string;
}
```

**Design** :

- Liste de cartes ressources
- Icône selon type
- Badge "agent_owner"
- Lien externe ou modal

### 5.6 Evaluation Block

**Type** : `EvaluationBlock`

**Structure** :

```typescript
{
  kind: 'evaluation_block';
  id: string;
  title: string;
  global_score: number; // 0-10
  max_score: number;
  feedback: string;
  axes: EvaluationAxis[];
}

interface EvaluationAxis {
  name: string;
  score: number;
  max_score: number;
  comment: string;
}
```

**Design** :

- Score global en grand (ex: 8.5/10)
- Barres de progression pour chaque axe
- Commentaires détaillés
- Couleur selon score (green/yellow/red)

---

## 6. Flux Utilisateur Complets

### 6.1 Onboarding Flow

**Fichier** : `journey-simulator/src/components/onboarding/OnboardingFlow.tsx`

**Étapes** :

1. **Landing Page** (`HeroSection.tsx`)
   - Présentation du produit
   - CTA "Get Started"
   - Wallet connection optionnelle

2. **Login/Register** (`LoginPage.tsx`, `RegisterPage.tsx`)
   - Email/password ou Wallet
   - Demo mode (token: 'demo-token')

3. **Persona Selection** (`JourneysPage.tsx`)
   - Grille de 6 personas
   - Preview de chaque persona
   - Sélection → Redirection vers JourneyWorkspace

### 6.2 Journey Execution Flow

**Fichier** : `journey-simulator/src/components/Journey/JourneyWorkspace.tsx`

**Flux Principal** :

```
1. User arrive sur JourneyWorkspace
   ↓
2. Affichage de la phase actuelle (PhaseSection)
   ↓
3. UI Blocks rendus (UIBlocksRenderer)
   ↓
4. User interagit avec un block (Quiz, Mission, etc.)
   ↓
5. Soumission → API call (runInteractiveStep)
   ↓
6. Loading state (isStepLoading = true)
   ↓
7. Réponse avec nouveaux UI Blocks
   ↓
8. Mise à jour de l'interface
   ↓
9. Si phase complète → Phase suivante
   ↓
10. Si toutes phases complètes → JourneyCompletedPage
```

**États Intermédiaires** :

- **Thinking** : Animation "Zyno is thinking..." avec spinner
- **Loading** : Skeleton loaders pour les blocks
- **Error** : Toast error + retry option
- **Success** : Confetti + toast success

### 6.3 Artifact Flow

**Fichier** : `journey-simulator/src/components/Artifacts/ArtifactModal.tsx`

**Flux** :

```
1. Artifact généré par agent
   ↓
2. NeuralOverlay apparaît (animation)
   ↓
3. Artifact ajouté à la liste (ArtifactsPanel)
   ↓
4. User clique sur artifact
   ↓
5. ArtifactModal s'ouvre
   ↓
6. Preview (iframe si HTML, download si autre)
   ↓
7. Actions : Download, Share, Close
```

### 6.4 NFT Minting Flow

**Fichier** : `journey-simulator/src/components/NFTMintingModal.tsx`

**Flux** :

```
1. User complète une phase avec score ≥ 8.0/10
   ↓
2. CertificationModal s'affiche
   ↓
3. User clique "Mint NFT"
   ↓
4. NFTMintingModal s'ouvre
   ↓
5. Wallet connection (si non connecté)
   ↓
6. Preview NFT metadata
   ↓
7. User confirme → Transaction signing
   ↓
8. Minting en cours (loading)
   ↓
9. Success → Confetti + transaction link
   ↓
10. Error → Retry option
```

### 6.5 Staking Flow

**Fichier** : `journey-simulator/src/components/StakingModal.tsx`

**Flux** :

```
1. User clique "Stake $MFAI"
   ↓
2. StakingModal s'ouvre
   ↓
3. Input amount
   ↓
4. Preview voting power (amount * 2)
   ↓
5. Confirm → Transaction
   ↓
6. Success → Toast + update UI
```

### 6.6 DAO Voting Flow

**Fichier** : `journey-simulator/src/components/DAOVoteModal.tsx`

**Flux** :

```
1. User voit une proposition DAO
   ↓
2. Clique "Vote"
   ↓
3. DAOVoteModal s'ouvre
   ↓
4. Sélection : For / Against / Abstain
   ↓
5. Commentaire optionnel
   ↓
6. Submit → Transaction
   ↓
7. Success → Toast + update proposal
```

---

## 7. Personas & Parcours Visuels

### 7.1 Les 6 Personas

**Fichier Source** : `journey-simulator/src/data/personas.ts`

#### 1. Cognitive Activation Hub 🧠

- **Couleur** : Sky → Cyan (`from-sky-500 to-cyan-400`)
- **Icône** : 🧠
- **Cible** : Nouveaux venus dans Web3
- **Focus** : Fondamentaux Web3, Solana, tokenomics

#### 2. Capital Foundry 💰

- **Couleur** : Emerald → Teal (`from-emerald-500 to-teal-500`)
- **Icône** : 💰
- **Cible** : DeFi builders, protocol designers
- **Focus** : Infrastructure DeFi Solana, protocoles

#### 3. System Architect 🧩

- **Couleur** : Purple → Indigo (`from-purple-500 to-indigo-500`)
- **Icône** : 🧩
- **Cible** : Infra engineers, DePIN builders
- **Focus** : Architecture, scaling, production

#### 4. Experience Studio 🎨

- **Couleur** : Rose → Fuchsia (`from-rose-500 to-fuchsia-500`)
- **Icône** : 🎨
- **Cible** : Product/UX designers, creators
- **Focus** : Design d'expérience, NFT systems, community

#### 5. Impact Engine 🌱

- **Couleur** : Amber → Lime (`from-amber-500 to-lime-500`)
- **Icône** : 🌱
- **Cible** : DAO operators, governance builders
- **Focus** : Gouvernance, réputation, coordination

#### 6. Resilience Master 🛡️

- **Couleur** : Slate → Cyan (`from-slate-500 to-cyan-600`)
- **Icône** : 🛡️
- **Cible** : Security/audit profiles
- **Focus** : Sécurité, résilience, audit

### 7.2 Structure des Phases

Chaque persona a **6 phases** :

1. **Learn** (Phase 1) : Fondamentaux, orientation
2. **Build** (Phase 2) : Construction pratique
3. **Prove** (Phase 3) : Validation, preuve de compétence
4. **Activate** (Phase 4) : Activation, déploiement
5. **Scale** (Phase 5) : Scaling, expansion
6. **Launch** (Phase 6) : Launch via Collaterize (simulation)

**Propriétés d'une Phase** :

```typescript
{
  id: string;                    // Identifiant unique
  title: string;                 // Titre de la phase
  description: string;            // Description
  mission: string;                // Mission principale
  duration: string;               // Durée estimée (ex: "1 week")
  xpReward: number;              // XP gagné
  mfaiReward: number;            // $MFAI gagné
  nftReward: string;             // NFT éligible
  tools: string[];               // Outils recommandés
  outcomes: string[];            // Résultats attendus
  zynoTip: string;               // Conseil Zyno
  stakingRequired?: number;      // Staking requis (optionnel)
  daoVoteRequired?: boolean;     // Vote DAO requis (optionnel)
}
```

### 7.3 Représentation Visuelle

**JourneyCard** :

- Gradient persona en background
- Icône persona
- Titre et description
- Barre de progression
- Badge de statut

**JourneyWorkspace Header** :

- Titre persona centré
- Badge avec gradient persona
- Navigation back

**Phase Cards** :

- Border avec couleur persona au hover
- Icône de phase
- Statut visuel (completed/current/locked)

---

## 8. États de l'Interface

### 8.1 États de Chargement

#### Skeleton Loaders

**Fichier** : `journey-simulator/src/components/shared/Skeleton.tsx`

**Usage** :

```tsx
<Skeleton className="h-8 w-full" />           // Barre
<Skeleton className="h-32 w-32 rounded-xl" /> // Card
```

**Design** :

- Background : `bg-white/5`
- Animation : `shimmer` (gradient animé)
- Border radius selon contexte

#### Spinners

**Composant** : `Loader2` de Lucide React

**Usage** :

```tsx
<Loader2 className="animate-spin text-accent-cyan" size={24} />
```

**Variantes** :

- Small : `size={16}`
- Medium : `size={24}`
- Large : `size={32}`

#### Thinking State

**Fichier** : `journey-simulator/src/components/Journey/JourneyWorkspace.tsx` (ligne ~84)

**Affichage** :

```tsx
{isThinking && (
  <div className="flex items-center gap-2 text-accent-cyan">
    <Loader2 className="animate-spin" size={20} />
    <span>Zyno is thinking...</span>
  </div>
)}
```

### 8.2 États d'Erreur

#### Toast Errors

**Bibliothèque** : Sonner (`toast.error()`)

**Usage** :

```tsx
toast.error('Failed to submit mission', {
  description: 'Please try again',
  action: {
    label: 'Retry',
    onClick: () => handleRetry()
  }
});
```

#### Error States dans les Composants

**Pattern** :

```tsx
{error && (
  <div className="rounded-xl border border-danger/50 bg-danger/10 p-4">
    <p className="text-danger font-semibold">{error}</p>
    <button onClick={handleRetry}>Retry</button>
  </div>
)}
```

### 8.3 États de Succès

#### Confetti

**Bibliothèque** : `canvas-confetti` ou `react-confetti`

**Usage** :

```tsx
import confetti from 'canvas-confetti';

// Au succès
confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 }
});
```

**Composant Lazy** : `journey-simulator/src/components/shared/LazyConfetti.tsx`

#### Success Toasts

```tsx
toast.success('Phase completed!', {
  description: `You earned ${xpReward} XP`,
  duration: 5000
});
```

### 8.4 États Vides (Empty States)

**Pattern** :

```tsx
{items.length === 0 && (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <FileText size={48} className="text-white/20 mb-4" />
    <p className="text-white/60">No artifacts yet</p>
    <p className="text-sm text-white/40 mt-2">
      Complete missions to unlock artifacts
    </p>
  </div>
)}
```

**Composants avec Empty States** :

- ArtifactsPanel
- ResourcesPanel
- AgentLogs (si aucun log)

---

## 9. Animations & Transitions

### 9.1 Framer Motion

**Bibliothèque** : Framer Motion 12.23.0

**Usage Principal** : `JourneysPage.tsx` pour les animations de cartes

**Exemple** :

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {content}
</motion.div>
```

### 9.2 Animations CSS (Tailwind)

**Keyframes définis** dans `tailwind.config.js` :

| Animation | Keyframe | Usage |
|-----------|----------|-------|
| `fadeIn` | Opacity 0 → 1 | Apparition douce |
| `slideIn` | TranslateY + Opacity | Slide depuis le bas |
| `levitate` | TranslateY oscillation | Effet de lévitation |
| `glow-pulse` | Box-shadow pulse | Glow pulsant |
| `shimmer` | Background position | Skeleton loaders |
| `tilt-bounce` | Rotate3d | Effet 3D subtil |

**Usage** :

```tsx
className="animate-fadeIn"
className="animate-slideIn"
className="animate-levitate"
className="animate-glow-pulse"
```

### 9.3 Transitions

**Pattern Standard** :

```tsx
className="transition hover:bg-white/10"
className="transition-colors duration-200"
className="transition-all duration-300 ease-out"
```

**Transitions Spécifiques** :

- **Hover** : `hover:bg-white/10 hover:border-white/20`
- **Focus** : `focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2`
- **Active** : `active:scale-95` (pour les boutons)

### 9.4 Micro-interactions

#### Button Hover

```tsx
<button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_24px_rgba(34,211,238,0.12)]">
  Click me
</button>
```

#### Card Hover

```tsx
<div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-accent-cyan/50 hover:bg-accent-cyan/10 hover:shadow-[0_0_24px_rgba(34,211,238,0.12)]">
  {content}
</div>
```

#### Pulse Effect (Current Phase)

```tsx
{isCurrent && (
  <div className="absolute inset-0 rounded-full border border-accent-cyan animate-ping opacity-20" />
)}
```

---

## 10. Accessibilité

### 10.1 Standards

**Conformité** : WCAG 2.1 AA (objectif)

### 10.2 Éléments Sémantiques

**Problèmes Actuels** (à corriger) :

- Certains `role="button"` au lieu de `<button>`
- Labels manquants sur certains inputs
- Focus management à améliorer

**Bonnes Pratiques** :

```tsx
// ✅ Bon
<button onClick={handleClick} aria-label="Close modal">
  <X size={20} />
</button>

// ❌ À éviter
<div role="button" onClick={handleClick}>
  <X size={20} />
</div>
```

### 10.3 Keyboard Navigation

**Tab Order** : Doit être logique et prévisible

**Shortcuts** (à implémenter) :

- `Esc` : Fermer modals
- `Enter` : Soumettre formulaires
- `Arrow keys` : Navigation dans les listes

### 10.4 ARIA Labels

**Exemples** :

```tsx
<button aria-label={`Select ${persona.title}`}>
  <PersonaCard persona={persona} />
</button>

<div role="status" aria-live="polite">
  {loading && "Loading..."}
</div>
```

### 10.5 Contrast Ratios

**Vérifications** :

- Text white sur background dark : ✅ (contrast élevé)
- Text white/60 sur background : ⚠️ Vérifier ratio 4.5:1
- Accent colors : ✅ (cyan, purple bien visibles)

---

## 11. Responsive Design

### 11.1 Breakpoints (Tailwind)

| Breakpoint | Value | Usage |
|------------|-------|-------|
| `sm` | 640px | Tablets portrait |
| `md` | 768px | Tablets landscape |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |

### 11.2 Layout Adaptations

#### Desktop (≥ 1024px)

```
┌──────────┬──────────────────┬──────────┐
│ Navigator│   The Stage      │ Zyno Pulse│
│ (256px)  │   (flexible)     │ (320px)  │
└──────────┴──────────────────┴──────────┘
```

#### Tablet (768px - 1023px)

```
┌──────────────────────────────┐
│         HEADER                │
├──────────┬────────────────────┤
│ Navigator│   The Stage         │
│ (drawer) │   (full width)     │
└──────────┴────────────────────┘
│      Zyno Pulse (bottom)      │
└──────────────────────────────┘
```

#### Mobile (< 768px)

```
┌──────────────────┐
│     HEADER        │
├──────────────────┤
│                  │
│   The Stage      │
│   (full width)   │
│                  │
├──────────────────┤
│ Navigator (drawer)│
├──────────────────┤
│ Zyno Pulse (drawer)│
└──────────────────┘
```

### 11.3 Composants Responsive

**JourneyWorkspace** :

- Panels collapsibles en mobile
- Stack vertical en mobile
- Padding réduit : `px-4` mobile, `px-6` desktop

**JourneyCard** :

- Grid : `grid-cols-1` mobile, `grid-cols-2` tablet, `grid-cols-3` desktop

**UI Blocks** :

- Full width en mobile
- Max-width centré en desktop

---

## 12. Intégrations Web3

### 12.1 Wallet Connection

**Bibliothèque** : `@solana/wallet-adapter-react`

**Composants** :

- `WalletButton.tsx` : Bouton de connexion
- `WalletStatusDisplay.tsx` : Affichage du statut
- `WalletConnectionGuide.tsx` : Guide pour nouveaux utilisateurs

**Flow** :

```
1. User clique "Connect Wallet"
   ↓
2. Modal avec liste de wallets (Phantom, Solflare, etc.)
   ↓
3. User sélectionne wallet
   ↓
4. Wallet extension s'ouvre
   ↓
5. User approuve connexion
   ↓
6. Adresse wallet affichée dans header
```

**États** :

- **Not Connected** : Bouton "Connect Wallet"
- **Connecting** : Spinner + "Connecting..."
- **Connected** : Adresse tronquée (ex: `7xKX...9mN2`)
- **Error** : Toast error + retry

### 12.2 Wallet Button

**Fichier** : `journey-simulator/src/components/WalletButton.tsx`

**Design** :

- Badge avec icône wallet
- Adresse tronquée si connecté
- Dropdown avec actions (disconnect, copy address)

### 12.3 Transaction Signing

**Pattern** :

```tsx
const handleSign = async () => {
  try {
    setIsSigning(true);
    const signature = await wallet.signTransaction(transaction);
    // Process signature
  } catch (error) {
    toast.error('Transaction cancelled');
  } finally {
    setIsSigning(false);
  }
};
```

**UI Feedback** :

- Loading state pendant signature
- Success toast avec lien explorer
- Error toast avec message clair

---

## 13. Patterns d'Interaction

### 13.1 Modals

**Pattern Standard** :

```tsx
const [isOpen, setIsOpen] = useState(false);

{isOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="relative rounded-2xl border border-white/10 bg-[#0A0A1F] p-6 max-w-2xl w-full mx-4">
      <button
        onClick={() => setIsOpen(false)}
        className="absolute top-4 right-4 text-white/60 hover:text-white"
        aria-label="Close"
      >
        <X size={20} />
      </button>
      {content}
    </div>
  </div>
)}
```

**Z-index Hierarchy** :

- Modal backdrop : `z-50`
- Modal content : `z-50`
- Header : `z-50`
- Dropdowns : `z-40`

### 13.2 Toasts (Notifications)

**Bibliothèque** : Sonner 2.0.7

**Usage** :

```tsx
import { toast } from 'sonner';

toast.success('Success!');
toast.error('Error occurred');
toast.info('Information');
toast.warning('Warning');
```

**Position** : Top-right par défaut

**Duration** : 4s par défaut (configurable)

### 13.3 Dropdowns

**Pattern** :

```tsx
const [isOpen, setIsOpen] = useState(false);

<div className="relative">
  <button onClick={() => setIsOpen(!isOpen)}>
    Trigger
  </button>
  {isOpen && (
    <div className="absolute top-full right-0 mt-2 rounded-xl border border-white/10 bg-[#0A0A1F] p-2 min-w-[200px] z-40">
      {options}
    </div>
  )}
</div>
```

### 13.4 Tabs

**Pattern** (si nécessaire) :

```tsx
const [activeTab, setActiveTab] = useState(0);

<div className="flex gap-2 border-b border-white/10">
  {tabs.map((tab, index) => (
    <button
      key={index}
      onClick={() => setActiveTab(index)}
      className={`px-4 py-2 border-b-2 transition ${
        activeTab === index
          ? 'border-accent-cyan text-accent-cyan'
          : 'border-transparent text-white/60'
      }`}
    >
      {tab.label}
    </button>
  ))}
</div>
```

### 13.5 Accordions

**Pattern** :

```tsx
const [isOpen, setIsOpen] = useState(false);

<div className="border border-white/10 rounded-xl overflow-hidden">
  <button
    onClick={() => setIsOpen(!isOpen)}
    className="w-full flex items-center justify-between p-4"
  >
    <span>{title}</span>
    <ChevronDown className={`transition ${isOpen ? 'rotate-180' : ''}`} />
  </button>
  {isOpen && (
    <div className="p-4 border-t border-white/10">
      {content}
    </div>
  )}
</div>
```

---

## 14. Structure des Fichiers

### 14.1 Organisation

```
journey-simulator/
├── src/
│   ├── components/
│   │   ├── Journey/              # Composants spécifiques aux journeys
│   │   │   ├── JourneyWorkspace.tsx    # Composant principal (1277 lignes)
│   │   │   ├── JourneyCard.tsx
│   │   │   ├── JourneyProgressBar.tsx
│   │   │   ├── JourneyTimeline.tsx
│   │   │   └── ...
│   │   ├── UIBlocks/            # Rendu des UI Blocks dynamiques
│   │   │   └── UIBlocksRenderer.tsx    # Renderer principal (1146 lignes)
│   │   ├── Artifacts/           # Gestion des artefacts
│   │   ├── Zyno/                # Composants liés à Zyno
│   │   ├── layout/              # Layouts
│   │   ├── shared/              # Composants réutilisables
│   │   └── ...
│   ├── data/
│   │   ├── personas.ts          # Définition des 6 personas
│   │   ├── proofsData.ts        # Données des proofs NFT
│   │   └── resources.ts         # Ressources disponibles
│   ├── store/
│   │   └── journeyStore.ts      # Store Zustand principal
│   ├── types/
│   │   ├── journey.ts           # Types TypeScript
│   │   └── uiBlocks.ts          # Types des UI Blocks
│   ├── utils/
│   │   ├── personaStyles.ts     # Styles persona-specific
│   │   ├── api.ts               # Client API
│   │   └── ...
│   └── ...
├── tailwind.config.js           # Configuration Tailwind
└── ...
```

### 14.2 Composants Clés à Connaître

| Composant | Fichier | Lignes | Complexité | Priorité Refonte |
|-----------|---------|--------|------------|-----------------|
| JourneyWorkspace | `Journey/JourneyWorkspace.tsx` | 1277 | 28 | 🔴 Haute |
| UIBlocksRenderer | `UIBlocks/UIBlocksRenderer.tsx` | 1146 | 27 | 🔴 Haute |
| JourneyCard | `Journey/JourneyCard.tsx` | ~300 | 8 | 🟡 Moyenne |
| JourneyProgressBar | `Journey/JourneyProgressBar.tsx` | ~125 | 5 | 🟢 Basse |
| JourneyTimeline | `Journey/JourneyTimeline.tsx` | ~200 | 6 | 🟢 Basse |

---

## 15. Recommandations pour la Refonte

### 15.1 Priorités

#### 🔴 Critique (Complexité élevée)

1. **JourneyWorkspace** (Complexité 28)
   - **Problème** : Trop de responsabilités, logique métier mélangée
   - **Solution** : Extraire en sous-composants :
     - `JourneyHeader`
     - `JourneyStage` (center panel)
     - `JourneyNavigator` (left panel)
     - `JourneySidebar` (right panel)
   - **Hooks custom** : `useArtifacts`, `useJourneyState`, `useAutoSimulation`

2. **UIBlocksRenderer** (Complexité 27)
   - **Problème** : `renderBasicMarkdown` trop complexe
   - **Solution** : Extraire en fonctions plus petites :
     - `parseMarkdownHeaders`
     - `parseMarkdownLists`
     - `parseMarkdownParagraphs`
   - **Composants** : Un composant par type de block (déjà fait, mais améliorer)

#### 🟡 Important (Améliorations UX)

1. **Accessibilité**
   - Remplacer tous les `role="button"` par de vrais `<button>`
   - Ajouter `aria-labels` partout
   - Améliorer le focus management
   - Ajouter des shortcuts clavier

2. **Responsive Design**
   - Améliorer l'expérience mobile
   - Drawers pour les panels en mobile
   - Touch gestures pour navigation

3. **Performance**
   - Lazy loading des composants lourds
   - Virtualisation des listes longues
   - Memoization des composants coûteux

#### 🟢 Nice to Have

1. **Animations**
   - Transitions plus fluides
   - Micro-interactions améliorées
   - Loading states plus engageants

2. **Dark/Light Mode**
   - Support du thème clair (actuellement dark only)
   - Toggle dans les settings

### 15.2 Patterns à Implémenter

#### Compound Components

Pour les modals complexes :

```tsx
<Modal>
  <Modal.Header>
    <Modal.Title>Title</Modal.Title>
    <Modal.CloseButton />
  </Modal.Header>
  <Modal.Body>
    {content}
  </Modal.Body>
  <Modal.Footer>
    <Modal.Actions />
  </Modal.Footer>
</Modal>
```

#### Render Props / Children as Function

Pour les composants avec logique complexe :

```tsx
<ArtifactsProvider>
  {({ artifacts, loading, error }) => (
    <ArtifactsList artifacts={artifacts} />
  )}
</ArtifactsProvider>
```

#### Context API pour State Global

Au lieu de prop drilling :

```tsx
<JourneyContext.Provider value={journeyState}>
  <JourneyWorkspace />
</JourneyContext.Provider>
```

### 15.3 Design Tokens à Standardiser

Créer un fichier `design-tokens.ts` :

```typescript
export const tokens = {
  colors: {
    background: '#050510',
    surface: '#0A0A1F',
    // ...
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    // ...
  },
  // ...
};
```

### 15.4 Storybook

**État actuel** : Storybook configuré mais peu de stories

**Recommandation** : Créer des stories pour tous les composants :

- États (default, loading, error, empty)
- Variantes (sizes, colors)
- Interactions

**Fichier** : `journey-simulator/.storybook/`

---

## 16. Ressources & Références

### 16.1 Fichiers de Configuration

- **Tailwind** : `journey-simulator/tailwind.config.js`
- **TypeScript** : `journey-simulator/tsconfig.json`
- **Vite** : `journey-simulator/vite.config.ts`

### 16.2 Documentation Technique

- **API Contract** : `docs/API_CONTRACT_MF_BACK.md`
- **Architecture** : `docs/ARCHITECTURE.md`
- **Platform Deep Dive** : `docs/PLATFORM_DEEP_DIVE_FR.md`

### 16.3 Design Assets

- **Icons** : Lucide React (<https://lucide.dev>)
- **Colors** : Palette Solana + Custom
- **Fonts** : Space Grotesk + Inter (Google Fonts)

### 16.4 Outils de Développement

- **Storybook** : `npm run storybook` (port 6006)
- **Dev Server** : `npm run dev` (port 3003)
- **Linting** : `npm run lint`
- **Type Check** : `npm run typecheck`

---

## 17. Checklist pour le Spécialiste UI/UX

### 17.1 Compréhension du Projet

- [ ] Lire `README.md` principal
- [ ] Comprendre les 6 personas et leurs parcours
- [ ] Explorer `journey-simulator/src/data/personas.ts`
- [ ] Tester l'application en mode demo
- [ ] Comprendre le flux complet : Onboarding → Journey → Completion

### 17.2 Analyse de l'Existant

- [ ] Auditer tous les composants dans `src/components/`
- [ ] Identifier les problèmes d'accessibilité
- [ ] Tester sur mobile/tablet/desktop
- [ ] Analyser les performances (Lighthouse)
- [ ] Identifier les points de friction UX

### 17.3 Design System

- [ ] Documenter la palette de couleurs actuelle
- [ ] Créer un système de tokens cohérent
- [ ] Standardiser les espacements
- [ ] Définir la hiérarchie typographique
- [ ] Créer une bibliothèque de composants

### 17.4 Prototypage

- [ ] Créer des wireframes pour les écrans principaux
- [ ] Prototyper les nouveaux patterns d'interaction
- [ ] Tester les animations et transitions
- [ ] Valider avec les utilisateurs (si possible)

### 17.5 Implémentation

- [ ] Refactoriser `JourneyWorkspace` en sous-composants
- [ ] Améliorer `UIBlocksRenderer`
- [ ] Implémenter les améliorations d'accessibilité
- [ ] Optimiser pour mobile
- [ ] Ajouter les animations manquantes

---

## 18. Contacts & Support

### 18.1 Documentation

- **Architecture** : `docs/ARCHITECTURE.md`
- **API** : `docs/API_CONTRACT_MF_BACK.md`
- **Deep Dive** : `docs/PLATFORM_DEEP_DIVE_FR.md`

### 18.2 Code Source

- **Frontend** : `journey-simulator/`
- **Backend** : `mf-back/`
- **Web Portal** : `web/`

### 18.3 Questions Fréquentes

**Q: Comment tester l'application localement ?**
A: `./start_dev.sh` depuis la racine, puis `http://localhost:3003`

**Q: Où sont définis les styles persona-specific ?**
A: `journey-simulator/src/utils/personaStyles.ts`

**Q: Comment ajouter un nouveau type de UI Block ?**
A: 1) Ajouter le type dans `types/uiBlocks.ts`, 2) Ajouter le case dans `UIBlocksRenderer.tsx`, 3) Créer le composant

**Q: Comment fonctionne le state management ?**
A: Zustand store dans `store/journeyStore.ts`, accessible via `useJourneyStore()`

---

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

---

**Dernière mise à jour** : Décembre 2025
**Version du document** : 1.0

*Ce document est vivant et sera mis à jour au fur et à mesure de l'évolution du projet.*
