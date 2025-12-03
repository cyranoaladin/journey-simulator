
# Money Factory AI Journey Simulator

## Présentation
Plateforme d’apprentissage Web3 gamifiée, orchestrée par des agents IA (Zyno), intégrant la blockchain (NFT, staking, DAO) et la gestion de parcours personnalisés.

## Architecture
- **Frontend** : React/TypeScript (journey-simulator)
- **Backend** : Node.js/Express, MongoDB (mf-back)
- **Landing** : Next.js (web)
- **Orchestration IA** : Zyno multi-agent, RAG

## Fonctionnalités principales
- Authentification sécurisée (JWT)
- Suivi de progression, XP, NFT, tokens
- Mint NFT, staking, vote DAO, collaterize
- Orchestration multi-agent, recherche documentaire RAG
- UI moderne, responsive

## Installation
```bash
./start_dev.sh # Docker (recommandé)
# ou
cd mf-back && npm run dev
cd journey-simulator && npm run dev
```

## Tests
- **Backend** : `make test` (Jest)
- **Frontend** : Cypress e2e dans `journey-simulator/cypress/e2e/`

## Documentation technique
- **Endpoints API** : voir `mf-back/routes/`
- **Schémas DB** : `mf-back/models/`
- **Agents Zyno** : `mf-back/agents/`, orchestration dans `mf-back/orchestration/`
- **Workflows blockchain** : `src/utils/blockchain.ts`, roadmap dans `docs/blockchain_integration_plan.md`

## Démo investisseur
1. Création de compte
2. Navigation parcours, phases
3. Mint NFT, staking, vote DAO
4. Orchestration IA (console Zyno)

## Pitch
- Plateforme scalable, modulaire, extensible
- IA multi-agent, RAG, blockchain intégrée
- UX gamifiée, traçabilité, sécurité

---
Pour plus de détails, consultez les docs dans `docs/` et les README de chaque sous-projet.
