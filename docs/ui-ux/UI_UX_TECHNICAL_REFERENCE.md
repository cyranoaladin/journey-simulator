<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# 🔧 Référence Technique UI/UX - Money Factory AI

*Guide technique détaillé pour développeurs UI/UX*
*Version*: 1.0
*Dernière mise à jour*: Décembre 2025

---

## 📋 Table des Matières

1. [Structure du Code Frontend](#structure-du-code-frontend)
2. [State Management (Zustand)](#state-management-zustand)
3. [API Integration](#api-integration)
4. [Composants Réutilisables](#composants-réutilisables)
5. [Hooks Custom](#hooks-custom)
6. [Types TypeScript](#types-typescript)
7. [Routing & Navigation](#routing--navigation)
8. [Performance & Optimisation](#performance--optimisation)
9. [Testing](#testing)
10. [Build & Déploiement](#build--déploiement)

---

## 1. Structure du Code Frontend

### 1.1 Organisation des Dossiers

```
journey-simulator/src/
├── components/              # Composants React
│   ├── Journey/             # Composants spécifiques aux journeys
│   ├── UIBlocks/            # Rendu des UI Blocks dynamiques
│   ├── Artifacts/           # Gestion des artefacts
│   ├── Zyno/                # Composants liés à Zyno
│   ├── layout/              # Layouts (Header, Footer, Sidebar)
│   ├── shared/              # Composants réutilisables
│   ├── wallet/              # Composants wallet
│   └── ...
├── contexts/                # React Contexts
│   ├── AuthContext.tsx      # Authentification
│   ├── WalletContext.tsx    # Wallet Solana
│   └── WorkspaceLayoutContext.tsx  # Layout workspace
├── data/                    # Données statiques
│   ├── personas.ts          # 6 personas avec phases
│   ├── proofsData.ts        # Données des proofs NFT
│   └── resources.ts         # Ressources disponibles
├── hooks/                   # Hooks React custom
│   ├── useArtifacts.ts      # Hook pour artefacts
│   └── ...
├── pages/                   # Pages/Views
│   ├── HomePage.tsx
│   ├── Journey.tsx          # Page principale journey
│   ├── JourneyDemo.tsx      # Page demo
│   └── ...
├── store/                   # State management (Zustand)
│   ├── journeyStore.ts      # Store principal (868 lignes)
│   └── themeStore.ts        # Store thème
├── types/                   # Types TypeScript
│   ├── journey.ts           # Types journey, persona, progress
│   └── uiBlocks.ts          # Types des UI Blocks
├── utils/                   # Utilitaires
│   ├── api.ts               # Client API
│   ├── personaStyles.ts     # Styles persona-specific
│   ├── generateStableKey.ts # Génération de clés stables
│   └── ...
└── App.tsx                  # Point d'entrée React
```

### 1.2 Points d'Entrée

**App.tsx** : Configuration React Router, providers (Auth, Wallet, Tutorial)

**Routes Principales** :

- `/` : HomePage
- `/journeys` : JourneysPage (sélection persona) ou JourneyWorkspace
- `/journeys/demo` : Mode demo (sans wallet)
- `/journeys/:journeyId` : Journey spécifique
- `/dashboard` : Dashboard utilisateur
- `/dao` : Interface DAO

### 1.3 Layouts

**ProtectedLayout** : Routes protégées (nécessitent auth)
**WalletProtectedLayout** : Routes nécessitant wallet
**DemoLayout** : Routes demo (pas de wallet requis)

---

## 2. State Management (Zustand)

### 2.1 Store Principal

**Fichier** : `journey-simulator/src/store/journeyStore.ts`

**Structure** :

```typescript
interface JourneyState {
  // State
  selectedPersona: Persona | null;
  currentPhase: number;
  userProgress: UserProgress;
  lastStep: JourneyStepResponse | null;
  isStepLoading: boolean;

  // Actions
  setSelectedPersona: (persona: Persona | null) => void;
  runInteractiveStep: (args) => Promise<JourneyStepResponse>;
  completePhase: (phaseIndex, options) => Promise<void>;
  // ...
}
```

### 2.2 Utilisation

**Pattern Recommandé** (évite les re-renders) :

```tsx
import { useJourneyStore } from '../store/journeyStore';
import { shallow } from 'zustand/shallow';

const { selectedPersona, userProgress } = useJourneyStore(
  (state) => ({
    selectedPersona: state.selectedPersona,
    userProgress: state.userProgress,
  }),
  shallow  // Évite les re-renders inutiles
);
```

**Pattern Simple** (si besoin d'une seule valeur) :

```tsx
const selectedPersona = useJourneyStore((state) => state.selectedPersona);
```

### 2.3 Persistence

Le store utilise `persist` middleware de Zustand :

- **Storage** : `localStorage` (par défaut)
- **Key** : `journey-store`
- **Version** : Géré automatiquement

**Données Persistées** :

- `selectedPersona`
- `currentPhase`
- `userProgress`
- `apiJourneyId`
- `testnetFeatures`

### 2.4 Actions Principales

#### runInteractiveStep

```typescript
runInteractiveStep: async ({ phaseId, trackId, userInput }) => {
  // Appelle l'API /orchestration/vslice
  // Retourne JourneyStepResponse avec ui_blocks
  // Met à jour lastStep dans le store
}
```

**Usage** :

```tsx
const { runInteractiveStep, setIsStepLoading } = useJourneyStore();

const handleSubmit = async () => {
  setIsStepLoading(true);
  try {
    const response = await runInteractiveStep({
      phaseId: `phase-${phaseIndex}`,
      trackId: selectedPersona.id,
      userInput: inputValue
    });
    // response.ui_blocks sera rendu par UIBlocksRenderer
  } finally {
    setIsStepLoading(false);
  }
};
```

#### completePhase

```typescript
completePhase: async (phaseIndex, options) => {
  // Met à jour userProgress
  // Déclenche animations (confetti)
  // Ouvre modal de certification si score ≥ 8.0
}
```

---

## 3. API Integration

### 3.1 Client API

**Fichier** : `journey-simulator/src/utils/api.ts`

**Configuration** :

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

export const api = {
  // Journey endpoints
  getJourneys: () => fetch(`${API_BASE_URL}/journeys`),
  runStep: (payload) => fetch(`${API_BASE_URL}/orchestration/vslice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }),
  // ...
};
```

### 3.2 Endpoints Principaux

| Endpoint | Method | Usage |
|----------|--------|-------|
| `/orchestration/vslice` | POST | Exécution d'un step (retourne UI Blocks) |
| `/journey/user-progress` | GET | Récupération de la progression |
| `/agents/logs` | GET | Logs des agents |
| `/user/profile` | GET | Profil utilisateur |
| `/journey/artifacts` | GET | Artefacts générés |

### 3.3 Types de Réponses

**JourneyStepResponse** :

```typescript
interface JourneyStepResponse {
  metadata: {
    persona_id: string;
    phase_id: string;
    language: 'fr' | 'en';
    mode?: 'discovery' | 'builder' | 'expert' | 'investor_demo';
    tone?: 'pedagogical' | 'investor_pitch' | 'critical';
  };
  ui_blocks: UIBlock[];  // Array de blocks dynamiques
  agent_actions: AgentAction[];
  next_state: {
    phase_id: string;
    completed_missions: string[];
    xp_delta: number;
  };
}
```

### 3.4 Gestion d'Erreurs

**Pattern** :

```tsx
try {
  const response = await api.runStep(payload);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  const data = await response.json();
  // Process data
} catch (error) {
  toast.error('Failed to submit', {
    description: error.message
  });
}
```

---

## 4. Composants Réutilisables

### 4.1 Shared Components

**Fichier** : `journey-simulator/src/components/shared/`

#### Button

**Fichier** : `shared/Button.tsx`

**Props** :

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}
```

#### Skeleton

**Fichier** : `shared/Skeleton.tsx`

**Usage** :

```tsx
<Skeleton className="h-8 w-full" />
<Skeleton className="h-32 w-32 rounded-xl" />
```

#### MessageDisplay

**Fichier** : `shared/MessageDisplay.tsx`

**Usage** : Affichage de messages (success, error, info)

### 4.2 Layout Components

#### Header

**Fichier** : `layout/Header.tsx`

**Contenu** :

- Logo
- Navigation principale
- WalletButton
- User menu

#### Footer

**Fichier** : `layout/Footer.tsx`

**Contenu** :

- Links (About, Docs, etc.)
- Social links
- Copyright

#### Sidebar

**Fichier** : `layout/Sidebar.tsx`

**Contenu** :

- Navigation secondaire
- Quick links
- User metrics

---

## 5. Hooks Custom

### 5.1 useArtifacts

**Fichier** : `journey-simulator/src/hooks/useArtifacts.ts`

**Usage** :

```tsx
const { artifacts, loading, error } = useArtifacts({
  fallbackToStatic: isDemo
});
```

**Retourne** :

- `artifacts` : Array d'artefacts
- `loading` : Boolean
- `error` : Error | null

### 5.2 useWorkspaceLayout

**Fichier** : `journey-simulator/src/contexts/WorkspaceLayoutContext.tsx`

**Usage** :

```tsx
const { leftPanelOpen, rightPanelOpen, toggleLeft, toggleRight } = useWorkspaceLayout();
```

---

## 6. Types TypeScript

### 6.1 Types Principaux

**Fichier** : `journey-simulator/src/types/journey.ts`

```typescript
export interface Persona {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  color: string;  // Gradient Tailwind
  targetProfile: string;
  motivation: string;
  passType: string;
  phases: Phase[];
}

export interface Phase {
  id: string;
  title: string;
  description: string;
  mission: string;
  duration: string;
  xpReward: number;
  mfaiReward: number;
  nftReward: string;
  tools: string[];
  outcomes: string[];
  zynoTip: string;
  stakingRequired?: number;
  daoVoteRequired?: boolean;
}

export interface UserProgress {
  totalXP: number;
  nfts: string[];
  nftMints?: Array<{ name: string; address: string; signature: string; }>;
  passLevel: 'Free' | 'Gold' | 'Platinum' | 'Diamond';
  mfaiTokens: number;
  stakedMfai: number;
  walletConnected: boolean;
  walletAddress?: string;
  completedPhases: number[];
  currentPersona?: string;
  votingPower: number;
  daoProposals: number;
  // ...
}
```

**Fichier** : `journey-simulator/src/types/uiBlocks.ts`

Voir section 5.2 du guide UI/UX pour les types complets.

### 6.2 Type Guards

**Exemple** :

```typescript
function isTextBlock(block: UIBlock): block is TextBlock {
  return block.kind === 'text_block';
}

function isQuizBlock(block: UIBlock): block is QuizBlock {
  return block.kind === 'quiz_block';
}
```

---

## 7. Routing & Navigation

### 7.1 React Router Setup

**Fichier** : `journey-simulator/src/App.tsx`

**Structure** :

```tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/login" element={<LoginPage />} />

  {/* Demo routes */}
  <Route element={<DemoLayout />}>
    <Route path="journeys/demo" element={<JourneyDemo />} />
  </Route>

  {/* Protected routes */}
  <Route element={<ProtectedLayout />}>
    <Route path="dashboard" element={<Dashboard />} />
  </Route>

  {/* Wallet required */}
  <Route element={<WalletProtectedLayout />}>
    <Route path="journeys" element={<Journey />} />
  </Route>
</Routes>
```

### 7.2 Navigation Programmatique

**Usage** :

```tsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Navigation simple
navigate('/journeys');

// Navigation avec state
navigate('/journeys', { state: { personaId: 'cognitive-activation-hub' } });

// Navigation back
navigate(-1);
```

### 7.3 Protected Routes

**ProtectedLayout** :

- Vérifie l'authentification
- Redirige vers `/login` si non authentifié

**WalletProtectedLayout** :

- Vérifie l'authentification
- Vérifie la connexion wallet
- Affiche banner si wallet non connecté

---

## 8. Performance & Optimisation

### 8.1 Code Splitting

**Lazy Loading** :

```tsx
import { lazy, Suspense } from 'react';

const JourneyWorkspace = lazy(() => import('./components/Journey/JourneyWorkspace'));

<Suspense fallback={<Skeleton />}>
  <JourneyWorkspace />
</Suspense>
```

### 8.2 Memoization

**React.memo** :

```tsx
export const JourneyCard = React.memo(({ persona, progress, onSelect }) => {
  // Component
});
```

**useMemo** :

```tsx
const filteredPhases = useMemo(() => {
  return phases.filter(phase => phase.xpReward > 50);
}, [phases]);
```

**useCallback** :

```tsx
const handleClick = useCallback(() => {
  // Handler
}, [dependencies]);
```

### 8.3 Virtualisation

Pour les listes longues (ex: logs d'agents) :

- Utiliser `react-window` ou `react-virtualized`
- Actuellement non implémenté (à considérer)

### 8.4 Image Optimization

**Pattern** :

```tsx
<img
  src={imageUrl}
  loading="lazy"
  decoding="async"
  alt={altText}
/>
```

---

## 9. Testing

### 9.1 Tests Unitaires

**Framework** : Vitest 4.0

**Exemple** :

```typescript
import { render, screen } from '@testing-library/react';
import { JourneyCard } from './JourneyCard';

test('renders persona title', () => {
  render(<JourneyCard persona={mockPersona} />);
  expect(screen.getByText(mockPersona.title)).toBeInTheDocument();
});
```

### 9.2 Tests E2E

**Framework** : Playwright 1.56+

**Fichiers** : `journey-simulator/tests/e2e/`

**Exemple** :

```typescript
import { test, expect } from '@playwright/test';

test('complete journey flow', async ({ page }) => {
  await page.goto('/journeys/demo');
  await page.click('[data-testid="persona-card"]');
  // ...
});
```

### 9.3 Storybook

**Commande** : `npm run storybook`

**Port** : 6006

**Usage** : Créer des stories pour chaque composant avec différents états

---

## 10. Build & Déploiement

### 10.1 Build

**Commande** : `npm run build`

**Output** : `journey-simulator/dist/`

**Optimisations** :

- Minification
- Tree shaking
- Code splitting automatique

### 10.2 Variables d'Environnement

**Fichier** : `.env` ou `.env.local`

```bash
VITE_API_BASE_URL=http://localhost:3002
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_DEMO_MODE=true
```

### 10.3 Déploiement

**Production** :

- Build : `npm run build`
- Serve : `npm run preview` (pour test local)
- Serveur : Nginx ou similaire pour servir `dist/`

**Docker** :

- Voir `docker-compose.prod.yml`
- Image : Node.js avec serve statique

---

## 11. Patterns de Code à Suivre

### 11.1 Composants Fonctionnels

**Pattern Standard** :

```tsx
interface ComponentProps {
  // Props typées
}

export const Component = ({ prop1, prop2 }: ComponentProps) => {
  // Hooks
  const [state, setState] = useState();
  const { value } = useCustomHook();

  // Handlers
  const handleClick = () => {
    // Logic
  };

  // Render
  return (
    <div className="...">
      {content}
    </div>
  );
};
```

### 11.2 Gestion d'État Local

**useState** pour état simple :

```tsx
const [isOpen, setIsOpen] = useState(false);
```

**useReducer** pour état complexe :

```tsx
const [state, dispatch] = useReducer(reducer, initialState);
```

### 11.3 Effets de Bord

**useEffect** :

```tsx
useEffect(() => {
  // Side effect
  return () => {
    // Cleanup
  };
}, [dependencies]);
```

**Pattern pour fetch** :

```tsx
useEffect(() => {
  let cancelled = false;

  const fetchData = async () => {
    const data = await api.getData();
    if (!cancelled) {
      setData(data);
    }
  };

  fetchData();

  return () => {
    cancelled = true;
  };
}, []);
```

---

## 12. Debugging

### 12.1 React DevTools

- Installer l'extension Chrome/Firefox
- Inspecter les composants
- Voir le state Zustand

### 12.2 Console Logging

**Logger Utilitaire** :

```tsx
import { logger } from '../utils/logger';

logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');
```

### 12.3 Network Inspection

- Ouvrir DevTools → Network
- Filtrer par "Fetch/XHR"
- Vérifier les appels API

---

## 13. Problèmes Connus & Solutions

### 13.1 Re-renders Excessifs

**Problème** : Composant se re-render trop souvent

**Solution** :

- Utiliser `shallow` avec Zustand
- Memoizer les composants avec `React.memo`
- Utiliser `useMemo` pour les calculs coûteux

### 13.2 Performance des Animations

**Problème** : Animations laggy

**Solution** :

- Utiliser `will-change` CSS
- Préférer `transform` et `opacity` (GPU-accelerated)
- Éviter `height`, `width` dans les animations

### 13.3 Memory Leaks

**Problème** : Memory leaks avec useEffect

**Solution** :

- Toujours nettoyer les subscriptions
- Annuler les fetch en cours
- Utiliser `AbortController` pour les fetch

---

## 14. Ressources Externes

### 14.1 Documentation

- **React** : <https://react.dev>
- **TypeScript** : <https://www.typescriptlang.org/docs/>
- **Tailwind CSS** : <https://tailwindcss.com/docs>
- **Zustand** : <https://docs.pmnd.rs/zustand>
- **Framer Motion** : <https://www.framer.com/motion/>
- **React Router** : <https://reactrouter.com>

### 14.2 Design Resources

- **Lucide Icons** : <https://lucide.dev>
- **Solana Brand** : <https://solana.com/branding>
- **Google Fonts** : Space Grotesk, Inter

---

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer

---

**Dernière mise à jour** : Décembre 2025
**Version du document** : 1.0

*Ce document complète le `UI_UX_DESIGN_GUIDE.md` avec les détails techniques d'implémentation.*
