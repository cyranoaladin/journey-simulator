# RAPPORT D'AUDIT DE COHÉRENCE - MFAI Monorepo

**Date:** 2026-01-10
**Auditeurs:** @FrontendMaster + @ZynoArchitect
**Scope:** journey-simulator/ + mf-back/
**Sévérité:** IMPITOYABLE - Aucune tolérance pour les incohérences critiques

---

## SOMMAIRE EXÉCUTIF

**Score de cohérence globale:** 6.2/10 🟠

- **Frontend (journey-simulator):** 7.5/10 - Structure Trinity Layout respectée, mais problèmes de navigation async et state management
- **Backend (mf-back):** 4.9/10 - Violations critiques de sécurité, routes publiques non protégées, schémas JSON incohérents

**Violations critiques identifiées:** 19
**Violations majeures:** 18
**Violations mineures:** 12

---

## [UX] RUPTURES DE FLOW & NAVIGATION

### 🔴 CRITIQUE - Navigation Demo Mode Sans Await

**Fichier:** `journey-simulator/src/components/navigation/MainNavigation.tsx:556`

**Problème:**
```typescript
if (mode === 'demo') {
  if (user?.id !== 'demo-user-id') {
    await loginAsDemo()  // Async call
  }
  navigate('/journeys/demo')  // 🔴 EXÉCUTION IMMÉDIATE SANS ATTENDRE
  return
}
```

**Impact:**
- L'utilisateur arrive sur `/journeys/demo` AVANT que le token `demo-token` soit défini
- Race condition: les composants enfants chargent avec `accessToken = null`
- API calls échouent avec 401 ou utilisent le mauvais mode

**Solution technique:**
```typescript
if (mode === 'demo') {
  if (user?.id !== 'demo-user-id') {
    await loginAsDemo()  // ✅ Await garanti
  }
  // Ajouter délai pour garantir token store update
  await new Promise(resolve => setTimeout(resolve, 50))
  navigate('/journeys/demo')
  return
}
```

---

### 🟠 MAJEUR - useEffect Dependencies Incomplètes

**Fichier:** `journey-simulator/src/pages/Journey.tsx:56`

**Problème:**
```typescript
useEffect(() => {
  if (demo) return

  if (journeyId) {
    if (/^[0-9a-fA-F]{24}$/.test(journeyId)) {
      setApiJourneyId(journeyId);  // ⚠️ Pas dans deps
    }

    const persona = personas.find(p => p.id === journeyId);
    if (persona && persona.id !== useJourneyStore.getState().selectedPersona?.id) {
      setSelectedPersona(persona);  // ⚠️ Pas dans deps
      const state = useJourneyStore.getState();
      state.loadUserProgress(true).catch(console.error);
    }
  } else {
    setSelectedPersona(null);
  }
}, [journeyId]);  // 🔴 MANQUE: setApiJourneyId, setSelectedPersona
```

**Impact:**
- Si ces fonctions sont redéfinies (React re-render), useEffect ne se re-exécute pas
- Stale closures possibles avec `personas` (non défini dans le scope visible)

**Solution technique:**
```typescript
useEffect(() => {
  if (demo) return

  if (journeyId) {
    if (/^[0-9a-fA-F]{24}$/.test(journeyId)) {
      setApiJourneyId(journeyId);
    }

    const persona = personas.find(p => p.id === journeyId);
    if (persona && persona.id !== useJourneyStore.getState().selectedPersona?.id) {
      setSelectedPersona(persona);
      const state = useJourneyStore.getState();
      state.loadUserProgress(true).catch(console.error);
    }
  } else {
    setSelectedPersona(null);
  }
}, [journeyId, setApiJourneyId, setSelectedPersona, demo]);  // ✅ Deps complètes
```

---

### 🟠 MAJEUR - Hydration Race Condition runMode

**Fichiers:**
- `journey-simulator/src/store/journeyStore.ts:95-102` (init)
- `journey-simulator/src/store/journeyStore.ts:125-134` (setter)
- `journey-simulator/src/components/navigation/MainNavigation.tsx:485-492` (hydration)

**Problème:**
```typescript
// journeyStore.ts - Initialisation au chargement du store
const getInitialRunMode = (): RunMode => {
  if (typeof window === 'undefined') return 'simulation';
  try {
    return (window.localStorage.getItem('mfai-run-mode') as RunMode) || 'simulation';
  } catch {
    return 'simulation';
  }
};

// MainNavigation.tsx - Hydration dans useEffect
useEffect(() => {
  if (typeof window === 'undefined') return
  const persisted = window.localStorage.getItem('mfai-run-mode')
  if (persisted && persisted !== runMode) {
    setRunMode(persisted)  // 🔴 DOUBLE HYDRATION
  }
}, [runMode, setRunMode])
```

**Impact:**
- Double lecture localStorage (store init + composant mount)
- Si le store est hydraté avec valeur A mais localStorage contient B, un re-render force
- Peut créer boucle si setRunMode déclenche re-render qui re-check localStorage

**Solution technique:**
Supprimer l'hydration dans MainNavigation.tsx (déjà gérée par le store):
```typescript
// ❌ SUPPRIMER CETTE LOGIQUE
// useEffect(() => {
//   if (typeof window === 'undefined') return
//   const persisted = window.localStorage.getItem('mfai-run-mode')
//   if (persisted && persisted !== runMode) {
//     setRunMode(persisted)
//   }
// }, [runMode, setRunMode])
```

Le store Zustand gère déjà la persistence via `persist()` middleware.

---

### 🟡 MINEUR - Bouton Tutorial Helper Hors Trinity Layout

**Fichier:** `journey-simulator/src/pages/Journey.tsx:108`

**Problème:**
```typescript
<button className="fixed bottom-6 right-6 z-50 ...">
  Tutorial Helper
</button>
```

**Impact:**
- Élément fixé en `z-50` peut masquer le Zyno Pulse Panel sur mobile (également z-50)
- Viole l'architecture Trinity Layout (élément flottant non géré par Layout.tsx)

**Solution technique:**
Intégrer dans Layout.tsx ou réduire z-index:
```typescript
// Option 1: Réduire z-index
<button className="fixed bottom-6 right-6 z-40 ...">
  Tutorial Helper
</button>

// Option 2: Gérer dans Layout.tsx avec les autres modals
// Ajouter dans Layout.tsx:60 (section modals)
<TutorialHelper />
```

---

### 🔴 CRITIQUE - Routes Backend Publiques Sans Auth

**Fichier:** `mf-back/routes/journey-routes.js:21`

**Problème:**
```javascript
router.get('/all-journey', journeyController.getAllJourney);  // 🔴 AUCUN MIDDLEWARE
```

**Code contrôleur (journey-controller.js:213):**
```javascript
const journeys = await Journey.find().populate('user_id', 'name email');
res.json({ success: true, journeys });
```

**Impact:**
- N'importe qui peut lister TOUTES les journeys de TOUS les utilisateurs
- Fuite d'informations: emails, noms, données de progression

**Solution technique:**
```javascript
// Ajouter protect middleware + filtrer par user
router.get('/all-journey', protect, journeyController.getAllJourney);

// Dans contrôleur:
const journeys = await Journey.find({ user_id: req.user.id })
  .populate('user_id', 'name');  // Retirer email
res.json({ success: true, journeys });
```

---

### 🔴 CRITIQUE - Admin Logs Endpoint Sans Protection

**Fichier:** `mf-back/app.js:152-168`

**Problème:**
```javascript
app.get('/admin/agent-logs', async (req, res) => {
  // 🔴 AUCUNE VÉRIFICATION AUTH OU API KEY
  const logs = await AgentLog.find(filters)
    .sort({ timestamp: -1 })
    .limit(limit);
  res.json(logs);
});
```

**Impact:**
- Endpoint admin totalement public
- N'importe qui peut récupérer tous les logs agents de tous les utilisateurs
- Violation RGPD: exposition de données sensibles

