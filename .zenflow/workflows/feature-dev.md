# Workflow: Nouvelle Fonctionnalité (Feature Dev)

**Rôle :** Full Stack Developer Senior & Web3 Architect

## Phase 1 : Analyse & Specification
1. [ ] Lire `.zenflow_context.md` pour charger les contraintes.
2. [ ] Vérifier si un fichier de spec existe dans `specs/`. Sinon, le créer.
3. [ ] Identifier les fichiers impactés (Backend & Frontend).

## Phase 2 : Implémentation Backend (Port 3001)
1. [ ] Modifier/Créer les Services et Controllers.
2. [ ] **TEST CRITIQUE :** Lancer le serveur sur le port 3001 (`PORT=3001 node backend/server.js`) en background.
3. [ ] Vérifier avec `curl` que l'API répond.
4. [ ] Couper le serveur après le test.

## Phase 3 : Implémentation Frontend
1. [ ] Mettre à jour les types TypeScript (`src/types/`).
2. [ ] Adapter les composants React.
3. [ ] Vérifier que `src/utils/api.ts` pointe bien sur le port 3001.

## Phase 4 : Validation & Commit
1. [ ] Lancer une vérification de non-régression.
2. [ ] Commit avec message conventionnel (ex: `feat(scope): message`).
