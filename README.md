# Money Factory AI - Journey Simulator

**A Web3-native platform implementing the Cognitive Activation Protocol™**

[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![Solana](https://img.shields.io/badge/blockchain-Solana-9945FF.svg)](https://solana.com)
[![React](https://img.shields.io/badge/frontend-React-61DAFB.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6.svg)](https://typescriptlang.org)

**🌐 Live Demo**: [mfai.app](https://mfai.app) | **📂 Repository**: [github.com/cyranoaladin](https://github.com/cyranoaladin/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Core Concepts](#core-concepts)
- [Technical Stack](#technical-stack)
- [Project Structure](#project-structure)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Blockchain Integration](#blockchain-integration)
- [User Interface](#user-interface)
- [Development Workflow](#development-workflow)
- [Configuration](#configuration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Known Issues](#known-issues)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

Money Factory AI (MFAI) Journey Simulator is a revolutionary Web3-native platform that transforms users' skills into digital capital through the **Cognitive Activation Protocol™**. This protocol guides users through a structured 5-phase journey: Learn → Build → Prove → Activate → Scale.

The platform integrates:
- **AI Assistance** (Zyno AI Co-Founder™)
- **NFT Certifications** (Proof-of-Skill™)
- **Gamified XP Progression**
- **Token Economics** ($MFAI)
- **DAO Governance** (Synaptic Governance™)
- **Solana Blockchain Integration**

### Key Features

- 🎓 **6 Distinct User Personas** with tailored journeys
- 🏆 **NFT-based Skill Certification** on Solana
- 💰 **Token Staking & Rewards** system
- 🗳️ **DAO Governance** participation
- 🤖 **AI-powered Guidance** through Zyno
- 📱 **Responsive Design** for all devices
- 🔗 **Wallet Integration** with Phantom, Solflare, etc.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Git** for version control
- **Solana Wallet** (Phantom recommended)
- **Basic understanding** of React and TypeScript

### Installation

```bash
# Clone the repository
git clone https://github.com/cyranoaladin/journey-simulator.git
cd journey-simulator

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Integration with Money Factory AI Website

This journey simulator is designed to be integrated into the main Money Factory AI website at [mfai.app](https://mfai.app). The integration will include:

1. **CTA Button**: A prominent call-to-action button on the main website inviting users to "Experience Your Journey"
2. **Seamless Navigation**: Direct linking from the main site to the journey simulator
3. **Consistent Branding**: Matching design language and user experience
4. **Data Integration**: Potential user data synchronization between platforms

#### Recommended Integration Points:
- **Homepage Hero Section**: Primary CTA to start journey simulation
- **About Page**: Detailed explanation with link to try the simulator
- **Navigation Menu**: Direct access to journey simulator
- **Footer**: Secondary access point for interested users

### Wallet Setup for Development

1. **Install Phantom Wallet** browser extension
2. **Switch to Devnet**:
   - Open Phantom → Settings → Developer Settings
   - Change Network from "Mainnet" to "Devnet"
3. **Get Devnet SOL**:
   - Use the built-in faucet button in the app
   - Or visit [Solana Faucet](https://solfaucet.com/)

### First Run

1. Connect your wallet (set to Devnet)
2. Select a persona that matches your profile
3. Start your journey through the 5 phases
4. Earn XP, mint NFTs, and participate in governance

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Blockchain    │    │   AI Services   │
│   (React/TS)    │◄──►│   (Solana)      │    │   (Zyno AI)     │
│                 │    │                 │    │                 │
│ • UI Components │    │ • Smart         │    │ • Contextual    │
│ • State Mgmt    │    │   Contracts     │    │   Guidance      │
│ • Wallet Conn   │    │ • NFT Minting   │    │ • Validation    │
│ • Animations    │    │ • Token Staking │    │ • Recommendations│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow

```
User Action → State Update → Blockchain Transaction → UI Feedback
     ↓              ↓              ↓                    ↓
  Click Mint    Update Store    Sign with Wallet    Show Success
```

### Component Hierarchy

```
App
├── Header (Navigation + Wallet)
├── HeroSection (Landing + Skillchain Card)
├── JourneysPage
│   ├── PersonaSelector
│   ├── JourneyTimeline
│   ├── JourneyDashboard
│   └── PhaseSection[]
├── AccessPassHolders
├── Footer
└── Modals
    ├── JourneyModal
    ├── NFTProofModal
    ├── StakingModal
    └── DAOVoteModal
```

---

## 🧠 Core Concepts

### Cognitive Activation Protocol™

The foundation of the platform is a 5-phase progression model:

#### Phase 1: Learn
- **Objective**: Acquire foundational knowledge
- **Activities**: Interactive content, quizzes, videos
- **Rewards**: XP, $MFAI tokens, basic NFT badges
- **Duration**: 1-2 weeks

#### Phase 2: Build
- **Objective**: Apply knowledge to create projects
- **Activities**: Wallet setup, project creation, MVP development
- **Rewards**: Builder NFTs, increased XP, tool access
- **Duration**: 2-3 weeks

#### Phase 3: Prove
- **Objective**: Validate skills through challenges
- **Activities**: Skill assessments, peer review, certification
- **Rewards**: Proof-of-Skill™ NFTs, community recognition
- **Duration**: 1-2 weeks

#### Phase 4: Activate
- **Objective**: Engage in governance and staking
- **Activities**: DAO voting, token staking, community participation
- **Rewards**: Governance rights, staking rewards, voting power
- **Duration**: Ongoing

#### Phase 5: Scale
- **Objective**: Expand impact and earn passive income
- **Activities**: Teaching, project launching, ecosystem contribution
- **Rewards**: Neuro-Dividends™, leadership roles, revenue sharing
- **Duration**: Ongoing

### User Personas

Each persona follows the same 5-phase structure but with tailored content:

#### 1. Curious Student 🎓
- **Target**: Newcomers to Web3
- **Focus**: Learning fundamentals, earning first rewards
- **Journey**: Web3 basics → Wallet setup → Skill certification → DAO participation → Passive income

#### 2. Web2 Entrepreneur 💼
- **Target**: Traditional business owners
- **Focus**: Tokenizing business models
- **Journey**: NFT business models → MVP creation → Vision validation → Product integration → Funding

#### 3. Web3 Developer ⚡
- **Target**: Technical builders
- **Focus**: Protocol-level development
- **Journey**: Smart contracts → DApp building → Code auditing → Demo Day → Core team

#### 4. Content Creator 🎨
- **Target**: Artists and creators
- **Focus**: Monetizing creativity
- **Journey**: NFT art economics → Collection creation → Community validation → Distribution → Revenue streams

#### 5. Community Communicator 🗣️
- **Target**: Community builders
- **Focus**: Strategic coordination
- **Journey**: Communication training → Mission design → Leadership validation → Governance → Protocol influence

#### 6. Project Manager 🎯
- **Target**: Operational experts
- **Focus**: Mission orchestration
- **Journey**: Ops DNA mapping → Mission design → Orchestration mastery → Meta-missions → Council membership

### Token Economics

#### $MFAI Token Utility
- **Learning Rewards**: Earned through phase completion
- **Staking**: Required for advanced phases and governance
- **Governance**: Voting power in DAO decisions
- **Access**: Premium features and exclusive content
- **Rewards**: Neuro-Dividends™ for active participants

#### NFT Certifications
- **Proof-of-Skill™**: Validates learning achievements
- **Proof-of-Vision™**: Recognizes innovative ideas
- **Proof-of-Build™**: Certifies technical contributions
- **Proof-of-Creation™**: Acknowledges creative work
- **Access Passes**: Gold, Platinum, Diamond tiers

---

## 🛠️ Technical Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI framework |
| **TypeScript** | 5.2.2 | Type safety |
| **Vite** | 4.5.0 | Build tool & dev server |
| **Tailwind CSS** | 3.3.5 | Styling framework |
| **Framer Motion** | 10.16.4 | Animations |
| **Zustand** | 4.4.1 | State management |
| **Lucide React** | 0.292.0 | Icon library |

### Blockchain Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Solana Web3.js** | 1.98.2 | Blockchain interaction |
| **Wallet Adapter** | 0.15.35 | Wallet integration |
| **SPL Token** | 0.4.13 | Token operations |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **PostCSS** | CSS processing |
| **Autoprefixer** | CSS vendor prefixes |

---

## 📁 Project Structure

```
money-factory-ai/
├── docs/                           # Documentation
│   ├── README.md                   # This file
│   ├── blockchain_integration_plan.md
│   ├── cahier_charges.md
│   ├── protocol_paper_en.md
│   └── project_documentation.md
├── public/                         # Static assets
│   ├── images/                     # Images and icons
│   │   ├── logo_mfai.png
│   │   ├── activation_loop.png
│   │   ├── solana.svg
│   │   └── personas/               # Persona-specific images
│   └── favicon.ico
├── src/                           # Source code
│   ├── components/                # React components
│   │   ├── Journey/               # Journey-specific components
│   │   │   ├── JourneyCard.tsx
│   │   │   ├── JourneyTimeline.tsx
│   │   │   ├── JourneyDashboard.tsx
│   │   │   ├── PhaseSection.tsx
│   │   │   ├── XPTracker.tsx
│   │   │   └── ZynoBox.tsx
│   │   ├── Header.tsx             # Navigation
│   │   ├── HeroSection.tsx        # Landing section
│   │   ├── JourneysPage.tsx       # Main journey interface
│   │   ├── SkillchainCard.tsx     # Interactive progress card
│   │   ├── WalletButton.tsx       # Wallet connection
│   │   ├── AccessPassHolders.tsx  # Success stories
│   │   ├── Footer.tsx             # Site footer
│   │   ├── ZynoAssistant.tsx      # AI assistant
│   │   └── [Modals]/              # Various modal components
│   ├── contexts/                  # React contexts
│   │   └── WalletContext.tsx      # Wallet provider
│   ├── data/                      # Static data
│   │   ├── personas.ts            # Journey definitions
│   │   ├── holders.ts             # Success stories
│   │   └── proofsData.ts          # NFT metadata
│   ├── store/                     # State management
│   │   ├── journeyStore.ts        # Main app state
│   │   └── themeStore.ts          # Theme state
│   ├── types/                     # TypeScript definitions
│   │   └── journey.ts             # Core type definitions
│   ├── utils/                     # Utility functions
│   │   ├── blockchain.ts          # Blockchain operations
│   │   └── particles.ts           # Background effects
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # App entry point
│   └── index.css                  # Global styles
├── index.html                     # HTML template
├── package.json                   # Dependencies
├── tailwind.config.js             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
├── vite.config.ts                 # Vite configuration
└── README.md                      # This documentation
```

---

## 🧩 Component Architecture

### Core Components

#### App.tsx
**Purpose**: Main application orchestrator
**Responsibilities**:
- Route management
- Global layout
- Context providers
- Modal management

```typescript
function App() {
  const { isDark } = useThemeStore()
  const { selectedPersona } = useJourneyStore()

  return (
    <WalletContextProvider>
      <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
        <Header />
        <WalletConnectionBanner />
        <SkillchainBanner />
        <main>
          {!selectedPersona && <HeroSection />}
          <JourneysPage />
          {!selectedPersona && <AccessPassHolders />}
        </main>
        <Footer />
        <JourneyModal />
        <ZynoAssistant />
      </div>
    </WalletContextProvider>
  )
}
```

#### JourneysPage.tsx
**Purpose**: Main journey interface
**Responsibilities**:
- Persona selection
- Journey timeline display
- Phase management
- Progress tracking

**Key Features**:
- Dynamic persona switching
- Real-time progress updates
- Modal management for phases
- NFT minting integration

#### SkillchainCard.tsx
**Purpose**: Interactive progress visualization
**Responsibilities**:
- User progress display
- 3D flip animation
- Wallet status integration
- NFT collection showcase

**Technical Implementation**:
```typescript
const [isFlipped, setIsFlipped] = useState(false)

return (
  <div className="perspective">
    <motion.div
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Front and back card content */}
    </motion.div>
  </div>
)
```

#### WalletButton.tsx
**Purpose**: Wallet connection and management
**Responsibilities**:
- Multi-wallet support
- Connection status display
- Transaction history
- Network detection

**Supported Wallets**:
- Phantom
- Solflare
- Torus
- Ledger
- MathWallet
- TokenPocket
- Coinbase Wallet

### Modal Components

#### NFTProofModal.tsx
**Purpose**: NFT certification display and minting
**Features**:
- Proof-of-Skill™ visualization
- Minting workflow
- Metadata display
- Social sharing
- Download functionality

#### StakingModal.tsx
**Purpose**: Token staking interface
**Features**:
- Staking amount selection
- APY calculation
- Reward estimation
- Cognitive Lock™ implementation

#### DAOVoteModal.tsx
**Purpose**: Governance participation
**Features**:
- Proposal display
- Voting interface
- Voting power calculation
- Results visualization

---

## 🗄️ State Management

### Zustand Stores

#### journeyStore.ts
**Purpose**: Main application state management

**State Structure**:
```typescript
interface JourneyState {
  // Core journey data
  selectedPersona: Persona | null
  currentPhase: number
  userProgress: UserProgress
  
  // UI state
  isModalOpen: boolean
  modalContent: any
  
  // Blockchain features
  testnetFeatures: TestnetFeatures
  
  // Actions
  setSelectedPersona: (persona: Persona | null) => void
  updateProgress: (xp: number, nfts?: string[], mfai?: number) => void
  completePhase: (phaseIndex: number) => void
  mintNFT: (nftName: string) => Promise<string>
  updateStaking: (amount: number) => void
  updateVotingPower: (newPower: number) => void
  updateWalletConnection: (connected: boolean, address?: string) => void
  // ... other actions
}
```

**Key Features**:
- Persistent storage with Zustand persist middleware
- Automatic XP and level calculation
- NFT collection management
- Wallet state synchronization

#### themeStore.ts
**Purpose**: Theme management
```typescript
interface ThemeState {
  isDark: boolean
  toggleTheme: () => void
}
```

### Data Persistence

**Local Storage**: User progress, selected persona, and preferences are automatically persisted using Zustand's persist middleware.

**Session Storage**: Temporary UI state like modal content and current phase.

**Blockchain State**: NFT ownership and token balances are fetched from the blockchain on wallet connection.

---

## ⛓️ Blockchain Integration

### Current Implementation

The platform currently operates in **simulation mode** with the following blockchain integrations:

#### Wallet Connection
- **Network**: Solana Devnet
- **Auto-connect**: Disabled (user-initiated)
- **Error Handling**: Comprehensive error states and user feedback

```typescript
// src/contexts/WalletContext.tsx
export const WalletContextProvider: React.FC = ({ children }) => {
  const network = 'devnet'
  const endpoint = useMemo(() => clusterApiUrl(network), [network])
  
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    // ... other adapters
  ], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
```

#### Transaction Simulation
All blockchain operations are currently simulated with realistic delays and responses:

```typescript
// Example: NFT Minting Simulation
mintNFT: async (nftName: string) => {
  // Simulate minting delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Generate mock mint address
  const mintAddress = `${Math.random().toString(36).substr(2, 8)}${Math.random().toString(36).substr(2, 8)}`
  
  // Update state
  set((state) => ({
    userProgress: {
      ...state.userProgress,
      nfts: [...state.userProgress.nfts, nftName],
    }
  }))
  
  return mintAddress
}
```

### Blockchain Utilities

#### src/utils/blockchain.ts
Provides utility functions for blockchain operations:

- `getConnection()`: Initialize Solana connection
- `requestAirdrop()`: Request devnet SOL
- `getWalletBalance()`: Fetch wallet balance
- `mintProofOfSkill()`: Mint NFT certification
- `stakeMFAI()`: Stake tokens
- `submitDAOVote()`: Submit governance vote
- `getProposalVotes()`: Fetch vote totals from the governance program
- `verifyTransaction()`: Verify transaction status

### Future Blockchain Integration

See `docs/blockchain_integration_plan.md` for detailed implementation roadmap including:
- Additional steps for deploying SPL Governance are documented in `docs/spl_governance_setup.md`.
- Smart contract deployment
- Real NFT minting with Metaplex
- Token staking contracts
- DAO governance implementation
- AI validation integration

---

## 🎨 User Interface

### Design System

#### Color Palette
```css
/* Primary Colors */
--primary-50: #f0f9ff;
--primary-500: #4361ee;
--primary-900: #0f172a;

/* Accent Colors */
--accent-cyan: #22D3EE;
--accent-purple: #C084FC;
--accent-gold: #FFD700;
--accent-mint: #14F195;
```

#### Typography
- **Headings**: Space Grotesk (modern, tech-focused)
- **Body**: Inter (readable, professional)
- **Code**: Monospace (for addresses, hashes)

#### Gradients
```css
.bg-gradient-primary { background: linear-gradient(90deg, #4361ee, #7209b7); }
.bg-gradient-solana { background: linear-gradient(90deg, #9945FF, #14F195); }
.bg-gradient-gold { background: linear-gradient(90deg, #FFD700, #FFA500); }
```

### Responsive Design

#### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

#### Mobile-First Approach
All components are designed mobile-first with progressive enhancement:

```css
/* Mobile base styles */
.card { padding: 1rem; }

/* Tablet enhancement */
@media (min-width: 768px) {
  .card { padding: 1.5rem; }
}

/* Desktop enhancement */
@media (min-width: 1024px) {
  .card { padding: 2rem; }
}
```

### Animation System

#### Framer Motion Integration
- **Page transitions**: Smooth enter/exit animations
- **Component mounting**: Staggered animations for lists
- **Interactions**: Hover and tap feedback
- **Progress indicators**: Animated progress bars and counters

#### Key Animation Patterns
```typescript
// Staggered list animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}
```

### Accessibility

#### WCAG 2.1 Compliance
- **Color contrast**: Minimum 4.5:1 ratio
- **Keyboard navigation**: Full keyboard support
- **Screen readers**: Proper ARIA labels and roles
- **Focus management**: Visible focus indicators

#### Implementation
```typescript
// Example: Accessible button
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="btn-primary"
  aria-label="Connect your Solana wallet"
  disabled={connecting}
>
  {connecting ? 'Connecting...' : 'Connect Wallet'}
</motion.button>
```

---

## 🔧 Development Workflow

### Getting Started

#### Environment Setup
```bash
# Clone repository
git clone https://github.com/cyranoaladin/journey-simulator.git
cd journey-simulator

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

#### Development Scripts
```bash
# Development server with hot reload
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Standards

#### TypeScript Configuration
- **Strict mode**: Enabled for type safety
- **Path mapping**: Configured for clean imports
- **ESLint integration**: Automatic linting

#### Component Structure
```typescript
// Standard component template
interface ComponentProps {
  // Props with clear types
}

const Component: React.FC<ComponentProps> = ({ 
  prop1, 
  prop2 
}) => {
  // Hooks at the top
  const [state, setState] = useState()
  const { storeValue } = useStore()
  
  // Event handlers
  const handleEvent = () => {
    // Implementation
  }
  
  // Render
  return (
    <div className="component-wrapper">
      {/* JSX content */}
    </div>
  )
}

export default Component
```

#### Styling Guidelines
- **Tailwind-first**: Use Tailwind utilities
- **Component classes**: For reusable patterns
- **CSS modules**: For complex component-specific styles
- **Responsive design**: Mobile-first approach

### Git Workflow

#### Branch Strategy
```
main                    # Production-ready code
├── develop            # Integration branch
├── feature/xyz        # Feature development
├── bugfix/abc         # Bug fixes
└── hotfix/urgent      # Critical fixes
```

#### Commit Convention
```
feat: add NFT minting functionality
fix: resolve wallet connection issue
docs: update README with setup instructions
style: improve button hover animations
refactor: optimize state management
test: add unit tests for journey store
```

---

## ⚙️ Configuration

### Environment Variables

#### Required Variables
```bash
# .env.local
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_APP_VERSION=1.0.0
```

#### Optional Variables
```bash
# Analytics
VITE_ANALYTICS_ID=your_analytics_id

# Feature flags
VITE_ENABLE_ZYNO_AI=true
VITE_ENABLE_REAL_BLOCKCHAIN=false

# API endpoints
VITE_API_BASE_URL=https://api.moneyfactory.ai
VITE_ZYNO_API_URL=https://zyno.moneyfactory.ai
```

### Tailwind Configuration

#### Custom Theme Extensions
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        'space': ['Space Grotesk', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#4361ee',
          900: '#0f172a',
        },
        accent: {
          cyan: '#22D3EE',
          purple: '#C084FC',
          gold: '#FFD700',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      }
    }
  }
}
```

### Vite Configuration

#### Build Optimization
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          blockchain: ['@solana/web3.js', '@solana/wallet-adapter-react'],
        }
      }
    }
  }
})
```

---

## 🧪 Testing

### Testing Strategy

#### Unit Tests
- **Components**: React Testing Library
- **Utilities**: Jest
- **Stores**: Zustand testing utilities

#### Integration Tests
- **User flows**: Cypress
- **Wallet integration**: Mock wallet providers
- **API interactions**: MSW (Mock Service Worker)

#### E2E Tests
- **Critical paths**: Playwright
- **Cross-browser**: Chrome, Firefox, Safari
- **Mobile testing**: Device simulation

### Test Structure
```
src/
├── __tests__/              # Test files
│   ├── components/         # Component tests
│   ├── stores/            # Store tests
│   ├── utils/             # Utility tests
│   └── integration/       # Integration tests
├── __mocks__/             # Mock files
│   ├── wallet.ts          # Wallet mocks
│   └── blockchain.ts      # Blockchain mocks
└── test-utils.tsx         # Test utilities
```

### Running Tests
```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e

# All tests
npm run test:all
```

---

## 🚀 Deployment

### Build Process

#### Production Build
```bash
# Build for production
npm run build

# Preview build locally
npm run preview

# Analyze bundle size
npm run analyze
```

#### Build Output
```
dist/
├── assets/
│   ├── index-[hash].js      # Main application bundle
│   ├── vendor-[hash].js     # Third-party dependencies
│   └── index-[hash].css     # Compiled styles
├── images/                  # Optimized images
└── index.html              # Entry point
```

### Deployment Targets

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

#### Netlify
```bash
# Build command
npm run build

# Publish directory
dist

# Environment variables
VITE_SOLANA_NETWORK=mainnet-beta
```

#### Custom Server
```bash
# Build and serve
npm run build
npx serve dist

# With custom server
npm run build
node server.js
```

### Environment-Specific Configurations

#### Development
- Solana Devnet
- Debug logging enabled
- Hot module replacement
- Source maps

#### Staging
- Solana Testnet
- Error tracking
- Performance monitoring
- Feature flags

#### Production
- Solana Mainnet
- Optimized bundles
- CDN assets
- Analytics tracking

---

## 🐛 Known Issues

### Critical Issues

#### 1. Wallet Connection on Mobile
**Issue**: Phantom wallet connection may fail on mobile browsers
**Workaround**: Use desktop browser or Phantom mobile app
**Status**: Under investigation
**Priority**: High

#### 2. Transaction Simulation
**Issue**: All blockchain transactions are currently simulated
**Impact**: No real NFTs or tokens are minted
**Solution**: Implement real blockchain integration (see roadmap)
**Priority**: High

### Minor Issues

#### 3. Animation Performance
**Issue**: Complex animations may lag on older devices
**Workaround**: Reduce motion in accessibility settings
**Status**: Optimization in progress
**Priority**: Medium

#### 4. Image Loading
**Issue**: Some persona images may load slowly
**Workaround**: Images are lazy-loaded
**Status**: Considering CDN implementation
**Priority**: Low

### Browser Compatibility

#### Supported Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

#### Known Limitations
- ❌ Internet Explorer (not supported)
- ⚠️ Safari < 14 (limited Web3 support)
- ⚠️ Mobile browsers (wallet integration issues)

---

## 🗺️ Roadmap

### Phase 1: Real Blockchain Integration (Q1 2024)
- [ ] Deploy smart contracts on Solana Devnet
- [ ] Implement real NFT minting with Metaplex
- [ ] Connect staking to actual token contracts
- [ ] Enable real DAO voting
- [ ] Add transaction history and verification

### Phase 2: Enhanced User Experience (Q2 2024)
- [ ] Improve mobile responsiveness
- [ ] Add advanced animations and micro-interactions
- [ ] Implement progressive web app (PWA) features
- [ ] Add multi-language support
- [ ] Enhance accessibility features

### Phase 3: AI Integration (Q3 2024)
- [ ] Connect Zyno to real AI backend
- [ ] Implement contextual guidance system
- [ ] Add personalized learning paths
- [ ] Create AI-powered validation
- [ ] Develop intelligent mission generation

### Phase 4: Advanced Features (Q4 2024)
- [ ] Launch marketplace for NFT certifications
- [ ] Implement mentorship system
- [ ] Create project launchpad
- [ ] Add social features and community
- [ ] Develop mobile applications

### Phase 5: Ecosystem Expansion (2025)
- [ ] Multi-chain support (Ethereum, Polygon)
- [ ] Enterprise partnerships
- [ ] Educational institution integration
- [ ] Corporate training programs
- [ ] Global scaling and localization

---

## 🤝 Contributing

### Development Setup

#### Prerequisites
- Node.js 18+
- Git
- Solana CLI (for blockchain development)
- Phantom wallet (for testing)

#### Setup Process
```bash
# Fork the repository
git clone https://github.com/cyranoaladin/journey-simulator.git
cd journey-simulator

# Install dependencies
npm install

# Create feature branch
git checkout -b feature/your-feature-name

# Start development
npm run dev
```

### Contribution Guidelines

#### Code Style
- Follow existing TypeScript and React patterns
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

#### Pull Request Process
1. **Create Issue**: Describe the feature or bug
2. **Fork & Branch**: Create a feature branch
3. **Develop**: Implement changes with tests
4. **Test**: Ensure all tests pass
5. **Document**: Update relevant documentation
6. **Submit PR**: Create pull request with description
7. **Review**: Address feedback from maintainers
8. **Merge**: Approved PRs are merged to develop

#### Areas for Contribution
- 🐛 **Bug Fixes**: Resolve existing issues
- ✨ **Features**: Implement new functionality
- 📚 **Documentation**: Improve guides and docs
- 🎨 **Design**: Enhance UI/UX components
- 🧪 **Testing**: Add test coverage
- 🌐 **Localization**: Add language support

### Community

#### Communication Channels
- **Website**: [mfai.app](https://mfai.app)
- **GitHub**: [github.com/cyranoaladin](https://github.com/cyranoaladin/)
- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and ideas

#### Code of Conduct
We are committed to providing a welcoming and inclusive environment. Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

---

## 📄 License

This project is proprietary and confidential. All rights reserved.

**Copyright © 2024 Money Factory AI**

Unauthorized copying, modification, distribution, or use of this software is strictly prohibited. This software is provided for evaluation and development purposes only under the terms of the signed agreement.

For licensing inquiries, contact: [legal@moneyfactory.ai](mailto:legal@moneyfactory.ai)

---

## 📞 Support & Contact

### Technical Support
- **Website**: [mfai.app](https://mfai.app)
- **GitHub Issues**: For bug reports and feature requests

### Business Inquiries
- **Website**: [mfai.app](https://mfai.app)
- **GitHub**: [github.com/cyranoaladin](https://github.com/cyranoaladin/)

### Development Team
- **Chief Operator & Blockchain Officer**: Alaeddine BEN RHOUMA
- **GitHub**: [github.com/cyranoaladin](https://github.com/cyranoaladin/)

## 🔗 Website Integration Guide

### For Website Developers

To integrate this journey simulator into the main Money Factory AI website at [mfai.app](https://mfai.app), follow these guidelines:

#### 1. CTA Button Implementation
```html
<!-- Primary CTA on homepage -->
<a href="/journey-simulator" class="cta-button-primary">
  <span>Experience Your Cognitive Journey</span>
  <span class="cta-subtitle">Discover how your skills become capital</span>
</a>

<!-- Secondary CTA -->
<a href="/journey-simulator" class="cta-button-secondary">
  Try Journey Simulator
</a>
```

#### 2. Routing Setup
```javascript
// Next.js routing example
// pages/journey-simulator.js or app/journey-simulator/page.js
export default function JourneySimulator() {
  return (
    <iframe 
      src="https://journey-simulator.mfai.app" 
      width="100%" 
      height="100vh"
      frameBorder="0"
      title="Money Factory AI Journey Simulator"
    />
  );
}
```

#### 3. Subdomain Setup
For optimal integration, consider hosting the simulator on a subdomain:
- **Simulator URL**: `journey.mfai.app` or `simulator.mfai.app`
- **Main Website**: `mfai.app`
- **API Endpoint**: `api.mfai.app`

#### 4. Analytics Integration
```javascript
// Track journey simulator engagement
gtag('event', 'journey_simulator_start', {
  'event_category': 'engagement',
  'event_label': 'persona_selection'
});
```

#### 5. SEO Considerations
```html
<!-- Meta tags for journey simulator page -->
<meta name="description" content="Experience the Cognitive Activation Protocol™ - Transform your skills into digital capital through Money Factory AI's interactive journey simulator">
<meta property="og:title" content="Money Factory AI Journey Simulator">
<meta property="og:description" content="Discover how to transform your skills into capital in the Proof Economy">
<meta property="og:url" content="https://mfai.app/journey-simulator">
```

---

## 🙏 Acknowledgments

### Technologies
- **Solana Foundation** for blockchain infrastructure
- **React Team** for the amazing framework
- **Tailwind Labs** for the utility-first CSS framework
- **Framer** for the motion library
- **Lucide** for the beautiful icons

### Community
- **Early Adopters** who provided valuable feedback
- **Beta Testers** who helped identify and resolve issues
- **Contributors** who helped improve the platform
- **Solana Developer Community** for support and guidance

---

**Built with ❤️ by the Money Factory AI Team**

*Transforming skills into capital through the Cognitive Activation Protocol™*

---

*Last updated: January 2024*
*Version: 1.0.0*