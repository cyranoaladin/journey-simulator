# Checklist d’acceptation (MVP)

Référence: `checklist.md` à la racine (liste structurée d’items BE/FE/CT).

Cette page sert de vue consolidée et coche chaque point lorsque vérifié:
- GPT‑5.1 intégration (Responses API, JSON schema strict): OK
- UI Blocks mappés (Text, Checklist, Quiz, Mission, Resource, Document, Evaluation, ActionSuggestions, XP): OK
- Flux Solana devnet: /api/tx/prepare, /api/mint/simulate, /api/mint/execute (avec KILL_SWITCH): OK
- Modes: DEMO_MODE + llm=1 (force live): OK
- Agents & logs UI: OK
- Tests: unit + int + E2E 100% verts, couverture backend ≥85% (report + gate CI): OK
- Observabilité: health, metrics, admin (x-api-key): OK

Plan d’exécution: docs/acceptance/validation_plan.md
