### ✅ Partie 1/6 – Introduction & Project Scope

```md
# 🧠 USER_JOURNEYS_REACT_GUIDE.md

**Project**: Money Factory AI  
**Page**: `User Journeys`  
**Version**: 1.0  
**Audience**: React Developers (Frontend), UI/UX, Web3 Integrators

---

## 🎯 Mission

Build a **modular, gamified, Web3-native React interface** to onboard diverse user profiles into their **Cognitive Activation Journey™**, guided by Zyno AI, and enhanced by NFTs, XP, and the $MFAI token.

---

## 🔍 Key Objectives

- Guide users through 5-phase journeys: `Learn → Build → Prove → Activate → Scale`
- Support 6+ user profiles (“Personas”)
- Dynamically update UI based on:
  - Wallet connection & NFT detection
  - User XP, phase progress, and Zyno inputs
- Mint NFTs and track progression on-chain (or off-chain preview)
- Enable smart CTA logic powered by Zyno context and user state

---

## 🧱 Architecture Guidelines

| Element            | Design Choice                                     |
| ------------------ | ------------------------------------------------- |
| Framework          | React (Next.js recommended)                       |
| Styling            | Tailwind CSS + CSS Modules optional               |
| Animation          | Framer Motion                                     |
| State Management   | Zustand or Context API                            |
| Wallet Integration | `@rainbow-me/rainbowkit`, `solana-wallet-adapter` |
| NFT Layer          | `Thirdweb`, `Metaplex`, or custom contract calls  |
| AI Assistant       | Zyno SDK (chat + RAG)                             |
| Content Source     | Static JSON (v1), CMS optional                    |

---

## 🧠 Terminology Reference (vital for dev clarity)

| Term                                | Meaning                                        |
| ----------------------------------- | ---------------------------------------------- |
| **Zyno**                            | Cognitive AI Co-Founder™ that guides the user |
| **Cognitive Activation Protocol™** | 5-phase path structure                         |
| **Proof-of-Skill™ NFT**            | On-chain badge for completed learning steps    |
| **Neuro-Dividends™**               | Token rewards tied to progression              |
| **Persona**                         | A user archetype (Cognitive Activation Hub, Capital Foundry, System Architect, Experience Studio, Impact Engine, Resilience Master) |
| **XP**                              | Experience points to gamify journey            |
| **NFT Pass**                        | Gold / Platinum / Diamond access tiers         |
| **Journey Card**                    | Interactive entrypoint to a persona’s path     |

---

### 💠 Pathway Refresh (Nov 2025)

| Pathway | Narrative Focus | Primary Proof Type |
| ------- | ---------------- | ------------------ |
| Cognitive Activation Hub | Web3 cognition, Solana fluency, protocol mindset | Proof-of-Skill™ |
| Capital Foundry | Solana-native finance, DeFi program design, launch orchestration | Proof-of-Yield™ |
| System Architect | High-throughput infrastructure, AI x DePIN systems, guardian governance | Proof-of-Build™ |
| Experience Studio | Creative dApps, narrative design, NFT-driven experiences | Proof-of-Creation™ |
| Impact Engine | Synaptic governance, regenerative funding, community coordination | Proof-of-Orchestration™ |
| Resilience Master | Security operations, exploit response, guardian agent mesh | Proof-of-Security™ |

This mapping replaces the 2023-era student/investor/builder archetypes and should inform component copy, gradient themes, and proof metadata throughout the React implementation.

## 📁 Folder Structure (Recommended)
```

/components
/Journey
JourneyCard.tsx
JourneyTimeline.tsx
PhaseSection.tsx
ZynoBox.tsx
NFTBadge.tsx
XPTracker.tsx
/pages
/journeys
index.tsx // Entry page
\[persona].tsx // Dynamic route per profile
/utils
journeyData.ts // JSON static journey config
nftUtils.ts // NFT & wallet helpers
zynoLogic.ts // AI prompts & logic bridge

````

---

## 🔐 Access Control (Web3-aware)

- Phases may be locked unless:
  - A required NFT is held (Gold/Platinum Pass, Proof-of-Skill)
  - Sufficient XP is reached
  - $MFAI is staked
- Components must react in real time to wallet events

```ts
const { address, connected } = useWallet();
const hasAccess = checkNFTGate(address, 'Proof-of-Skill™');
````

## 🧩 Partie 2/6 — React Components Architecture

---

### 🔧 Component 1 — `<JourneyCard />`

> Affiche un résumé visuel de chaque parcours utilisateur (persona) avec CTA d'entrée.

```tsx
interface JourneyCardProps {
  persona: string;
  icon: JSX.Element;
  tagline: string;
  cta: string;
  progress?: number; // % of journey completed
}
```

#### ✅ Features

- Responsive hover animation
- Progress bar if journey started
- Dynamic CTA: “Start”, “Resume”, “Restart”
- Color theme varies by pathway (e.g. Cognitive Activation Hub = cyan gradients, Capital Foundry = emerald gradients)

---

### 🔧 Component 2 — `<JourneyTimeline />`

> Contient les 5 phases du parcours : Learn → Build → Prove → Activate → Scale

```tsx
interface JourneyTimelineProps {
  currentPhase: number;
  onPhaseChange: (index: number) => void;
  journeyData: JourneyPhase[];
}
```

#### ✅ Features

- Phase tabs with icons + progress
- Phase title + description + mission
- Uses `Framer Motion` for phase transitions
- Locked phase logic (based on wallet/NFT/XP)

---

### 🔧 Component 3 — `<PhaseSection />`

> Affiche le contenu détaillé de chaque phase avec missions, CTA, XP et NFT

```tsx
interface PhaseSectionProps {
  phase: 'Learn' | 'Build' | 'Prove' | 'Activate' | 'Scale';
  description: string;
  mission: string;
  nftReward?: string;
  xpReward?: number;
  locked?: boolean;
}
```

#### ✅ Features

- Actionable CTA with conditional states
- XP bar segment
- NFT visual if earned
- Zyno support icon (“Ask Zyno for help”)

---

### 🔧 Component 4 — `<NFTBadge />`

> Montre les NFT débloqués pour chaque phase

```tsx
interface NFTBadgeProps {
  title: string;
  imageUrl: string;
  claimed: boolean;
  onClaim?: () => void;
}
```

#### ✅ Features

- Claimed = full color, animation
- Unclaimed = grayscale with “Unlock” hint
- Tooltip with NFT metadata
- Connect to wallet if unclaimed

---

### 🔧 Component 5 — `<ZynoBox />`

> Petit assistant intelligent à droite ou en popup

```tsx
interface ZynoBoxProps {
  context: string;
  onPrompt: (msg: string) => void;
}
```

#### ✅ Features

- “Zyno Suggests…” prompt engine
- Optional voice bubble
- Icon animée + mini-chat ou tooltip
- Intégration avec LangChain ou backend RAG

---

### 🔧 Component 6 — `<XPTracker />`

> Indique l’XP global et les récompenses à venir

```tsx
interface XPTrackerProps {
  totalXP: number;
  nextRewardAt: number;
}
```

#### ✅ Features

- XP progress ring
- Milestone animation when level up
- Shows bonus for NFT Pass holders

---

### 🧠 Smart Reusability Pattern

Tous ces composants doivent être :

- **composables** entre eux (ex: `<PhaseSection />` dans `<JourneyTimeline />`)
- **prop-driven**, pas hardcodés
- **thématisables** (dark mode, persona colors, etc.)
- **compatibles wallet** (NFTs, tokens, gated CTAs)

## 📊 Partie 3/6 — Data Logic & Journey Configuration

---

### 🧠 Objectif

Permettre une **génération dynamique de parcours** à partir de fichiers de configuration (JSON ou CMS), et gérer l’**état utilisateur** (XP, NFT, phase atteinte, pass).

---

## 🧾 1. Structure de données (`journeyData.ts`)

> Fichier source avec tous les parcours disponibles, par persona.

```ts
export const journeys = [
  {
    persona: "cognitive-activation-hub",
    label: "Cognitive Activation Hub",
    icon: "🧠",
    tagline: "Ignite your Solana cognition",
    phases: [
      {
        title: "Cognition Ignition",
        description: "Decode Web3 paradigms and craft your activation thesis",
        mission: "Complete the paradigm deep-dive and publish your mission statement",
        xpReward: 60,
        nftReward: "Proof-of-Skill™: Web3 Orientation",
      },
      // ...additional phases from personas.ts
    ],
    requiredPass: "Genesis Cognition Pass",
  },
  ...
];
```

---

## 🧠 2. Utilisation des données

### 🔹 Filtrage dynamique :

```ts
const userPersona = getUserPersona();
const journey = journeys.find(j => j.persona === userPersona);
```

### 🔹 Chargement dans composants :

```tsx
<JourneyTimeline
  currentPhase={userState.phaseIndex}
  onPhaseChange={handleChange}
  journeyData={journey.phases}
/>
```

---

## 💾 3. État utilisateur (`useUserState.ts` hook)

> Gère le parcours, XP, NFT, pass, wallet connecté…

```ts
interface UserState {
  persona: string;
  currentPhase: number;
  totalXP: number;
  nfts: string[];
  passLevel: "Free" | "Gold" | "Platinum" | "Diamond";
  $MFAI: number;
  walletConnected: boolean;
}

const useUserState = create<UserState & Actions>((set, get) => ({
  persona: "student",
  currentPhase: 0,
  totalXP: 0,
  nfts: [],
  ...
}));
```

---

## 🔁 4. Persistant entre sessions

- Utiliser `localStorage` ou `IndexedDB` pour stocker :

  - XP
  - Phase atteinte
  - Persona choisie
  - Récompenses visuelles

- Optionnel : synchro avec Firebase ou backend

---

## 🧩 5. Exemple de logique d'accès conditionnelle

```ts
const current = userState.currentPhase;
const locked = phaseIndex > current;

if (locked && !userState.nfts.includes("Proof-of-Skill™")) {
  return <LockedPhaseMessage />;
}
```

---

## 🧠 6. Recommandation d'optimisation future

- Passage vers CMS type Sanity ou Notion API
- Configuration stockée sous forme de modèles :

  - `personaTemplate.json`
  - `phaseTemplate.json`

## 🔐 Partie 4/6 — Wallet, NFTs, and Token Gating

---

## 🧠 Objectif

Permettre à la page `User Journeys` :

- de détecter les **NFT Passes**, les **Proof-of-Skill NFTs**, et les soldes \$MFAI
- de verrouiller/déverrouiller dynamiquement les phases ou actions
- de **connecter, lire, écrire et minter** via les wallets

---

## 🔗 1. Wallet Integration

### ✅ Librairies recommandées

| Réseau                      | Libs                                              |
| --------------------------- | ------------------------------------------------- |
| **EVM** (Ethereum, Polygon) | `wagmi`, `viem`, `@rainbow-me/rainbowkit`         |
| **Solana**                  | `@solana/wallet-adapter-react`, `@solana/web3.js` |

### 🔁 Exemples d’intégration

```tsx
import { useAccount } from 'wagmi';

const { address, isConnected } = useAccount();
```

```tsx
import { useWallet } from '@solana/wallet-adapter-react';

