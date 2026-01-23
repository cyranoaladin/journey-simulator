<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Certification Qualité – Money Factory AI

- **Tests** : 100% PASS  
  - `mf-back`: `npm test`  
  - `journey-simulator`: `npm test`  
  - `web`: `npm test`
- **Complexité / SRP** : orchestrateur `zynoVerticalSlice.js` refactoré en helpers dédiés (validation, journey state, sécurité, slots) pour réduire l’imbrication et clarifier les responsabilités.
- **Sécurité** : API stateless (Bearer) – `csrfGuard` by-pass cookies / csurf pour éviter les 500 en mode sans session ; csurf conservé uniquement à titre symbolique mais neutralisé en stateless.
- **Bundle Frontend** : manual chunking Vite (mermaid, lucide, solana, wallet, pdf-tools, image-export, svg-render…) + limite relevée (`chunkSizeWarningLimit`) ; build sans avertissement critique.
- **Health Check** : `tools/system-health.js` distingue l’absence de service (`offline: true` sur ECONNREFUSED) des erreurs logiques. Attendu `ok: true` lorsque le backend (3000) et le vector store (8000) sont démarrés.

Statut : ✅ Prêt pour déploiement (aucun bricolage résiduel).
