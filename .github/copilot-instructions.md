<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Money Factory AI Journey Simulator - AI Agent Instructions

This is a **full-stack Web3 learning platform** implementing the Cognitive Activation Protocol™. The system combines a React/TypeScript frontend, Node.js/Express backend, MongoDB persistence, and simulated Solana blockchain integration with a multi-agent AI orchestration layer (Zyno).

## Architecture Overview

**Monorepo structure** with two major subsystems:
- `journey-simulator/` - React + TypeScript + Vite frontend with Zustand state management (Zyno UI lives in `src/components/Zyno/`)
- `mf-back/` - Express + MongoDB backend API (JWT auth, RESTful routes) including the Zyno multi-agent orchestrator (`mf-back/agents/`, `mf-back/orchestration/`, `mf-back/rag/`)

```
Frontend (React/TS) ←→ Backend API (Express) ←→ MongoDB
                    ↓
              Zyno Orchestrator ←→ RAG Docs + Agent Registry
                    ↓
            Solana Wallet Adapters (Devnet simulation)
```

**Key data flow**: User completes phase → Frontend updates Zustand store → API persists to MongoDB → Orchestrator may trigger agent workflows → Blockchain operations simulated locally.

## Essential Development Workflows

### Local Development

```bash
# Start full stack with Docker (recommended)
./start_dev.sh

# OR manually:
# Backend: cd mf-back && npm run dev (port 3000)
# Frontend: cd journey-simulator && npm run dev (port 5173+)
# MongoDB: docker compose up mongo
```

### Key Commands
- `make test` - Run backend Jest tests
- `make docker-build` - Build production backend image
- `npm run lint` - ESLint validation (frontend)
- `npm run test:coverage` - Generate test coverage (Zyno agents)

### CORS Configuration
Backend allows origins: `localhost:5173`, `5174`, `4173`, `127.0.0.1:4173` in development. Update `mf-back/app.js` corsOptions for new ports.

## Critical Patterns & Conventions

### State Management (Frontend)
**Zustand stores are the source of truth**:
- `journeyStore` - User progress, persona, phase completion, XP, NFTs, tokens (persisted to `localStorage` key `mfai-journey-storage`)
- `themeStore` - UI theme persistence

**IMPORTANT**: When modifying user progress:
1. Update Zustand store first via actions (`updateProgress`, `completePhase`)
2. Store automatically syncs to backend via `api.updateProgress()` and `api.completePhase()`
3. Backend endpoints return updated state to merge back

Example pattern in `src/store/journeyStore.ts`:
```typescript
completePhase: async (phaseIndex, options) => {
  // 1. Update local state
  set(state => ({ ...state, completedPhases: [...phases, phaseIndex] }))
  
  // 2. Persist to backend
  await api.completePhase({ phase_number: options?.phaseNumber, ... })
  
  // 3. Sync full progress
  await get().updateProgress(xp, nfts, mfai)
}
```

### Authentication Flow
**JWT-based with refresh tokens**:
- Access token stored in `localStorage.accessToken` (short-lived)
- Refresh token in `localStorage.refreshToken` (longer-lived)
- Protected routes use `middleware/auth.js` → `protect` middleware validates JWT and populates `req.user`
- Frontend `AuthContext` wraps `api.ts` request helper that auto-refreshes on 401

**When adding authenticated endpoints**:
```javascript
// Backend route
router.post('/endpoint', protect, controller.method)

// Frontend API call (automatic auth header injection)
await api.request('/endpoint', { method: 'POST', body: data })
```

### Backend Route Structure
All routes in `mf-back/routes/` follow RESTful patterns:
- `/user/*` - Auth, profile, tokens, certifications
- `/journey/*` - Journey CRUD, progress tracking, phase completion
- `/cours/*` - Course catalog and progress
- `/analytics/*` - Event tracking (downloads, shares)
- `/orchestration` - Zyno agent orchestration endpoint
- `/admin/agent-logs` - Agent execution logs
- `/admin/rag/upload` - RAG document ingestion

**Adding new routes**: Create `routes/new-feature-routes.js`, mount in `app.js`, use existing controller patterns from `controllers/`.

### Zyno Multi-Agent System
Backend implementation lives under `mf-back/`:
- **Agents** in `mf-back/agents/` inherit from `agent_template.js` (BuilderAgent, CoachAgent, DAOAgent, etc.)
- **Orchestrator** (`mf-back/orchestration/zynoOrchestrator.js`) detects intent → selects agents from `agentsRegistry.js` → executes the pipeline → aggregates AEPO/AECO scores
- **RAG integration** via `mf-back/rag/ragClient.js` queries local documents in `mf-back/data/rag-documents/`
- **Logs** persisted to MongoDB via `mf-back/models/agentFeedbackLog.js`

Frontend widgets for Zyno live in `journey-simulator/src/components/Zyno/` (console, mission flow, agent scoreboard).

**When modifying agents**:
1. Extend `mf-back/agents/agent_template.js` by creating a new agent file that implements `execute(context, user, payload)`
2. Return `{ result, score, references }` structure to keep orchestration telemetry consistent
3. Register the agent in `mf-back/orchestration/agentsRegistry.js`
4. Update `mf-back/orchestration/journey-tasks.json` to map new intents

### Blockchain Integration (Currently Simulated)
All blockchain operations in `src/utils/blockchain.ts` return mock data:
- `mintProofOfSkill()` - Generates fake mint address after 2s delay
- `stakeMFAI()` - Simulates staking transaction
- `submitDAOVote()` - Records vote locally

**Real Solana integration roadmap** documented in `docs/blockchain_integration_plan.md`. When implementing:
- Use Metaplex for NFT minting
- Deploy smart contracts to Devnet first
- Update `WalletContext` connection from simulated to real cluster

### Database Schema Conventions
MongoDB models in `mf-back/models/`:
- `user.js` - Central user document with embedded progress (`total_xp`, `completed_phases`, `nft_certificates`, `token_transactions`)
- `Journeys.js` - Per-user journey metadata (phases_status, completion_percentage)
- `cours.js` + `userCoursProgress.js` - Course catalog and progress tracking

**Key model field**: `persona` accepts both new IDs (`cognitive-hub`, `capital-foundry`) and legacy aliases for backward compatibility.

### Frontend Component Patterns
- **Journey components** in `src/components/Journey/` are connected to `journeyStore` hooks
- **Modals** (`NFTProofModal`, `StakingModal`, `DAOVoteModal`) receive props from `JourneysPage` parent orchestrator
- **Framer Motion** animations use `motion.*` components with `variants` pattern for staggered lists
- **Tailwind utilities** preferred over custom CSS; use `className={clsx(...)}` for conditional classes

### Environment Variables
**Frontend** (`journey-simulator/.env`):
- `VITE_SOLANA_NETWORK=devnet` - Wallet adapter network
- API_BASE_URL hardcoded in `src/utils/api.ts` as `http://localhost:3000` (change for production)

**Backend** (`mf-back/.env`):
- `MONGO_URI` - MongoDB connection string (default: `mongodb://127.0.0.1:27017/mfai`)
- `JWT_SECRET` - Token signing key (REQUIRED)
- `ADMIN_API_KEY` - Admin route protection

**Never commit** real secrets. Use `.env.example` as template.

## Common Pitfalls & Solutions

### Issue: 401 Unauthorized on authenticated routes
- **Check**: `localStorage.accessToken` exists in browser DevTools
- **Fix**: Call `loadUserProgress()` after login in `AuthContext` to hydrate state
- **Verify**: Backend logs show JWT validation passing in `middleware/auth.js`

### Issue: Zustand state not persisting across sessions
- **Check**: Browser localStorage key `mfai-journey-storage` contains expected JSON
- **Fix**: Ensure `persist` middleware wraps store in `create()(persist(...))` double-invocation pattern
- **Note**: `partialize` in store config selects which state properties persist

### Issue: Mongoose deprecation warnings on startup
- **Current**: `useNewUrlParser` and `useUnifiedTopology` options show warnings
- **Ignore**: Non-breaking until Mongoose 8 upgrade
- **Tracked**: Comment in `mf-back/app.js` line 29-32

### Issue: Vite build warnings about chunk size (>500KB)
- **Current**: Large vendor bundles due to Solana libraries
- **Fix**: Use dynamic imports for wallet adapters: `const { PhantomWalletAdapter } = await import('@solana/wallet-adapter-wallets')`
- **Example**: See `vite.config.ts` manualChunks configuration

### Issue: CORS errors from frontend
- **Check**: Frontend origin matches `allowedOrigins` array in `mf-back/app.js`
- **Fix**: Add new origin to array, restart backend
- **Note**: OPTIONS preflight handled by `app.options('*', cors(corsOptions))`

## Testing Conventions

### Backend Tests
Jest tests in `mf-back/__tests__/` follow pattern:
```javascript
describe('Controller', () => {
  beforeAll(async () => {
    await mongoose.connect(TEST_MONGO_URI)
  })
  
  it('should perform action', async () => {
    const res = await request(app).post('/endpoint').send(data)
    expect(res.status).toBe(200)
  })
})
```

### Zyno Agent Tests
Add or update tests under `mf-back/tests/` (unit specs inside `mf-back/tests/unit/`, integration flows in `mf-back/__tests__/`).
- Create `[agent].test.js` files alongside existing agent specs when adding behaviour.
- Use `npm run test:coverage --prefix mf-back` to verify coverage reports.

### Frontend Testing
No Jest/Vitest setup yet. **Recommendation**: Add React Testing Library for component tests, mock `useJourneyStore` with Zustand testing utilities.

## Integration Points

### Frontend ↔ Backend
- **Auth**: `AuthContext` → `api.login()` → `/user/login` → JWT returned
- **Progress**: `journeyStore.completePhase()` → `api.completePhase()` → `/journey/complete-phase` (protected)
- **Persona switch**: `setSelectedPersona()` → `api.updateUserPersona()` → `/user/persona`

### Backend ↔ Zyno
- **Orchestration trigger**: Frontend calls `/orchestration` with user intent
- **Agent execution**: `zynoOrchestrator.orchestrateZyno()` selects agents → agents query RAG → results aggregated
- **Feedback loop**: Agent logs written to MongoDB via `agentFeedbackLog.js`, displayed in `AgentLogViewer` component

### Wallet Integration
- `WalletContext` provides Solana wallet adapters (Phantom, Solflare, Torus, etc.)
- `WalletButton` triggers connection modal from `@solana/wallet-adapter-react-ui`
- On connect: `updateWalletConnection(true, address)` updates store → backend optional sync
- Network: Devnet by default (`clusterApiUrl('devnet')` in `contexts/WalletContext.tsx`)

## File Locations for Common Tasks

### Adding a new API endpoint
1. `mf-back/controllers/` - Create controller method
2. `mf-back/routes/` - Define route with middleware
3. `mf-back/app.js` - Mount route group
4. `journey-simulator/src/utils/api.ts` - Add helper function

### Adding a new journey phase
1. `journey-simulator/src/data/personas.ts` - Update persona's `phases` array
2. `journey-simulator/src/data/proofsData.ts` - Map phase to Proof-of-* type
3. Backend models already support dynamic phases (no changes needed)

### Adding a new Zyno agent
1. Add `mf-back/agents/NewAgent.js` extending `agent_template.js`
2. Register the agent in `mf-back/orchestration/agentsRegistry.js`
3. Map the intent in `mf-back/orchestration/journey-tasks.json`
4. Cover behaviour with tests in `mf-back/tests/unit/` (or `mf-back/__tests__/` for integration)

### Modifying UI components
- **Journey flow**: `journey-simulator/src/components/JourneysPage.tsx` (orchestrator)
- **Phase cards**: `journey-simulator/src/components/Journey/PhaseSection.tsx`
- **Zyno console**: `journey-simulator/src/components/Zyno/ZynoConsole.tsx`

## Documentation References

- **System architecture**: `docs/system_blueprint.md` (comprehensive technical overview)
- **Deployment**: `DEPLOY.md` (Docker setup, production builds)
- **Integration guide**: `journey-simulator/integration_guide_journey.md` (Zyno file structure)
- **Blockchain roadmap**: `journey-simulator/docs/blockchain_integration_plan.md`

## Code Style Notes

- **Backend**: CommonJS (`require`), camelCase for JS files, snake_case for model fields
- **Frontend**: ES6 modules (`import`), PascalCase for components, camelCase for utilities
- **Zyno**: CamelCase for agent classes, kebab-case for data files (JSON)
- **Commits**: Follow conventional commits (`feat:`, `fix:`, `docs:`) per `contributing.md`

---

**When in doubt**: Check `docs/system_blueprint.md` for detailed flow diagrams, or grep for existing patterns (`grep -r "completePhase" journey-simulator/src/`).