const { publicKey, connected } = useWallet();
```

---

## 🪪 2. Détection des NFT

### ✅ Recommandé :

- Appel backend API ou Thirdweb/Moralis/Metaplex
- Filtrer par tag ou nom de la collection (Proof-of-Skill™, Pass, etc.)

```ts
const userNFTs = await getUserNFTs(walletAddress);
const hasPass = userNFTs.some(nft => nft.name.includes('Gold Pass'));
```

---

## 🪙 3. Vérification du token \$MFAI

```ts
const balance = await getTokenBalance(address, '$MFAI');
const eligible = balance > 100;
```

> Astuce : actualiser le solde après une action (staking, vote...)

---

## 🚪 4. Token Gating Logic (Phase Locks)

| Phase        | Conditions d'accès          |
| ------------ | --------------------------- |
| **Build**    | Gold NFT Pass requis        |
| **Prove**    | Proof-of-Skill™ NFT requis |
| **Activate** | \$MFAI stakés OU NFT Pass   |
| **Scale**    | DAO role / Platinum Pass    |

```tsx
if (!hasPass && phase === 'Build') return <LockedOverlay reason="Gold Pass required" />;
```

---

## 🧠 5. NFT Minting Flow (Simplifié)

```ts
const mintNFT = async () => {
  const metadata = {
    name: 'Proof-of-Skill: Web3 Basics',
    image: '/nfts/web3_basic.png',
    attributes: [{ trait_type: 'XP', value: 75 }],
  };

  await thirdweb.mintTo(walletAddress, metadata);
};
```

🎁 Suggestion UI :

- Modal de succès → NFT visible dans `<NFTBadge />`
- Feedback animé : confetti, Zyno applaudit

---

## 🧾 6. Stockage NFT & XP

- NFTs sur blockchain → appel à chaque connexion
- XP → persisté localement + résumé on-chain optionnel (NFT badge résumé)

## ✨ Partie 5/6 — Animation, AI & CTA Intelligence

---

## 🎯 Objectif

Créer une interface :

- fluide et agréable visuellement (animations contextuelles)
- **guidée par l’IA Zyno** selon les profils et comportements
- avec des **CTA intelligents** qui s’adaptent à la progression utilisateur

---

## 🎞️ 1. Animations avec Framer Motion

### 📌 Intégrations recommandées

| Composant          | Effet                                  |
| ------------------ | -------------------------------------- |
| `<JourneyCard />`  | Slide-in on scroll                     |
| `<PhaseSection />` | Fade + scale transition between phases |
| `<NFTBadge />`     | Bounce or glow on unlock               |
| `<XPTracker />`    | Progress bar animation                 |
| `<CTASection />`   | Pulse animation when unlocked          |

```tsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  <JourneyCard />
</motion.div>
```

---

## 🧠 2. Zyno AI Integration

### 🧩 Objectifs :

- Fournir des **hints contextuels**
- Répondre aux questions par phase
- Donner des **recommandations proactives** (“Zyno suggests…”)

### 🔧 Implémentation (simplifiée)

```tsx
<ZynoBox context={`phase:${currentPhase}`} onPrompt={msg => sendToZynoAI(msg)} />
```

Backend suggestion : `LangChain` avec vecteurs (OpenAI, Cohere, Zyno RAG)

---

## 💬 3. Types de contenu de Zyno

| Situation           | Réponse attendue                            |
| ------------------- | ------------------------------------------- |
| Blocage utilisateur | “Want me to explain this step again?”       |
| Fin de phase        | “You’re ready to prove your skills.”        |
| Nouveau parcours    | “Based on your profile, I suggest you try…” |
| Échec quiz          | “Let’s review what you missed.”             |
| Fin de parcours     | “Congrats! Here’s your Proof NFT.”          |

---

## 🧠 4. CTA System (Smart Call-To-Action)

### 🎯 But : un système contextuel, personnalisé et réactif

```ts
const getCTA = () => {
  if (!walletConnected) return 'Connect your wallet';
  if (!hasNFT) return 'Mint Proof-of-Skill™';
  if (currentPhase === 'Learn') return 'Start Learning';
  if (currentPhase === 'Prove') return 'Take the Quiz';
  return 'Ask Zyno for Guidance';
};
```

```tsx
<StartCTA label={getCTA()} onClick={handleAction} />
```

---

## 🏷️ 5. CTA Design par Phase

| Phase    | CTA Label                    | Style      |
| -------- | ---------------------------- | ---------- |
| Learn    | “Start Now with Zyno”        | Primary    |
| Build    | “Create your first project”  | Green Glow |
| Prove    | “Mint your Proof-of-Skill™” | Purple CTA |
| Activate | “Join a DAO vote”            | Dark/DAO   |
| Scale    | “Apply to Launchpad”         | Gold Pulse |

---

## 🎁 6. Bonus UI feedbacks

| Action         | Animation                           |
| -------------- | ----------------------------------- |
| Phase complete | Confetti (🎉)                       |
| NFT mint       | NFT floats and locks into tray      |
| XP milestone   | Glow + sound                        |
| Zyno message   | “Zyno eye” blinking or sound bubble |

## 📦 Partie 6/6 — Final Developer Roadmap & Deliverables

---

## 🚧 1. Roadmap Technique pour Intégration

| Étape                                   | Description                                                   |
| --------------------------------------- | ------------------------------------------------------------- |
| 🧱 **1. Setup de la base React**        | Initialiser projet avec Next.js ou CRA + Tailwind + Zustand   |
| 🧠 **2. Ajout des données statiques**   | Créer `journeyData.ts` avec tous les parcours/personas        |
| 🧩 **3. Implémenter les composants UI** | Intégrer `<JourneyCard />`, `<JourneyTimeline />`, etc.       |
| 🔌 **4. Connecter le wallet & NFT**     | Intégration `wagmi` / `solana-wallet-adapter` + NFT scan      |
| 🔐 **5. Gérer l’état utilisateur**      | Hook Zustand pour suivre XP, persona, NFTs, etc.              |
| 💬 **6. Brancher Zyno (IA)**            | API backend pour prompts, suggestions, scoring                |
| ✨ **7. Animer et optimiser**           | Ajouter Framer Motion + animations conditionnelles            |
| 🧪 **8. Tester tous les cas d’usage**   | Persona différents, wallet connecté/déconnecté, gated actions |
| 🚀 **9. Push en staging**               | Déploiement sur vercel/netlify pour tests communautaires      |
| ✅ **10. Validation DAO & production**  | Feedback DAO + mise en ligne officielle                       |

---

## 🧰 2. Stack Technique Recommandée

| Domaine             | Outils / Libs                    |
| ------------------- | -------------------------------- |
| Frontend            | React, Next.js, Tailwind CSS     |
| Animation           | Framer Motion                    |
| State Management    | Zustand                          |
| Wallet (EVM)        | RainbowKit, wagmi                |
| Wallet (Solana)     | Solana Wallet Adapter            |
| NFT / Web3          | Thirdweb, Moralis, Metaplex      |
| IA / Zyno           | LangChain, OpenAI, Vercel AI SDK |
| CMS (optionnel)     | Sanity, Notion API               |
| Backend (si besoin) | Firebase / Supabase / NodeJS API |

---

## 📁 3. Livrables attendus

| Nom du Fichier                   | Contenu                                 |
| -------------------------------- | --------------------------------------- |
| `journeys/index.tsx`             | Page principale avec liste des parcours |
| `components/JourneyCard.tsx`     | Carte de résumé par persona             |
| `components/JourneyTimeline.tsx` | Timeline à 5 étapes avec CTA            |
| `components/PhaseSection.tsx`    | Affichage par phase                     |
| `components/NFTBadge.tsx`        | Badges NFT débloqués                    |
| `components/ZynoBox.tsx`         | Assistant IA contextuel                 |
| `components/XPTracker.tsx`       | Tracker d’XP visuel                     |
| `utils/useUserState.ts`          | Hook Zustand (état utilisateur)         |
| `utils/journeyData.ts`           | Configuration des parcours              |
| `utils/nftUtils.ts`              | Fonctions Web3 (wallet, NFT, token)     |
| `utils/zynoLogic.ts`             | Prompts IA et logique dynamique         |

---

## 🧠 4. Bonnes pratiques

- Toutes les actions doivent donner **un feedback visuel immédiat**
- Prévoir des **composants réactifs à l’état du wallet**
- Éviter toute logique conditionnelle hardcodée (tout doit être data-driven)
- Optimiser pour **mobile-first**
- Documenter chaque composant en `.md` ou `.tsx` docstring

---

## ✅ 5. Validation UX & DAO

- Réaliser des tests avec profils variés (builder, investisseur, curieux…)
- Prendre en compte :

  - Accessibilité (ARIA)
  - Latence Web3
  - Adaptabilité des CTA

- Obtenir feedback DAO via vote Snapshot ou formulaire de validation

---

## 🧠 Conclusion finale

Cette page est **le cœur de l’expérience utilisateur MFAI**. Elle doit incarner :

- L’esprit de **gamification intelligente**
- L’utilité concrète des **NFTs comme preuve**
- La présence vivante de **Zyno comme mentor IA**
- Le rôle actif du token **\$MFAI comme moteur d’engagement**

---

## 🧩 SECTION X — Strategic Clarifications & Simulation Mode Expectations (June 2025 Update)

### 🎯 1. Purpose of the Journeys Page (Simulation Mode)

The “User Journeys” page must function as a **narrative simulator**, allowing all visitors — even those without a wallet — to fully understand how they could evolve through the Money Factory AI protocol.

#### Core Objectives:

- Explain and illustrate the **Cognitive Activation Protocol™**
- Help users self-identify via personas and project into a gamified path
- Provide an interactive, frictionless preview (no NFT/wallet gating)

> 💡 This is a pedagogical demo, not a production dApp (yet).

---

### 🧪 2. Functional Simulation — Key Mechanics

Each journey must allow full navigation through the 5 phases via:

- ⏭️ Manual navigation: Next / Previous buttons
- 📈 Dynamic dashboard preview:
  - XP progression bar
  - \$MFAI simulated balance
  - Certifications / NFTs earned
- 📋 Phase details:
  - Title, mission, expected outcome
  - Static Zyno tip or quote
  - Optional unlocks via NFT Pass

#### Developer Notes:

- Use React state or Zustand to simulate progress
- XP and rewards should update locally only
- Zyno should appear as a **non-interactive assistant box** in this prototype
- Tooltips should show what each action leads to (XP, badge, etc.)

---

### 🪙 3. NFT Pass Integration (Optional but Visible)

NFT Passes (Gold, Platinum, Diamond) must **not block access**, but should:

- Show visually what they would **unlock/enhance**
- Appear as optional “power-ups” per phase

| Phase    | With NFT Pass Example                        |
| -------- | -------------------------------------------- |
| Learn    | Bonus XP for Gold Pass holders               |
| Build    | Unlock premium templates with Platinum Pass  |
| Prove    | Fast-track certification with Diamond Pass   |
| Activate | DAO role booster (Platinum and above)        |
| Scale    | Eligible for Neuro-Dividends™ with any Pass |

> 🏷️ Use visual badges and tooltips, not modals or lock icons.

---

### 🎨 4. Design Alignment: Solana + MFAI Brand

#### 🎨 Color Scheme:

- Base: `#0F172A` (dark blue/black)
- Accent: `#22D3EE` (cyan), `#C084FC` (purple), `#14F195` (mint)
- Gradients: `linear-gradient(90deg, #9945FF, #14F195)`