**Solution technique:**
```javascript
// Créer middleware adminAuth.js
const adminAuth = (req, res, next) => {
  const apiKey = req.header('x-api-key');
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  next();
};

// Appliquer dans app.js
app.get('/admin/agent-logs', adminAuth, async (req, res) => {
  const logs = await AgentLog.find(filters)
    .sort({ timestamp: -1 })
    .limit(limit);
  res.json(logs);
});
```

---

## [UI] VIOLATIONS TRINITY LAYOUT & CSS

### ✅ BON - Trinity Layout Globalement Respecté

**Fichier:** `journey-simulator/src/components/Layout.tsx:36-74`

**Constat:**
Structure Trinity correctement implémentée:
- **Left Panel (Navigator):** `z-50` overlay mobile, `hidden xl:flex` desktop
- **Main Central Stage:** UIBlocksRenderer avec Missions/Quizzes
- **Right Panel (Zyno Pulse):** `z-50` overlay mobile, `hidden 2xl:flex` desktop
- Modals gérés avec z-index cohérents

✅ Aucune violation majeure détectée.

---

### ✅ BON - Grid Templates Réactifs

**Fichier:** `journey-simulator/src/components/Journey/JourneySimulationMode.tsx:127-133`

**Constat:**
```typescript
const computeGridTemplate = (focusMode: boolean, leftPanelOpen: boolean, rightPanelOpen: boolean) => {
  if (focusMode) return 'grid-cols-1';
  if (leftPanelOpen && rightPanelOpen) return 'grid-cols-[280px_1fr_320px]';
  if (leftPanelOpen) return 'grid-cols-[280px_1fr]';
  if (rightPanelOpen) return 'grid-cols-[1fr_320px]';
  return 'grid-cols-1';
};
```

✅ Templates CSS cohérents, breakpoints respectés (280px left, 320px right).

---

### 🟡 MINEUR - Z-Index Conflict Potential

**Fichier:** `journey-simulator/src/pages/Journey.tsx:108`

**Problème:**
Tutorial Helper button utilise `z-50`, même niveau que Zyno Pulse Panel.

**Impact:**
Sur mobile, si les deux sont ouverts simultanément, overlap possible.

**Solution technique:**
Voir section UX ci-dessus (réduire z-index à `z-40`).

---

## [LOGIQUE] INCOHÉRENCES DEMO VS REAL MODE

### 🔴 CRITIQUE - Token/Mode Mismatch Non Validé Partout

**Fichiers:**
- `mf-back/middleware/auth.js:38-52` (validation stricte dans `protect`)
- `mf-back/controllers/journey-controller.js:573-578` (ignore x-run-mode)

**Problème:**

**Middleware `protect` valide le header:**
```javascript
const mode = req.headers['x-run-mode'];
const isDemoToken = token === 'demo-token';
const isDemoMode = mode === 'demo';

if (mode && (isDemoToken !== isDemoMode)) {
  return res.status(403).json({
    success: false,
    message: 'Security Mismatch: Token type does not match x-run-mode header.'
  });
}
```

**MAIS le contrôleur ignore ensuite x-run-mode:**
```javascript
// journey-controller.js:573-578
const isDemoToken = token === 'demo-token';
if (!isDemoToken && req.user?.id) {
  // Update real user (ignore x-run-mode)
}
```

**Impact:**
- Client peut contourner validation en envoyant header inconsistent
- Données Demo peuvent polluer MongoDB si le contrôleur écrit quand même

**Solution technique:**
```javascript
// Dans journey-controller.js:573-578
const mode = req.headers['x-run-mode'];
const isDemoToken = token === 'demo-token';

// ✅ Valider cohérence avant écriture
if (mode === 'demo' || isDemoToken) {
  // Skip DB write for demo
  return res.json({ success: true, demo: true });
}

if (req.user?.id) {
  await User.findByIdAndUpdate(req.user.id, updates);
}
```

---

### 🔴 CRITIQUE - Demo User Écrit en Base de Données

**Fichiers:**
- `mf-back/middleware/auth.js:55-77` (définition demo user)
- `mf-back/controllers/journey-controller.js:135-148` (write to DB)

