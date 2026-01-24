# Workflow MFAI - Feature Development

## Phase 1 : Initialisation
1. [ ] Lire `.zenflow_context.md` pour charger les contraintes (Port 3001).
2. [ ] Vérifier que l'environnement est propre (pas de processus zombies).

## Phase 2 : Développement
1. [ ] Implémenter le code (Backend ou Frontend).
2. [ ] **Backend :** Si modif, redémarrer sur le port 3001.
3. [ ] **Frontend :** Vérifier la connexion API (http://localhost:3001/api).

## Phase 3 : Validation & Commit
1. [ ] Tester manuellement avec `curl` ou le navigateur.
2. [ ] Commit sécurisé : `git commit -m "feat: ..." --no-verify`