#### 🖋️ Fonts:

- Headings: `Space Grotesk` or `General Sans`
- Body: `Inter`, `Geist`, or `Manrope`

#### 🖼️ Icons:

- Use only `Lucide`, `Phosphor` or custom MFAI icons
- Replace Telegram-style emojis with semantic React-based icons

✅ Examples:

- 🎓 → `<GraduationCapIcon />`
- 💰 → `<BanknoteIcon />`
- 🛠️ → `<WrenchIcon />`

---

### 🧬 5. Vocabulary & Pathway Alignment

Use **MFAI-native narrative** and terms across all journeys.

#### ✅ Valid Pathway Names:

- Cognitive Activation Hub
- Capital Foundry
- System Architect
- Experience Studio
- Impact Engine
- Resilience Master

#### ❌ Do Not Use:

- “path”, “course”, “module”, “advisor”

#### ✅ Use Instead:

| Generic Term  | MFAI Language        |
| ------------- | -------------------- |
| Path          | Cognitive Journey    |
| Phase Step    | Activation Phase     |
| Certification | Proof-of-Skill™ NFT |
| Coach/Guide   | Zyno AI Co-Founder™ |
| Learning      | Skillchain Mining™  |

---

### 🧠 Final Reminder for Dev

This page must:

- Simulate **value**, not just UI
- Emulate **progression**, not navigation
- Visualize **transformation**, not content

> Zyno should feel present. XP should feel earned. And every user should walk away wanting to activate their journey.