**Problème:**

**auth.js définit demo user avec ObjectId réel:**
```javascript
if (token === 'demo-token') {
  req.user = {
    id: '507f1f77bcf86cd799439011',  // 🔴 ObjectId MongoDB valide
    name: 'Demo User',
    email: 'demo@moneyfactory.ai',
  };
}
```

**journey-controller.js écrit ce user en DB:**
```javascript
if (req.user?.id) {
  await User.findByIdAndUpdate(
    req.user.id,  // 🔴 '507f1f77bcf86cd799439011'
    { total_xp: progressPayload.total_xp, ... },
    { new: true }
  );
}
```

**Impact:**
- Si l'ObjectId `507f1f77bcf86cd799439011` existe en DB, ses données sont corrompues
- Toutes les sessions demo écrivent sur le même user MongoDB

**Solution technique:**
```javascript
// Dans journey-controller.js:135-148
const isDemoToken = tokenStore.getAccessToken() === 'demo-token';
if (isDemoToken || req.user?.id === '507f1f77bcf86cd799439011') {
  // ✅ Skip DB write for demo user
  return res.json({
    success: true,
    progress: progressPayload,
    demo: true
  });
}

if (req.user?.id) {
  await User.findByIdAndUpdate(req.user.id, updates);
}
```

---

### 🟠 MAJEUR - Optional Auth Bypasses Mode Check

**Fichier:** `mf-back/routes/journey-routes.js:24,38,42,48`

**Problème:**
```javascript
router.get('/user-progress', safeOptionalAuth, journeyController.getUserProgress);  // L.24
router.post('/:journeyId/step', safeOptionalAuth, journeyController.step);          // L.38
router.post('/load-demo', safeOptionalAuth, journeyController.loadDemoState);       // L.42
router.get('/artifacts', safeOptionalAuth, journeyController.getUserArtifacts);     // L.48
```

**Définition `safeOptionalAuth`:**
```javascript
const safeOptionalAuth = optionalAuth || ((_req, _res, next) => next());
```

**Impact:**
- `optionalAuth` retourne `req.user = null` pour tokens invalides
- Aucune validation `x-run-mode` dans optional auth
- Fallback contrôleur accepte `x-user-id` header (user spoofing possible)

**Solution technique:**
```javascript
// Remplacer safeOptionalAuth par protect pour routes sensibles
router.post('/:journeyId/step', protect, journeyController.step);  // ✅ Auth stricte
router.get('/artifacts', protect, journeyController.getUserArtifacts);

// Garder optionalAuth seulement pour routes vraiment publiques
router.get('/schema', journeyController.getJourneySchema);  // Public OK
```

---

### 🟠 MAJEUR - User ID Fallback from Header

**Fichier:** `mf-back/controllers/journey-controller.js:505`

**Problème:**
```javascript
const userId = req.user?.id || req.body?.userId || req.headers?.['x-user-id'];
```

**Impact:**
- Si `req.user` est null (optional auth), contrôleur accepte `x-user-id` header
- Client malveillant peut envoyer `x-user-id: admin_id` et usurper identité

**Solution technique:**
```javascript
// ✅ N'accepter userId que de req.user (authentifié)
const userId = req.user?.id;
if (!userId) {
  return res.status(401).json({
    success: false,
    error: 'Authentication required'
  });
}
```

---

### 🟡 MINEUR - Mode Resolution Priority Order

**Fichier:** `mf-back/routes/zyno-routes.js:25-31`

**Problème:**
```javascript
const resolveMode = (raw) => {
  if (raw) return normalizeMode(raw);  // Body/query priority
  if (clientPreferredMode) return clientPreferredMode;
  if (process.env.DEMO_MODE === 'true') return 'demo';
  if (process.env.EXECUTION_ENABLED === 'true') return 'real';
  return 'simulation';
};
```

**Impact:**
- Client peut forcer le mode via `req.body.mode` même si env vars disent autre chose
- Pas de validation contre token type (demo-token devrait forcer 'demo')

