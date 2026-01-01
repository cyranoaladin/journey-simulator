# Checklist des Variables d'Environnement

## Vue d'ensemble

Ce document liste toutes les variables d'environnement nécessaires pour le fonctionnement complet de Money Factory AI, avec un focus sur RAG et LLM.

---

## Variables RAG (Retrieval Augmented Generation)

### Obligatoires pour RAG Remote

- **`RAG_SEARCH_URL`** : URL du service RAG pour les recherches
  - Exemple : `http://127.0.0.1:8001/rag/query` ou `https://rag-api.nexusreussite.academy/search`
  - Utilisé dans : `mf-back/rag/ragClient.js`, `mf-back/orchestration/ragClient.js`
  - Fallback : `http://localhost:8000/kb/search` (ragClient.js) ou vide (orchestration/ragClient.js)

- **`RAG_API_KEY`** : Clé API pour authentifier les requêtes RAG
  - Exemple : `MoneyFactory_2025_Secure_Token_X9`
  - Utilisé dans : tous les clients RAG
  - Fallback : chaîne vide (utilise alors le fallback local)

- **`RAG_COLLECTION`** : Nom de la collection RAG à utiliser
  - Exemple : `mfai-knowledge`
  - Utilisé dans : tous les clients RAG
  - Fallback : `mfai-knowledge`

### Optionnelles pour RAG

- **`RAG_INGEST_URL`** : URL pour l'ingestion de documents
  - Exemple : `http://127.0.0.1:8001/rag/ingest` ou `https://rag-api.nexusreussite.academy/ingest`
  - Utilisé dans : `mf-back/rag/ragClient.js`
  - Fallback : `http://localhost:8000/kb/ingest`

- **`RAG_DATA_PATH`** : Chemin local pour le fallback RAG (documents locaux)
  - Exemple : `./data/rag-documents` ou `./docs`
  - Utilisé dans : `mf-back/rag/ragClient.js`, `mf-back/orchestration/ragClient.js`
  - Fallback : `../data/rag-documents` (ragClient.js) ou `../docs` (orchestration/ragClient.js)

- **`RAG_HEALTH_URL`** : URL pour vérifier la santé du service RAG
  - Utilisé dans : `mf-back/scripts/check-rag-connection.js`
  - Fallback : `${DEFAULT_BASE_URL}/health`

- **`RAG_TEST_K`** : Nombre de résultats à retourner pour les tests
  - Utilisé dans : `mf-back/scripts/check-rag-connection.js`
  - Fallback : `3`

---

## Variables LLM (Large Language Model)

### Obligatoires pour LLM Réel

- **`OPENAI_API_KEY`** : Clé API OpenAI
  - Format : clé privée OpenAI (ne pas commit)
  - Utilisé dans : `mf-back/utils/openaiClient.js`, `mf-back/orchestration/zynoVerticalSlice.js`
  - **⚠️ CRITIQUE** : Sans cette clé, le système utilise le mode mock
  - Fallback : mode mock activé automatiquement

### Optionnelles pour LLM

- **`LLM_MODEL_NAME`** : Modèle LLM à utiliser
  - Exemple : `gpt-4o`, `gpt-4o-mini`, `gpt-3.5-turbo`
  - Utilisé dans : `mf-back/utils/openaiClient.js`
  - Fallback : `gpt-4o`

- **`LLM_TEMPERATURE`** : Température pour la génération (0.0 à 2.0)
  - Exemple : `0.4`
  - Utilisé dans : `mf-back/utils/openaiClient.js`
  - Fallback : `0.4`

- **`LLM_MAX_OUTPUT_TOKENS`** : Nombre maximum de tokens en sortie
  - Exemple : `1500`
  - Utilisé dans : `mf-back/utils/openaiClient.js`
  - Fallback : `1500`

---

## Variables Autres (Sécurité, Base de données, etc.)

### Obligatoires

- **`NODE_ENV`** : Environnement d'exécution
  - Valeurs : `development`, `production`, `test`
  - Utilisé partout

- **`PORT`** : Port du serveur backend
  - Exemple : `3000` (dev), `3002` (prod)
  - Fallback : dépend du framework

- **`MONGO_URI`** : URI de connexion MongoDB
  - Exemple : `mongodb://127.0.0.1:27017/journey`
  - **⚠️ CRITIQUE** : Requis pour la persistance

- **`JWT_SECRET`** : Secret pour signer les tokens JWT
  - **⚠️ CRITIQUE** : Doit être unique et sécurisé en production

- **`ADMIN_API_KEY`** : Clé API pour les routes admin
  - Utilisé dans : routes admin, RAG upload, exports
  - **⚠️ CRITIQUE** : Requis pour les opérations admin

### Optionnelles

- **`CORS_ALLOWED_ORIGINS`** : Origines autorisées pour CORS
  - Format : liste séparée par des virgules
  - Exemple : `http://localhost:3003,http://localhost:5173`

- **`EXECUTION_ENABLED`** : Active l'exécution réelle (au lieu de DRY_RUN)
  - Valeur : `true` pour activer
  - **⚠️ DANGER** : Active les side-effects réels

- **`REAL_EXECUTION_MODE`** : Mode d'exécution réelle
  - Valeur : `shadow` pour mode shadow
  - Utilisé dans : `mf-back/orchestration/zynoVerticalSlice.js`

- **`DEMO_MODE`** : Active le mode démo (sorties stables)
  - Valeur : `true` pour activer
  - Utilisé dans : `mf-back/orchestration/zynoVerticalSlice.js`

- **`KILL_SWITCH`** : Active le kill switch global
  - Valeur : `true` pour activer
  - Utilisé dans : `mf-back/orchestration/killSwitch.js`

- **`KILL_SWITCH_SCOPE`** : Portée du kill switch
  - Valeurs : `ALL`, `REAL_ONLY`
  - Utilisé dans : `mf-back/orchestration/killSwitch.js`

---

## Fichiers .env à vérifier

### Fichiers existants

1. **`.env`** (racine du projet) - ⚠️ Non versionné (gitignore)
2. **`mf-back/.env`** - ⚠️ Non versionné (gitignore)
3. **`mf-back/env.example`** - ✅ Versionné (template minimal)
4. **`mf-back/env.development.example`** - ✅ Versionné (template dev)
5. **`mf-back/env.production.example`** - ✅ Versionné (template prod)

### Fichiers à créer/mettre à jour

- `.env` (local, non versionné) - doit contenir toutes les variables nécessaires
- `.env.local` (local, non versionné) - peut être utilisé pour override

---

## Checklist de Vérification

### Pour RAG Remote

- [ ] `RAG_SEARCH_URL` est défini et accessible
- [ ] `RAG_API_KEY` est défini et valide
- [ ] `RAG_COLLECTION` est défini (ou utilise le fallback)
- [ ] `RAG_INGEST_URL` est défini si ingestion nécessaire
- [ ] Test de connexion : `node mf-back/scripts/check-rag-connection.js`

### Pour LLM Réel

- [ ] `OPENAI_API_KEY` est défini et valide (clé OpenAI privée)
- [ ] `LLM_MODEL_NAME` est défini si différent de `gpt-4o`
- [ ] Test de connexion : vérifier que `ops.llm.mode === 'openai'` dans les réponses

### Pour Production

- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` est unique et sécurisé
- [ ] `ADMIN_API_KEY` est unique et sécurisé
- [ ] `MONGO_URI` pointe vers la base de production
- [ ] `CORS_ALLOWED_ORIGINS` est configuré correctement
- [ ] `EXECUTION_ENABLED` est `false` par défaut (sécurité)

---

## Commandes de Vérification

```bash
# Vérifier les variables RAG
cd mf-back
node scripts/check-rag-connection.js

# Vérifier les variables LLM (via test)
npm test -- --runTestsByPath __tests__/verticalSliceOrchestration.test.js

# Lister les variables manquantes
node -e "
const required = ['OPENAI_API_KEY', 'RAG_SEARCH_URL', 'RAG_API_KEY', 'MONGO_URI', 'JWT_SECRET', 'ADMIN_API_KEY'];
required.forEach(v => {
  if (!process.env[v]) console.log('❌', v, 'manquante');
  else console.log('✅', v, 'définie');
});
"
```

---

## Notes Importantes

1. **Mode Mock** : Si `OPENAI_API_KEY` n'est pas défini, le système utilise automatiquement le mode mock (pas d'appels réels à OpenAI)

2. **Fallback Local RAG** : Si `RAG_SEARCH_URL` n'est pas défini ou si la connexion échoue, le système utilise le fallback local (documents dans `RAG_DATA_PATH`)

3. **Sécurité** : Ne jamais commiter les fichiers `.env` avec des valeurs réelles. Utiliser les fichiers `.example` comme templates.

4. **Production** : Toutes les variables critiques doivent être définies en production. Le mode mock/fallback ne doit être utilisé qu'en développement.

---

## Références

- `mf-back/rag/ragClient.js` : Client RAG principal
- `mf-back/orchestration/ragClient.js` : Client RAG pour orchestration
- `mf-back/utils/openaiClient.js` : Client OpenAI/LLM
- `mf-back/orchestration/zynoVerticalSlice.js` : Utilisation des variables dans l'orchestrateur

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer
