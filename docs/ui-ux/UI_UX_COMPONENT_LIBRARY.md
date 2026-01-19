<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# 📚 Bibliothèque de Composants UI - Money Factory AI

*Référence complète de tous les composants UI pour spécialistes UI/UX*
*Version*: 1.0
*Dernière mise à jour*: Décembre 2025

---

## 📋 Table des Matières

1. [Composants de Layout](#composants-de-layout)
2. [Composants Journey](#composants-journey)
3. [Composants UI Blocks](#composants-ui-blocks)
4. [Composants Modals](#composants-modals)
5. [Composants Wallet](#composants-wallet)
6. [Composants Shared](#composants-shared)
7. [Composants Zyno](#composants-zyno)
8. [Composants Artifacts](#composants-artifacts)

---

## 1. Composants de Layout

### 1.1 Layout

**Fichier** : `journey-simulator/src/components/layout/Layout.tsx`

**Props** :

```typescript
interface LayoutProps {
  children: React.ReactNode;
  enableWallet?: boolean;  // Active wallet adapter si true
}
```

**Structure** :

```tsx
<Layout enableWallet={true}>
  <Header />
  <Main>
    {children}
  </Main>
  <Footer />
</Layout>
```

### 1.2 Header

**Fichier** : `journey-simulator/src/components/layout/Header.tsx`

**Contenu** :

- Logo (lien vers home)
- Navigation principale
- WalletButton
- User menu (si authentifié)

**Sticky** : `sticky top-0 z-50`

### 1.3 JourneyLayout

**Fichier** : `journey-simulator/src/components/Layout/JourneyLayout.tsx`

**Usage** : Layout spécifique pour les pages journey

**Différences avec Layout** :

- Pas de Header/Footer standard
- Header custom avec controls (panels toggle, etc.)

---

## 2. Composants Journey

### 2.1 JourneyCard

**Fichier** : `journey-simulator/src/components/Journey/JourneyCard.tsx`

**Props** :

```typescript
interface JourneyCardProps {
  persona: Persona;
  progress: number;  // 0-100
  onSelect: () => void;
  className?: string;
}
```

**Design** :

- Gradient persona-specific en background
- Icône persona (emoji)
- Titre et description
- Barre de progression
- Badge statut

**États** :

- **Available** : Carte cliquable, gradient visible
- **Locked** : Opacité 0.5, overlay "Locked"
- **Completed** : Badge "Completed", confetti possible
- **Current** : Border accent-cyan, glow effect

**Classes CSS** :

```tsx
className={`
  rounded-2xl border p-6
  bg-gradient-to-br ${persona.color}
  transition hover:scale-105 hover:shadow-glow
  ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
`}
```

### 2.2 JourneyProgressBar

**Fichier** : `journey-simulator/src/components/Journey/JourneyProgressBar.tsx`

**Props** :

```typescript
interface JourneyProgressBarProps {
  phases: Phase[];
  currentPhase: number;  // Index de la phase actuelle
  completedPhases: number[];  // Indices des phases complétées
}
```

**Design** :

- Barre horizontale avec segments
- Icônes pour chaque phase :
  - Completed : `<Check />` (green)
  - Current : `<Zap />` (cyan, pulse)
  - Locked : Number (muted)

**Animation** : Progress bar animée avec transition

### 2.3 JourneyTimeline

**Fichier** : `journey-simulator/src/components/Journey/JourneyTimeline.tsx`

**Props** :

```typescript
interface JourneyTimelineProps {
  phases: Phase[];
  currentPhase: number;
  onPhaseChange: (phaseIndex: number) => void;
}
```

**Design** :

- Timeline verticale
- Carte pour chaque phase
- Connecteurs entre phases
- Cliquable pour navigation

**États Visuels** :

- **Completed** : Green border, check icon
- **Current** : Cyan border, glow, pulse
- **Locked** : Muted, disabled

### 2.4 JourneyNextActionsPanel

**Fichier** : `journey-simulator/src/components/Journey/JourneyNextActionsPanel.tsx`

**Props** :

```typescript
interface Props {
  personaId: string;
  currentStepId: string;
  journeyId?: string;
  onActionClick?: (actionType: string, actionId: string) => void;
  className?: string;
}
```

**Contenu** :

- Actions suggérées (AEPO)
- Recent agent runs
- Quick links

**Design** : Card avec liste d'actions cliquables

### 2.5 ZynoSignalSidebar

**Fichier** : `journey-simulator/src/components/Journey/ZynoSignalSidebar.tsx`

**Usage** : Console agentique (right panel)

**Contenu** :

- Agent activity logs
- Real-time updates
- Actions suggérées

**Design** : Scrollable panel avec logs formatés

---

## 3. Composants UI Blocks

### 3.1 UIBlocksRenderer

**Fichier** : `journey-simulator/src/components/UIBlocks/UIBlocksRenderer.tsx`

**Props** :

```typescript
interface Props {
  response: JourneyStepResponse;
}
```

**Responsabilité** : Rendu de tous les types de UI Blocks

**Pattern** :

```tsx
{response.ui_blocks.map((block) => {
  switch (block.kind) {
    case 'text_block': return <Text block={block} />;
    case 'quiz_block': return <Quiz block={block} />;
    // ...
  }
})}
```

### 3.2 Text Block

**Composant** : `<Text />` dans UIBlocksRenderer

**Props** :

```typescript
interface TextBlock {
  kind: 'text_block';
  id: string;
  title: string;
  body_markdown: string;
}
```

**Rendu** :

- Titre en `<h3>`
- Body markdown converti en HTML
- Styling via Tailwind Typography

### 3.3 Quiz Block

**Composant** : `<Quiz />` dans UIBlocksRenderer

**Props** :

```typescript
interface QuizBlock {
  kind: 'quiz_block';
  id: string;
  title: string;
  questions: QuizQuestion[];
}
```

**Interactions** :

- Radio buttons pour sélection
- Submit button
- Feedback immédiat (correct/incorrect)
- Explanation affichée

**Design** :

- Options avec hover effect
- Correct : Green border, check
- Incorrect : Red border, X, correct answer highlight

### 3.4 Mission Block

**Composant** : `<Mission />` dans UIBlocksRenderer

**Props** :

```typescript
interface MissionBlock {
  kind: 'mission_block';
  id: string;
  title: string;
  description: string;
  expected_input_type: 'text' | 'markdown_document' | 'code_snippet' | 'link' | 'choice';
  xp_reward: number;
  nft_reward_id?: string;
  is_mandatory?: boolean;
}
```

**UI** :

- Card avec border accent
- Textarea ou input selon type
- XP reward visible
- NFT reward preview si éligible
- Submit button

**États** :

- Empty : Button disabled
- Filled : Button enabled
- Submitting : Loading spinner
- Submitted : Success state

### 3.5 Evaluation Block

**Composant** : `<Evaluation />` dans UIBlocksRenderer

**Props** :

```typescript
interface EvaluationBlock {
  kind: 'evaluation_block';
  id: string;
  title: string;
  global_score: number;  // 0-10
  max_score: number;
  feedback: string;
  axes: EvaluationAxis[];
}
```

**Design** :

- Score global en grand (ex: 8.5/10)
- Barres de progression pour chaque axe
- Commentaires détaillés
- Couleur selon score (green/yellow/red)

**Animations** :

- Barres animées (0 → score)
- Confetti si score ≥ 8.0

### 3.6 Resource Block

**Composant** : `<Resources />` dans UIBlocksRenderer

**Props** :

```typescript
interface ResourceBlock {
  kind: 'resource_block';
  id: string;
  title: string;
  resources: ResourceItem[];
}
```

**Design** :

- Liste de cartes ressources
- Icône selon type (article, video, etc.)
- Badge "agent_owner"
- Lien externe ou modal

### 3.7 Checklist Block

**Composant** : `<Checklist />` dans UIBlocksRenderer

**Props** :

```typescript
interface ChecklistBlock {
  kind: 'checklist_block';
  id: string;
  title: string;
  items: ChecklistItem[];
}
```

**Interactions** :

- Checkboxes pour chaque item
- Auto-save state (localStorage)
- Progress indicator

### 3.8 Interactive Template Block

**Composant** : `<InteractiveTemplate />` dans UIBlocksRenderer

**Props** :

```typescript
interface InteractiveTemplateBlock {
  kind: 'interactive_template_block';
  id: string;
  title: string;
  description: string;
  templateType: 'one-pager' | 'pitch-deck' | 'tokenomics' | 'governance' | 'launch-plan';
  fields: TemplateField[];
  agentOwner: string;
}
```

**UI** :

- Form dynamique selon fields
- Validation en temps réel
- Preview du template
- Submit → Génère document

---

## 4. Composants Modals

### 4.1 CertificationModal

**Fichier** : `journey-simulator/src/components/CertificationModal.tsx`

**Props** :

```typescript
interface CertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  certification: {
    name: string;
    personaId: string;
    phaseId: string;
    imageUrl?: string;
  };
}
```

**Contenu** :

- Image NFT
- Titre et description
- Métadonnées
- Actions : Mint, Share, Close

**Design** : Modal centré avec backdrop blur

### 4.2 NFTMintingModal

**Fichier** : `journey-simulator/src/components/NFTMintingModal.tsx`

**Props** :

```typescript
interface NFTMintingModalProps {
  isOpen: boolean;
  onClose: () => void;
  nftName: string;
  personaId?: string;
  phaseId?: string;
}
```

**Étapes** :

1. Preview
2. Wallet connection (si nécessaire)
3. Transaction signing
4. Confirmation

### 4.3 StakingModal

**Fichier** : `journey-simulator/src/components/StakingModal.tsx`

**Props** :

```typescript
interface StakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  currentStaked: number;
}
```

**Champs** :

- Amount input
- Voting power preview
- Confirm button

### 4.4 DAOVoteModal

**Fichier** : `journey-simulator/src/components/DAOVoteModal.tsx`

**Props** :

```typescript
interface DAOVoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: Proposal;
  votingPower: number;
}
```

**Options** :

- Radio buttons : For / Against / Abstain
- Commentaire optionnel
- Submit button

---

## 5. Composants Wallet

### 5.1 WalletButton

**Fichier** : `journey-simulator/src/components/WalletButton.tsx`

**Usage** : Bouton de connexion wallet dans header

**États** :

- **Not Connected** : "Connect Wallet"
- **Connecting** : Spinner + "Connecting..."
- **Connected** : Adresse tronquée (ex: `7xKX...9mN2`)

**Dropdown** (si connecté) :

- Copy address
- View on Explorer
- Disconnect

### 5.2 WalletStatusDisplay

**Fichier** : `journey-simulator/src/components/WalletStatusDisplay.tsx`

**Usage** : Affichage du statut wallet

**Contenu** :

- Icône wallet
- Adresse (tronquée)
- Network (devnet/mainnet)
- Balance (optionnel)

### 5.3 WalletConnectionGuide

**Fichier** : `journey-simulator/src/components/WalletConnectionGuide.tsx`

**Usage** : Guide pour nouveaux utilisateurs

**Contenu** :

- Instructions étape par étape
- Liste de wallets supportés
- Liens de téléchargement

---

## 6. Composants Shared

### 6.1 Button

**Fichier** : `journey-simulator/src/components/shared/Button.tsx`

**Props** :

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}
```

**Variants** :

- **Primary** : Gradient accent, white text
- **Secondary** : Border, transparent background
- **Ghost** : No border, transparent

### 6.2 Skeleton

**Fichier** : `journey-simulator/src/components/shared/Skeleton.tsx`

**Usage** : Loading placeholder

**Props** :

```typescript
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}
```

### 6.3 MessageDisplay

**Fichier** : `journey-simulator/src/components/shared/MessageDisplay.tsx`

**Usage** : Affichage de messages (success, error, info)

**Props** :

```typescript
interface MessageDisplayProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose?: () => void;
}
```

---

## 7. Composants Zyno

### 7.1 ZynoConsole

**Fichier** : `journey-simulator/src/components/Zyno/ZynoConsole.tsx`

**Usage** : Console principale Zyno

**Contenu** :

- Logs des agents
- Actions en cours
- Suggestions

### 7.2 AgentActivityFeed

**Fichier** : `journey-simulator/src/components/AgentActivityFeed.tsx`

**Usage** : Feed d'activité des agents

**Props** :

```typescript
interface AgentActivityFeedProps {
  personaId: string;
  limit?: number;
}
```

**Contenu** :

- Liste de logs formatés
- Timestamps
- Agent names
- Status (success/error)

---

## 8. Composants Artifacts

### 8.1 ArtifactCard

**Fichier** : `journey-simulator/src/components/Artifacts/ArtifactCard.tsx`

**Props** :

```typescript
interface ArtifactCardProps {
  artifact: {
    key: string;
    title: string;
    agent: string;
    category: string;
    version: string;
    fileUrl?: string;
  };
  isActive: boolean;
  onClick: () => void;
}
```

**Design** :

- Card avec border
- Icône FileText
- Titre et métadonnées
- Active state : Border accent-cyan, glow

### 8.2 ArtifactModal

**Fichier** : `journey-simulator/src/components/Artifacts/ArtifactModal.tsx`

**Props** :

```typescript
interface ArtifactModalProps {
  isOpen: boolean;
  onClose: () => void;
  artifact: Artifact;
}
```

**Contenu** :

- Preview (iframe si HTML)
- Métadonnées
- Actions : Download, Share, Close

### 8.3 NeuralOverlay

**Fichier** : `journey-simulator/src/components/Artifacts/NeuralOverlay.tsx`

**Usage** : Overlay animé lors de la génération d'artefact

**Design** :

- Animation "neural network"
- Message "Generating artifact..."
- Auto-dismiss après génération

---

## 9. Patterns de Composants

### 9.1 Card Pattern

**Pattern Standard** :

```tsx
<div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10 hover:border-white/20">
  {content}
</div>
```

**Variantes** :

- **Glass** : `backdrop-blur bg-white/5`
- **Neon** : `border-accent-cyan/50 shadow-glow`
- **Elevated** : `shadow-glass`

### 9.2 Button Pattern

**Pattern Standard** :

```tsx
<button
  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10 hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed"
  onClick={handleClick}
  disabled={isDisabled}
>
  {children}
</button>
```

**Variantes** :

- **Primary** : `bg-gradient-to-r from-accent to-accent-dark text-white`
- **Secondary** : `border-accent text-accent`
- **Ghost** : `border-transparent`

### 9.3 Input Pattern

**Pattern Standard** :

```tsx
<input
  type="text"
  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/20"
  placeholder="Enter text..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### 9.4 Modal Pattern

**Pattern Standard** :

```tsx
{isOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="relative rounded-2xl border border-white/10 bg-[#0A0A1F] p-6 max-w-2xl w-full mx-4">
      <button
        onClick={onClose}
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

---

## 10. Accessibilité des Composants

### 10.1 Checklist par Composant

#### Button

- [ ] Élément `<button>` (pas `div` avec `role="button"`)
- [ ] `aria-label` si pas de texte visible
- [ ] Focus visible
- [ ] Keyboard accessible (Enter, Space)

#### Input

- [ ] `<label>` associé ou `aria-label`
- [ ] `aria-describedby` pour erreurs
- [ ] `aria-invalid` si erreur
- [ ] Focus visible

#### Modal

- [ ] `role="dialog"`
- [ ] `aria-labelledby` pour le titre
- [ ] `aria-describedby` pour la description
- [ ] Focus trap
- [ ] `Esc` pour fermer

#### List

- [ ] `role="list"` et `role="listitem"`
- [ ] Keys stables (pas d'index)
- [ ] Keyboard navigation (Arrow keys)

---

## 11. Responsive Breakpoints

### 11.1 Mobile (< 768px)

**Adaptations** :

- Panels en drawers
- Stack vertical
- Full width components
- Padding réduit (`px-4`)

### 11.2 Tablet (768px - 1023px)

**Adaptations** :

- 2 colonnes pour grids
- Panels collapsibles
- Padding moyen (`px-6`)

### 11.3 Desktop (≥ 1024px)

**Adaptations** :

- 3 colonnes pour grids
- Panels toujours visibles
- Max-width centré
- Padding large (`px-8`)

---

## 12. Animations par Composant

### 12.1 JourneyCard

**Hover** :

- Scale : `hover:scale-105`
- Glow : `hover:shadow-glow`
- Transition : `transition-all duration-300`

### 12.2 Button

**Hover** :

- Background : `hover:bg-white/10`
- Border : `hover:border-white/20`
- Scale (active) : `active:scale-95`

### 12.3 Modal

**Entrée** :

- Fade-in backdrop
- Slide-up content
- Duration : 300ms

---

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

---

**Dernière mise à jour** : Décembre 2025
**Version du document** : 1.0

*Ce document complète les guides UI/UX avec une référence technique de tous les composants.*
