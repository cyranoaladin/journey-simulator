# 🚀 Environnement de Test - Configuration Actuelle

## ✅ Services Actifs

### Backend
- **Port**: 3002 (changé de 3000 pour éviter les conflits)
- **URL**: `http://localhost:3002`
- **Status**: ✅ Running
- **Database**: MongoDB Connected

### Frontend  
- **Port**: 5173
- **URL**: `http://localhost:5173`
- **Status**: ✅ Running
- **Hot Reload**: Actif

---

## 🔐 Identifiants de Test

**Email**: `test@moneyfactory.ai`  
**Mot de passe**: `Test123!`

---

## 🎯 URLs de Test

### Application Principale
- **Login**: `http://localhost:5173/login`
- **Dashboard**: `http://localhost:5173/dashboard`
- **Journeys**: `http://localhost:5173/journeys`

### Deep Linking (Accès Direct aux Parcours)
- **Cognitive Activation Hub**: `http://localhost:5173/journeys/cognitive-activation-hub`
- **Capital Foundry**: `http://localhost:5173/journeys/capital-foundry`
- **System Architect**: `http://localhost:5173/journeys/system-architect`
- **Experience Studio**: `http://localhost:5173/journeys/experience-studio`
- **Impact Engine**: `http://localhost:5173/journeys/impact-engine`
- **Resilience Master**: `http://localhost:5173/journeys/resilience-master`

---

## 🔧 Configuration Technique

### CORS
Le backend autorise les requêtes depuis:
- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `http://localhost:3002`
- `http://127.0.0.1:3002`

### API Base URL
Le frontend est configuré pour communiquer avec:
```typescript
http://127.0.0.1:3002
```

---

## ✨ Fonctionnalités à Tester

### 1. Authentification
- [x] Login avec identifiants de test
- [ ] Logout
- [ ] Persistance de session

### 2. Deep Linking
- [ ] Navigation directe vers un parcours via URL
- [ ] Gestion des IDs invalides
- [ ] Retour à la liste des parcours

### 3. Navigation
- [ ] Sélection de persona
- [ ] Navigation entre parcours
- [ ] Navigation navigateur (back/forward)
- [ ] Maintien d'état entre routes

### 4. Interactions Zyno
- [ ] Démarrer un parcours
- [ ] Affichage des blocs UI
- [ ] Soumission de missions
- [ ] Évaluation par agents

### 5. Mode Démo
- [ ] Charger un état de démo
- [ ] Progression pré-configurée
- [ ] Données de test cohérentes

### 6. Validation des Ressources
- [ ] Affichage des ressources valides
- [ ] Filtrage des URLs invalides
- [ ] Copie d'informations

---

## 📝 Notes

- **Port Backend**: Changé de 3000 à 3002 pour éviter les conflits
- **CORS**: Correctement configuré pour localhost et 127.0.0.1
- **Hot Reload**: Le frontend se recharge automatiquement lors des modifications
- **MongoDB**: Connecté et opérationnel

---

**Date**: 2025-11-21 20:57  
**Status**: ✅ **READY FOR MANUAL TESTING**