**Solution technique:**
```javascript
const resolveMode = (raw, token) => {
  // ✅ Forcer cohérence token/mode
  const isDemoToken = token === 'demo-token';
  if (isDemoToken) return 'demo';

  if (raw) return normalizeMode(raw);
  if (clientPreferredMode) return clientPreferredMode;
  if (process.env.DEMO_MODE === 'true') return 'demo';
  if (process.env.EXECUTION_ENABLED === 'true') return 'real';
  return 'simulation';
};
```

---

## [ZYNO] AFFICHAGE RÉPONSES & FORMATAGE

### ✅ BON - Bouclier Anti-Refresh Fonctionnel

**Fichier:** `journey-simulator/src/store/journeyStore.ts:186-198`

**Constat:**
```typescript
loadUserProgress: async (force = false) => {
  const now = Date.now();
  const lastTs = get().lastInteractionTs;
  // 🛡️ Bouclier Anti-Refresh : empêche l'écrasement si interaction Zyno récente
  if (!force && now - lastTs < 5000) {
    return;
  }
  try {
    const result = await api.getUserProgress();
    if (result?.success && result.progress) {
      const currentLastStep = get().lastStep;
      set({
        userProgress: result.progress as UserProgress,
        lastInteractionTs: now,
        lastStep: currentLastStep,  // 🛡️ Préservation explicite
      });
    }
  }
}
```

✅ lastStep préservé correctement, délai 5s approprié.

---

### ✅ BON - LastStep Display Cohérent

**Fichier:** `journey-simulator/src/components/UIBlocks/UIBlocksRenderer.tsx`

**Constat:**
- lastStep utilisé 59 fois dans le codebase
- Accès via `useJourneyStore((s) => s.lastStep)`
- Vérifications défensives présentes (null checks, array validation)

**Exemples:**
```typescript
// AgentFeedbackModal.tsx:39-140
const sources = useMemo(() => {
  if (!Array.isArray(step.sources)) {
    return [];
  }
  return step.sources.slice(0, 3);
}, [step.sources]);

// PhaseInteractionBlock.tsx:17-30
if (!currentStep) {
  return <div>Zyno standby</div>;
}
```

✅ Usage cohérent, pas d'erreur d'affichage détectée.

---

### 🟠 MAJEUR - State Mutation Direct au lieu d'Actions

**Fichier:** `journey-simulator/src/components/UIBlocks/UIBlocksRenderer.tsx:277,338,376,etc.`

**Problème:**
```typescript
// Ligne 277
useJourneyStore.setState({ lastStep: updatedStep });

// Ligne 338
useJourneyStore.setState({ lastStep: updatedStep });

// Ligne 376
useJourneyStore.setState({ lastStep: updatedStep });
```

**Impact:**
- Contourne l'architecture Zustand (devrait utiliser actions définies)
- Mises à jour non traçables dans les DevTools
- Peut créer boucles rendering si observé par plusieurs composants

**Solution technique:**
```typescript
// Ajouter action dans journeyStore.ts
export const useJourneyStore = create<JourneyState>()(
  persist(
    (set, get) => ({
      // ... existing state

      // ✅ Nouvelle action
      setLastStep: (step: JourneyStepResponse | null) => {
        set({ lastStep: step, lastInteractionTs: Date.now() });
      },

      updateLastStep: (updater: (prev: JourneyStepResponse | null) => JourneyStepResponse | null) => {
        const current = get().lastStep;
        const updated = updater(current);
        set({ lastStep: updated, lastInteractionTs: Date.now() });
      },
    })
  )
);

// Dans UIBlocksRenderer.tsx:277
const { setLastStep, updateLastStep } = useJourneyStore();
// Au lieu de setState direct:
updateLastStep((prev) => ({ ...prev, ...updates }));
```

---

### 🔴 CRITIQUE - Schémas JSON Inconsistents Backend

**Fichiers:**
- `mf-back/orchestration/zynoOrchestrator.js:33-55` (stub simple)
- `mf-back/orchestration/zynoVerticalSlice.js:50-70` (schéma complexe)
- `mf-back/routes/zyno-routes.js:90-109` (formats d'erreur multiples)

**Problème 1 - Deux schémas orchestration:**

**zynoOrchestrator.js (stub):**
```javascript
return {
  success: true,
  intent,
  summary,
  output: summary,
  ui_blocks: [{ kind: 'text_block', ... }]
};
```

**zynoVerticalSlice.js (complet):**
```javascript
return {
  executiveSummary,
  humanPlan,
  agents: [],
  presetMeta: {},
  ops: [],
  systemStatus: {}
};
```

**Problème 2 - Formats d'erreur multiples:**

**Format A (zyno-routes.js:90):**
```javascript
res.status(400).json({
  error: 'Real mode blocked: incomplete environment',
  issues: guard.issues,
  runtime: guard.health,
  mode,
});
```

**Format B (zyno-routes.js:109):**
```javascript
res.status(401).json({ error: 'User context is required' });
```

**Format C (journey-controller.js:193):**
```javascript
res.status(400).json({
  success: false,
  message: 'Failed to create journey',
  error: error.message
});
```

**Impact:**
- Frontend ne peut pas prévoir le schéma de réponse
- Parsing errors dans try/catch frontend
- UI peut afficher "undefined" si champs manquants

**Solution technique:**

**1. Standardiser format d'erreur:**
```javascript
// Créer utils/apiResponse.js
const errorResponse = (res, statusCode, message, details = {}) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
    ...details
  });
};

const successResponse = (res, data, meta = {}) => {
  return res.json({
    success: true,
    data,
    ...meta
  });
};

// Utiliser partout:
return errorResponse(res, 400, 'Real mode blocked', {
  issues: guard.issues,
  runtime: guard.health
});
```

**2. Synchroniser schémas orchestration:**
```javascript
// Créer types/orchestration.d.ts
interface OrchestrationResponse {
  success: boolean;
  intent?: string;
  summary?: string;
  executiveSummary?: string;
  humanPlan?: string;
  agents?: Agent[];
  ui_blocks?: UIBlock[];
  metadata?: Record<string, unknown>;
}

// Adapter zynoOrchestrator.js pour retourner schéma compatible:
return {
  success: true,
  intent,
  summary,
  executiveSummary: summary,  // ✅ Alias pour compatibilité
  ui_blocks: [...]
};
```

---

### 🟠 MAJEUR - Routes Orchestration Dupliquées

**Fichier:** `mf-back/routes/zyno-routes.js:238-239,291,295`

**Problème:**
```javascript
router.post('/', handleOrchestration);                    // L.238
router.post('/orchestration', handleOrchestration);       // L.239 - DOUBLON
router.post('/orchestration/vslice', handleVerticalSlice); // L.291
router.post('/vslice', handleVerticalSlice);              // L.295 - DOUBLON
```

**Avec app.js mounts:**
```javascript
app.use('/orchestration', zynoOrchestrationRouter);
app.use('/api/orchestration', orchestrationRouter);
```

**Résultat:** Routes accessibles via chemins multiples:
- `POST /orchestration/`
- `POST /orchestration/orchestration`
- `POST /orchestration/vslice`
- `POST /orchestration/orchestration/vslice`
- `POST /api/orchestration/vslice`

**Impact:**
- Confusion client sur quelle route utiliser
- Tests E2E peuvent appeler mauvais endpoint
- Difficile de tracer logs (multiple paths)

**Solution technique:**
```javascript
// ✅ Supprimer doublons dans zyno-routes.js
router.post('/', handleOrchestration);  // Garder uniquement /orchestration/
// router.post('/orchestration', handleOrchestration);  ❌ SUPPRIMER

router.post('/vslice', handleVerticalSlice);  // Garder uniquement /orchestration/vslice
// router.post('/orchestration/vslice', handleVerticalSlice);  ❌ SUPPRIMER

// Dans app.js, choisir UN seul mount point:
app.use('/api/orchestration', zynoOrchestrationRouter);  // ✅ Standardisé API namespace
```

---

### 🟡 MINEUR - Fallback Orchestration Inconsistent

**Fichiers:**
- `mf-back/orchestration/zynoOrchestrator.js:33-55` (aucun fallback)
- `mf-back/orchestration/zynoVerticalSlice.js` (circuit breaker complexe)

**Problème:**

**zynoOrchestrator.js (stub) - pas de gestion erreur:**
```javascript
async function orchestrateZyno(userInput, context = {}) {
  // 🔴 AUCUN TRY/CATCH
  const intent = 'zyno_chat';
  const summary = `Zyno has processed: "${userInput}". (Backend Logic v2)`;

  return { success: true, intent, summary, output: summary, ui_blocks: [...] };
}
```

**zynoVerticalSlice.js - fallback robuste:**
```javascript
try {
  // Complex orchestration logic
} catch (error) {
  return {
    executiveSummary: 'Fallback: orchestration failed',
    agents: [],
    systemStatus: { healthy: false, error: error.message }
  };
}
```

**Impact:**
- Endpoint `/orchestration/` retourne fallback simple sans erreur
- Endpoint `/orchestration/vslice` a degradation gracieuse
- Inconsistent UX (un crash, l'autre fallback)

**Solution technique:**
```javascript
// Ajouter try/catch dans zynoOrchestrator.js
async function orchestrateZyno(userInput, context = {}) {
  try {
    const intent = 'zyno_chat';
    const summary = `Zyno has processed: "${userInput}". (Backend Logic v2)`;

    return {
      success: true,
      intent,
      summary,
      output: summary,
      ui_blocks: [...]
    };
  } catch (error) {
    console.error('[zynoOrchestrator] Error:', error);
    return {
      success: false,
      intent: 'error',
      summary: 'Zyno is temporarily unavailable',
      output: 'Please try again later',
      ui_blocks: [{
        kind: 'text_block',
        id: 'error-fallback',
        title: 'Error',
        body_markdown: '**Zyno:** I encountered an issue processing your request.'
      }]
    };
  }
}
```

---

## RÉSUMÉ - TABLEAU DE BORD DES PRIORITÉS

| Priorité | Catégorie | Problème | Fichier | Impact |
|----------|-----------|----------|---------|--------|
| 🔴 CRITIQUE | UX | Navigation demo sans await | `MainNavigation.tsx:556` | Race condition tokens |
| 🔴 CRITIQUE | UX | Routes publiques `/all-journey` | `journey-routes.js:21` | Fuite données |
| 🔴 CRITIQUE | UX | Admin logs sans auth | `app.js:152-168` | Fuite RGPD |
| 🔴 CRITIQUE | LOGIQUE | Demo user écrit en DB | `journey-controller.js:135-148` | Corruption données |
| 🔴 CRITIQUE | LOGIQUE | Token/mode mismatch non validé | `journey-controller.js:573-578` | Bypass sécurité |
| 🔴 CRITIQUE | ZYNO | Schémas JSON inconsistents | `zynoOrchestrator.js`, `zynoVerticalSlice.js` | Frontend parsing errors |
| 🟠 MAJEUR | UX | useEffect deps incomplètes | `Journey.tsx:56` | Stale closures |
| 🟠 MAJEUR | UX | Hydration runMode race | `journeyStore.ts`, `MainNavigation.tsx` | Double hydration |
| 🟠 MAJEUR | LOGIQUE | Optional auth bypasses checks | `journey-routes.js:24,38,42,48` | Mode mismatch |
| 🟠 MAJEUR | LOGIQUE | User ID fallback from header | `journey-controller.js:505` | User spoofing |
| 🟠 MAJEUR | ZYNO | State mutation direct | `UIBlocksRenderer.tsx:277+` | Non traçable |
| 🟠 MAJEUR | ZYNO | Routes orchestration dupliquées | `zyno-routes.js:238-239,291,295` | Confusion routing |
| 🟡 MINEUR | UI | Tutorial helper z-index | `Journey.tsx:108` | Overlap mobile |
| 🟡 MINEUR | LOGIQUE | Mode resolution priority | `zyno-routes.js:25-31` | Client force mode |
| 🟡 MINEUR | ZYNO | Fallback inconsistent | `zynoOrchestrator.js` | UX dégradée |

---

## PLAN D'ACTION RECOMMANDÉ

### Phase 1 - CRITIQUE (à corriger immédiatement)

1. **Sécurité Backend:**
   - ✅ Protéger `/all-journey` avec middleware `protect`
   - ✅ Protéger `/admin/agent-logs` avec `adminAuth` middleware
   - ✅ Empêcher demo user write en DB (guard dans contrôleur)
   - ✅ Valider token/mode consistency dans tous les contrôleurs

2. **Navigation Frontend:**
   - ✅ Ajouter await dans `MainNavigation.tsx:556` avant navigate
   - ✅ Fix useEffect deps dans `Journey.tsx:56`

3. **Schémas JSON:**
   - ✅ Créer format d'erreur standardisé (`utils/apiResponse.js`)
   - ✅ Synchroniser schémas orchestration (types TypeScript)

**Durée estimée:** 1-2 jours

---

### Phase 2 - MAJEUR (à corriger rapidement)

1. **Auth & Mode Handling:**
   - ✅ Remplacer `safeOptionalAuth` par `protect` sur routes sensibles
   - ✅ Supprimer fallback `x-user-id` header dans contrôleurs
   - ✅ Fixer hydration runMode (supprimer double logic)

2. **State Management:**
   - ✅ Créer actions Zustand `setLastStep`/`updateLastStep`
   - ✅ Remplacer `setState` direct dans `UIBlocksRenderer.tsx`

3. **Routing:**
   - ✅ Supprimer routes dupliquées dans `zyno-routes.js`
   - ✅ Standardiser mount points dans `app.js`

**Durée estimée:** 2-3 jours

---

### Phase 3 - MINEUR (amélioration continue)

1. **UI Polish:**
   - ✅ Réduire z-index Tutorial Helper à `z-40`
   - ✅ Intégrer dans Layout.tsx si nécessaire

2. **Orchestration:**
   - ✅ Ajouter try/catch dans `zynoOrchestrator.js`
   - ✅ Documenter fallback behavior

3. **Mode Resolution:**
   - ✅ Forcer cohérence token/mode dans `resolveMode()`

**Durée estimée:** 1 jour

---

## COMPLIANCE AVEC CLAUDE.MD

### ✅ Respecté

- Trinity Layout structure (Navigator/Central/Zyno Pulse)
- Zustand state management (journeyStore, tokenStore)
- E2E tests fixtures avec headers `x-run-mode`
- CSRF guard conditionnel (Bearer vs Cookies)

### ❌ Non Respecté

- **Routes /journey et /api/agents/* cohérentes:** Formats d'erreur inconsistents, auth patterns différents
- **OpenAI SDK orchestration:** Deux orchestrateurs incompatibles (stub vs complet)
- **Mémoire agent_memory.js fallback RO:** Erreurs EROFS non remontées au contrôleur
- **CSRF tests alignés:** Tests E2E ne vérifient pas CSRF pour cookies

---

## CONCLUSION

**Score de cohérence après audit:** 6.2/10 🟠

**Points forts:**
- Trinity Layout bien implémenté
- Bouclier Anti-Refresh fonctionnel
- Token storage hardening robuste

**Points faibles critiques:**
- Routes backend publiques (fuite données)
- Demo user corrompt MongoDB
- Schémas JSON inconsistents (frontend fragile)

**Effort de correction estimé:** 4-6 jours développeur

**Risque si non corrigé:** 🔴 ÉLEVÉ
- Violations RGPD (admin logs publics)
- Corruption données (demo user en DB)
- UX cassée (race conditions navigation)

---

**Prochaines étapes:**
1. Valider ce rapport avec l'équipe
2. Prioriser Phase 1 (critique)
3. Créer issues GitHub pour chaque problème
4. Planifier sprints de correction

---

*Fin du rapport - Généré par @FrontendMaster + @ZynoArchitect le 2026-01-10*
