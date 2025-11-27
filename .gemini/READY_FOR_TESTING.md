# ✅ Environnement de Test - PRÊT

## 🎯 Services Actifs

### Backend (Port 3002)
- ✅ **Status**: Running
- ✅ **URL**: `http://localhost:3002`
- ✅ **MongoDB**: Connected
- ✅ **CORS**: Configuré pour localhost:5173 et 127.0.0.1:5173
- ✅ **Test API**: Login fonctionne

### Frontend (Port 5173)
- ✅ **Status**: Running
- ✅ **URL**: `http://localhost:5173`
- ✅ **Cache**: Vidé
- ✅ **Service Worker**: Désactivé
- ✅ **API URL**: Configurée sur port 3002 via `.env.local`

---

## 🔐 Identifiants de Test

**Email**: `test@moneyfactory.ai`  
**Mot de passe**: `Test123!`

✅ **Compte vérifié** - La connexion API fonctionne

---

## 🚀 Comment Tester

### 1. Ouvrir l'Application
```
http://localhost:5173/login
```

### 2. Se Connecter
- Entrez l'email: `test@moneyfactory.ai`
- Entrez le mot de passe: `Test123!`
- Cliquez sur "Sign In"

### 3. Tester le Deep Linking
Accès direct aux parcours:
- `http://localhost:5173/journeys/cognitive-activation-hub`
- `http://localhost:5173/journeys/capital-foundry`
- `http://localhost:5173/journeys/system-architect`
- `http://localhost:5173/journeys/experience-studio`
- `http://localhost:5173/journeys/impact-engine`
- `http://localhost:5173/journeys/resilience-master`

---

## 🔧 Corrections Appliquées

### 1. Port Backend
- ✅ Changé de 3000 à 3002 pour éviter les conflits

### 2. Configuration Frontend
- ✅ `api.ts`: URL mise à jour vers port 3002
- ✅ `.env.local`: Variables d'environnement créées
- ✅ Cache Vite: Vidé complètement

### 3. Service Worker
- ✅ Désactivé dans `main.tsx`
- ✅ `public/sw.js`: Remplacé par version auto-désinstallante

### 4. Providers React
- ✅ Ordre corrigé: WalletContext → Auth → Tutorial

### 5. CORS Backend
- ✅ Ajout de tous les ports et origines nécessaires
- ✅ Header `x-user-id` autorisé

---

## 📋 Checklist de Vérification

Avant de tester, assurez-vous que:

- [ ] Le backend tourne sur le port 3002
- [ ] Le frontend tourne sur le port 5173
- [ ] Vous utilisez une **fenêtre de navigation privée** OU vous avez vidé le cache
- [ ] Les DevTools sont ouverts (F12) pour voir les erreurs éventuelles

---

## 🐛 Si Vous Voyez Encore des Erreurs

### Erreur: "Failed to fetch" ou "CORS"
1. Vérifiez que le backend tourne: `curl http://localhost:3002/user/login`
2. Ouvrez une fenêtre de navigation privée
3. Videz complètement le cache du navigateur

### Erreur: "Port 3000"
1. Fermez TOUTES les fenêtres du navigateur
2. Rouvrez en navigation privée
3. Accédez à `http://localhost:5173/login`

### Erreur: "useAuth must be used within..."
1. Rafraîchissez la page (F5)
2. Si persiste, redémarrez le frontend

---

## 🎯 Scénarios de Test Prioritaires

### 1. Authentification
- [x] Login avec identifiants valides
- [ ] Logout
- [ ] Persistance de session

### 2. Deep Linking
- [ ] URL directe vers un parcours
- [ ] URL avec ID invalide
- [ ] Retour à la liste

### 3. Navigation
- [ ] Sélection de persona
- [ ] Workspace
- [ ] Back button
- [ ] Browser navigation

### 4. Interactions Zyno
- [ ] Démarrer un parcours
- [ ] Blocs UI
- [ ] Missions
- [ ] Évaluations

### 5. Mode Démo
- [ ] Load Demo State
- [ ] Progression avancée

---

## 📝 Commandes Utiles

### Vérifier le Backend
```bash
curl http://localhost:3002/user/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@moneyfactory.ai","password":"Test123!"}'
```

### Redémarrer le Frontend
```bash
cd journey-simulator
rm -rf node_modules/.vite
npm run dev
```

### Vérifier les Ports
```bash
lsof -i:3002  # Backend
lsof -i:5173  # Frontend
```

---

**Date**: 2025-11-21 21:43  
**Status**: ✅ **READY FOR MANUAL TESTING**

**IMPORTANT**: Utilisez une **fenêtre de navigation privée** pour éviter tout problème de cache !
