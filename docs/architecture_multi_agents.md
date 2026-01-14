<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Architecture multi‑agents (MVP)

- Orchestrateur: web/src/server/zyno.ts → GPT‑5.1 (Responses API) avec `response_format=json_schema`
- Évaluateur: web/app/api/journeys/[id]/submit/route.ts (callZynoEvaluate)
- On‑chain: web/app/api/tx/prepare, mint/simulate, mint/execute + web/src/server/signer.ts
- Logs & state: web/src/server/state.ts (Prisma ou mémoire)
- UI Blocks: web/src/components/Journey/UIBlocksRenderer.tsx

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer
