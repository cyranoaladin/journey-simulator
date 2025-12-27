# Audit initial (synthèse)

Source de vérité MVP: `web/`
Répertoires gelés (référence): `journey-simulator/`, `mf-back/`

Mapping cahier → implémentation
- GPT‑5.1 Orchestrateur: web/src/server/zyno.ts, web/app/api/journeys/[id]/step/route.ts, submit/route.ts
- JSON Schema (JourneyStepResponse): see journey-simulator/docs/schemas/JourneyStepResponse.schema.json
- UI Blocks: web/src/components/Journey/UIBlocksRenderer.tsx
- Solana devnet: web/app/api/tx/prepare, mint/simulate, mint/execute
- Observabilité: /api/health(z), /api/metrics, admin logs/state (see tests)

Gaps majeurs: aucun bloquant pour le MVP; CI racine ajoutée; docs centralisés.

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer
