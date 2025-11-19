# Script de démo investisseur — Journey Simulator

Objectif: montrer une boucle complète et crédible en 8–10 minutes.

Pré-requis
- DEMO_MODE=true (ou parcours de démo prêt côté backend)
- ADMIN_API_KEY défini
- Minter devnet configuré (MINTER_SECRET_KEY) et solde > 0.1 SOL devnet

Parcours (séquence)
1) Contexte (30s)
   - "Vous voyez Journey Simulator: un orchestrateur multi-agents (Zyno) propulsé par GPT‑5.1."
   - "Parcours structurés Learn→Build→Prove→Activate→Scale, sorties strictement JSON → UI blocks."

2) Sélection rapide (30s)
   - Persona: Builder
   - Mode: discovery (ou builder suivant l’audience)
   - Langue: FR

3) Étape Zyno (2–3 min)
   - POST /api/journeys/:id/step (sans llm → démo) pour afficher:
     - text_block d’introduction
     - checklist_block (préparation)
     - mission_block (rédiger un pitch/tokenomics one‑pager)
     - resource_block (liens/templates)
     - action_suggestions_block (choix explicites)
     - xp_block (progression)

4) Soumission de mission (2–3 min)
   - POST /api/journeys/:id/submit?llm=1 (évalue via Zyno/GPT‑5.1):
     - evaluation_block (score + axes)
     - xp_block (xp_delta)
     - next_state
   - Montrer les logs admin:
     - /admin/logs (tokens/perf, erreurs si présentes)
     - /admin/state (last_state)

5) Mint NFT devnet (1–2 min)
   - /mint: Simuler puis Exécuter → signature (+ explorer optionnel)
   - Montrer "Last Mint" (GET /api/mint/last)

6) (Option) Vote simulé et Stake (1–2 min)
   - POST /api/dao/vote/simulate (oui/non)
   - POST /api/stake/simulate (X tokens → votingPowerDelta)

7) Conclusion (30s)
   - "Orchestration JSON stricte, métriques, mode démo scripté pour pitch."

Annexes
- Admin: /admin/logs, /admin/users, /admin/state (header x-api-key)
- OpenAPI: docs/openapi/journey-simulator.yaml (RapiDoc/ReDoc via npm scripts)
