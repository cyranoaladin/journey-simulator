# Sovereign Engineering Manual (S.E.M.)

**Status:** IRON_SOVEREIGN_LOCKED
**Version:** 2.0.0 (S2_MASTERPIECE)
**Guardian:** Antigravity

---

## 🏗️ 1. Architecture Overview
The system is a high-fidelity "Journey Simulator" orchestrated by a dual-core architecture:
- **Frontend (Sim-Core):** React 18, Zustand (Global State), TailwindCSS, Mermaid.js (Dynamic), Katex (Dynamic).
- **Backend (Neural-Core):** Node.js, Express, PostgreSQL, TensorFlow/Brain.js (Simulated).

## 🧬 2. Extending the World

### Adding a New Persona
1. **Define Data**: Edit `src/data/personas.ts`.
   - Must include unique `id`, `title`, and highly detailed `description`.
   - Define minimal 5 phases in `phases: []`.
2. **Asset Generation**: Use `generate_image` to create a `card_bg_<id>.webp`.
3. **Register Route**: If using specific routing, ensure `App.tsx` handles dynamic params (already configured for `/journeys/:journeyId`).
4. **Validation**: Run `npx playwright test tests/e2e/05-agents-orchestration/features-validation.spec.ts`.

### Updating Validators
Validators reside in `src/components/UIBlocks/*.tsx`.
- **BondingCurve**: Uses `recharts` for visualization. ensure `data` prop matches schema.
- **CodeAuditor**: Uses regex-based simulation. Update patterns in `AuditorLogic.ts` (if extracted) or component logic.

## 📊 3. Interpreting Logs (Swarm Command Center)
Logs are structured as JSON streams.
- **[Store]**: Frontend state mutations. Look for `loadUserProgress` to debug hydration.
- **[Orchestrator]**: Backend agent coordination.
- **[Auth]**: Token rotation and security stamps.

**Critical Signals:**
- `IRON_SOVEREIGN_LOCKED=TRUE`: System integrity verified.
- `HYDRATION_MISMATCH`: React/Zustand sync error.

## 🚨 4. Emergency Protocols

### Kill-Switch (Immediate Lockdown)
If a security breach or runaway AI loop is detected:
```bash
./scripts/emergency-lockdown.sh
```
*Effect: Revokes all JWTs, sets runMode to 'maintenance', shuts down ports.*

### DB Recovery (Time-Travel)
Restore the last known sovereign snapshot:
```bash
./scripts/sovereign-snapshot.sh --restore latest
```

## 🔒 5. Security Standards
- **Scripts**: All scripts in `scripts/` MUST be executable (`chmod +x`).
- **Secrets**: `.env` files are git-ignored. verification via `ci-verify.sh`.
