# 🔧 Instructions pour Désactiver le Service Worker

## Problème
Le Service Worker cache les anciennes requêtes vers le port 3000 et empêche la connexion au nouveau port 3002.

## Solution Immédiate

### Option 1: Via les DevTools (Recommandé)
1. Ouvrez les DevTools (F12)
2. Allez dans l'onglet **Application**
3. Dans le menu de gauche, cliquez sur **Service Workers**
4. Cliquez sur **Unregister** pour chaque service worker listé
5. Cliquez sur **Clear storage** dans le menu de gauche
6. Cochez toutes les cases et cliquez sur **Clear site data**
7. Fermez et rouvrez le navigateur
8. Accédez à `http://localhost:5173`

### Option 2: Mode Incognito
1. Ouvrez une fenêtre de navigation privée/incognito
2. Accédez à `http://localhost:5173/login`
3. Connectez-vous normalement

### Option 3: Vider le Cache Complet
1. Dans Chrome: `Ctrl+Shift+Delete` (ou `Cmd+Shift+Delete` sur Mac)
2. Sélectionnez "Depuis toujours"
3. Cochez:
   - Cookies et autres données de site
   - Images et fichiers en cache
4. Cliquez sur "Effacer les données"
5. Redémarrez le navigateur

## Vérification

Après avoir suivi une des options ci-dessus:

1. Ouvrez `http://localhost:5173/login`
2. Ouvrez la Console (F12 → Console)
3. Vous ne devriez **PAS** voir le message "Service Worker enregistré"
4. Essayez de vous connecter avec:
   - Email: `test@moneyfactory.ai`
   - Mot de passe: `Test123!`

## Fichiers Modifiés

J'ai modifié les fichiers suivants pour désactiver le SW:

1. ✅ `journey-simulator/src/main.tsx` - Commenté l'enregistrement du SW
2. ✅ `journey-simulator/public/sw.js` - Remplacé par un SW qui se désinstalle

## Si le Problème Persiste

Si vous voyez toujours des erreurs vers le port 3000:

```bash
# Arrêter le frontend
# Ctrl+C dans le terminal du frontend

# Supprimer le cache de Vite
cd journey-simulator
rm -rf node_modules/.vite
rm -rf dist

# Redémarrer
npm run dev
```

---

**Note**: Le Service Worker sera réactivé plus tard en production avec la bonne configuration.
